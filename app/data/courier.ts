import { sellerOrderStatusMeta, type SellerOrderStatus } from '~/data/seller'

export type CourierOrderItem = {
  title: string
  variantLabel: string
  qty: number
}

export type CourierOrderAddress = {
  province: string
  city: string
  address: string
  postalCode: string
}

export type CourierOrder = {
  id: string
  status: SellerOrderStatus
  date: string
  receiverName: string
  phone: string
  city: string
  address: CourierOrderAddress
  items: CourierOrderItem[]
  total: number
  paymentMethod: string
  shippingMethod: string
  note: string
}

const statuses: SellerOrderStatus[] = ['new', 'packing', 'shipped', 'delivered', 'returned', 'cancelled']

export const courierStatusFilters: { id: 'all' | SellerOrderStatus, label: string }[] = [
  { id: 'all', label: 'همه' },
  { id: 'new', label: 'جدید' },
  { id: 'packing', label: 'آماده‌سازی' },
  { id: 'shipped', label: 'ارسال شده' },
  { id: 'delivered', label: 'تحویل شده' },
  { id: 'returned', label: 'مرجوعی' },
  { id: 'cancelled', label: 'لغو شده' },
]

export function courierItemQty(order: CourierOrder) {
  return order.items.reduce((sum, item) => sum + item.qty, 0)
}

export function courierStatusMeta(status: string) {
  if (statuses.includes(status as SellerOrderStatus)) {
    return sellerOrderStatusMeta[status as SellerOrderStatus]
  }
  return sellerOrderStatusMeta.new
}

export function toCourierOrder(raw: Partial<CourierOrder> & { id?: string }): CourierOrder {
  const status = statuses.includes(raw.status as SellerOrderStatus)
    ? raw.status as SellerOrderStatus
    : 'new'
  const address = raw.address || { province: '', city: '', address: '', postalCode: '' }
  return {
    id: String(raw.id || ''),
    status,
    date: String(raw.date || ''),
    receiverName: String(raw.receiverName || ''),
    phone: String(raw.phone || ''),
    city: String(raw.city || address.city || ''),
    address: {
      province: String(address.province || ''),
      city: String(address.city || ''),
      address: String(address.address || ''),
      postalCode: String(address.postalCode || ''),
    },
    items: Array.isArray(raw.items)
      ? raw.items.map(item => ({
          title: String(item.title || ''),
          variantLabel: String(item.variantLabel || ''),
          qty: Math.max(0, Number(item.qty) || 0),
        }))
      : [],
    total: Math.max(0, Math.round(Number(raw.total) || 0)),
    paymentMethod: String(raw.paymentMethod || ''),
    shippingMethod: String(raw.shippingMethod || ''),
    note: String(raw.note || ''),
  }
}

export function courierMapsUrl(order: CourierOrder) {
  const query = [order.address.province, order.address.city, order.address.address, order.address.postalCode]
    .map(part => part.trim())
    .filter(Boolean)
    .join('، ')
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

export function courierApiMessage(error: { statusCode?: number, status?: number, data?: { errors?: { message?: string }[], message?: string } } | null | undefined, fallback: string) {
  return error?.data?.errors?.map(item => item.message).filter(Boolean).join(' ، ')
    || error?.data?.message
    || fallback
}
