import {
  customerFullName,
  emptyCustomerForm,
  toCustomerForm,
  type SellerCustomer,
  type SellerCustomerAddress,
  type SellerCustomerFormValues,
  type SellerCustomerStatus,
} from '~/data/seller-customers'

function apiErrorMessage(error: any, fallback: string) {
  return (
    error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
    || error?.data?.message
    || error?.message
    || fallback
  )
}

export type SellerCustomersQuery = {
  q?: string
  status?: string
  hasOrders?: boolean
  spendMin?: number | string
  spendMax?: number | string
  sort?: string
  page?: number
  pageSize?: number
  all?: boolean
}

export type SellerCustomersPage = {
  items: SellerCustomer[]
  total: number
  page: number
  pageSize: number
  statusCounts: Record<string, number>
}

export type SellerCustomerDetail = SellerCustomer & {
  recentOrders: Array<{
    id: string
    date: string
    dateKey: string
    status: string
    total: number
    shippingMethod: string
    paymentMethod: string
    customerName: string
    customerPhone: string
  }>
}

function toAddress(raw: any): SellerCustomerAddress {
  return {
    id: String(raw.id || ''),
    title: String(raw.title || ''),
    recipient: String(raw.recipient || raw.fullName || ''),
    phone: String(raw.phone || ''),
    province: String(raw.province || ''),
    city: String(raw.city || ''),
    address: String(raw.address || ''),
    postalCode: String(raw.postalCode || ''),
    isDefault: Boolean(raw.isDefault),
  }
}

function toCustomer(raw: any): SellerCustomer {
  return {
    id: String(raw.id),
    firstName: String(raw.firstName || ''),
    lastName: String(raw.lastName || ''),
    email: String(raw.email || ''),
    phone: String(raw.phone || ''),
    status: (['active', 'inactive', 'blocked'].includes(raw.status) ? raw.status : 'active') as SellerCustomerStatus,
    registeredAt: String(raw.registeredAt || new Date().toISOString()),
    lastActivityAt: String(raw.lastActivityAt || raw.registeredAt || new Date().toISOString()),
    orderCount: Number(raw.orderCount) || 0,
    completedOrders: Number(raw.completedOrders) || 0,
    cancelledOrders: Number(raw.cancelledOrders) || 0,
    returnedOrders: Number(raw.returnedOrders) || 0,
    totalSpent: Number(raw.totalSpent) || 0,
    refundTotal: Number(raw.refundTotal) || 0,
    reviewCount: Number(raw.reviewCount) || 0,
    questionCount: Number(raw.questionCount) || 0,
    wishlistCount: Number(raw.wishlistCount) || 0,
    addresses: Array.isArray(raw.addresses) ? raw.addresses.map(toAddress) : [],
  }
}

export function useSellerCustomers() {
  const items = useState<SellerCustomer[]>('seller-customers', () => [])
  const listMeta = useState('seller-customers-meta', () => ({
    total: 0,
    page: 1,
    pageSize: 10,
    statusCounts: {
      all: 0,
      active: 0,
      inactive: 0,
      blocked: 0,
    } as Record<string, number>,
  }))
  const pending = useState('seller-customers-pending', () => false)
  const detailCache = useState<Record<string, SellerCustomerDetail>>('seller-customers-detail', () => ({}))

  const customers = computed(() => items.value)

  async function fetchList(query?: SellerCustomersQuery) {
    pending.value = true
    try {
      const params: Record<string, string | number | boolean> = {}
      if (query?.q?.trim()) params.q = query.q.trim()
      if (query?.status && query.status !== 'all') params.status = query.status
      if (query?.hasOrders) params.hasOrders = true
      if (query?.spendMin != null && query.spendMin !== '') params.spendMin = Number(query.spendMin)
      if (query?.spendMax != null && query.spendMax !== '') params.spendMax = Number(query.spendMax)
      if (query?.sort) params.sort = query.sort
      if (query?.all) {
        params.all = true
        params.pageSize = query.pageSize || 200
      }
      else {
        if (query?.page != null) params.page = query.page
        params.pageSize = query?.pageSize || 10
      }

      const { result, error } = await useGet<SellerCustomersPage | SellerCustomer[]>(
        '/seller/customers',
        { query: params, headers: { 'no-error': true } },
      )
      if (error || result == null) {
        return { ok: false as const, error: error ?? { message: 'customers-fetch-failed' } }
      }

      if (Array.isArray(result)) {
        items.value = result.map(toCustomer)
        listMeta.value = {
          total: items.value.length,
          page: 1,
          pageSize: items.value.length,
          statusCounts: { all: items.value.length },
        }
      }
      else {
        items.value = Array.isArray(result.items) ? result.items.map(toCustomer) : []
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

  /** @deprecated prefer fetchList */
  async function ensureLoaded(options?: { force?: boolean }) {
    if (items.value.length && !options?.force) return items.value
    await fetchList({ all: true, pageSize: 200 })
    return items.value
  }

  function getById(id: string) {
    return (
      detailCache.value[id]
      || items.value.find(c => c.id === id || c.id === id.replace(/^user/i, ''))
      || null
    )
  }

  async function fetchOne(id: string) {
    const { result, error } = await useGet<SellerCustomerDetail>(
      `/seller/customers/${encodeURIComponent(id)}`,
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return { ok: false as const, customer: null as SellerCustomerDetail | null, error: apiErrorMessage(error, 'مشتری پیدا نشد') }
    }
    const customer: SellerCustomerDetail = {
      ...toCustomer(result),
      recentOrders: Array.isArray(result.recentOrders)
        ? result.recentOrders.map(o => ({
            id: String(o.id),
            date: String(o.date || ''),
            dateKey: String(o.dateKey || ''),
            status: String(o.status || ''),
            total: Number(o.total) || 0,
            shippingMethod: String(o.shippingMethod || ''),
            paymentMethod: String(o.paymentMethod || ''),
            customerName: String(o.customerName || ''),
            customerPhone: String(o.customerPhone || ''),
          }))
        : [],
    }
    detailCache.value = { ...detailCache.value, [customer.id]: customer, [id]: customer }
    items.value = items.value.map(c => (c.id === customer.id ? customer : c))
    if (!items.value.some(c => c.id === customer.id)) {
      items.value = [customer, ...items.value]
    }
    return { ok: true as const, customer, error: null as null }
  }

  async function updateCustomer(id: string, form: SellerCustomerFormValues) {
    const { result, error } = await usePatch<SellerCustomerDetail>(
      `/seller/customers/${encodeURIComponent(id)}`,
      {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email || null,
        phone: form.phone,
        status: form.status,
      },
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return { ok: false as const, error: apiErrorMessage(error, 'ذخیره مشتری ناموفق بود') }
    }
    const customer = {
      ...toCustomer(result),
      recentOrders: Array.isArray(result.recentOrders) ? result.recentOrders : (detailCache.value[id]?.recentOrders || []),
    } as SellerCustomerDetail
    detailCache.value = { ...detailCache.value, [customer.id]: customer, [id]: customer }
    items.value = items.value.map(c => (c.id === customer.id ? customer : c))
    return { ok: true as const, customer }
  }

  async function setStatus(id: string, status: SellerCustomerStatus) {
    const { result, error } = await usePatch<SellerCustomerDetail>(
      `/seller/customers/${encodeURIComponent(id)}/status`,
      { status },
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return { ok: false as const, error: apiErrorMessage(error, 'مشتری پیدا نشد') }
    }
    const customer = {
      ...toCustomer(result),
      recentOrders: Array.isArray(result.recentOrders) ? result.recentOrders : (detailCache.value[id]?.recentOrders || []),
    } as SellerCustomerDetail
    detailCache.value = { ...detailCache.value, [customer.id]: customer, [id]: customer }
    items.value = items.value.map(c => (c.id === customer.id ? customer : c))
    return { ok: true as const, customer }
  }

  async function bulkSetStatus(ids: string[], status: SellerCustomerStatus) {
    const { result, error } = await usePost<{ updated: number, status: string }>(
      '/seller/customers/bulk-status',
      { ids, status },
      { headers: { 'no-error': true } },
    )
    if (error) {
      return { ok: false as const, error: apiErrorMessage(error, 'به‌روزرسانی گروهی ناموفق بود') }
    }
    return { ok: true as const, updated: Number(result?.updated) || ids.length }
  }

  return {
    customers,
    listMeta,
    pending: computed(() => pending.value),
    fetchList,
    fetchOne,
    ensureLoaded,
    getById,
    updateCustomer,
    setStatus,
    bulkSetStatus,
    customerFullName,
    emptyCustomerForm,
    toCustomerForm,
  }
}
