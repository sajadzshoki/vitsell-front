import type { SellerRefund } from '~/data/seller-returns-refunds'
import type { SellerPayment } from '~/data/seller-finance-payments'
import type { SellerSettlement } from '~/data/seller-finance-settlements'
import type { SellerFinanceAdjustment } from '~/data/seller-finance-adjustments'

/** Derived unified ledger — projection only, not a second write path */

export type SellerFinanceTransactionType =
  | 'payment'
  | 'refund'
  | 'settlement'
  | 'adjustment'
  | 'fee'

export type SellerFinanceTransactionStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded'

export type SellerFinanceTransaction = {
  id: string
  type: SellerFinanceTransactionType
  amount: number
  /** Signed amount for display: refunds/fees negative when outflow */
  signedAmount: number
  status: SellerFinanceTransactionStatus
  paymentMethod: string
  gateway: string
  orderId: string | null
  customerId: string | null
  customerName: string
  reference: string
  paymentId: string | null
  refundId: string | null
  settlementId: string | null
  adjustmentId: string | null
  createdAt: string
  completedAt: string | null
  sourceLabel: string
}

export const sellerFinanceTransactionTypeMeta: Record<
  SellerFinanceTransactionType,
  { label: string }
> = {
  payment: { label: 'پرداخت' },
  refund: { label: 'بازپرداخت' },
  settlement: { label: 'تسویه درگاه' },
  adjustment: { label: 'تعدیل' },
  fee: { label: 'کارمزد' },
}

export const sellerFinanceTransactionStatusMeta: Record<
  SellerFinanceTransactionStatus,
  { label: string, color: 'success' | 'warning' | 'error' | 'info' | 'neutral' }
> = {
  pending: { label: 'در انتظار', color: 'warning' },
  processing: { label: 'در حال پردازش', color: 'info' },
  completed: { label: 'تکمیل‌شده', color: 'success' },
  failed: { label: 'ناموفق', color: 'error' },
  cancelled: { label: 'لغو شده', color: 'neutral' },
  refunded: { label: 'بازپرداخت‌شده', color: 'info' },
}

function mapPaymentStatus(s: SellerPayment['status']): SellerFinanceTransactionStatus {
  if (s === 'successful') return 'completed'
  if (s === 'pending' || s === 'processing') return s === 'processing' ? 'processing' : 'pending'
  if (s === 'failed') return 'failed'
  if (s === 'cancelled' || s === 'expired') return 'cancelled'
  if (s === 'refunded' || s === 'partially_refunded') return 'refunded'
  return 'pending'
}

function mapRefundStatus(s: SellerRefund['status']): SellerFinanceTransactionStatus {
  if (s === 'completed') return 'completed'
  if (s === 'pending') return 'pending'
  if (s === 'processing') return 'processing'
  if (s === 'failed') return 'failed'
  if (s === 'cancelled') return 'cancelled'
  return 'pending'
}

function mapSettlementStatus(s: SellerSettlement['status']): SellerFinanceTransactionStatus {
  if (s === 'completed' || s === 'reconciled') return 'completed'
  if (s === 'pending') return 'pending'
  if (s === 'processing') return 'processing'
  if (s === 'failed') return 'failed'
  return 'pending'
}

export function projectPaymentsToTransactions(payments: SellerPayment[]): SellerFinanceTransaction[] {
  return payments.map(p => ({
    id: `tx-pay-${p.id}`,
    type: 'payment' as const,
    amount: p.amount,
    signedAmount: p.amount,
    status: mapPaymentStatus(p.status),
    paymentMethod: p.paymentMethod,
    gateway: p.gateway,
    orderId: p.orderId,
    customerId: p.customerId,
    customerName: p.customerName,
    reference: p.refId || p.authority || p.transactionId,
    paymentId: p.id,
    refundId: null,
    settlementId: null,
    adjustmentId: null,
    createdAt: p.createdAt,
    completedAt: p.completedAt,
    sourceLabel: 'پرداخت سفارش',
  }))
}

export function projectRefundsToTransactions(refunds: SellerRefund[]): SellerFinanceTransaction[] {
  return refunds.map(r => ({
    id: `tx-ref-${r.id}`,
    type: 'refund' as const,
    amount: r.amount,
    signedAmount: -Math.abs(r.amount),
    status: mapRefundStatus(r.status),
    paymentMethod: '',
    gateway: '',
    orderId: r.orderId,
    customerId: null,
    customerName: r.customerName,
    reference: r.transactionId,
    paymentId: null,
    refundId: r.id,
    settlementId: null,
    adjustmentId: null,
    createdAt: r.createdAt,
    completedAt: r.status === 'completed' ? r.createdAt : null,
    sourceLabel: 'بازپرداخت',
  }))
}

export function projectSettlementsToTransactions(settlements: SellerSettlement[]): SellerFinanceTransaction[] {
  const rows: SellerFinanceTransaction[] = []
  for (const s of settlements) {
    rows.push({
      id: `tx-stl-${s.id}`,
      type: 'settlement',
      amount: s.amount,
      signedAmount: s.netAmount,
      status: mapSettlementStatus(s.status),
      paymentMethod: '',
      gateway: s.gateway,
      orderId: null,
      customerId: null,
      customerName: '—',
      reference: s.reference,
      paymentId: null,
      refundId: null,
      settlementId: s.id,
      adjustmentId: null,
      createdAt: s.createdAt,
      completedAt: s.status === 'completed' || s.status === 'reconciled' ? s.settlementDate : null,
      sourceLabel: 'تسویه درگاه/بانک',
    })
    if (s.fees > 0) {
      rows.push({
        id: `tx-fee-${s.id}`,
        type: 'fee',
        amount: s.fees,
        signedAmount: -Math.abs(s.fees),
        status: mapSettlementStatus(s.status),
        paymentMethod: '',
        gateway: s.gateway,
        orderId: null,
        customerId: null,
        customerName: '—',
        reference: s.reference,
        paymentId: null,
        refundId: null,
        settlementId: s.id,
        adjustmentId: null,
        createdAt: s.createdAt,
        completedAt: s.status === 'completed' || s.status === 'reconciled' ? s.settlementDate : null,
        sourceLabel: 'کارمزد تسویه',
      })
    }
  }
  return rows
}

export function projectAdjustmentsToTransactions(adjustments: SellerFinanceAdjustment[]): SellerFinanceTransaction[] {
  return adjustments.map(a => ({
    id: `tx-adj-${a.id}`,
    type: 'adjustment' as const,
    amount: Math.abs(a.amount),
    signedAmount: a.amount,
    status: 'completed' as const,
    paymentMethod: '',
    gateway: '',
    orderId: a.orderId,
    customerId: null,
    customerName: a.actorName,
    reference: a.id,
    paymentId: null,
    refundId: null,
    settlementId: null,
    adjustmentId: a.id,
    createdAt: a.createdAt,
    completedAt: a.createdAt,
    sourceLabel: 'تعدیل مالی',
  }))
}

export function buildFinanceLedger(input: {
  payments: SellerPayment[]
  refunds: SellerRefund[]
  settlements: SellerSettlement[]
  adjustments: SellerFinanceAdjustment[]
}): SellerFinanceTransaction[] {
  return [
    ...projectPaymentsToTransactions(input.payments),
    ...projectRefundsToTransactions(input.refunds),
    ...projectSettlementsToTransactions(input.settlements),
    ...projectAdjustmentsToTransactions(input.adjustments),
  ].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
}
