import type { AccountProfile, ShopOrder } from '~/data/account'

const emptyProfile = (): AccountProfile => ({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  birth: '',
  gender: '',
})

export function useAccount() {
  const profile = useState<AccountProfile>('account-profile', emptyProfile)
  const orders = useState<ShopOrder[]>('account-orders', () => [])
  const profileLoaded = useState('account-profile-loaded', () => false)
  const ordersLoaded = useState('account-orders-loaded', () => false)
  const { fetchProduct } = useProducts()

  const fullName = computed(
    () => `${profile.value.firstName} ${profile.value.lastName}`.trim(),
  )

  const avatarInitial = computed(() =>
    profile.value.firstName.trim().charAt(0) || '؟',
  )

  const activeOrdersCount = computed(
    () =>
      orders.value.filter(
        o => o.status !== 'delivered' && o.status !== 'cancelled',
      ).length,
  )

  function getOrderById(id: string) {
    return orders.value.find(o => o.id === id) ?? null
  }

  async function hydrateOrderProducts(items: { productId: string }[]) {
    const ids = [...new Set(items.map(i => i.productId).filter(Boolean))]
    await Promise.all(ids.map(id => fetchProduct(id)))
  }

  async function fetchProfile() {
    const { result, error } = await useGet<AccountProfile>('/account/profile', {
      headers: { 'no-error': true },
    })
    if (result) {
      profile.value = result
      profileLoaded.value = true
    }
    return { result, error }
  }

  async function updateProfile(payload: Partial<AccountProfile>) {
    const body = {
      firstName: payload.firstName ?? '',
      lastName: payload.lastName ?? '',
      ...(payload.email?.trim() ? { email: payload.email.trim() } : {}),
      ...(payload.birth?.trim() ? { birth: payload.birth.trim() } : {}),
      ...(payload.gender?.trim() ? { gender: payload.gender.trim() } : {}),
    }
    const { result, error } = await usePut<AccountProfile>('/account/profile', body, {
      headers: { 'no-error': true },
    })
    if (result) {
      profile.value = result
      profileLoaded.value = true
    }
    return { result, error }
  }

  async function fetchOrders() {
    const { result, error } = await useGet<ShopOrder[]>('/account/orders', {
      headers: { 'no-error': true },
    })
    if (error) {
      return { result: null as ShopOrder[] | null, error }
    }

    orders.value = Array.isArray(result) ? result : []
    ordersLoaded.value = true
    await hydrateOrderProducts(orders.value.flatMap(o => o.items))

    return { result: orders.value, error: null as null }
  }

  async function fetchOrder(id: string) {
    const { result, error } = await useGet<ShopOrder>(
      `/account/orders/${encodeURIComponent(id)}`,
      { headers: { 'no-error': true } },
    )
    if (error || !result) {
      return { result: null as ShopOrder | null, error }
    }

    const others = orders.value.filter(o => o.id !== result.id)
    orders.value = [result, ...others]
    await hydrateOrderProducts(result.items)
    return { result, error: null as null }
  }

  return {
    profile,
    orders,
    profileLoaded,
    ordersLoaded,
    fullName,
    avatarInitial,
    activeOrdersCount,
    getOrderById,
    fetchProfile,
    updateProfile,
    fetchOrders,
    fetchOrder,
  }
}
