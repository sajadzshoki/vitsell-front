import { emptyOrderCommerce, type SellerOrderCommerce, type SellerOrderInternalNote } from '~/data/seller-order-commerce'
import type { SellerOrder } from '~/data/seller'

export function useSellerOrderCommerce() {
  const map = useState<Record<string, SellerOrderCommerce & { refunds?: any[] }>>('seller-order-commerce', () => ({}))

  function getCommerce(order: SellerOrder): SellerOrderCommerce & { refunds?: any[] } {
    if (!map.value[order.id]) {
      return emptyOrderCommerce(order)
    }
    const stored = map.value[order.id]!
    const fallback = emptyOrderCommerce(order)
    return {
      ...fallback,
      ...stored,
      shippingStatus: stored.shippingStatus || fallback.shippingStatus,
      paymentStatus: stored.paymentStatus || fallback.paymentStatus,
      timeline: stored.timeline?.length ? stored.timeline : fallback.timeline,
      internalNotes: stored.internalNotes ?? fallback.internalNotes,
      refunds: Array.isArray(stored.refunds) ? stored.refunds : [],
    }
  }

  function saveCommerce(orderId: string, patch: Partial<SellerOrderCommerce> & { refunds?: any[] }) {
    const previous = map.value[orderId]
    const base = previous ?? emptyOrderCommerce({
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
    const next: SellerOrderCommerce & { refunds?: any[] } = {
      ...base,
      ...patch,
      orderId,
      timeline: patch.timeline ? [...patch.timeline] : [...(base.timeline || [])],
      internalNotes: patch.internalNotes ? [...patch.internalNotes] : [...(base.internalNotes || [])],
      refunds: patch.refunds ? [...patch.refunds] : [...((base as any).refunds || [])],
    }
    map.value = { ...map.value, [orderId]: next }
    return next
  }

  function addInternalNote(orderId: string, text: string, author: string) {
    const current = map.value[orderId] ?? emptyOrderCommerce({
      id: orderId,
      date: new Date().toLocaleDateString('fa-IR'),
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
    const note: SellerOrderInternalNote = {
      id: `note-${Date.now()}`,
      text: text.trim(),
      author,
      createdAt: new Date().toISOString(),
    }
    return saveCommerce(orderId, {
      ...current,
      internalNotes: [note, ...current.internalNotes],
    })
  }

  function appendTimeline(orderId: string, event: string, actor: string, detail?: string) {
    const current = map.value[orderId]
    if (!current) return
    saveCommerce(orderId, {
      timeline: [
        {
          id: `ev-${Date.now()}`,
          event,
          at: new Date().toISOString(),
          actor,
          detail,
        },
        ...current.timeline,
      ],
    })
  }

  return {
    map,
    getCommerce,
    saveCommerce,
    addInternalNote,
    appendTimeline,
  }
}
