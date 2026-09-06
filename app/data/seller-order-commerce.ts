import type { SellerOrder, SellerOrderStatus } from '~/data/seller'

/** Separate dimensions — do not merge into SellerOrderStatus */
export type SellerPaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded'
export type SellerShippingStatus = 'unfulfilled' | 'ready' | 'shipped' | 'delivered' | 'returned'
export type SellerReturnStatusFlag = 'none' | 'requested' | 'partial' | 'completed'
export type SellerRefundStatusFlag = 'none' | 'pending' | 'partial' | 'completed'

export type SellerOrderTimelineEvent = {
  id: string
  event: string
  at: string
  actor: string
  detail?: string
}

export type SellerOrderInternalNote = {
  id: string
  text: string
  author: string
  createdAt: string
}

/** Frontend commerce overlay for order detail (until richer API) */
export type SellerOrderCommerce = {
  orderId: string
  paymentStatus: SellerPaymentStatus
  shippingStatus: SellerShippingStatus
  returnStatus: SellerReturnStatusFlag
  refundStatus: SellerRefundStatusFlag
  trackingCode: string
  estimatedDelivery: string
  carrier: string
  transactionId: string
  paymentAuthority?: string | null
  paymentRefId?: string | null
  paymentCardPan?: string | null
  paymentDate: string
  discountAmount: number
  shippingCost: number
  taxAmount: number
  customerEmail: string
  customerId: string | null
  timeline: SellerOrderTimelineEvent[]
  internalNotes: SellerOrderInternalNote[]
  refundedAmount: number
}

export const sellerPaymentStatusMeta: Record<SellerPaymentStatus, { label: string, color: 'success' | 'warning' | 'error' | 'info' | 'neutral' }> = {
  pending: { label: 'در انتظار پرداخت', color: 'warning' },
  paid: { label: 'پرداخت‌شده', color: 'success' },
  failed: { label: 'ناموفق', color: 'error' },
  refunded: { label: 'بازپرداخت کامل', color: 'info' },
  partially_refunded: { label: 'بازپرداخت جزئی', color: 'info' },
}

export const sellerShippingStatusMeta: Record<SellerShippingStatus, { label: string, color: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary' }> = {
  unfulfilled: { label: 'آماده نشده', color: 'neutral' },
  ready: { label: 'آماده ارسال', color: 'info' },
  shipped: { label: 'ارسال‌شده', color: 'primary' },
  delivered: { label: 'تحویل‌شده', color: 'success' },
  returned: { label: 'برگشتی', color: 'error' },
}

function mapShippingFromOrder(status: SellerOrderStatus): SellerShippingStatus {
  if (status === 'new') return 'unfulfilled'
  if (status === 'packing') return 'ready'
  if (status === 'shipped') return 'shipped'
  if (status === 'delivered') return 'delivered'
  if (status === 'returned') return 'returned'
  return 'unfulfilled'
}

function mapPaymentFromOrder(status: SellerOrderStatus): SellerPaymentStatus {
  if (status === 'cancelled') return 'failed'
  if (status === 'returned') return 'partially_refunded'
  if (status === 'new') return 'paid'
  return 'paid'
}

function defaultTimeline(order: SellerOrder): SellerOrderTimelineEvent[] {
  const events: SellerOrderTimelineEvent[] = [
    {
      id: `${order.id}-created`,
      event: 'ثبت سفارش',
      at: order.date,
      actor: 'سیستم',
      detail: order.customerName,
    },
  ]
  if (order.status !== 'cancelled' && order.status !== 'new') {
    events.push({
      id: `${order.id}-paid`,
      event: 'پرداخت دریافت شد',
      at: order.date,
      actor: 'درگاه',
      detail: order.paymentMethod,
    })
  }
  if (['packing', 'shipped', 'delivered'].includes(order.status)) {
    events.push({
      id: `${order.id}-packing`,
      event: 'آماده‌سازی',
      at: order.date,
      actor: 'ادمین',
    })
  }
  if (['shipped', 'delivered'].includes(order.status)) {
    events.push({
      id: `${order.id}-shipped`,
      event: 'ارسال شد',
      at: order.date,
      actor: 'ادمین',
      detail: order.shippingMethod,
    })
  }
  if (order.status === 'delivered') {
    events.push({
      id: `${order.id}-delivered`,
      event: 'تحویل شد',
      at: order.date,
      actor: 'سیستم',
    })
  }
  if (order.status === 'cancelled') {
    events.push({
      id: `${order.id}-cancelled`,
      event: 'لغو شد',
      at: order.date,
      actor: 'ادمین',
    })
  }
  if (order.status === 'returned') {
    events.push({
      id: `${order.id}-returned`,
      event: 'مرجوع شد',
      at: order.date,
      actor: 'ادمین',
    })
  }
  return events
}

export function emptyOrderCommerce(order: SellerOrder): SellerOrderCommerce {
  return {
    orderId: order.id,
    paymentStatus: mapPaymentFromOrder(order.status),
    shippingStatus: mapShippingFromOrder(order.status),
    returnStatus: order.status === 'returned' ? 'completed' : 'none',
    refundStatus: order.status === 'returned' ? 'partial' : 'none',
    trackingCode: '',
    estimatedDelivery: '',
    carrier: order.shippingMethod || '',
    transactionId: '',
    paymentDate: order.date,
    discountAmount: 0,
    shippingCost: 0,
    taxAmount: 0,
    customerEmail: '',
    customerId: null,
    timeline: defaultTimeline(order),
    internalNotes: order.note
      ? [{
          id: `note-${order.id}`,
          text: order.note,
          author: 'سیستم',
          createdAt: order.date,
        }]
      : [],
    refundedAmount: 0,
  }
}

export const sellerOrderFilterDefs = [
  { key: 'q', label: 'جستجو', type: 'text' as const, placeholder: 'شماره، مشتری، تلفن' },
  {
    key: 'status',
    label: 'وضعیت سفارش',
    type: 'select' as const,
    options: [
      { value: 'all', label: 'همه' },
      { value: 'new', label: 'جدید' },
      { value: 'packing', label: 'آماده‌سازی' },
      { value: 'shipped', label: 'ارسال‌شده' },
      { value: 'delivered', label: 'تحویل‌شده' },
      { value: 'returned', label: 'مرجوعی' },
      { value: 'cancelled', label: 'لغو شده' },
    ],
  },
  {
    key: 'payment',
    label: 'وضعیت پرداخت',
    type: 'select' as const,
    options: [
      { value: 'all', label: 'همه' },
      { value: 'pending', label: 'در انتظار' },
      { value: 'paid', label: 'پرداخت‌شده' },
      { value: 'failed', label: 'ناموفق' },
      { value: 'refunded', label: 'بازپرداخت' },
      { value: 'partially_refunded', label: 'بازپرداخت جزئی' },
    ],
  },
  {
    key: 'shipping',
    label: 'وضعیت ارسال',
    type: 'select' as const,
    options: [
      { value: 'all', label: 'همه' },
      { value: 'unfulfilled', label: 'آماده نشده' },
      { value: 'ready', label: 'آماده ارسال' },
      { value: 'shipped', label: 'ارسال‌شده' },
      { value: 'delivered', label: 'تحویل‌شده' },
      { value: 'returned', label: 'برگشتی' },
    ],
  },
  {
    key: 'paymentMethod',
    label: 'روش پرداخت',
    type: 'select' as const,
    options: [
      { value: 'all', label: 'همه' },
    ],
  },
  { key: 'amount', label: 'بازه مبلغ', type: 'numberRange' as const, minKey: 'amountMin', maxKey: 'amountMax' },
  { key: 'created', label: 'بازه تاریخ', type: 'dateRange' as const, fromKey: 'dateFrom', toKey: 'dateTo' },
  { key: 'hasDiscount', label: 'دارای تخفیف', type: 'boolean' as const },
  { key: 'hasRefund', label: 'دارای بازپرداخت', type: 'boolean' as const },
  { key: 'hasReturn', label: 'دارای مرجوعی', type: 'boolean' as const },
]
