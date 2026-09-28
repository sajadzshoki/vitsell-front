import {
  refundableRemaining,
  type SellerRefund,
  type SellerRefundStatus,
  type SellerReturn,
  type SellerReturnStatus,
  type SellerShippingMethod,
} from '~/data/seller-returns-refunds'

function apiErrorMessage(error: any, fallback: string) {
  return (
    error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
    || error?.data?.message
    || error?.message
    || fallback
  )
}

function toReturn(raw: any): SellerReturn {
  return {
    id: String(raw.id),
    orderId: String(raw.orderId || ''),
    customerId: String(raw.customerId || ''),
    customerName: String(raw.customerName || ''),
    status: (raw.status || 'requested') as SellerReturnStatus,
    reason: String(raw.reason || ''),
    adminNote: String(raw.adminNote || ''),
    requestedAt: String(raw.requestedAt || new Date().toISOString()),
    items: Array.isArray(raw.items)
      ? raw.items.map((item: any) => ({
          productId: String(item.productId || ''),
          productTitle: String(item.productTitle || item.productId || ''),
          variantLabel: item.variantLabel ?? null,
          sku: String(item.sku || item.productId || ''),
          qty: Number(item.qty) || 1,
          unitPrice: Number(item.unitPrice) || 0,
          variantId: item.variantId ?? null,
          image: String(item.image || ''),
        }))
      : [],
    photos: Array.isArray(raw.photos) ? raw.photos.map((url: unknown) => String(url)).filter(Boolean) : [],
  }
}

export type SellerReturnsQuery = {
  q?: string
  status?: string
  page?: number
  pageSize?: number
  all?: boolean
}

export type SellerReturnsPage = {
  items: SellerReturn[]
  total: number
  page: number
  pageSize: number
  statusCounts: Record<string, number>
}

export function useSellerReturns() {
  const items = useState<SellerReturn[]>('seller-returns', () => [])
  const listMeta = useState('seller-returns-meta', () => ({
    total: 0,
    page: 1,
    pageSize: 10,
    statusCounts: {
      all: 0,
      requested: 0,
      approved: 0,
      rejected: 0,
      received: 0,
      processing: 0,
      completed: 0,
      cancelled: 0,
    } as Record<string, number>,
  }))
  const pending = useState('seller-returns-pending', () => false)

  const returns = computed(() => items.value)
  const pendingCount = computed(() =>
    Number(listMeta.value.statusCounts.requested) || items.value.filter(r => r.status === 'requested').length,
  )

  async function fetchList(query?: SellerReturnsQuery) {
    pending.value = true
    try {
      const params: Record<string, string | number | boolean> = {}
      if (query?.q?.trim()) params.q = query.q.trim()
      if (query?.status && query.status !== 'all') params.status = query.status
      if (query?.all) {
        params.all = true
        params.pageSize = query.pageSize || 200
      }
      else {
        if (query?.page != null) params.page = query.page
        params.pageSize = query?.pageSize || 10
      }
      const { result, error } = await useGet<SellerReturnsPage | SellerReturn[]>(
        '/seller/returns',
        { query: params, headers: { 'no-error': true } },
      )
      if (error || result == null) {
        return { ok: false as const, error: error ?? { message: 'returns-fetch-failed' } }
      }
      if (Array.isArray(result)) {
        items.value = result.map(toReturn)
        listMeta.value = {
          total: items.value.length,
          page: 1,
          pageSize: items.value.length,
          statusCounts: { all: items.value.length },
        }
      }
      else {
        items.value = Array.isArray(result.items) ? result.items.map(toReturn) : []
        listMeta.value = {
          total: Number(result.total) || items.value.length,
          page: Number(result.page) || 1,
          pageSize: Number(result.pageSize) || 10,
          statusCounts: result.statusCounts || { all: items.value.length },
        }
      }
      return { ok: true as const, error: null as null }
    }
    finally {
      pending.value = false
    }
  }

  /** @deprecated prefer fetchList — kept for dashboard callers */
  async function ensureLoaded(options?: { force?: boolean }) {
    if (items.value.length && !options?.force) return items.value
    await fetchList({ all: true, pageSize: 200 })
    return items.value
  }

  async function setStatus(id: string, status: SellerReturnStatus, adminNote?: string) {
    const { result, error } = await usePatch<SellerReturn>(
      `/seller/returns/${encodeURIComponent(id)}/status`,
      { status, adminNote },
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return { ok: false as const, error: apiErrorMessage(error, 'مرجوعی پیدا نشد') }
    }
    const next = toReturn(result)
    items.value = items.value.map(r => (r.id === id ? next : r))
    return { ok: true as const, item: next }
  }

  async function createReturn(input: {
    orderId: string
    reason: string
    customerName?: string
    customerId?: string
    adminNote?: string
    items: SellerReturn['items']
  }) {
    const { result, error } = await usePost<SellerReturn>(
      '/seller/returns',
      input,
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return { ok: false as const, error: apiErrorMessage(error, 'ثبت مرجوعی ناموفق بود') }
    }
    const row = toReturn(result)
    items.value = [row, ...items.value]
    return { ok: true as const, item: row }
  }

  return {
    returns,
    listMeta,
    pending: computed(() => pending.value),
    pendingCount,
    fetchList,
    ensureLoaded,
    setStatus,
    createReturn,
  }
}

export type SellerRefundsQuery = {
  q?: string
  status?: string
  page?: number
  pageSize?: number
  all?: boolean
}

export type SellerRefundsPage = {
  items: SellerRefund[]
  total: number
  page: number
  pageSize: number
  statusCounts: Record<string, number>
}

function toRefund(raw: any): SellerRefund {
  return {
    id: String(raw.id),
    orderId: String(raw.orderId || ''),
    returnId: raw.returnId != null ? String(raw.returnId) : null,
    customerName: String(raw.customerName || ''),
    status: (raw.status || 'pending') as SellerRefundStatus,
    amount: Number(raw.amount) || 0,
    orderTotal: Number(raw.orderTotal) || 0,
    alreadyRefunded: Number(raw.alreadyRefunded) || 0,
    reason: String(raw.reason || ''),
    transactionId: String(raw.transactionId || ''),
    createdAt: String(raw.createdAt || new Date().toISOString()),
    items: Array.isArray(raw.items)
      ? raw.items.map((item: any) => ({
          productId: String(item.productId || ''),
          productTitle: String(item.productTitle || ''),
          qty: Number(item.qty) || 1,
          amount: Number(item.amount) || 0,
        }))
      : [],
  }
}

export function useSellerRefunds() {
  const items = useState<SellerRefund[]>('seller-refunds', () => [])
  const listMeta = useState('seller-refunds-meta', () => ({
    total: 0,
    page: 1,
    pageSize: 10,
    statusCounts: {
      all: 0,
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      cancelled: 0,
    } as Record<string, number>,
  }))
  const pending = useState('seller-refunds-pending', () => false)

  const refunds = computed(() => items.value)
  const pendingCount = computed(() => {
    const pendingN = Number(listMeta.value.statusCounts.pending) || 0
    const processingN = Number(listMeta.value.statusCounts.processing) || 0
    const fromMeta = pendingN + processingN
    if (fromMeta > 0 || listMeta.value.total > 0) return fromMeta
    return items.value.filter(r => r.status === 'pending' || r.status === 'processing').length
  })

  async function fetchList(query?: SellerRefundsQuery) {
    pending.value = true
    try {
      const params: Record<string, string | number | boolean> = {}
      if (query?.q?.trim()) params.q = query.q.trim()
      if (query?.status && query.status !== 'all') params.status = query.status
      if (query?.all) {
        params.all = true
        params.pageSize = query.pageSize || 200
      }
      else {
        if (query?.page != null) params.page = query.page
        params.pageSize = query?.pageSize || 10
      }
      const { result, error } = await useGet<SellerRefundsPage | SellerRefund[]>(
        '/seller/refunds',
        { query: params, headers: { 'no-error': true } },
      )
      if (error || result == null) {
        return { ok: false as const, error: error ?? { message: 'refunds-fetch-failed' } }
      }
      if (Array.isArray(result)) {
        items.value = result.map(toRefund)
        listMeta.value = {
          total: items.value.length,
          page: 1,
          pageSize: items.value.length,
          statusCounts: { all: items.value.length },
        }
      }
      else {
        items.value = Array.isArray(result.items) ? result.items.map(toRefund) : []
        listMeta.value = {
          total: Number(result.total) || items.value.length,
          page: Number(result.page) || 1,
          pageSize: Number(result.pageSize) || 10,
          statusCounts: result.statusCounts || { all: items.value.length },
        }
      }
      return { ok: true as const, error: null as null }
    }
    finally {
      pending.value = false
    }
  }

  /** @deprecated prefer fetchList — kept for dashboard callers */
  async function ensureLoaded(options?: { force?: boolean }) {
    if (items.value.length && !options?.force) return items.value
    await fetchList({ all: true, pageSize: 200 })
    return items.value
  }

  async function getOrderRefundable(orderId: string, orderTotal: number) {
    const { result, error } = await useGet<SellerRefundsPage | SellerRefund[]>(
      '/seller/refunds',
      {
        query: { q: orderId, all: true, pageSize: 200 },
        headers: { 'no-error': true },
      },
    )
    if (error || result == null) {
      return { ok: false as const, remaining: orderTotal, completed: 0, reserved: 0 }
    }
    const rows = Array.isArray(result)
      ? result.map(toRefund)
      : (Array.isArray(result.items) ? result.items.map(toRefund) : [])
    const forOrder = rows.filter(r => r.orderId === orderId)
    let completed = 0
    let reserved = 0
    for (const row of forOrder) {
      if (row.status === 'completed') completed += row.amount
      else if (row.status === 'pending' || row.status === 'processing') reserved += row.amount
    }
    return {
      ok: true as const,
      completed,
      reserved,
      remaining: refundableRemaining(orderTotal, completed + reserved),
    }
  }

  async function createRefund(input: {
    orderId: string
    returnId?: string | null
    amount: number
    reason: string
    transactionId?: string
    status?: SellerRefundStatus
    items?: SellerRefund['items']
  }) {
    const { result, error } = await usePost<SellerRefund>(
      '/seller/refunds',
      {
        orderId: input.orderId,
        returnId: input.returnId ?? null,
        amount: input.amount,
        reason: input.reason,
        transactionId: input.transactionId,
        status: input.status,
        items: input.items,
      },
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return { ok: false as const, error: apiErrorMessage(error, 'ثبت بازپرداخت ناموفق بود') }
    }
    const row = toRefund(result)
    items.value = [row, ...items.value]
    return { ok: true as const, refund: row }
  }

  async function setStatus(id: string, status: SellerRefundStatus, transactionId?: string) {
    const { result, error } = await usePatch<SellerRefund>(
      `/seller/refunds/${encodeURIComponent(id)}/status`,
      { status, transactionId },
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return { ok: false as const, error: apiErrorMessage(error, 'بازپرداخت پیدا نشد') }
    }
    const next = toRefund(result)
    items.value = items.value.map(r => (r.id === id ? next : r))
    return { ok: true as const, refund: next }
  }

  return {
    refunds,
    listMeta,
    pending: computed(() => pending.value),
    pendingCount,
    fetchList,
    ensureLoaded,
    getOrderRefundable,
    createRefund,
    setStatus,
    refundableRemaining,
  }
}

export function useSellerShipping() {
  const methods = useState<SellerShippingMethod[]>('seller-shipping-methods', () => [])
  const pending = useState('seller-shipping-pending', () => false)

  const shippingMethods = computed(() => methods.value)

  function toMethod(raw: any): SellerShippingMethod {
    return {
      id: String(raw.id),
      name: String(raw.name || ''),
      carrier: String(raw.carrier || ''),
      estimatedDays: String(raw.estimatedDays || ''),
      baseCost: Number(raw.baseCost) || 0,
      status: raw.status === 'inactive' ? 'inactive' : 'active',
    }
  }

  async function fetchList(options?: { force?: boolean, q?: string, status?: string }) {
    if (methods.value.length && !options?.force && !options?.q && !options?.status) {
      return { ok: true as const, error: null as null }
    }
    pending.value = true
    try {
      const query: Record<string, string> = {}
      if (options?.q?.trim()) query.q = options.q.trim()
      if (options?.status && options.status !== 'all') query.status = options.status
      const { result, error } = await useGet<{ items: SellerShippingMethod[] } | SellerShippingMethod[]>(
        '/seller/shipping',
        { query, headers: { 'no-error': true } },
      )
      if (error || result == null) {
        return { ok: false as const, error: error ?? { message: 'shipping-fetch-failed' } }
      }
      const rows = Array.isArray(result)
        ? result
        : (Array.isArray(result.items) ? result.items : [])
      methods.value = rows.map(toMethod)
      return { ok: true as const, error: null as null }
    }
    finally {
      pending.value = false
    }
  }

  /** @deprecated prefer fetchList */
  async function ensureLoaded(options?: { force?: boolean }) {
    await fetchList({ force: options?.force })
    return methods.value
  }

  async function updateMethod(id: string, patch: Partial<SellerShippingMethod>) {
    const { result, error } = await usePatch<SellerShippingMethod>(
      `/seller/shipping/${encodeURIComponent(id)}`,
      {
        baseCost: patch.baseCost,
        status: patch.status,
        name: patch.name,
        carrier: patch.carrier,
        estimatedDays: patch.estimatedDays,
      },
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return { ok: false as const, error: apiErrorMessage(error, 'به‌روزرسانی روش ارسال ناموفق بود') }
    }
    const next = toMethod(result)
    methods.value = methods.value.map(m => (m.id === id ? next : m))
    return { ok: true as const, method: next }
  }

  async function createMethod(payload: {
    name: string
    carrier?: string
    estimatedDays?: string
    baseCost?: number
    status?: 'active' | 'inactive'
  }) {
    const { result, error } = await usePost<SellerShippingMethod>(
      '/seller/shipping',
      {
        name: payload.name,
        carrier: payload.carrier,
        estimatedDays: payload.estimatedDays,
        baseCost: payload.baseCost,
        status: payload.status,
      },
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return { ok: false as const, error: apiErrorMessage(error, 'ایجاد روش ارسال ناموفق بود') }
    }
    const next = toMethod(result)
    methods.value = [...methods.value, next]
    return { ok: true as const, method: next }
  }

  async function deleteMethod(id: string) {
    const { error } = await useDelete(`/seller/shipping/${encodeURIComponent(id)}`, {
      headers: { 'no-error': true },
    })
    if (error) {
      return { ok: false as const, error: apiErrorMessage(error, 'حذف روش ارسال ناموفق بود') }
    }
    methods.value = methods.value.filter(m => m.id !== id)
    return { ok: true as const }
  }

  return {
    shippingMethods,
    pending: computed(() => pending.value),
    fetchList,
    ensureLoaded,
    updateMethod,
    createMethod,
    deleteMethod,
  }
}
