export type SellerCourierStatus = 'active' | 'inactive' | 'blocked'

export type SellerCourier = {
  id: number
  name: string
  phone: string
  status: SellerCourierStatus
}

function apiMessage(error: { data?: { errors?: { message?: string }[], message?: string } } | null | undefined, fallback: string) {
  return error?.data?.errors?.map(item => item.message).filter(Boolean).join(' ، ')
    || error?.data?.message
    || fallback
}

export function useSellerCouriers() {
  const items = ref<SellerCourier[]>([])
  const loading = ref(false)

  function mapCourier(raw: Partial<SellerCourier> & { id: number }): SellerCourier {
    const status = raw.status === 'inactive' || raw.status === 'blocked' ? raw.status : 'active'
    return {
      id: Number(raw.id),
      name: String(raw.name || ''),
      phone: String(raw.phone || ''),
      status,
    }
  }

  async function fetchCouriers(status?: 'active' | 'inactive') {
    loading.value = true
    try {
      const { result, error } = await useGet<{ items: SellerCourier[] }>('/seller/couriers', {
        headers: { 'no-error': true },
        query: status ? { status } : {},
      })
      if (error || !result) {
        return { ok: false as const, items: [] as SellerCourier[], message: apiMessage(error, 'بارگذاری پیک‌ها ناموفق بود') }
      }
      const list = Array.isArray(result.items) ? result.items.map(mapCourier) : []
      items.value = list
      return { ok: true as const, items: list, message: '' }
    }
    finally {
      loading.value = false
    }
  }

  async function fetchCourier(id: number) {
    const { result, error } = await useGet<SellerCourier>(`/seller/couriers/${id}`, {
      headers: { 'no-error': true },
    })
    if (error || !result?.id) {
      return { ok: false as const, courier: null as SellerCourier | null, message: apiMessage(error, 'پیک یافت نشد') }
    }
    return { ok: true as const, courier: mapCourier(result), message: '' }
  }

  async function createCourier(payload: { name: string, phone: string }) {
    const { result, error } = await usePost<SellerCourier>('/seller/couriers', payload, {
      headers: { 'no-error': true },
    })
    if (error || !result?.id) {
      return { ok: false as const, courier: null as SellerCourier | null, message: apiMessage(error, 'ثبت پیک ناموفق بود') }
    }
    return { ok: true as const, courier: mapCourier(result), message: '' }
  }

  async function updateCourier(id: number, payload: { name: string, phone: string }) {
    const { result, error } = await usePut<SellerCourier>(`/seller/couriers/${id}`, payload, {
      headers: { 'no-error': true },
    })
    if (error || !result?.id) {
      return { ok: false as const, courier: null as SellerCourier | null, message: apiMessage(error, 'ویرایش پیک ناموفق بود') }
    }
    return { ok: true as const, courier: mapCourier(result), message: '' }
  }

  async function setCourierStatus(id: number, status: 'active' | 'inactive') {
    const { result, error } = await usePatch<SellerCourier>(`/seller/couriers/${id}/status`, { status }, {
      headers: { 'no-error': true },
    })
    if (error || !result?.id) {
      return { ok: false as const, courier: null as SellerCourier | null, message: apiMessage(error, 'تغییر وضعیت ناموفق بود') }
    }
    const courier = mapCourier(result)
    items.value = items.value.map(item => item.id === courier.id ? courier : item)
    return { ok: true as const, courier, message: '' }
  }

  return {
    items,
    loading,
    fetchCouriers,
    fetchCourier,
    createCourier,
    updateCourier,
    setCourierStatus,
  }
}
