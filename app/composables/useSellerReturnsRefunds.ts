import {
  buildDefaultRefunds,
  buildDefaultReturns,
  buildDefaultShippingMethods,
  refundableRemaining,
  type SellerRefund,
  type SellerRefundStatus,
  type SellerReturn,
  type SellerReturnStatus,
  type SellerShippingMethod,
} from '~/data/seller-returns-refunds'

export function useSellerReturns() {
  const items = useState<SellerReturn[]>('seller-returns', () => [])
  const seeded = useState('seller-returns-seeded', () => false)

  function ensureLoaded() {
    if (!seeded.value) {
      items.value = buildDefaultReturns()
      seeded.value = true
    }
    return items.value
  }

  const returns = computed(() => items.value)
  const pendingCount = computed(() => items.value.filter(r => r.status === 'requested').length)

  function setStatus(id: string, status: SellerReturnStatus, adminNote?: string) {
    ensureLoaded()
    const index = items.value.findIndex(r => r.id === id)
    if (index === -1) return { ok: false as const, error: 'مرجوعی پیدا نشد' }
    const previous = items.value[index]!
    const next: SellerReturn = {
      ...previous,
      status,
      adminNote: adminNote ?? previous.adminNote,
    }
    const copy = [...items.value]
    copy[index] = next
    items.value = copy
    return { ok: true as const, item: next }
  }

  return { returns, pendingCount, ensureLoaded, setStatus }
}

export function useSellerRefunds() {
  const items = useState<SellerRefund[]>('seller-refunds', () => [])
  const seeded = useState('seller-refunds-seeded', () => false)

  function ensureLoaded() {
    if (!seeded.value) {
      items.value = buildDefaultRefunds()
      seeded.value = true
    }
    return items.value
  }

  const refunds = computed(() => items.value)
  const pendingCount = computed(() =>
    items.value.filter(r => r.status === 'pending' || r.status === 'processing').length,
  )

  function createRefund(input: Omit<SellerRefund, 'id' | 'createdAt' | 'status'> & { status?: SellerRefundStatus }) {
    ensureLoaded()
    const remaining = refundableRemaining(input.orderTotal, input.alreadyRefunded)
    if (input.amount <= 0 || input.amount > remaining) {
      return { ok: false as const, error: 'مبلغ بازپرداخت نامعتبر است' }
    }
    const row: SellerRefund = {
      ...input,
      id: `RF-${Date.now().toString().slice(-6)}`,
      status: input.status ?? 'pending',
      createdAt: new Date().toISOString(),
    }
    items.value = [row, ...items.value]
    return { ok: true as const, refund: row }
  }

  function setStatus(id: string, status: SellerRefundStatus, transactionId?: string) {
    ensureLoaded()
    const index = items.value.findIndex(r => r.id === id)
    if (index === -1) return { ok: false as const, error: 'بازپرداخت پیدا نشد' }
    const previous = items.value[index]!
    const next: SellerRefund = {
      ...previous,
      status,
      transactionId: transactionId ?? previous.transactionId,
      alreadyRefunded: status === 'completed'
        ? previous.alreadyRefunded + previous.amount
        : previous.alreadyRefunded,
    }
    const copy = [...items.value]
    copy[index] = next
    items.value = copy
    return { ok: true as const, refund: next }
  }

  return { refunds, pendingCount, ensureLoaded, createRefund, setStatus, refundableRemaining }
}

export function useSellerShipping() {
  const methods = useState<SellerShippingMethod[]>('seller-shipping-methods', () => [])
  const seeded = useState('seller-shipping-seeded', () => false)

  function ensureLoaded() {
    if (!seeded.value) {
      methods.value = buildDefaultShippingMethods()
      seeded.value = true
    }
    return methods.value
  }

  const shippingMethods = computed(() => methods.value)

  function updateMethod(id: string, patch: Partial<SellerShippingMethod>) {
    ensureLoaded()
    methods.value = methods.value.map(m => (m.id === id ? { ...m, ...patch } : m))
    return { ok: true as const }
  }

  return { shippingMethods, ensureLoaded, updateMethod }
}
