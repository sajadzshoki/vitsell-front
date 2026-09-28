import {
  courierApiMessage,
  toCourierOrder,
  type CourierOrder,
} from '~/data/courier'

function isForbidden(error: { statusCode?: number, status?: number } | null | undefined) {
  const status = error?.statusCode ?? error?.status
  return status === 401 || status === 403
}

export function useCourier() {
  const { logout } = useShop()

  async function kickToLogin() {
    await logout()
    await navigateTo('/courier/login')
  }

  async function fetchOrders() {
    const { result, error } = await useGet<{ items: CourierOrder[] }>('/courier/orders', {
      headers: { 'no-error': true },
    })
    if (isForbidden(error)) {
      await kickToLogin()
      return { ok: false as const, items: [] as CourierOrder[], message: '' }
    }
    if (error || !result) {
      return {
        ok: false as const,
        items: [] as CourierOrder[],
        message: courierApiMessage(error, 'بارگذاری سفارش‌ها ناموفق بود'),
      }
    }
    const items = Array.isArray(result.items) ? result.items.map(item => toCourierOrder(item)) : []
    return { ok: true as const, items, message: '' }
  }

  async function fetchOrder(id: string) {
    const { result, error } = await useGet<CourierOrder>(`/courier/orders/${encodeURIComponent(id)}`, {
      headers: { 'no-error': true },
    })
    if (isForbidden(error)) {
      await kickToLogin()
      return { ok: false as const, missing: false, order: null as CourierOrder | null, message: '' }
    }
    const status = error?.statusCode ?? error?.status
    if (status === 404) {
      return { ok: false as const, missing: true, order: null as CourierOrder | null, message: 'سفارش یافت نشد' }
    }
    if (error || !result?.id) {
      return {
        ok: false as const,
        missing: false,
        order: null as CourierOrder | null,
        message: courierApiMessage(error, 'بارگذاری سفارش ناموفق بود'),
      }
    }
    return { ok: true as const, missing: false, order: toCourierOrder(result), message: '' }
  }

  async function deliver(id: string, code: string) {
    const { result, error } = await usePost<CourierOrder>(
      `/courier/orders/${encodeURIComponent(id)}/deliver`,
      { code },
      { headers: { 'no-error': true } },
    )
    if (isForbidden(error)) {
      await kickToLogin()
      return { ok: false as const, order: null as CourierOrder | null, message: '' }
    }
    if (error || !result?.id) {
      return {
        ok: false as const,
        order: null as CourierOrder | null,
        message: courierApiMessage(error, 'کد تحویل نادرست است'),
      }
    }
    return { ok: true as const, order: toCourierOrder(result), message: '' }
  }

  return { fetchOrders, fetchOrder, deliver }
}
