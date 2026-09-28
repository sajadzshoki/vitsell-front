export type SellerReturnStatus =
  | 'requested'
  | 'approved'
  | 'rejected'
  | 'received'
  | 'processing'
  | 'completed'
  | 'cancelled'

export type SellerRefundStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'

export type SellerReturnItem = {
  productId: string
  productTitle: string
  variantId?: string | null
  variantLabel: string | null
  sku: string
  qty: number
  unitPrice: number
  image?: string
}

export type SellerReturn = {
  id: string
  orderId: string
  customerId: string
  customerName: string
  status: SellerReturnStatus
  reason: string
  adminNote: string
  requestedAt: string
  items: SellerReturnItem[]
  photos: string[]
}

export type SellerRefundItem = {
  productId: string
  productTitle: string
  qty: number
  amount: number
}

export type SellerRefund = {
  id: string
  orderId: string
  returnId: string | null
  customerName: string
  status: SellerRefundStatus
  amount: number
  orderTotal: number
  alreadyRefunded: number
  reason: string
  transactionId: string
  createdAt: string
  items: SellerRefundItem[]
}

export type SellerShippingMethod = {
  id: string
  name: string
  carrier: string
  estimatedDays: string
  baseCost: number
  status: 'active' | 'inactive'
}

export const sellerReturnStatusMeta: Record<SellerReturnStatus, { label: string, color: 'warning' | 'success' | 'error' | 'info' | 'neutral' | 'primary' }> = {
  requested: { label: 'درخواست‌شده', color: 'warning' },
  approved: { label: 'تأیید شده', color: 'info' },
  rejected: { label: 'رد شده', color: 'error' },
  received: { label: 'دریافت‌شده', color: 'primary' },
  processing: { label: 'در حال بررسی', color: 'info' },
  completed: { label: 'تکمیل‌شده', color: 'success' },
  cancelled: { label: 'لغو شده', color: 'neutral' },
}

export const sellerRefundStatusMeta: Record<SellerRefundStatus, { label: string, color: 'warning' | 'success' | 'error' | 'info' | 'neutral' }> = {
  pending: { label: 'در انتظار', color: 'warning' },
  processing: { label: 'در حال پردازش', color: 'info' },
  completed: { label: 'انجام‌شده', color: 'success' },
  failed: { label: 'ناموفق', color: 'error' },
  cancelled: { label: 'لغو شده', color: 'neutral' },
}

export function buildDefaultReturns(): SellerReturn[] {
  const now = Date.now()
  return [
    {
      id: 'RET-1001',
      orderId: 'SL-20411',
      customerId: 'cust-1',
      customerName: 'علی محمدی',
      status: 'requested',
      reason: 'کالا معیوب بود',
      adminNote: '',
      requestedAt: new Date(now - 2 * 86400_000).toISOString(),
      items: [
        {
          productId: 'iphone-16-pro',
          productTitle: 'آیفون ۱۶ پرو',
          variantLabel: null,
          sku: 'iphone-16-pro',
          qty: 1,
          unitPrice: 98_000_000,
        },
      ],
      photos: [],
    },
    {
      id: 'RET-1002',
      orderId: 'SL-20390',
      customerId: 'cust-3',
      customerName: 'رضا کریمی',
      status: 'approved',
      reason: 'انصراف از خرید',
      adminNote: 'تأیید مرجوعی جزئی',
      requestedAt: new Date(now - 8 * 86400_000).toISOString(),
      items: [
        {
          productId: 'sony-xm5',
          productTitle: 'سونی XM5',
          variantLabel: null,
          sku: 'sony-xm5',
          qty: 1,
          unitPrice: 18_500_000,
        },
      ],
      photos: [],
    },
  ]
}

export function buildDefaultRefunds(): SellerRefund[] {
  const now = Date.now()
  return [
    {
      id: 'RF-501',
      orderId: 'SL-20390',
      returnId: 'RET-1002',
      customerName: 'رضا کریمی',
      status: 'pending',
      amount: 18_500_000,
      orderTotal: 22_000_000,
      alreadyRefunded: 0,
      reason: 'مرجوعی تأییدشده',
      transactionId: '',
      createdAt: new Date(now - 7 * 86400_000).toISOString(),
      items: [
        { productId: 'sony-xm5', productTitle: 'سونی XM5', qty: 1, amount: 18_500_000 },
      ],
    },
    {
      id: 'RF-500',
      orderId: 'SL-20350',
      returnId: null,
      customerName: 'سارا احمدی',
      status: 'completed',
      amount: 2_000_000,
      orderTotal: 12_000_000,
      alreadyRefunded: 2_000_000,
      reason: 'بازپرداخت جزئی هزینه ارسال',
      transactionId: 'TX-99881',
      createdAt: new Date(now - 20 * 86400_000).toISOString(),
      items: [],
    },
  ]
}

export function buildDefaultShippingMethods(): SellerShippingMethod[] {
  return [
    {
      id: 'ship-express',
      name: 'پیک اکسپرس',
      carrier: 'ویتسل',
      estimatedDays: '۱–۲ روز',
      baseCost: 0,
      status: 'active',
    },
    {
      id: 'ship-tipax',
      name: 'تیپاکس',
      carrier: 'تیپاکس',
      estimatedDays: '۲–۴ روز',
      baseCost: 85_000,
      status: 'active',
    },
    {
      id: 'ship-post',
      name: 'پست پیشتاز',
      carrier: 'پست ایران',
      estimatedDays: '۳–۵ روز',
      baseCost: 65_000,
      status: 'active',
    },
  ]
}

export function refundableRemaining(orderTotal: number, alreadyRefunded: number) {
  return Math.max(0, orderTotal - alreadyRefunded)
}
