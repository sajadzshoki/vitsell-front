import {
  defaultOrders,
  defaultProfile,
  type AccountProfile,
  type ShopOrder,
} from '~/data/account'

export function useAccount() {
  const profile = useState<AccountProfile>('account-profile', () =>
    structuredClone(defaultProfile),
  )
  const orders = useState<ShopOrder[]>('account-orders', () =>
    structuredClone(defaultOrders),
  )

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

  return {
    profile,
    orders,
    fullName,
    avatarInitial,
    activeOrdersCount,
    getOrderById,
  }
}
