import {
  emptyDiscountForm,
  formToDiscount,
  toDiscountForm,
  discountIdPattern,
  type SellerDiscount,
  type SellerDiscountFormValues,
  type SellerDiscountStatus,
} from '~/data/seller-discounts'
import { emptyMarketingTargeting } from '~/data/seller-marketing-shared'
import { isValidScheduleWindow } from '~/data/seller-marketing-shared'

export type SellerDiscountsQuery = {
  q?: string
  status?: string
  type?: string
  page?: number
  pageSize?: number
  all?: boolean
}

export type SellerDiscountsPage = {
  items: SellerDiscount[]
  total: number
  page: number
  pageSize: number
  statusCounts: Record<string, number>
}

function apiErrorMessage(error: any, fallback: string) {
  return (
    error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
    || error?.data?.message
    || error?.message
    || fallback
  )
}

function toDiscount(raw: any): SellerDiscount {
  return {
    id: String(raw.id || ''),
    name: String(raw.name || ''),
    description: String(raw.description || ''),
    type: raw.type === 'fixed' ? 'fixed' : 'percent',
    value: Math.max(0, Math.round(Number(raw.value) || 0)),
    minOrder: Math.max(0, Math.round(Number(raw.minOrder) || 0)),
    maxDiscount: raw.maxDiscount == null ? null : Math.max(0, Math.round(Number(raw.maxDiscount))),
    startsAt: String(raw.startsAt || new Date().toISOString()),
    endsAt: String(raw.endsAt || new Date().toISOString()),
    status: raw.status === 'inactive' ? 'inactive' : 'active',
    usageLimit: raw.usageLimit == null ? null : Math.max(0, Math.round(Number(raw.usageLimit))),
    usageCount: Math.max(0, Math.round(Number(raw.usageCount) || 0)),
    perCustomerLimit:
      raw.perCustomerLimit == null
        ? null
        : Math.max(0, Math.round(Number(raw.perCustomerLimit))),
    priority: Math.max(0, Math.round(Number(raw.priority) || 0)),
    targeting: {
      ...emptyMarketingTargeting(),
      ...(raw.targeting && typeof raw.targeting === 'object' ? raw.targeting : {}),
    },
    createdAt: String(raw.createdAt || new Date().toISOString()),
    updatedAt: String(raw.updatedAt || raw.createdAt || new Date().toISOString()),
  }
}

function formToPayload(form: SellerDiscountFormValues) {
  const draft = formToDiscount(form)
  return {
    id: draft.id || undefined,
    name: draft.name,
    description: draft.description,
    type: draft.type,
    value: draft.value,
    minOrder: draft.minOrder,
    maxDiscount: draft.maxDiscount,
    startsAt: draft.startsAt,
    endsAt: draft.endsAt,
    status: draft.status,
    usageLimit: draft.usageLimit,
    perCustomerLimit: draft.perCustomerLimit,
    priority: draft.priority,
    targeting: draft.targeting,
  }
}

export function useSellerDiscounts() {
  const items = useState<SellerDiscount[]>('seller-discounts', () => [])
  const listMeta = useState('seller-discounts-meta', () => ({
    total: 0,
    page: 1,
    pageSize: 10,
    statusCounts: {
      all: 0,
      active: 0,
      inactive: 0,
    } as Record<string, number>,
  }))
  const seeded = useState('seller-discounts-seeded', () => false)
  const pending = useState('seller-discounts-pending', () => false)

  const discounts = computed(() => items.value)
  const activeDiscounts = computed(() =>
    Number(listMeta.value.statusCounts.active)
      || items.value.filter(d => d.status === 'active').length,
  )

  function upsertLocal(discount: SellerDiscount) {
    const index = items.value.findIndex(d => d.id === discount.id)
    if (index === -1) {
      items.value = [discount, ...items.value]
      return
    }
    const copy = [...items.value]
    copy[index] = discount
    items.value = copy
  }

  async function fetchList(query?: SellerDiscountsQuery) {
    pending.value = true
    try {
      const params: Record<string, string | number | boolean> = {}
      if (query?.q?.trim()) params.q = query.q.trim()
      if (query?.status && query.status !== 'all') params.status = query.status
      if (query?.type && query.type !== 'all') params.type = query.type
      if (query?.all) {
        params.all = true
        params.pageSize = query.pageSize || 200
      }
      else {
        if (query?.page != null) params.page = query.page
        params.pageSize = query?.pageSize || 10
      }

      const { result, error } = await useGet<SellerDiscountsPage | SellerDiscount[]>(
        '/seller/discounts',
        { query: params, headers: { 'no-error': true }, server: false },
      )

      if (error || result == null) {
        return { ok: false as const, error: error ?? { message: 'discounts-fetch-failed' } }
      }

      if (Array.isArray(result)) {
        items.value = result.map(toDiscount)
        listMeta.value = {
          total: items.value.length,
          page: 1,
          pageSize: items.value.length,
          statusCounts: {
            all: items.value.length,
            active: items.value.filter(d => d.status === 'active').length,
            inactive: items.value.filter(d => d.status === 'inactive').length,
          },
        }
      }
      else {
        items.value = Array.isArray(result.items) ? result.items.map(toDiscount) : []
        listMeta.value = {
          total: Number(result.total) || items.value.length,
          page: Number(result.page) || 1,
          pageSize: Number(result.pageSize) || 10,
          statusCounts: result.statusCounts || {
            all: items.value.length,
            active: items.value.filter(d => d.status === 'active').length,
            inactive: items.value.filter(d => d.status === 'inactive').length,
          },
        }
      }
      seeded.value = true
      return { ok: true as const, error: null as null }
    }
    finally {
      pending.value = false
    }
  }

  async function ensureLoaded(options?: { force?: boolean }) {
    if (seeded.value && !options?.force) return items.value
    await fetchList({ page: 1, pageSize: 100 })
    return items.value
  }

  async function fetchDiscount(id: string, options?: { force?: boolean }) {
    const cached = getById(id)
    if (cached && !options?.force) {
      return { ok: true as const, discount: cached, error: null as null }
    }

    const { result, error } = await useGet<SellerDiscount>(
      `/seller/discounts/${encodeURIComponent(id)}`,
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return { ok: false as const, discount: null as SellerDiscount | null, error }
    }
    const discount = toDiscount(result)
    upsertLocal(discount)
    seeded.value = true
    return { ok: true as const, discount, error: null as null }
  }

  function getById(id: string) {
    return items.value.find(d => d.id === id) ?? null
  }

  function validate(form: SellerDiscountFormValues) {
    if (!form.name.trim()) return 'نام الزامی است'
    if (!form.id.trim() || !discountIdPattern.test(form.id.trim())) return 'شناسه نامعتبر است'
    const value = Number(form.value)
    if (form.type === 'percent' && (value < 1 || value > 99)) return 'درصد باید بین ۱ تا ۹۹ باشد'
    if (form.type === 'fixed' && value <= 0) return 'مبلغ تخفیف باید مثبت باشد'
    if (!isValidScheduleWindow(
      form.startsAt.includes('T') ? new Date(form.startsAt).toISOString() : form.startsAt,
      form.endsAt.includes('T') ? new Date(form.endsAt).toISOString() : form.endsAt,
    )) {
      if (form.endsAt <= form.startsAt) return 'پایان باید بعد از شروع باشد'
    }
    if (form.endsAt && form.startsAt && form.endsAt <= form.startsAt) {
      return 'پایان باید بعد از شروع باشد'
    }
    return null
  }

  async function createDiscount(form: SellerDiscountFormValues) {
    const err = validate(form)
    if (err) return { ok: false as const, error: err }

    const payload = formToPayload(form)
    const { result, error } = await usePost<SellerDiscount>('/seller/discounts', payload, {
      headers: { 'no-error': true },
    })
    if (error || !result?.id) {
      return { ok: false as const, error: apiErrorMessage(error, 'ثبت تخفیف ناموفق بود') }
    }
    const discount = toDiscount(result)
    upsertLocal(discount)
    seeded.value = true
    return { ok: true as const, discount }
  }

  async function updateDiscount(id: string, form: SellerDiscountFormValues) {
    const err = validate({ ...form, id })
    if (err) return { ok: false as const, error: err }

    const payload = formToPayload({ ...form, id })
    const { id: _omit, ...body } = payload
    const { result, error } = await usePut<SellerDiscount>(
      `/seller/discounts/${encodeURIComponent(id)}`,
      body,
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return { ok: false as const, error: apiErrorMessage(error, 'به‌روزرسانی تخفیف ناموفق بود') }
    }
    const discount = toDiscount(result)
    upsertLocal(discount)
    return { ok: true as const, discount }
  }

  async function deleteDiscount(id: string) {
    const { error } = await useDelete(`/seller/discounts/${encodeURIComponent(id)}`, {
      headers: { 'no-error': true },
    })
    if (error) {
      return { ok: false as const, error: apiErrorMessage(error, 'حذف تخفیف ناموفق بود') }
    }
    items.value = items.value.filter(d => d.id !== id)
    return { ok: true as const }
  }

  async function setStatus(id: string, status: SellerDiscountStatus) {
    const { result, error } = await usePatch<SellerDiscount>(
      `/seller/discounts/${encodeURIComponent(id)}/status`,
      { status },
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return { ok: false as const, error: apiErrorMessage(error, 'تغییر وضعیت ناموفق بود') }
    }
    const discount = toDiscount(result)
    upsertLocal(discount)
    return { ok: true as const, discount }
  }

  async function bulkSetStatus(ids: string[], status: SellerDiscountStatus) {
    const { result, error } = await usePost<{ updated: number }>(
      '/seller/discounts/bulk-status',
      { ids, status },
      { headers: { 'no-error': true } },
    )
    if (error) {
      return { ok: false as const, error: apiErrorMessage(error, 'اقدام گروهی ناموفق بود') }
    }
    items.value = items.value.map(d => (ids.includes(d.id) ? { ...d, status } : d))
    return { ok: true as const, updated: Number(result?.updated) || ids.length }
  }

  async function bulkDelete(ids: string[]) {
    const { result, error } = await usePost<{ deleted: number }>(
      '/seller/discounts/bulk-delete',
      { ids },
      { headers: { 'no-error': true } },
    )
    if (error) {
      return { ok: false as const, error: apiErrorMessage(error, 'حذف گروهی ناموفق بود') }
    }
    const set = new Set(ids)
    items.value = items.value.filter(d => !set.has(d.id))
    return { ok: true as const, deleted: Number(result?.deleted) || ids.length }
  }

  return {
    discounts,
    items,
    listMeta,
    activeDiscounts,
    pending: computed(() => pending.value),
    seeded,
    fetchList,
    ensureLoaded,
    fetchDiscount,
    getById,
    createDiscount,
    updateDiscount,
    deleteDiscount,
    setStatus,
    bulkSetStatus,
    bulkDelete,
    emptyDiscountForm,
    toDiscountForm,
  }
}
