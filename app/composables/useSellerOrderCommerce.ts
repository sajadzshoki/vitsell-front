import { emptyOrderCommerce, type SellerOrderCommerce, type SellerOrderInternalNote } from '~/data/seller-order-commerce'
import type { SellerOrder } from '~/data/seller'

export function useSellerOrderCommerce() {
  const map = useState<Record<string, SellerOrderCommerce>>('seller-order-commerce', () => ({}))

  function getCommerce(order: SellerOrder): SellerOrderCommerce {
    if (!map.value[order.id]) {
      return emptyOrderCommerce(order)
    }
    const stored = map.value[order.id]!
    return {
      ...stored,
      shippingStatus: stored.shippingStatus || emptyOrderCommerce(order).shippingStatus,
      timeline: stored.timeline?.length ? stored.timeline : emptyOrderCommerce(order).timeline,
    }
  }

  function saveCommerce(orderId: string, patch: Partial<SellerOrderCommerce>) {
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
    const next: SellerOrderCommerce = {
      ...base,
      ...patch,
      orderId,
      timeline: patch.timeline ? [...patch.timeline] : [...base.timeline],
      internalNotes: patch.internalNotes ? [...patch.internalNotes] : [...base.internalNotes],
    }
    map.value = { ...map.value, [orderId]: next }
    return next
  }

  function addInternalNote(orderId: string, text: string, author: string) {
    const orderStub = { id: orderId } as SellerOrder
    const current = map.value[orderId] ?? emptyOrderCommerce({
      ...orderStub,
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
