import { cartDiscountCodes } from '~/data/cart'
import { products, type Product } from '~/data/products'
import { defaultNotifications, type ShopNotification } from '~/data/notifications'

export type CartLine = {
  id: string
  qty: number
  product: Product
}

export function useShop() {
  const cart = useState<Record<string, number>>('shop-cart', () => ({
    'iphone-16-pro': 1,
    'sony-xm5': 2,
  }))
  const cartBump = useState('shop-cart-bump', () => 0)
  const wishlist = useState<string[]>('shop-wishlist', () => [])
  const notificationList = useState<ShopNotification[]>(
    'shop-notification-list',
    () => structuredClone(defaultNotifications),
  )
  const isLoggedIn = useState('shop-logged-in', () => false)
  const discountCode = useState<string | null>('shop-discount-code', () => null)

  const cartCount = computed(() =>
    Object.values(cart.value).reduce((sum, n) => sum + n, 0),
  )

  const cartLines = computed<CartLine[]>(() =>
    Object.entries(cart.value)
      .map(([id, qty]) => {
        const product = products.find(p => p.id === id)
        if (!product || qty <= 0) return null
        return { id, qty, product }
      })
      .filter((line): line is CartLine => line !== null),
  )

  const cartSubtotal = computed(() =>
    cartLines.value.reduce((sum, line) => sum + line.product.price * line.qty, 0),
  )

  const discountAmount = computed(() => {
    if (!discountCode.value) return 0
    const pct = cartDiscountCodes[discountCode.value] ?? 0
    return Math.floor(cartSubtotal.value * pct)
  })

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

  function getCartQty(id: string) {
    return cart.value[id] || 0
  }

  function bumpCart() {
    cartBump.value += 1
  }

  function addToCart(id: string, qty = 1) {
    cart.value = {
      ...cart.value,
      [id]: (cart.value[id] || 0) + qty,
    }
    bumpCart()
  }

  function updateQty(id: string, qty: number) {
    const prev = cart.value[id] || 0
    if (qty <= 0) {
      const next = { ...cart.value }
      delete next[id]
      cart.value = next
      return
    }
    cart.value = {
      ...cart.value,
      [id]: qty,
    }
    if (qty > prev) bumpCart()
  }

  function removeFromCart(id: string) {
    if (!(id in cart.value)) return
    const next = { ...cart.value }
    delete next[id]
    cart.value = next
  }

  function clearCart() {
    cart.value = {}
  }

  function applyDiscount(code: string): boolean {
    const normalized = code.trim().toUpperCase()
    if (!normalized || !(normalized in cartDiscountCodes)) {
      return false
    }
    discountCode.value = normalized
    return true
  }

  function clearDiscount() {
    discountCode.value = null
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
    cartBump,
    cartLines,
    cartSubtotal,
    discountCode,
    discountAmount,
    wishlist,
    notificationList,
    isLoggedIn,
    cartCount,
    wishlistCount,
    notificationCount,
    isInWishlist,
    toggleWishlist,
    getCartQty,
    addToCart,
    updateQty,
    removeFromCart,
    clearCart,
    applyDiscount,
    clearDiscount,
    markNotificationRead,
    markAllNotificationsRead,
    login,
    logout,
  }
}
