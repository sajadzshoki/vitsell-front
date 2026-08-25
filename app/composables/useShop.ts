import { defaultNotifications, type ShopNotification } from '~/data/notifications'

export function useShop() {
  const cart = useState<Record<string, number>>('shop-cart', () => ({}))
  const wishlist = useState<string[]>('shop-wishlist', () => [])
  const notificationList = useState<ShopNotification[]>(
    'shop-notification-list',
    () => structuredClone(defaultNotifications),
  )
  const isLoggedIn = useState('shop-logged-in', () => false)

  const cartCount = computed(() =>
    Object.values(cart.value).reduce((sum, n) => sum + n, 0),
  )

  const wishlistCount = computed(() => wishlist.value.length)

  const notificationCount = computed(
    () => notificationList.value.filter(n => !n.read).length,
  )

  function isInWishlist(id: string) {
    return wishlist.value.includes(id)
  }

  function toggleWishlist(id: string) {
    const i = wishlist.value.indexOf(id)
    if (i >= 0) {
      wishlist.value = wishlist.value.filter(x => x !== id)
    }
    else {
      wishlist.value = [...wishlist.value, id]
    }
  }

  function addToCart(id: string, qty = 1) {
    cart.value = {
      ...cart.value,
      [id]: (cart.value[id] || 0) + qty,
    }
  }

  function markNotificationRead(id: string) {
    notificationList.value = notificationList.value.map(n =>
      n.id === id ? { ...n, read: true } : n,
    )
  }

  function markAllNotificationsRead() {
    notificationList.value = notificationList.value.map(n => ({ ...n, read: true }))
  }

  function login() {
    isLoggedIn.value = true
  }

  function logout() {
    isLoggedIn.value = false
  }

  return {
    cart,
    wishlist,
    notificationList,
    isLoggedIn,
    cartCount,
    wishlistCount,
    notificationCount,
    isInWishlist,
    toggleWishlist,
    addToCart,
    markNotificationRead,
    markAllNotificationsRead,
    login,
    logout,
  }
}
