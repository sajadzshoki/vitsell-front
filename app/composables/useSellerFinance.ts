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
import {
  buildDefaultGateways,
  type SellerFinanceGateway,
  type SellerGatewayConfigStatus,
} from '~/data/seller-finance-gateways'
import {
  buildFinanceLedger,
  projectAdjustmentsToTransactions,
  projectSettlementsToTransactions,
  type SellerFinanceTransaction,
} from '~/data/seller-finance-transactions'
import { detectFinanceDiscrepancies, type FinanceDiscrepancy } from '~/data/seller-finance-reconciliation'

function apiErrorMessage(error: any, fallback: string) {
  return (
    error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
    || error?.data?.message
    || error?.message
    || fallback
  )
}

function gatewaysFromIntegrations(
  integrations: Array<{ id: string, label: string, status: string, hint: string }>,
): SellerFinanceGateway[] | null {
  const paymentish = integrations.filter(i =>
    /zarin|payment|درگاه|پرداخت/i.test(`${i.id} ${i.label}`),
  )
  if (!paymentish.length) return null
  return paymentish.map((row, index) => {
    const status = row.status as string
    let configStatus: SellerGatewayConfigStatus = 'not_configured'
    if (status === 'live' || status === 'sandbox') configStatus = 'live'
    else if (status === 'mock') configStatus = 'display_only'
    return {
      id: row.id || `gw-${index + 1}`,
      name: row.label || row.id,
      enabled: status === 'live' || status === 'sandbox' || status === 'mock',
      priority: index + 1,
      supportedMethods: ['آنلاین'],
      configStatus,
      note: row.hint || 'وضعیت از نمای سیستم سرور',
    }
  })
}

export function useSellerFinance() {
  const { orders, payouts, sales, pending: sellerPending, fetchFinance, fetchOrders } = useSeller()
  const { getCommerce } = useSellerOrderCommerce()
  const { refunds, fetchList: fetchRefunds } = useSellerRefunds()
  const { overview, fetchOverview } = useSellerSystem()
  const { appendLog } = useSellerAudit()

  const paymentOverrides = useState<Record<string, Partial<SellerPayment>>>('seller-finance-payment-overrides', () => ({}))
  const settlementOverrides = useState<Record<string, Partial<SellerSettlement>>>('seller-finance-settlement-overrides', () => ({}))
  const localSettlements = useState<SellerSettlement[]>('seller-finance-local-settlements', () => [])
  const adjustments = useState<SellerFinanceAdjustment[]>('seller-finance-adjustments', () => buildDefaultAdjustments())
  const adjustmentsMeta = useState<{
    typeCounts: Record<string, number>
    summary: { credit: number, debit: number, net: number }
    total: number
  }>('seller-finance-adjustments-meta', () => ({
    typeCounts: { all: 0 },
    summary: { credit: 0, debit: 0, net: 0 },
    total: 0,
  }))
  const adjustmentsLoaded = useState('seller-finance-adjustments-loaded', () => false)
  const gateways = useState<SellerFinanceGateway[]>('seller-finance-gateways', () => buildDefaultGateways())
  const reconciledIds = useState<string[]>('seller-finance-reconciled-ids', () => [])
  const period = useState<FinancePeriodId>('seller-finance-period', () => 'last_30')
  const customStart = useState<string>('seller-finance-custom-start', () => '')
  const customEnd = useState<string>('seller-finance-custom-end', () => '')
  const loaded = useState('seller-finance-loaded', () => false)
  const loading = useState('seller-finance-loading', () => false)
  const loadError = useState<string | null>('seller-finance-load-error', () => null)
  const apiTransactions = useState<SellerFinanceTransaction[] | null>('seller-finance-api-transactions', () => null)
  const transactionsMeta = useState<{
    statusCounts: Record<string, number>
    typeCounts: Record<string, number>
    gatewayOptions: string[]
    total: number
  }>('seller-finance-transactions-meta', () => ({
    statusCounts: { all: 0 },
    typeCounts: { all: 0 },
    gatewayOptions: [],
    total: 0,
  }))
  const apiPayments = useState<SellerPayment[] | null>('seller-finance-api-payments', () => null)
  const paymentsMeta = useState<{
    statusCounts: Record<string, number>
    gatewayOptions: string[]
    total: number
  }>('seller-finance-payments-meta', () => ({
    statusCounts: { all: 0 },
    gatewayOptions: [],
    total: 0,
  }))
  const apiSettlements = useState<SellerSettlement[] | null>('seller-finance-api-settlements', () => null)
  const settlementsMeta = useState<{
    statusCounts: Record<string, number>
    gatewayOptions: string[]
    total: number
  }>('seller-finance-settlements-meta', () => ({
    statusCounts: { all: 0 },
    gatewayOptions: [],
    total: 0,
  }))
  const apiDiscrepancies = useState<FinanceDiscrepancy[] | null>('seller-finance-api-discrepancies', () => null)
  const reconciliationMeta = useState<{
    openCount: number
    resolvedCount: number
    severityCounts: Record<string, number>
    generatedAt: string | null
  }>('seller-finance-reconciliation-meta', () => ({
    openCount: 0,
    resolvedCount: 0,
    severityCounts: { all: 0, high: 0, medium: 0, low: 0 },
    generatedAt: null,
  }))
  const apiReports = useState<{
    periodKey: string
    kpis: FinanceKpiBundle
    discountImpact: { orderDiscountTotal: number }
    trend: { labels: string[], sales: number[], payments: number[] }
    generatedAt: string | null
  } | null>('seller-finance-api-reports', () => null)

  function toTransaction(raw: any): SellerFinanceTransaction {
    return {
      id: String(raw.id || ''),
      type: raw.type,
      amount: Math.max(0, Math.round(Number(raw.amount) || 0)),
      signedAmount: Math.round(Number(raw.signedAmount) || 0),
      status: raw.status,
      paymentMethod: String(raw.paymentMethod || ''),
      gateway: String(raw.gateway || ''),
      orderId: raw.orderId ? String(raw.orderId) : null,
      customerId: raw.customerId != null ? String(raw.customerId) : null,
      customerName: String(raw.customerName || ''),
      customerPhone: String(raw.customerPhone || ''),
      reference: String(raw.reference || ''),
      paymentId: raw.paymentId ? String(raw.paymentId) : null,
      refundId: raw.refundId ? String(raw.refundId) : null,
      settlementId: raw.settlementId ? String(raw.settlementId) : null,
      adjustmentId: raw.adjustmentId ? String(raw.adjustmentId) : null,
      createdAt: String(raw.createdAt || ''),
      completedAt: raw.completedAt ? String(raw.completedAt) : null,
      sourceLabel: String(raw.sourceLabel || ''),
    }
  }

  function toPayment(raw: any): SellerPayment {
    return {
      id: String(raw.id || ''),
      orderId: String(raw.orderId || ''),
      customerId: raw.customerId != null ? String(raw.customerId) : null,
      customerName: String(raw.customerName || ''),
      customerPhone: String(raw.customerPhone || ''),
      amount: Math.max(0, Math.round(Number(raw.amount) || 0)),
      currency: String(raw.currency || 'IRR'),
      paymentMethod: String(raw.paymentMethod || ''),
      gateway: String(raw.gateway || ''),
      status: raw.status,
      authority: raw.authority ? String(raw.authority) : null,
      refId: raw.refId ? String(raw.refId) : null,
      cardPan: raw.cardPan ? String(raw.cardPan) : null,
      transactionId: String(raw.transactionId || ''),
      adminNote: String(raw.adminNote || ''),
      createdAt: String(raw.createdAt || ''),
      completedAt: raw.completedAt ? String(raw.completedAt) : null,
      reviewedAt: raw.reviewedAt ? String(raw.reviewedAt) : null,
    }
  }

  function toSettlement(raw: any): SellerSettlement {
    const amount = Math.max(0, Math.round(Number(raw.amount) || 0))
    const fees = Math.max(0, Math.round(Number(raw.fees) || 0))
    return {
      id: String(raw.id || ''),
      source: (raw.source || 'gateway') as SellerSettlementSource,
      gateway: String(raw.gateway || 'زرین‌پال'),
      amount,
      fees,
      netAmount: Math.max(0, Number(raw.netAmount) || amount - fees),
      status: raw.status as SellerSettlementStatus,
      settlementDate: String(raw.settlementDate || '').slice(0, 10),
      reference: String(raw.reference || ''),
      relatedPaymentIds: Array.isArray(raw.relatedPaymentIds) ? raw.relatedPaymentIds.map(String) : [],
      relatedTransactionIds: Array.isArray(raw.relatedTransactionIds) ? raw.relatedTransactionIds.map(String) : [],
      note: String(raw.note || ''),
      createdAt: String(raw.createdAt || ''),
      updatedAt: String(raw.updatedAt || raw.createdAt || ''),
    }
  }

  async function fetchTransactionsLedger(options?: { force?: boolean }) {
    if (apiTransactions.value?.length && !options?.force) {
      return { ok: true as const, error: null as null }
    }
    const { result, error } = await useGet<{
      items: SellerFinanceTransaction[]
      total: number
      statusCounts?: Record<string, number>
      typeCounts?: Record<string, number>
      gatewayOptions?: string[]
    }>('/seller/transactions', {
      query: { all: true, pageSize: 500 },
      headers: { 'no-error': true },
    })
    if (error || result == null) {
      return {
        ok: false as const,
        error: apiErrorMessage(error, 'بارگذاری تراکنش‌ها ناموفق بود'),
      }
    }
    const items = Array.isArray(result.items) ? result.items.map(toTransaction) : []
    apiTransactions.value = items
    transactionsMeta.value = {
      total: Number(result.total) || items.length,
      statusCounts: result.statusCounts || { all: items.length },
      typeCounts: result.typeCounts || { all: items.length },
      gatewayOptions: Array.isArray(result.gatewayOptions) ? result.gatewayOptions : [],
    }
    return { ok: true as const, error: null as null }
  }

  async function fetchPaymentsList(options?: { force?: boolean }) {
    if (apiPayments.value?.length && !options?.force) {
      return { ok: true as const, error: null as null }
    }
    const { result, error } = await useGet<{
      items: SellerPayment[]
      total: number
      statusCounts?: Record<string, number>
      gatewayOptions?: string[]
    }>('/seller/payments', {
      query: { all: true, pageSize: 500 },
      headers: { 'no-error': true },
    })
    if (error || result == null) {
      return {
        ok: false as const,
        error: apiErrorMessage(error, 'بارگذاری پرداخت‌ها ناموفق بود'),
      }
    }
    const items = Array.isArray(result.items) ? result.items.map(toPayment) : []
    apiPayments.value = items
    paymentsMeta.value = {
      total: Number(result.total) || items.length,
      statusCounts: result.statusCounts || { all: items.length },
      gatewayOptions: Array.isArray(result.gatewayOptions) ? result.gatewayOptions : [],
    }
    return { ok: true as const, error: null as null }
  }

  async function fetchTransaction(id: string) {
    const cached = (apiTransactions.value || []).find(t => t.id === id)
    if (cached) return { ok: true as const, transaction: cached, error: null as null }
    const { result, error } = await useGet<SellerFinanceTransaction>(
      `/seller/transactions/${encodeURIComponent(id)}`,
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return {
        ok: false as const,
        transaction: null as SellerFinanceTransaction | null,
        error: apiErrorMessage(error, 'تراکنش یافت نشد'),
      }
    }
    const row = toTransaction(result)
    apiTransactions.value = [row, ...(apiTransactions.value || []).filter(t => t.id !== row.id)]
    return { ok: true as const, transaction: row, error: null as null }
  }

  async function fetchPayment(id: string) {
    const key = String(id || '').trim()
    const cached = (apiPayments.value || []).find(p => p.id === key || p.orderId === key || p.id === `pay-${key}`)
    if (cached) return { ok: true as const, payment: cached, error: null as null }
    const { result, error } = await useGet<SellerPayment>(
      `/seller/payments/${encodeURIComponent(key)}`,
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return {
        ok: false as const,
        payment: null as SellerPayment | null,
        error: apiErrorMessage(error, 'پرداخت یافت نشد'),
      }
    }
    const row = toPayment(result)
    apiPayments.value = [row, ...(apiPayments.value || []).filter(p => p.id !== row.id)]
    return { ok: true as const, payment: row, error: null as null }
  }

  async function fetchSettlementsList(options?: { force?: boolean }) {
    if (apiSettlements.value?.length && !options?.force) {
      return { ok: true as const, error: null as null }
    }
    const { result, error } = await useGet<{
      items: SellerSettlement[]
      total: number
      statusCounts?: Record<string, number>
      gatewayOptions?: string[]
    }>('/seller/settlements', {
      query: { all: true, pageSize: 200 },
      headers: { 'no-error': true },
    })
    if (error || result == null) {
      return {
        ok: false as const,
        error: apiErrorMessage(error, 'بارگذاری تسویه‌ها ناموفق بود'),
      }
    }
    const items = Array.isArray(result.items) ? result.items.map(toSettlement) : []
    apiSettlements.value = items
    settlementsMeta.value = {
      total: Number(result.total) || items.length,
      statusCounts: result.statusCounts || { all: items.length },
      gatewayOptions: Array.isArray(result.gatewayOptions) ? result.gatewayOptions : [],
    }
    return { ok: true as const, error: null as null }
  }

  async function fetchSettlement(id: string) {
    const key = String(id || '').trim()
    const cached = (apiSettlements.value || []).find(s =>
      s.id === key || s.id === `stl-${key}` || key === `stl-${s.id}`,
    )
    if (cached) return { ok: true as const, settlement: cached, error: null as null }
    const { result, error } = await useGet<SellerSettlement>(
      `/seller/settlements/${encodeURIComponent(key)}`,
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return {
        ok: false as const,
        settlement: null as SellerSettlement | null,
        error: apiErrorMessage(error, 'تسویه یافت نشد'),
      }
    }
    const row = toSettlement(result)
    apiSettlements.value = [row, ...(apiSettlements.value || []).filter(s => s.id !== row.id)]
    return { ok: true as const, settlement: row, error: null as null }
  }

  function toDiscrepancy(raw: any): FinanceDiscrepancy {
    return {
      id: String(raw.id || ''),
      code: String(raw.code || ''),
      severity: raw.severity === 'high' || raw.severity === 'medium' || raw.severity === 'low'
        ? raw.severity
        : 'low',
      title: String(raw.title || ''),
      detail: String(raw.detail || ''),
      orderId: raw.orderId ? String(raw.orderId) : null,
      paymentId: raw.paymentId ? String(raw.paymentId) : null,
      settlementId: raw.settlementId ? String(raw.settlementId) : null,
      refundId: raw.refundId ? String(raw.refundId) : null,
      reconciled: Boolean(raw.reconciled),
    }
  }

  async function fetchReconciliation(options?: { force?: boolean }) {
    if (apiDiscrepancies.value && !options?.force) {
      return { ok: true as const, error: null as null }
    }
    const { result, error } = await useGet<{
      items: FinanceDiscrepancy[]
      openCount?: number
      resolvedCount?: number
      severityCounts?: Record<string, number>
      reconciledIds?: string[]
      generatedAt?: string
    }>('/seller/reconciliation', {
      headers: { 'no-error': true },
    })
    if (error || result == null) {
      return {
        ok: false as const,
        error: apiErrorMessage(error, 'بارگذاری مغایرت‌گیری ناموفق بود'),
      }
    }
    const items = Array.isArray(result.items) ? result.items.map(toDiscrepancy) : []
    apiDiscrepancies.value = items
    if (Array.isArray(result.reconciledIds)) {
      reconciledIds.value = result.reconciledIds.map(String)
    }
    reconciliationMeta.value = {
      openCount: Number(result.openCount) || items.filter(i => !i.reconciled).length,
      resolvedCount: Number(result.resolvedCount) || items.filter(i => i.reconciled).length,
      severityCounts: result.severityCounts || {
        all: items.length,
        high: items.filter(i => i.severity === 'high').length,
        medium: items.filter(i => i.severity === 'medium').length,
        low: items.filter(i => i.severity === 'low').length,
      },
      generatedAt: result.generatedAt || new Date().toISOString(),
    }
    return { ok: true as const, error: null as null }
  }

  function toAdjustment(raw: any): SellerFinanceAdjustment {
    return {
      id: String(raw.id || ''),
      type: raw.type,
      amount: Math.round(Number(raw.amount) || 0),
      reason: String(raw.reason || ''),
      orderId: raw.orderId ? String(raw.orderId) : null,
      actorId: String(raw.actorId || 'admin'),
      actorName: String(raw.actorName || 'ادمین'),
      createdAt: String(raw.createdAt || ''),
    }
  }

  async function fetchAdjustments(options?: { force?: boolean }) {
    if (adjustmentsLoaded.value && !options?.force) {
      return { ok: true as const, error: null as null }
    }
    const { result, error } = await useGet<{
      items: SellerFinanceAdjustment[]
      total?: number
      typeCounts?: Record<string, number>
      summary?: { credit: number, debit: number, net: number }
    }>('/seller/adjustments', {
      headers: { 'no-error': true },
    })
    if (error || result == null) {
      return {
        ok: false as const,
        error: apiErrorMessage(error, 'بارگذاری تعدیلات ناموفق بود'),
      }
    }
    const items = Array.isArray(result.items) ? result.items.map(toAdjustment) : []
    adjustments.value = items
    adjustmentsMeta.value = {
      total: Number(result.total) || items.length,
      typeCounts: result.typeCounts || { all: items.length },
      summary: result.summary || {
        credit: items.filter(i => i.amount > 0).reduce((s, i) => s + i.amount, 0),
        debit: items.filter(i => i.amount < 0).reduce((s, i) => s + Math.abs(i.amount), 0),
        net: items.reduce((s, i) => s + i.amount, 0),
      },
    }
    adjustmentsLoaded.value = true
    return { ok: true as const, error: null as null }
  }

  function reportsPeriodKey(
    p = period.value,
    start = customStart.value,
    end = customEnd.value,
  ) {
    return `${p}|${start || ''}|${end || ''}`
  }

  async function fetchReports(options?: { force?: boolean }) {
    const key = reportsPeriodKey()
    if (apiReports.value?.periodKey === key && !options?.force) {
      return { ok: true as const, error: null as null }
    }
    const query: Record<string, string> = { period: period.value }
    if (period.value === 'custom') {
      if (customStart.value) query.start = customStart.value
      if (customEnd.value) query.end = customEnd.value
    }
    const { result, error } = await useGet<{
      period?: string
      kpis?: FinanceKpiBundle
      discountImpact?: { orderDiscountTotal: number }
      trend?: { labels: string[], sales: number[], payments: number[] }
      generatedAt?: string
    }>('/seller/reports', {
      query,
      headers: { 'no-error': true },
    })
    if (error || result == null) {
      return {
        ok: false as const,
        error: apiErrorMessage(error, 'بارگذاری گزارش مالی ناموفق بود'),
      }
    }
    apiReports.value = {
      periodKey: key,
      kpis: { ...emptyFinanceKpis(), ...(result.kpis || {}) },
      discountImpact: {
        orderDiscountTotal: Math.round(Number(result.discountImpact?.orderDiscountTotal) || 0),
      },
      trend: {
        labels: Array.isArray(result.trend?.labels) ? result.trend!.labels.map(String) : [],
        sales: Array.isArray(result.trend?.sales)
          ? result.trend!.sales.map(v => Math.round(Number(v) || 0))
          : [],
        payments: Array.isArray(result.trend?.payments)
          ? result.trend!.payments.map(v => Math.round(Number(v) || 0))
          : [],
      },
      generatedAt: result.generatedAt || new Date().toISOString(),
    }
    return { ok: true as const, error: null as null }
  }

  const range = computed((): FinanceDateRange =>
    resolveFinanceRange(period.value, customStart.value || null, customEnd.value || null),
  )

  const payments = computed((): SellerPayment[] => {
    const derived = orders.value.map((o) => {
      const pay = buildPaymentsFromOrders([o], () => getCommerce(o))[0]!
      const ov = paymentOverrides.value[pay.id]
      return ov ? { ...pay, ...ov, id: pay.id } : pay
    })

    if (!apiPayments.value?.length) return derived

    const byId = new Map<string, SellerPayment>()
    for (const row of apiPayments.value) {
      const ov = paymentOverrides.value[row.id]
      byId.set(row.id, ov ? { ...row, ...ov, id: row.id } : row)
    }
    // Keep any derived rows missing from API (edge cases)
    for (const row of derived) {
      if (!byId.has(row.id)) byId.set(row.id, row)
    }
    return [...byId.values()].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
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

    if (!apiSettlements.value?.length) {
      const byId = new Map<string, SellerSettlement>()
      for (const s of [...fromPayouts, ...local]) byId.set(s.id, s)
      return [...byId.values()].sort((a, b) => String(b.settlementDate).localeCompare(String(a.settlementDate)))
    }

    const byId = new Map<string, SellerSettlement>()
    for (const row of apiSettlements.value) {
      const ov = settlementOverrides.value[row.id]
      byId.set(row.id, ov ? { ...row, ...ov, id: row.id } : row)
    }
    for (const s of local) {
      if (!byId.has(s.id)) byId.set(s.id, s)
    }
    return [...byId.values()].sort((a, b) => String(b.settlementDate).localeCompare(String(a.settlementDate)))
  })

  const derivedTransactions = computed((): SellerFinanceTransaction[] =>
    buildFinanceLedger({
      payments: payments.value,
      refunds: refunds.value,
      settlements: settlements.value,
      adjustments: adjustments.value,
    }),
  )

  const transactions = computed((): SellerFinanceTransaction[] => {
    if (!apiTransactions.value?.length) return derivedTransactions.value

    const byId = new Map<string, SellerFinanceTransaction>()
    for (const row of apiTransactions.value) {
      let next = row
      if (row.paymentId && paymentOverrides.value[row.paymentId]) {
        const ov = paymentOverrides.value[row.paymentId]!
        next = {
          ...row,
          reference: ov.refId || ov.authority || row.reference,
          completedAt: ov.completedAt ?? row.completedAt,
        }
      }
      byId.set(next.id, next)
    }

    for (const row of projectAdjustmentsToTransactions(adjustments.value)) {
      byId.set(row.id, row)
    }
    for (const row of projectSettlementsToTransactions(localSettlements.value)) {
      byId.set(row.id, row)
    }

    return [...byId.values()].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
  })

  const derivedDiscrepancies = computed((): FinanceDiscrepancy[] =>
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

  const discrepancies = computed((): FinanceDiscrepancy[] => {
    if (apiDiscrepancies.value) {
      return apiDiscrepancies.value.map(d => ({
        ...d,
        reconciled: d.reconciled || reconciledIds.value.includes(d.id),
      }))
    }
    return derivedDiscrepancies.value
  })

  const openDiscrepancies = computed(() => discrepancies.value.filter(d => !d.reconciled))

  function inPeriod(date: string | null | undefined, r = range.value) {
    return isDateInRange(date, r.start, r.end)
  }

  const derivedKpis = computed((): FinanceKpiBundle => {
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

  const kpis = computed((): FinanceKpiBundle => {
    if (apiReports.value?.periodKey === reportsPeriodKey()) {
      return {
        ...apiReports.value.kpis,
        openReconciliationIssues: openDiscrepancies.value.length,
      }
    }
    return derivedKpis.value
  })

  /** Discount impact for reports (order commerce + optional promo totals) */
  const derivedDiscountImpact = computed(() => {
    const r = range.value
    const orderDiscount = orders.value
      .filter(o => inPeriod(o.date, r))
      .reduce((s, o) => s + (getCommerce(o).discountAmount || 0), 0)
    return {
      orderDiscountTotal: orderDiscount,
    }
  })

  const discountImpact = computed(() => {
    if (apiReports.value?.periodKey === reportsPeriodKey()) {
      return apiReports.value.discountImpact
    }
    return derivedDiscountImpact.value
  })

  const reportTrend = computed(() => {
    if (apiReports.value?.periodKey === reportsPeriodKey() && apiReports.value.trend.labels.length) {
      return apiReports.value.trend
    }
    return {
      labels: sales.value.map(p => p.label),
      sales: sales.value.map(p => p.value),
      payments: [] as number[],
    }
  })

  async function ensureLoaded(force = false) {
    if (loaded.value && !force) return { ok: true as const, error: null as null }
    loading.value = true
    loadError.value = null
    try {
      const [refundsRes, ordersRes, financeRes, systemRes, txRes, payRes, stlRes, reconRes, adjRes, reportsRes] = await Promise.all([
        fetchRefunds({ all: true, pageSize: 200 }),
        fetchOrders({ force, query: { all: true, pageSize: 500 } }),
        fetchFinance({ force }),
        fetchOverview({ force }),
        fetchTransactionsLedger({ force }),
        fetchPaymentsList({ force }),
        fetchSettlementsList({ force }),
        fetchReconciliation({ force }),
        fetchAdjustments({ force }),
        fetchReports({ force }),
      ])

      const fromSystem = gatewaysFromIntegrations(overview.value.integrations)
      if (fromSystem?.length) {
        gateways.value = fromSystem
      }
      else if (!gateways.value.length) {
        gateways.value = buildDefaultGateways()
      }

      const failed
        = (!ordersRes.ok && apiErrorMessage(ordersRes.error, 'بارگذاری سفارش‌ها ناموفق بود'))
          || (!financeRes.ok && apiErrorMessage(financeRes.error, 'بارگذاری تسویه/فروش ناموفق بود'))
          || (!refundsRes.ok && apiErrorMessage(refundsRes.error, 'بارگذاری بازپرداخت‌ها ناموفق بود'))
          || (!txRes.ok && apiErrorMessage(txRes.error, 'بارگذاری تراکنش‌ها ناموفق بود'))
          || (!payRes.ok && apiErrorMessage(payRes.error, 'بارگذاری پرداخت‌ها ناموفق بود'))
          || (!stlRes.ok && apiErrorMessage(stlRes.error, 'بارگذاری تسویه‌ها ناموفق بود'))
          || (!reconRes.ok && apiErrorMessage(reconRes.error, 'بارگذاری مغایرت‌گیری ناموفق بود'))
          || (!adjRes.ok && apiErrorMessage(adjRes.error, 'بارگذاری تعدیلات ناموفق بود'))
          || (!reportsRes.ok && apiErrorMessage(reportsRes.error, 'بارگذاری گزارش مالی ناموفق بود'))
          || null

      if (failed && !ordersRes.ok && !financeRes.ok && !txRes.ok && !payRes.ok && !stlRes.ok && !reconRes.ok && !adjRes.ok && !reportsRes.ok) {
        loadError.value = failed
        return { ok: false as const, error: failed }
      }

      if (failed) {
        loadError.value = failed
      }

      loaded.value = true
      return {
        ok: true as const,
        error: failed,
        systemOk: systemRes.ok,
      }
    }
    finally {
      loading.value = false
    }
  }

  function getPayment(id: string) {
    const key = String(id || '').trim()
    return payments.value.find(p =>
      p.id === key || p.orderId === key || p.id === `pay-${key}`,
    ) ?? null
  }

  function getTransaction(id: string) {
    return transactions.value.find(t => t.id === id) ?? null
  }

  function getSettlement(id: string) {
    const key = String(id || '').trim()
    return settlements.value.find(s =>
      s.id === key
      || s.id === `stl-${key}`
      || (key.startsWith('stl-') && s.id === key.slice(4))
      || (s.id.startsWith('stl-') && s.id.slice(4) === key),
    ) ?? null
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

    const { result, error } = await usePost<SellerSettlement>(
      '/seller/settlements',
      {
        amount,
        fees,
        source: input.source,
        gateway: input.gateway.trim() || 'زرین‌پال',
        reference: input.reference?.trim() || '',
        note: input.note?.trim() || '',
      },
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return {
        ok: false as const,
        error: apiErrorMessage(error, 'ثبت تسویه ناموفق بود'),
      }
    }

    const row = toSettlement(result)
    apiSettlements.value = [row, ...(apiSettlements.value || []).filter(s => s.id !== row.id)]
    await Promise.all([
      fetchFinance({ force: true }),
      fetchTransactionsLedger({ force: true }),
      fetchSettlementsList({ force: true }),
    ])

    appendLog({
      actorId: input.actor.id,
      actorName: input.actor.name,
      action: 'create',
      entity: 'settlement',
      entityId: row.id,
      summary: 'ثبت تسویه درگاه/بانک',
      newValue: String(amount),
    })
    return { ok: true as const, settlement: row }
  }

  async function setSettlementStatus(
    id: string,
    status: SellerSettlementStatus,
    actor: { id: string, name: string },
    reference?: string,
  ) {
    const current = getSettlement(id)
    if (!current) return { ok: false as const, error: 'تسویه یافت نشد' }

    const { result, error } = await usePatch<SellerSettlement>(
      `/seller/settlements/${encodeURIComponent(id)}/status`,
      {
        status,
        ...(reference != null ? { reference: reference.trim() } : {}),
      },
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      // Optimistic FE fallback if API unavailable
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
      return { ok: true as const, offline: true as const }
    }

    const row = toSettlement(result)
    apiSettlements.value = [row, ...(apiSettlements.value || []).filter(s => s.id !== row.id)]
    if (settlementOverrides.value[id]) {
      const next = { ...settlementOverrides.value }
      delete next[id]
      settlementOverrides.value = next
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

  async function createAdjustment(input: {
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

    const { result, error } = await usePost<SellerFinanceAdjustment>(
      '/seller/adjustments',
      {
        type: input.type,
        amount,
        reason,
        orderId: input.orderId ?? null,
        actorId: input.actor.id,
        actorName: input.actor.name,
      },
      { headers: { 'no-error': true } },
    )

    let row: SellerFinanceAdjustment
    if (error || !result?.id) {
      // FE fallback when API unavailable
      row = {
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
    }
    else {
      row = toAdjustment(result)
      adjustments.value = [row, ...adjustments.value.filter(a => a.id !== row.id)]
      await Promise.all([
        fetchAdjustments({ force: true }),
        fetchTransactionsLedger({ force: true }),
      ])
    }

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

  async function markDiscrepancyReconciled(id: string, actor: { id: string, name: string }) {
    const key = String(id || '').trim()
    if (!key) return { ok: false as const, error: 'شناسه نامعتبر است' }

    const { result, error } = await usePost<{ ok: boolean, reconciledIds?: string[] }>(
      '/seller/reconciliation/resolve',
      { id: key },
      { headers: { 'no-error': true } },
    )

    if (error || !result?.ok) {
      // FE fallback
      if (!reconciledIds.value.includes(key)) {
        reconciledIds.value = [...reconciledIds.value, key]
      }
      if (apiDiscrepancies.value) {
        apiDiscrepancies.value = apiDiscrepancies.value.map(d =>
          d.id === key ? { ...d, reconciled: true } : d,
        )
      }
    }
    else {
      if (Array.isArray(result.reconciledIds)) {
        reconciledIds.value = result.reconciledIds.map(String)
      }
      else if (!reconciledIds.value.includes(key)) {
        reconciledIds.value = [...reconciledIds.value, key]
      }
      if (apiDiscrepancies.value) {
        apiDiscrepancies.value = apiDiscrepancies.value.map(d =>
          d.id === key ? { ...d, reconciled: true } : d,
        )
      }
      reconciliationMeta.value = {
        ...reconciliationMeta.value,
        openCount: Math.max(0, (reconciliationMeta.value.openCount || 0) - 1),
        resolvedCount: (reconciliationMeta.value.resolvedCount || 0) + 1,
      }
    }

    appendLog({
      actorId: actor.id,
      actorName: actor.name,
      action: 'status_change',
      entity: 'finance',
      entityId: key,
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
        || p.customerName.includes(opts.search!.trim())
        || (p.customerPhone || '').includes(opts.search!.trim()),
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
        || t.customerName.includes(opts.search!.trim())
        || (t.customerPhone || '').includes(opts.search!.trim()),
      )
    }
    if (opts.type && opts.type !== 'all') list = list.filter(t => t.type === opts.type)
    if (opts.status && opts.status !== 'all') list = list.filter(t => t.status === opts.status)
    if (opts.gateway && opts.gateway !== 'all') list = list.filter(t => t.gateway === opts.gateway)
    if (opts.orderId) list = list.filter(t => t.orderId === opts.orderId)
    if (opts.customer) {
      list = list.filter(t =>
        t.customerName.includes(opts.customer!)
        || (t.customerPhone || '').includes(opts.customer!)
        || t.customerId === opts.customer,
      )
    }
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
    loadError,
    sellerPending,
    payments,
    paymentsMeta,
    settlements,
    settlementsMeta,
    adjustments,
    adjustmentsMeta,
    gateways,
    transactions,
    transactionsMeta,
    discrepancies,
    openDiscrepancies,
    reconciliationMeta,
    kpis,
    discountImpact,
    reportTrend,
    sales,
    refunds,
    orders,
    ensureLoaded,
    fetchTransactionsLedger,
    fetchTransaction,
    fetchPaymentsList,
    fetchPayment,
    fetchSettlementsList,
    fetchSettlement,
    fetchReconciliation,
    fetchAdjustments,
    fetchReports,
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
