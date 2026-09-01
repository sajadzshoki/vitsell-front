import {
  emptyFinanceKpis,
  isDateInRange,
  percentChange,
  resolveFinanceRange,
  type FinanceDateRange,
  type FinanceKpiBundle,
  type FinancePeriodId,
} from '~/data/seller-finance'
import {
  buildPaymentsFromOrders,
  type SellerFinancePaymentStatus,
  type SellerPayment,
} from '~/data/seller-finance-payments'
import {
  mapPayoutToSettlement,
  type SellerSettlement,
  type SellerSettlementSource,
  type SellerSettlementStatus,
} from '~/data/seller-finance-settlements'
import {
  buildDefaultAdjustments,
  type SellerFinanceAdjustment,
  type SellerFinanceAdjustmentType,
} from '~/data/seller-finance-adjustments'
import { buildDefaultGateways, type SellerFinanceGateway } from '~/data/seller-finance-gateways'
import { buildFinanceLedger, type SellerFinanceTransaction } from '~/data/seller-finance-transactions'
import { detectFinanceDiscrepancies, type FinanceDiscrepancy } from '~/data/seller-finance-reconciliation'
import { toSellerPayout, type SellerPayout } from '~/data/seller'

export function useSellerFinance() {
  const { orders, payouts, sales, pending: sellerPending, fetchFinance, fetchOrders } = useSeller()
  const { getCommerce } = useSellerOrderCommerce()
  const { refunds, ensureLoaded: ensureRefunds } = useSellerRefunds()
  const { appendLog } = useSellerAudit()

  const paymentOverrides = useState<Record<string, Partial<SellerPayment>>>('seller-finance-payment-overrides', () => ({}))
  const settlementOverrides = useState<Record<string, Partial<SellerSettlement>>>('seller-finance-settlement-overrides', () => ({}))
  const localSettlements = useState<SellerSettlement[]>('seller-finance-local-settlements', () => [])
  const adjustments = useState<SellerFinanceAdjustment[]>('seller-finance-adjustments', () => buildDefaultAdjustments())
  const gateways = useState<SellerFinanceGateway[]>('seller-finance-gateways', () => buildDefaultGateways())
  const reconciledIds = useState<string[]>('seller-finance-reconciled-ids', () => [])
  const period = useState<FinancePeriodId>('seller-finance-period', () => 'last_30')
  const customStart = useState<string>('seller-finance-custom-start', () => '')
  const customEnd = useState<string>('seller-finance-custom-end', () => '')
  const loaded = useState('seller-finance-loaded', () => false)
  const loading = useState('seller-finance-loading', () => false)

  const range = computed((): FinanceDateRange =>
    resolveFinanceRange(period.value, customStart.value || null, customEnd.value || null),
  )

  const payments = computed((): SellerPayment[] => {
    return orders.value.map((o) => {
      const pay = buildPaymentsFromOrders([o], () => getCommerce(o))[0]!
      const ov = paymentOverrides.value[pay.id]
      return ov ? { ...pay, ...ov, id: pay.id } : pay
    })
  })

  const settlements = computed((): SellerSettlement[] => {
    const fromPayouts = payouts.value.map((p) => {
      const base = mapPayoutToSettlement(p)
      const ov = settlementOverrides.value[base.id]
      return ov ? { ...base, ...ov, id: base.id } : base
    })
    const local = localSettlements.value.map((s) => {
      const ov = settlementOverrides.value[s.id]
      return ov ? { ...s, ...ov, id: s.id } : s
    })
    const byId = new Map<string, SellerSettlement>()
    for (const s of [...fromPayouts, ...local]) byId.set(s.id, s)
    return [...byId.values()].sort((a, b) => String(b.settlementDate).localeCompare(String(a.settlementDate)))
  })

  const transactions = computed((): SellerFinanceTransaction[] =>
    buildFinanceLedger({
      payments: payments.value,
      refunds: refunds.value,
      settlements: settlements.value,
      adjustments: adjustments.value,
    }),
  )

  const discrepancies = computed((): FinanceDiscrepancy[] =>
    detectFinanceDiscrepancies({
      orders: orders.value,
      getCommerce: (orderId) => {
        const order = orders.value.find(o => o.id === orderId)
        return order ? getCommerce(order) : getCommerce({
          id: orderId,
          date: '',
          dateKey: '',
          status: 'new',
          customerName: '',
          customerPhone: '',
          city: '',
          address: { province: '', city: '', address: '', postalCode: '' },
          items: [],
          total: 0,
          shippingMethod: '',
          paymentMethod: '',
        })
      },
      payments: payments.value,
      refunds: refunds.value,
      settlements: settlements.value,
      transactions: transactions.value,
      reconciledIds: new Set(reconciledIds.value),
    }),
  )

  const openDiscrepancies = computed(() => discrepancies.value.filter(d => !d.reconciled))

  function inPeriod(date: string | null | undefined, r = range.value) {
    return isDateInRange(date, r.start, r.end)
  }

  const kpis = computed((): FinanceKpiBundle => {
    const r = range.value
    const todayR = resolveFinanceRange('today')
    const weekR = resolveFinanceRange('last_7')
    const monthR = resolveFinanceRange('this_month')

    const periodPayments = payments.value.filter(p => inPeriod(p.createdAt, r))
    const prevPayments = payments.value.filter(p => isDateInRange(p.createdAt, r.previousStart, r.previousEnd))
    const successful = (list: SellerPayment[]) => list.filter(p => p.status === 'successful' || p.status === 'partially_refunded' || p.status === 'refunded')

    const gross = successful(periodPayments).reduce((s, p) => s + p.amount, 0)
    const periodRefunds = refunds.value.filter(rf => inPeriod(rf.createdAt, r) && rf.status === 'completed')
    const refundSum = periodRefunds.reduce((s, rf) => s + rf.amount, 0)
    const net = Math.max(0, gross - refundSum)

    const prevGross = successful(prevPayments).reduce((s, p) => s + p.amount, 0)
    const prevRefund = refunds.value
      .filter(rf => isDateInRange(rf.createdAt, r.previousStart, r.previousEnd) && rf.status === 'completed')
      .reduce((s, rf) => s + rf.amount, 0)
    const prevNet = Math.max(0, prevGross - prevRefund)

    const todayGross = successful(payments.value.filter(p => inPeriod(p.createdAt, todayR))).reduce((s, p) => s + p.amount, 0)
    const weekGross = successful(payments.value.filter(p => inPeriod(p.createdAt, weekR))).reduce((s, p) => s + p.amount, 0)
    const monthGross = successful(payments.value.filter(p => inPeriod(p.createdAt, monthR))).reduce((s, p) => s + p.amount, 0)

    const periodOrders = orders.value.filter(o => inPeriod(o.date, r))
    let paidOrders = 0
    let unpaidOrders = 0
    let failedPayments = 0
    let refundedOrders = 0
    let partiallyRefundedOrders = 0
    for (const o of periodOrders) {
      const c = getCommerce(o)
      if (c.paymentStatus === 'paid') paidOrders++
      else if (c.paymentStatus === 'pending') unpaidOrders++
      else if (c.paymentStatus === 'failed') failedPayments++
      else if (c.paymentStatus === 'refunded') refundedOrders++
      else if (c.paymentStatus === 'partially_refunded') partiallyRefundedOrders++
    }

    const succCount = successful(periodPayments).length
    const pendingPay = periodPayments.filter(p => p.status === 'pending' || p.status === 'processing').length
    const failedPay = periodPayments.filter(p => p.status === 'failed').length
    const volume = successful(periodPayments).reduce((s, p) => s + p.amount, 0)

    const allPeriodRefunds = refunds.value.filter(rf => inPeriod(rf.createdAt, r))
    const pendingRefunds = allPeriodRefunds.filter(rf => rf.status === 'pending' || rf.status === 'processing').length
    const completedRefunds = allPeriodRefunds.filter(rf => rf.status === 'completed').length
    const failedRefunds = allPeriodRefunds.filter(rf => rf.status === 'failed').length

    const pendingReceivables = payments.value
      .filter(p => p.status === 'pending' || p.status === 'processing')
      .reduce((s, p) => s + p.amount, 0)
    const pendingSettlements = settlements.value
      .filter(s => s.status === 'pending' || s.status === 'processing')
      .reduce((s, x) => s + x.amount, 0)

    return {
      ...emptyFinanceKpis(),
      grossRevenue: gross,
      netRevenue: net,
      todayRevenue: todayGross,
      weekRevenue: weekGross,
      monthRevenue: monthGross,
      revenuePrev: prevNet,
      revenueChangePct: percentChange(net, prevNet),
      paidOrders,
      unpaidOrders,
      failedPayments,
      refundedOrders,
      partiallyRefundedOrders,
      successfulPayments: succCount,
      pendingPayments: pendingPay,
      failedPaymentCount: failedPay,
      paymentVolume: volume,
      avgTransactionValue: succCount ? Math.round(volume / succCount) : 0,
      totalRefunded: refundSum,
      pendingRefunds,
      completedRefunds,
      failedRefunds,
      pendingReceivables,
      pendingSettlements,
      openReconciliationIssues: openDiscrepancies.value.length,
    }
  })

  /** Discount impact for reports (order commerce + optional promo totals) */
  const discountImpact = computed(() => {
    const r = range.value
    const orderDiscount = orders.value
      .filter(o => inPeriod(o.date, r))
      .reduce((s, o) => s + (getCommerce(o).discountAmount || 0), 0)
    return {
      orderDiscountTotal: orderDiscount,
    }
  })

  async function ensureLoaded(force = false) {
    if (loaded.value && !force) return
    loading.value = true
    try {
      ensureRefunds()
      await Promise.all([
        fetchOrders({ force }),
        fetchFinance({ force }),
      ])
      loaded.value = true
    }
    finally {
      loading.value = false
    }
  }

  function getPayment(id: string) {
    return payments.value.find(p => p.id === id) ?? null
  }

  function getTransaction(id: string) {
    return transactions.value.find(t => t.id === id) ?? null
  }

  function getSettlement(id: string) {
    return settlements.value.find(s => s.id === id) ?? null
  }

  function reviewPayment(id: string, note: string, actor: { id: string, name: string }) {
    const pay = getPayment(id)
    if (!pay) return { ok: false as const, error: 'پرداخت یافت نشد' }
    paymentOverrides.value = {
      ...paymentOverrides.value,
      [id]: {
        ...paymentOverrides.value[id],
        adminNote: note.trim(),
        reviewedAt: new Date().toISOString(),
      },
    }
    appendLog({
      actorId: actor.id,
      actorName: actor.name,
      action: 'update',
      entity: 'payment',
      entityId: id,
      summary: 'بررسی دستی وضعیت پرداخت',
      previousValue: pay.adminNote || null,
      newValue: note.trim() || null,
    })
    return { ok: true as const }
  }

  async function createSettlement(input: {
    amount: number
    fees?: number
    source: SellerSettlementSource
    gateway: string
    reference?: string
    note?: string
    actor: { id: string, name: string }
  }) {
    const amount = Math.max(0, Math.round(input.amount))
    if (amount <= 0) return { ok: false as const, error: 'مبلغ نامعتبر است' }
    const fees = Math.max(0, Math.round(input.fees ?? Math.round(amount * 0.01)))
    const now = new Date().toISOString()

    // API seam: POST /seller/payouts with explicit amount (not marketplace withdraw UX)
    let id = `stl-local-${Date.now()}`
    try {
      const { result } = await usePost<SellerPayout>(
        '/seller/payouts',
        { amount },
        { headers: { 'no-error': true } },
      )
      if (result?.id) {
        id = mapPayoutToSettlement(toSellerPayout(result)).id
        // refresh payout list quietly
        await fetchFinance({ force: true })
      }
    }
    catch {
      // FE-only settlement row when API unavailable
    }

    const row: SellerSettlement = {
      id,
      source: input.source,
      gateway: input.gateway,
      amount,
      fees,
      netAmount: Math.max(0, amount - fees),
      status: 'pending',
      settlementDate: now.slice(0, 10),
      reference: input.reference?.trim() || '',
      relatedPaymentIds: [],
      relatedTransactionIds: [],
      note: input.note?.trim() || '',
      createdAt: now,
      updatedAt: now,
    }
    localSettlements.value = [row, ...localSettlements.value.filter(s => s.id !== id)]
    settlementOverrides.value = { ...settlementOverrides.value, [id]: row }

    appendLog({
      actorId: input.actor.id,
      actorName: input.actor.name,
      action: 'create',
      entity: 'settlement',
      entityId: id,
      summary: 'ثبت تسویه درگاه/بانک',
      newValue: String(amount),
    })
    return { ok: true as const, settlement: row }
  }

  function setSettlementStatus(
    id: string,
    status: SellerSettlementStatus,
    actor: { id: string, name: string },
    reference?: string,
  ) {
    const current = getSettlement(id)
    if (!current) return { ok: false as const, error: 'تسویه یافت نشد' }
    const patch: Partial<SellerSettlement> = {
      status,
      updatedAt: new Date().toISOString(),
      ...(reference != null ? { reference: reference.trim() } : {}),
    }
    settlementOverrides.value = {
      ...settlementOverrides.value,
      [id]: { ...settlementOverrides.value[id], ...patch },
    }
    appendLog({
      actorId: actor.id,
      actorName: actor.name,
      action: 'status_change',
      entity: 'settlement',
      entityId: id,
      summary: `وضعیت تسویه به «${status}» تغییر کرد`,
      previousValue: current.status,
      newValue: status,
    })
    return { ok: true as const }
  }

  function createAdjustment(input: {
    type: SellerFinanceAdjustmentType
    amount: number
    reason: string
    orderId?: string | null
    actor: { id: string, name: string }
  }) {
    const reason = input.reason.trim()
    if (!reason) return { ok: false as const, error: 'دلیل الزامی است' }
    const amount = Math.round(input.amount)
    if (!amount) return { ok: false as const, error: 'مبلغ نامعتبر است' }
    const row: SellerFinanceAdjustment = {
      id: `adj-${Date.now()}`,
      type: input.type,
      amount,
      reason,
      orderId: input.orderId ?? null,
      actorId: input.actor.id,
      actorName: input.actor.name,
      createdAt: new Date().toISOString(),
    }
    adjustments.value = [row, ...adjustments.value]
    appendLog({
      actorId: input.actor.id,
      actorName: input.actor.name,
      action: 'create',
      entity: 'adjustment',
      entityId: row.id,
      summary: `تعدیل مالی: ${reason}`,
      newValue: String(amount),
    })
    return { ok: true as const, adjustment: row }
  }

  function markDiscrepancyReconciled(id: string, actor: { id: string, name: string }) {
    if (!reconciledIds.value.includes(id)) {
      reconciledIds.value = [...reconciledIds.value, id]
    }
    appendLog({
      actorId: actor.id,
      actorName: actor.name,
      action: 'status_change',
      entity: 'finance',
      entityId: id,
      summary: 'مغایرت مالی به‌عنوان رسیدگی‌شده علامت خورد',
      newValue: 'reconciled',
    })
    return { ok: true as const }
  }

  function updateGateway(id: string, patch: Partial<Pick<SellerFinanceGateway, 'enabled' | 'priority'>>) {
    gateways.value = gateways.value.map((g) => {
      if (g.id !== id) return g
      return { ...g, ...patch }
    }).sort((a, b) => a.priority - b.priority)
  }

  function setPeriod(next: FinancePeriodId) {
    period.value = next
  }

  function filterPayments(opts: {
    search?: string
    status?: string
    gateway?: string
  }) {
    let list = [...payments.value]
    const q = opts.search?.trim().toLowerCase()
    if (q) {
      list = list.filter(p =>
        p.id.toLowerCase().includes(q)
        || p.orderId.toLowerCase().includes(q)
        || (p.refId || '').toLowerCase().includes(q)
        || (p.authority || '').toLowerCase().includes(q)
        || p.customerName.includes(opts.search!.trim()),
      )
    }
    if (opts.status && opts.status !== 'all') {
      list = list.filter(p => p.status === opts.status as SellerFinancePaymentStatus)
    }
    if (opts.gateway && opts.gateway !== 'all') {
      list = list.filter(p => p.gateway === opts.gateway)
    }
    return list
  }

  function filterTransactions(opts: {
    search?: string
    type?: string
    status?: string
    gateway?: string
    customer?: string
    orderId?: string
    amountMin?: number | null
    amountMax?: number | null
  }) {
    let list = [...transactions.value]
    const q = opts.search?.trim().toLowerCase()
    if (q) {
      list = list.filter(t =>
        t.id.toLowerCase().includes(q)
        || (t.orderId || '').toLowerCase().includes(q)
        || t.reference.toLowerCase().includes(q)
        || t.customerName.includes(opts.search!.trim()),
      )
    }
    if (opts.type && opts.type !== 'all') list = list.filter(t => t.type === opts.type)
    if (opts.status && opts.status !== 'all') list = list.filter(t => t.status === opts.status)
    if (opts.gateway && opts.gateway !== 'all') list = list.filter(t => t.gateway === opts.gateway)
    if (opts.orderId) list = list.filter(t => t.orderId === opts.orderId)
    if (opts.customer) list = list.filter(t => t.customerName.includes(opts.customer!) || t.customerId === opts.customer)
    if (opts.amountMin != null) list = list.filter(t => t.amount >= opts.amountMin!)
    if (opts.amountMax != null) list = list.filter(t => t.amount <= opts.amountMax!)
    return list
  }

  return {
    period,
    customStart,
    customEnd,
    range,
    setPeriod,
    loaded,
    loading,
    sellerPending,
    payments,
    settlements,
    adjustments,
    gateways,
    transactions,
    discrepancies,
    openDiscrepancies,
    kpis,
    discountImpact,
    sales,
    refunds,
    orders,
    ensureLoaded,
    getPayment,
    getTransaction,
    getSettlement,
    reviewPayment,
    createSettlement,
    setSettlementStatus,
    createAdjustment,
    markDiscrepancyReconciled,
    updateGateway,
    filterPayments,
    filterTransactions,
    getCommerce,
  }
}
