import type { Product } from '~/data/products'
import type { ShopNotification } from '~/data/notifications'
import type { AccountProfile } from '~/data/account'
import {
  clearGuestCartStorage,
  guestCartLineId,
  productForGuestLine,
  readGuestCart,
  writeGuestCart,
  type CartLine,
} from '~/composables/guest-cart'

export type { CartLine }

export function useShop() {
  const { token, logoutRemote, fetchMe, setToken } = useAuth()
  const { profile, fetchProfile, fetchOrders } = useAccount()
  const { remember, getCachedProduct, fetchProduct } = useProducts()
  const router = useRouter()

  const cartLines = useState<CartLine[]>('shop-cart-lines', () => [])
  const cartBump = useState('shop-cart-bump', () => 0)
  const wishlistProducts = useState<Product[]>('shop-wishlist-products', () => [])
  const notificationList = useState<ShopNotification[]>('shop-notification-list', () => [])
  const isLoggedIn = useState('shop-logged-in', () => !!token.value)
  const discountCode = useState<string | null>('shop-discount-code', () => null)
  const discountCodes = useState<Record<string, number>>('shop-discount-codes', () => ({}))
  const authHydrated = useState('shop-auth-hydrated', () => false)
  const shopPending = useState('shop-pending', () => false)

  const wishlist = computed(() => wishlistProducts.value.map(p => p.id))

  const cartCount = computed(() =>
    cartLines.value.reduce((sum, line) => sum + line.qty, 0),
  )

  const cartSubtotal = computed(() =>
    cartLines.value.reduce((sum, line) => sum + line.product.price * line.qty, 0),
  )

  const discountAmount = computed(() => {
    if (!discountCode.value) return 0
    const pct = discountCodes.value[discountCode.value] ?? 0
    return Math.floor(cartSubtotal.value * pct)
  })

  const wishlistCount = computed(() => wishlistProducts.value.length)

  const notificationCount = computed(
    () => notificationList.value.filter(n => !n.read).length,
  )

  function requireAuth() {
    if (isLoggedIn.value && token.value) return true
    router.push({ path: '/login', query: { redirect: router.currentRoute.value.fullPath } })
    return false
  }

  function bumpCart() {
    cartBump.value += 1
  }

  function isGuestSession() {
    return !token.value || !isLoggedIn.value
  }

  function persistGuestCart(lines: CartLine[]) {
    cartLines.value = lines
    writeGuestCart(lines)
    remember(lines.map(l => l.product))
  }

  function loadGuestCart() {
    const lines = readGuestCart()
    cartLines.value = lines
    if (lines.length) remember(lines.map(l => l.product))
  }

  function isInWishlist(id: string) {
    return wishlistProducts.value.some(p => p.id === id)
  }

  function getCartQty(productId: string, variantId?: string | null) {
    if (variantId) {
      return cartLines.value.find(line =>
        line.product.id === productId && line.variantId === variantId,
      )?.qty || 0
    }
    return cartLines.value
      .filter(line => line.product.id === productId)
      .reduce((sum, line) => sum + line.qty, 0)
  }

  function getCartLineId(productId: string, variantId?: string | null) {
    return cartLines.value.find(line =>
      line.product.id === productId
      && (variantId ? line.variantId === variantId : !line.variantId),
    )?.id ?? null
  }

  async function fetchDiscountCodes() {
    const { result } = await useGet<Record<string, number>>('/discount-codes', {
      headers: { 'no-error': true },
    })
    discountCodes.value = result && typeof result === 'object' ? result : {}
  }

  async function fetchCart() {
    if (!token.value) {
      loadGuestCart()
      return { ok: true as const, error: null as null }
    }
    const { result, error } = await useGet<CartLine[]>('/cart', {
      headers: { 'no-error': true },
      server: false,
    })
    if (error) {
      return { ok: false as const, error }
    }
    cartLines.value = Array.isArray(result) ? result : []
    remember(cartLines.value.map(l => l.product))
    return { ok: true as const, error: null as null }
  }

  async function fetchWishlist() {
    if (!token.value) {
      wishlistProducts.value = []
      return { result: [] as Product[], error: null as null }
    }
    const { result, error } = await useGet<Product[]>('/wishlist', {
      headers: { 'no-error': true },
      server: false,
    })
    if (error) {
      return { result: null as Product[] | null, error }
    }
    wishlistProducts.value = Array.isArray(result) ? result : []
    remember(wishlistProducts.value)
    return { result: wishlistProducts.value, error: null as null }
  }

  async function fetchNotifications() {
    if (!token.value) {
      notificationList.value = []
      return
    }
    const { result } = await useGet<ShopNotification[]>('/notifications', {
      headers: { 'no-error': true },
      server: false,
    })
    notificationList.value = Array.isArray(result) ? result : []
  }

  /** Push guest lines into server cart (qty merges server-side), then refresh. */
  async function mergeGuestCartIntoServer() {
    const guest = readGuestCart()
    if (!guest.length || !token.value) return

    await Promise.all(guest.map(line =>
      usePost<CartLine>('/cart', {
        productId: line.product.id,
        qty: line.qty,
        ...(line.variantId ? { variantId: line.variantId } : {}),
      }, {
        headers: { 'no-error': true },
      }),
    ))

    clearGuestCartStorage()
    await fetchCart()
  }

  async function hydrateShop() {
    if (!token.value) {
      loadGuestCart()
      wishlistProducts.value = []
      notificationList.value = []
      return
    }
    shopPending.value = true
    try {
      await Promise.all([
        fetchCart(),
        fetchWishlist(),
        fetchNotifications(),
        fetchDiscountCodes(),
        fetchOrders(),
      ])
      await mergeGuestCartIntoServer()
      const { syncToServer } = useUserActivity()
      void syncToServer()
    }
    finally {
      shopPending.value = false
    }
  }

  /** Ensure cart badge has fresh data after login / on navbar mount */
  async function ensureCartLoaded() {
    if (!import.meta.client) return
    if (isGuestSession()) {
      loadGuestCart()
      return
    }
    await fetchCart()
  }

  if (import.meta.client && !authHydrated.value) {
    authHydrated.value = true
    isLoggedIn.value = !!token.value
    fetchDiscountCodes()
    if (token.value) {
      fetchMe().then(({ result, error }) => {
        if (result) {
          profile.value = result
          isLoggedIn.value = true
          hydrateShop()
        }
        else if (error) {
          setToken(null)
          isLoggedIn.value = false
          loadGuestCart()
        }
      })
    }
    else {
      loadGuestCart()
    }
  }

  async function toggleWishlist(id: string) {
    if (!requireAuth()) return
    if (isInWishlist(id)) {
      await useDelete(`/wishlist/${encodeURIComponent(id)}`, { headers: { 'no-error': true } })
      wishlistProducts.value = wishlistProducts.value.filter(p => p.id !== id)
      return
    }
    const { result } = await usePost<Product>('/wishlist', { productId: id }, {
      headers: { 'no-error': true },
    })
    if (result) {
      wishlistProducts.value = [...wishlistProducts.value, result]
      remember([result])
      const { track } = useUserActivity()
      void track({
        type: 'wishlist',
        productId: result.id,
        category: result.category,
      })
    }
    else {
      await fetchWishlist()
    }
  }

  async function resolveProduct(id: string) {
    const cached = getCachedProduct(id)
    if (cached) return cached
    const { result } = await fetchProduct(id)
    return result ?? null
  }

  async function addGuestToCart(id: string, qty = 1, variantId?: string | null) {
    const base = await resolveProduct(id)
    if (!base) return

    const { product, variantLabel } = productForGuestLine(base, variantId)
    const lineId = guestCartLineId(id, variantId)
    const existing = cartLines.value.find(l => l.id === lineId)
    const nextQty = (existing?.qty ?? 0) + qty
    const line: CartLine = {
      id: lineId,
      qty: nextQty,
      product,
      variantId: variantId ?? null,
      variantLabel,
    }
    const others = cartLines.value.filter(l => l.id !== lineId)
    persistGuestCart([...others, line])
    bumpCart()
    const { track } = useUserActivity()
    void track({
      type: 'add_to_cart',
      productId: product.id,
      category: product.category,
    })
  }

  async function addToCart(id: string, qty = 1, variantId?: string | null) {
    if (isGuestSession()) {
      await addGuestToCart(id, qty, variantId)
      return
    }
    const { result } = await usePost<CartLine>('/cart', {
      productId: id,
      qty,
      ...(variantId ? { variantId } : {}),
    }, {
      headers: { 'no-error': true },
    })
    if (result) {
      const others = cartLines.value.filter(l => l.id !== result.id)
      cartLines.value = [...others, result]
      remember([result.product])
      bumpCart()
      const { track } = useUserActivity()
      void track({
        type: 'add_to_cart',
        productId: result.product.id,
        category: result.product.category,
      })
    }
    else {
      await fetchCart()
      bumpCart()
    }
  }

  async function updateQty(id: string, qty: number) {
    if (qty <= 0) {
      await removeFromCart(id)
      return
    }

    if (isGuestSession()) {
      const prev = cartLines.value.find(l => l.id === id)?.qty ?? 0
      const next = cartLines.value.map(l => (l.id === id ? { ...l, qty } : l))
      if (!next.some(l => l.id === id)) return
      persistGuestCart(next)
      if (qty > prev) bumpCart()
      return
    }

    const prev = cartLines.value.find(l => l.id === id)?.qty ?? 0
    const { result } = await usePatch<CartLine | { removed: true }>(
      `/cart/${encodeURIComponent(id)}`,
      { qty },
      { headers: { 'no-error': true } },
    )
    if (result && 'product' in result) {
      cartLines.value = cartLines.value.map(l => (l.id === id ? result : l))
      remember([result.product])
    }
    else {
      await fetchCart()
    }
    if (qty > prev) bumpCart()
  }

  async function removeFromCart(id: string) {
    if (isGuestSession()) {
      persistGuestCart(cartLines.value.filter(l => l.id !== id))
      return
    }
    await useDelete(`/cart/${encodeURIComponent(id)}`, { headers: { 'no-error': true } })
    cartLines.value = cartLines.value.filter(l => l.id !== id)
  }

  async function clearCart() {
    if (isGuestSession()) {
      clearGuestCartStorage()
      cartLines.value = []
      return
    }
    await useDelete('/cart', { headers: { 'no-error': true } })
    cartLines.value = []
  }

  function applyDiscount(code: string): boolean {
    const normalized = code.trim().toUpperCase()
    if (!normalized || !(normalized in discountCodes.value)) {
      return false
    }
    discountCode.value = normalized
    return true
  }

  function clearDiscount() {
    discountCode.value = null
  }

  async function markNotificationRead(id: string) {
    if (!requireAuth()) return
    const { result } = await usePost<ShopNotification>(
      `/notifications/${encodeURIComponent(id)}/read`,
      {},
      { headers: { 'no-error': true } },
    )
    if (result) {
      notificationList.value = notificationList.value.map(n =>
        n.id === id ? result : n,
      )
    }
    else {
      notificationList.value = notificationList.value.map(n =>
        n.id === id ? { ...n, read: true } : n,
      )
    }
  }

  async function markAllNotificationsRead() {
    if (!requireAuth()) return
    await usePost('/notifications/read-all', {}, { headers: { 'no-error': true } })
    notificationList.value = notificationList.value.map(n => ({ ...n, read: true }))
  }

  async function login(accessToken?: string, accountProfile?: AccountProfile) {
    if (accessToken) setToken(accessToken)
    if (accountProfile) profile.value = accountProfile
    isLoggedIn.value = true
    // Wait a tick so cookie/Authorization is visible to subsequent $fetch calls
    await nextTick()
    await hydrateShop()
    void fetchProfile()
  }

  async function logout() {
    await logoutRemote()
    setToken(null)
    isLoggedIn.value = false
    cartLines.value = []
    wishlistProducts.value = []
    notificationList.value = []
    discountCode.value = null
    clearGuestCartStorage()
    profile.value = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      birth: '',
      gender: '',
    }
  }

  return {
    cartLines,
    cartBump,
    cartSubtotal,
    discountCode,
    discountAmount,
    wishlist,
    wishlistProducts,
    notificationList,
    isLoggedIn,
    cartCount,
    wishlistCount,
    notificationCount,
    shopPending,
    isInWishlist,
    toggleWishlist,
    getCartQty,
    getCartLineId,
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
    fetchCart,
    fetchWishlist,
    fetchNotifications,
    hydrateShop,
    ensureCartLoaded,
    requireAuth,
  }
}
