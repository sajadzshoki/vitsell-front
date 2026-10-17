import type {
  SellerShippingCity,
  SellerShippingMethod,
  SellerShippingSlot,
  ShippingCalendarHoliday,
} from '~/data/seller-returns-refunds'

function apiErrorMessage(error: any, fallback: string) {
  return (
    error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
    || error?.data?.message
    || error?.message
    || fallback
  )
}

function toMethod(raw: any): SellerShippingMethod {
  return {
    id: String(raw.id),
    name: String(raw.name || ''),
    carrier: String(raw.carrier || ''),
    estimatedDays: String(raw.estimatedDays || ''),
    baseCost: Number(raw.baseCost) || 0,
    status: raw.status === 'inactive' ? 'inactive' : 'active',
    coverage: raw.coverage === 'cities' ? 'cities' : 'nationwide',
    slotsEnabled: Boolean(raw.slotsEnabled),
    holidayMode:
      raw.holidayMode === 'custom' || raw.holidayMode === 'closed'
        ? raw.holidayMode
        : 'use_weekday',
    expressEnabled: Boolean(raw.expressEnabled),
    expressPrice: Number(raw.expressPrice) || 0,
    expressDeadlineHour: Math.min(23, Math.max(0, Number(raw.expressDeadlineHour) || 12)),
    cities: Array.isArray(raw.cities) ? raw.cities.map(toCity) : undefined,
    weekdaySlots: Array.isArray(raw.weekdaySlots) ? raw.weekdaySlots.map(toSlot) : undefined,
    holidaySlots: Array.isArray(raw.holidaySlots) ? raw.holidaySlots.map(toSlot) : undefined,
  }
}

function toCity(raw: any): SellerShippingCity {
  return {
    id: Number(raw.id),
    methodId: String(raw.methodId || ''),
    province: String(raw.province || ''),
    city: String(raw.city || ''),
    price: Number(raw.price) || 0,
    active: raw.active !== false,
  }
}

function toSlot(raw: any): SellerShippingSlot {
  return {
    id: raw.id != null ? Number(raw.id) : undefined,
    startTime: String(raw.startTime || ''),
    endTime: String(raw.endTime || ''),
    capacity: Number(raw.capacity) || 0,
    priceOverride: raw.priceOverride == null ? null : Number(raw.priceOverride),
    sortOrder: raw.sortOrder != null ? Number(raw.sortOrder) : undefined,
    weekday: raw.weekday != null ? Number(raw.weekday) : undefined,
  }
}

export function useSellerShipping() {
  const methods = useState<SellerShippingMethod[]>('seller-shipping-methods', () => [])
  const pending = useState('seller-shipping-pending', () => false)

  const shippingMethods = computed(() => methods.value)

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

  async function ensureLoaded(options?: { force?: boolean }) {
    await fetchList({ force: options?.force })
    return methods.value
  }

  async function fetchMethod(id: string) {
    const { result, error } = await useGet<SellerShippingMethod>(
      `/seller/shipping/${encodeURIComponent(id)}`,
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return { ok: false as const, error: apiErrorMessage(error, 'بارگذاری روش ارسال ناموفق بود') }
    }
    const next = toMethod(result)
    methods.value = methods.value.map(m => (m.id === id ? next : m))
    if (!methods.value.some(m => m.id === id)) {
      methods.value = [...methods.value, next]
    }
    return { ok: true as const, method: next }
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
        coverage: patch.coverage,
        slotsEnabled: patch.slotsEnabled,
        holidayMode: patch.holidayMode,
        expressEnabled: patch.expressEnabled,
        expressPrice: patch.expressPrice,
        expressDeadlineHour: patch.expressDeadlineHour,
      },
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return { ok: false as const, error: apiErrorMessage(error, 'به‌روزرسانی روش ارسال ناموفق بود') }
    }
    const next = toMethod(result)
    methods.value = methods.value.map(m => (m.id === id ? { ...m, ...next } : m))
    return { ok: true as const, method: next }
  }

  async function createMethod(payload: Partial<SellerShippingMethod> & { name: string }) {
    const { result, error } = await usePost<SellerShippingMethod>(
      '/seller/shipping',
      {
        name: payload.name,
        carrier: payload.carrier,
        estimatedDays: payload.estimatedDays,
        baseCost: payload.baseCost,
        status: payload.status,
        coverage: payload.coverage,
        slotsEnabled: payload.slotsEnabled,
        holidayMode: payload.holidayMode,
        expressEnabled: payload.expressEnabled,
        expressPrice: payload.expressPrice,
        expressDeadlineHour: payload.expressDeadlineHour,
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

  async function fetchCities(methodId: string) {
    const { result, error } = await useGet<{ items: SellerShippingCity[] }>(
      `/seller/shipping/${encodeURIComponent(methodId)}/cities`,
      { headers: { 'no-error': true } },
    )
    if (error) return { ok: false as const, error: apiErrorMessage(error, 'بارگذاری شهرها ناموفق بود'), items: [] as SellerShippingCity[] }
    return { ok: true as const, items: (result?.items || []).map(toCity) }
  }

  async function upsertCity(methodId: string, payload: { province: string, city: string, price: number, active?: boolean }) {
    const { result, error } = await usePost<SellerShippingCity>(
      `/seller/shipping/${encodeURIComponent(methodId)}/cities`,
      payload,
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return { ok: false as const, error: apiErrorMessage(error, 'ذخیره شهر ناموفق بود') }
    }
    return { ok: true as const, city: toCity(result) }
  }

  async function deleteCity(methodId: string, cityId: number) {
    const { error } = await useDelete(
      `/seller/shipping/${encodeURIComponent(methodId)}/cities/${cityId}`,
      { headers: { 'no-error': true } },
    )
    if (error) return { ok: false as const, error: apiErrorMessage(error, 'حذف شهر ناموفق بود') }
    return { ok: true as const }
  }

  async function fetchWeekdaySlots(methodId: string) {
    const { result, error } = await useGet<{ items: SellerShippingSlot[] }>(
      `/seller/shipping/${encodeURIComponent(methodId)}/weekday-slots`,
      { headers: { 'no-error': true } },
    )
    if (error) return { ok: false as const, error: apiErrorMessage(error, 'بارگذاری بازه‌ها ناموفق بود'), items: [] as SellerShippingSlot[] }
    return { ok: true as const, items: (result?.items || []).map(toSlot) }
  }

  async function replaceWeekdaySlots(methodId: string, weekday: number, slots: SellerShippingSlot[]) {
    const { result, error } = await usePut<{ weekday: number, items: SellerShippingSlot[] }>(
      `/seller/shipping/${encodeURIComponent(methodId)}/weekday-slots`,
      {
        weekday,
        slots: slots.map(s => ({
          startTime: s.startTime,
          endTime: s.endTime,
          capacity: s.capacity,
          priceOverride: s.priceOverride,
          sortOrder: s.sortOrder,
        })),
      },
      { headers: { 'no-error': true } },
    )
    if (error) return { ok: false as const, error: apiErrorMessage(error, 'ذخیره بازه‌ها ناموفق بود') }
    return { ok: true as const, items: (result?.items || []).map(toSlot) }
  }

  async function fetchHolidaySlots(methodId: string) {
    const { result, error } = await useGet<{ items: SellerShippingSlot[], holidayMode?: string }>(
      `/seller/shipping/${encodeURIComponent(methodId)}/holiday-slots`,
      { headers: { 'no-error': true } },
    )
    if (error) return { ok: false as const, error: apiErrorMessage(error, 'بارگذاری بازه‌های تعطیل ناموفق بود'), items: [] as SellerShippingSlot[] }
    return { ok: true as const, items: (result?.items || []).map(toSlot), holidayMode: result?.holidayMode }
  }

  async function replaceHolidaySlots(methodId: string, slots: SellerShippingSlot[]) {
    const { result, error } = await usePut<{ items: SellerShippingSlot[] }>(
      `/seller/shipping/${encodeURIComponent(methodId)}/holiday-slots`,
      {
        slots: slots.map(s => ({
          startTime: s.startTime,
          endTime: s.endTime,
          capacity: s.capacity,
          priceOverride: s.priceOverride,
          sortOrder: s.sortOrder,
        })),
      },
      { headers: { 'no-error': true } },
    )
    if (error) return { ok: false as const, error: apiErrorMessage(error, 'ذخیره بازه‌های تعطیل ناموفق بود') }
    return { ok: true as const, items: (result?.items || []).map(toSlot) }
  }

  async function fetchHolidays(from?: string, to?: string) {
    const query: Record<string, string> = {}
    if (from) query.from = from
    if (to) query.to = to
    const { result, error } = await useGet<{ items: ShippingCalendarHoliday[] }>(
      '/seller/shipping/holidays',
      { query, headers: { 'no-error': true } },
    )
    if (error) return { ok: false as const, error: apiErrorMessage(error, 'بارگذاری تعطیلات ناموفق بود'), items: [] as ShippingCalendarHoliday[] }
    return {
      ok: true as const,
      items: (result?.items || []).map(h => ({
        id: Number(h.id),
        date: String(h.date || ''),
        title: String(h.title || ''),
        source: h.source === 'iran' ? 'iran' as const : 'manual' as const,
      })),
    }
  }

  async function upsertHoliday(payload: { date: string, title?: string }) {
    const { result, error } = await usePost<ShippingCalendarHoliday>(
      '/seller/shipping/holidays',
      payload,
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return { ok: false as const, error: apiErrorMessage(error, 'ثبت تعطیل ناموفق بود') }
    }
    return {
      ok: true as const,
      holiday: {
        id: Number(result.id),
        date: String(result.date || ''),
        title: String(result.title || ''),
        source: result.source === 'iran' ? 'iran' as const : 'manual' as const,
      },
    }
  }

  async function deleteHoliday(id: number) {
    const { error } = await useDelete(`/seller/shipping/holidays/${id}`, {
      headers: { 'no-error': true },
    })
    if (error) return { ok: false as const, error: apiErrorMessage(error, 'حذف تعطیل ناموفق بود') }
    return { ok: true as const }
  }

  return {
    shippingMethods,
    pending: computed(() => pending.value),
    fetchList,
    ensureLoaded,
    fetchMethod,
    updateMethod,
    createMethod,
    deleteMethod,
    fetchCities,
    upsertCity,
    deleteCity,
    fetchWeekdaySlots,
    replaceWeekdaySlots,
    fetchHolidaySlots,
    replaceHolidaySlots,
    fetchHolidays,
    upsertHoliday,
    deleteHoliday,
  }
}
