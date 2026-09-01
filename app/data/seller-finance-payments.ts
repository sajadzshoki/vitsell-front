import type { SellerOrder } from '~/data/seller'
import type { SellerOrderCommerce, SellerPaymentStatus } from '~/data/seller-order-commerce'

/** Seller payment record — aligned with PaymentSchema + order commerce overlay */

export type SellerFinancePaymentStatus =
  | 'pending'
  | 'processing'
  | 'successful'
  | 'failed'
  | 'cancelled'
  | 'expired'
  | 'refunded'
  | 'partially_refunded'

export type SellerPayment = {
  id: string
  orderId: string
  customerId: string | null
  customerName: string
  amount: number
  currency: string
  paymentMethod: string
  gateway: string
  status: SellerFinancePaymentStatus
  authority: string | null
  refId: string | null
  cardPan: string | null
  transactionId: string
  adminNote: string
  createdAt: string
  completedAt: string | null
  reviewedAt: string | null
}

export const sellerFinancePaymentStatusMeta: Record<
  SellerFinancePaymentStatus,
  { label: string, color: 'success' | 'warning' | 'error' | 'info' | 'neutral' }
> = {
  pending: { label: 'در انتظار', color: 'warning' },
  processing: { label: 'در حال پردازش', color: 'info' },
  successful: { label: 'موفق', color: 'success' },
  failed: { label: 'ناموفق', color: 'error' },
  cancelled: { label: 'لغو شده', color: 'neutral' },
  expired: { label: 'منقضی', color: 'neutral' },
  refunded: { label: 'بازپرداخت کامل', color: 'info' },
  partially_refunded: { label: 'بازپرداخت جزئی', color: 'info' },
}

export function mapCommercePaymentStatus(status: SellerPaymentStatus): SellerFinancePaymentStatus {
  if (status === 'paid') return 'successful'
  if (status === 'pending') return 'pending'
  if (status === 'failed') return 'failed'
  if (status === 'refunded') return 'refunded'
  if (status === 'partially_refunded') return 'partially_refunded'
  return 'pending'
}

function inferGateway(method: string): string {
  const m = method.toLowerCase()
  if (m.includes('زرین') || m.includes('zarin')) return 'زرین‌پال'
  if (m.includes('ملت')) return 'ملت'
  if (m.includes('سامان')) return 'سامان'
  if (m.includes('پارسیان')) return 'پارسیان'
  if (m.includes('محل') || m.includes('cod')) return 'پرداخت در محل'
  return 'زرین‌پال'
}

export function paymentFromOrder(
  order: SellerOrder,
  commerce: SellerOrderCommerce,
): SellerPayment {
  const status = mapCommercePaymentStatus(commerce.paymentStatus)
  const completed = status === 'successful' || status === 'refunded' || status === 'partially_refunded'
  return {
    id: `pay-${order.id}`,
    orderId: order.id,
    customerId: commerce.customerId,
    customerName: order.customerName,
    amount: order.total,
    currency: 'IRR',
    paymentMethod: order.paymentMethod,
    gateway: inferGateway(order.paymentMethod),
    status,
    authority: commerce.transactionId ? `AUTH-${commerce.transactionId.slice(-8)}` : null,
    refId: commerce.transactionId || null,
    cardPan: null,
    transactionId: commerce.transactionId || `txn-${order.id}`,
    adminNote: '',
    createdAt: order.date,
    completedAt: completed ? (commerce.paymentDate || order.date) : null,
    reviewedAt: null,
  }
}

export function buildPaymentsFromOrders(
  orders: SellerOrder[],
  getCommerce: (orderId: string) => SellerOrderCommerce,
): SellerPayment[] {
  return orders.map(o => paymentFromOrder(o, getCommerce(o.id)))
}
