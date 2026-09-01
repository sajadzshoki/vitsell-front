import type { SellerOrder } from '~/data/seller'
import type { SellerOrderCommerce } from '~/data/seller-order-commerce'
import type { SellerRefund } from '~/data/seller-returns-refunds'
import type { SellerPayment } from '~/data/seller-finance-payments'
import type { SellerSettlement } from '~/data/seller-finance-settlements'
import type { SellerFinanceTransaction } from '~/data/seller-finance-transactions'

export type FinanceDiscrepancySeverity = 'high' | 'medium' | 'low'

export type FinanceDiscrepancy = {
  id: string
  code: string
  severity: FinanceDiscrepancySeverity
  title: string
  detail: string
  orderId: string | null
  paymentId: string | null
  settlementId: string | null
  refundId: string | null
  reconciled: boolean
}

export function detectFinanceDiscrepancies(input: {
  orders: SellerOrder[]
  getCommerce: (orderId: string) => SellerOrderCommerce
  payments: SellerPayment[]
  refunds: SellerRefund[]
  settlements: SellerSettlement[]
  transactions: SellerFinanceTransaction[]
  reconciledIds: Set<string>
}): FinanceDiscrepancy[] {
  const issues: FinanceDiscrepancy[] = []
  const paymentByOrder = new Map(input.payments.map(p => [p.orderId, p]))
  const txByOrder = new Map<string, SellerFinanceTransaction[]>()
  for (const tx of input.transactions) {
    if (!tx.orderId) continue
    const list = txByOrder.get(tx.orderId) ?? []
    list.push(tx)
    txByOrder.set(tx.orderId, list)
  }

  for (const order of input.orders) {
    const commerce = input.getCommerce(order.id)
    if (commerce.paymentStatus === 'paid' || commerce.paymentStatus === 'partially_refunded' || commerce.paymentStatus === 'refunded') {
      const pay = paymentByOrder.get(order.id)
      const txs = txByOrder.get(order.id) ?? []
      if (!pay || !txs.some(t => t.type === 'payment')) {
        const id = `disc-paid-no-tx-${order.id}`
        issues.push({
          id,
          code: 'paid_order_missing_transaction',
          severity: 'high',
          title: 'سفارش پرداخت‌شده بدون تراکنش',
          detail: `سفارش ${order.id} وضعیت پرداخت موفق دارد ولی رکورد تراکنش/پرداخت متناظر یافت نشد.`,
          orderId: order.id,
          paymentId: pay?.id ?? null,
          settlementId: null,
          refundId: null,
          reconciled: input.reconciledIds.has(id),
        })
      }
    }

    const pay = paymentByOrder.get(order.id)
    if (pay && pay.status === 'successful' && commerce.paymentStatus === 'failed') {
      const id = `disc-pay-order-mismatch-${order.id}`
      issues.push({
        id,
        code: 'payment_order_status_mismatch',
        severity: 'high',
        title: 'ناسازگاری وضعیت پرداخت و سفارش',
        detail: `پرداخت ${pay.id} موفق است ولی وضعیت پرداخت سفارش ${order.id} ناموفق است.`,
        orderId: order.id,
        paymentId: pay.id,
        settlementId: null,
        refundId: null,
        reconciled: input.reconciledIds.has(id),
      })
    }

    if (commerce.refundedAmount > 0) {
      const completedRefundSum = input.refunds
        .filter(r => r.orderId === order.id && r.status === 'completed')
        .reduce((s, r) => s + r.amount, 0)
      if (Math.abs(completedRefundSum - commerce.refundedAmount) > 1) {
        const id = `disc-refund-amount-${order.id}`
        issues.push({
          id,
          code: 'refund_amount_mismatch',
          severity: 'medium',
          title: 'مغایرت مبلغ بازپرداخت',
          detail: `مجموع بازپرداخت‌های تکمیل‌شده (${completedRefundSum}) با مبلغ ثبت‌شده روی سفارش (${commerce.refundedAmount}) هم‌خوان نیست.`,
          orderId: order.id,
          paymentId: pay?.id ?? null,
          settlementId: null,
          refundId: null,
          reconciled: input.reconciledIds.has(id),
        })
      }
    }
  }

  for (const s of input.settlements) {
    if ((s.status === 'completed' || s.status === 'reconciled') && !s.reference.trim()) {
      const id = `disc-stl-ref-${s.id}`
      issues.push({
        id,
        code: 'settlement_missing_reference',
        severity: 'medium',
        title: 'تسویه بدون شماره مرجع',
        detail: `تسویه ${s.id} تکمیل شده ولی شماره مرجع ندارد.`,
        orderId: null,
        paymentId: null,
        settlementId: s.id,
        refundId: null,
        reconciled: input.reconciledIds.has(id),
      })
    }
  }

  for (const order of input.orders) {
    const commerce = input.getCommerce(order.id)
    if (order.status === 'delivered' || order.status === 'packing' || order.status === 'shipped') {
      const pay = paymentByOrder.get(order.id)
      if (pay && pay.status === 'failed') {
        const id = `disc-failed-pay-active-order-${order.id}`
        issues.push({
          id,
          code: 'failed_payment_active_order',
          severity: 'high',
          title: 'پرداخت ناموفق روی سفارش فعال',
          detail: `سفارش ${order.id} در جریان است ولی پرداخت مرتبط ناموفق ثبت شده.`,
          orderId: order.id,
          paymentId: pay.id,
          settlementId: null,
          refundId: null,
          reconciled: input.reconciledIds.has(id),
        })
      }
      if (commerce.paymentStatus === 'failed') {
        // already covered by payment status on commerce when no pay row mismatch
      }
    }
  }

  return issues.filter(i => !i.reconciled || true).map(i => ({
    ...i,
    reconciled: input.reconciledIds.has(i.id),
  }))
}
