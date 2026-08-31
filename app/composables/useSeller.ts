import {
  defaultSellerShop,
  sellerLowStockThreshold,
  sellerOrderNextStatus,
  sellerOrderPrevStatus,
  toSellerOrder,
  toSellerPayout,
  toSellerSalesPoint,
  type SellerListing,
  type SellerOrder,
  type SellerOrderStatus,
  type SellerPayout,
  type SellerProductStatus,
  type SellerReview,
  type SellerSalesPoint,
  type SellerShop,
} from '~/data/seller'
import type { Product } from '~/data/products'

const emptyShop = (): SellerShop => ({ ...defaultSellerShop })

export function useSeller() {
  const { fetchProduct, getCachedProduct, remember } = useProducts()
  const { applySite } = useSiteSettings()

  const shop = useState<SellerShop>('seller-shop', emptyShop)
  const listings = useState<SellerListing[]>('seller-listings', () => [])
  const orders = useState<SellerOrder[]>('seller-orders', () => [])
  const reviews = useState<SellerReview[]>('seller-reviews', () => [])
  const payouts = useState<SellerPayout[]>('seller-payouts', () => [])
  const sales = useState<SellerSalesPoint[]>('seller-sales', () => [])
  const loaded = useState('seller-loaded', () => false)
  const pending = useState('seller-pending', () => false)
  const inFlight = useState<Promise<void> | null>('seller-inflight', () => null)

  const shopInitial = computed(() => shop.value.name.trim().charAt(0) || 'ف')

  const activeListings = computed(() =>
    listings.value.filter(item => item.status === 'active'),
  )

  const newOrdersCount = computed(() =>
    orders.value.filter(order => order.status === 'new').length,
  )

  const openOrdersCount = computed(() =>
    orders.value.filter(
      order => order.status === 'new' || order.status === 'packing' || order.status === 'shipped',
    ).length,
  )

  const unansweredReviews = computed(() =>
    reviews.value.filter(review => !review.reply).length,
  )

  const lowStockListings = computed(() =>
    listings.value.filter(
      item => item.status !== 'inactive' && item.stock <= sellerLowStockThreshold,
    ),
  )

  const wallet = computed(() => {
    const monthSales = sales.value.reduce((sum, point) => sum + point.value, 0)
    const pendingAmount = payouts.value
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0)
    const paidAmount = payouts.value
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0)
    return {
      available: Math.max(0, monthSales - pendingAmount - paidAmount),
      pending: pendingAmount,
      monthSales,
    }
  })

  function resolveProduct(productId: string): Product {
    return getCachedProduct(productId) ?? {
      id: productId,
      title: productId,
      brand: '',
      category: '',
      categoryLabel: '',
      price: 0,
      rating: 0,
      reviews: 0,
      image: '',
      inStock: false,
      fastDelivery: false,
    }
  }

  const listingProducts = computed(() =>
    listings.value.map(listing => ({
      ...listing,
      product: resolveProduct(listing.productId),
    })),
  )

  type ListingApiItem = SellerListing & { product?: Product }

  function applyListings(items: ListingApiItem[]) {
    const products: Product[] = []
    listings.value = items.map((item) => {
      if (item.product) products.push(item.product)
      return {
        productId: item.productId,
        stock: item.stock,
        sold: item.sold,
        views: item.views,
        status: item.status,
      }
    })
    if (products.length) remember(products)
  }

  async function hydrateProducts(ids: string[]) {
    const unique = [...new Set(ids.filter(Boolean))]
    const missing = unique.filter(id => !getCachedProduct(id))
    await Promise.all(missing.map(id => fetchProduct(id)))
  }

  async function fetchListings(options?: { force?: boolean }) {
    if (listings.value.length && loaded.value && !options?.force) {
      return { ok: true as const, error: null as null }
    }

    const { result, error } = await useGet<ListingApiItem[]>('/seller/listings', {
      headers: { 'no-error': true },
    })
    if (error || !Array.isArray(result)) {
      return { ok: false as const, error: error ?? { message: 'listings-fetch-failed' } }
    }

    applyListings(result)
    await hydrateProducts(listings.value.map(l => l.productId))
    return { ok: true as const, error: null as null }
  }

  async function fetchSeller(options?: { force?: boolean }) {
    if (loaded.value && !options?.force) {
      return { ok: true as const, error: null as null }
    }
    if (inFlight.value) {
      await inFlight.value
      return { ok: loaded.value, error: loaded.value ? null : ({ message: 'seller-fetch-failed' } as const) }
    }

    pending.value = true
    let fetchError: unknown = null

    const run = (async () => {
      try {
        const [
          shopRes,
          listingsRes,
          ordersRes,
          reviewsRes,
          payoutsRes,
          salesRes,
        ] = await Promise.all([
          useGet<SellerShop>('/seller/shop', { headers: { 'no-error': true } }),
          useGet<ListingApiItem[]>('/seller/listings', { headers: { 'no-error': true } }),
          useGet<SellerOrder[]>('/seller/orders', { headers: { 'no-error': true } }),
          useGet<SellerReview[]>('/seller/reviews', { headers: { 'no-error': true } }),
          useGet<SellerPayout[]>('/seller/payouts', { headers: { 'no-error': true } }),
          useGet<SellerSalesPoint[]>('/seller/sales', { headers: { 'no-error': true } }),
        ])

        const shopOk = Boolean(shopRes.result)
        if (shopRes.result) {
          shop.value = { ...defaultSellerShop, ...shopRes.result }
          applySite(shop.value)
        }
        if (Array.isArray(listingsRes.result)) applyListings(listingsRes.result)
        if (Array.isArray(ordersRes.result)) {
          orders.value = ordersRes.result.map(o => toSellerOrder(o))
        }
        if (Array.isArray(reviewsRes.result)) reviews.value = reviewsRes.result
        if (Array.isArray(payoutsRes.result)) {
          payouts.value = payoutsRes.result.map(p => toSellerPayout(p))
        }
        if (Array.isArray(salesRes.result)) {
          sales.value = salesRes.result
            .map(point => toSellerSalesPoint(point))
            .filter((point): point is SellerSalesPoint => Boolean(point))
        }

        // Only mark loaded when auth-critical shop call succeeds so empty/failed runs can retry.
        if (shopOk) {
          loaded.value = true
          const productIds = [
            ...listings.value.map(l => l.productId),
            ...reviews.value.map(r => r.productId),
            ...orders.value.flatMap(o => o.items.map(i => i.productId)),
          ]
          await hydrateProducts(productIds)
        }
        else {
          fetchError = shopRes.error ?? listingsRes.error ?? ordersRes.error ?? { message: 'seller-fetch-failed' }
        }
      }
      finally {
        pending.value = false
        inFlight.value = null
      }
    })()

    inFlight.value = run
    await run
    return { ok: loaded.value, error: fetchError }
  }

  function getListing(productId: string) {
    return listings.value.find(item => item.productId === productId) ?? null
  }

  function upsertListing(item: ListingApiItem) {
    const listing: SellerListing = {
      productId: item.productId,
      stock: item.stock,
      sold: item.sold,
      views: item.views,
      status: item.status,
    }
    if (item.product) remember([item.product])
    const exists = listings.value.some(l => l.productId === listing.productId)
    listings.value = exists
      ? listings.value.map(l => (l.productId === listing.productId ? listing : l))
      : [listing, ...listings.value]
    return listing
  }

  /**
   * Load one listing (+ product) for /seller/products/:id.
   * Also refreshes orders/reviews when the panel has not been loaded yet.
   */
  async function fetchListing(productId: string, options?: { force?: boolean }) {
    const id = productId.trim()
    if (!id) return { ok: false as const, error: { message: 'missing-product-id' } }

    if (!options?.force && getListing(id) && getCachedProduct(id)) {
      return { ok: true as const, error: null as null }
    }

    const { result, error } = await useGet<ListingApiItem>(
      `/seller/listings/${encodeURIComponent(id)}`,
      { headers: { 'no-error': true } },
    )
    if (error || !result?.productId) {
      // Fallback: list endpoint + public product (deep-link resilience)
      await fetchListings({ force: options?.force })
      if (!getCachedProduct(id)) await fetchProduct(id)
      if (!getListing(id)) {
        return { ok: false as const, error: error ?? { message: 'listing-not-found' } }
      }
      return { ok: true as const, error: null as null }
    }

    upsertListing(result)
    if (!result.product) await fetchProduct(id)
    return { ok: true as const, error: null as null }
  }

  async function fetchProductPanel(productId: string) {
    const id = productId.trim()
    const listingRes = await fetchListing(id, { force: true })

    if (!loaded.value) {
      const [ordersRes, reviewsRes] = await Promise.all([
        useGet<SellerOrder[]>('/seller/orders', { headers: { 'no-error': true } }),
        useGet<SellerReview[]>('/seller/reviews', { headers: { 'no-error': true } }),
      ])
      if (Array.isArray(ordersRes.result)) {
        orders.value = ordersRes.result.map(o => toSellerOrder(o))
      }
      if (Array.isArray(reviewsRes.result)) reviews.value = reviewsRes.result
    }

    return listingRes
  }

  async function setListingStatus(productId: string, status: SellerProductStatus) {
    const { result, error } = await usePatch<{ listing: SellerListing, product?: Product } | SellerListing>(
      `/seller/listings/${encodeURIComponent(productId)}`,
      { status },
      { headers: { 'no-error': true } },
    )
    const listing = result && 'listing' in result && result.listing
      ? result.listing
      : (result && 'productId' in result ? result as SellerListing : null)
    const product = result && 'product' in result ? result.product : undefined

    if (!error && listing) {
      upsertListing({ ...listing, product })
      return true
    }
    // front-only fallback
    if (!getListing(productId)) return false
    listings.value = listings.value.map(item =>
      item.productId === productId ? { ...item, status } : item,
    )
    return true
  }

  async function updateListingProduct(
    productId: string,
    product: Product,
    stock: number,
    status?: SellerProductStatus,
  ) {
    const listing = getListing(productId)
    if (!listing) return false

    const nextStatus = status
      ?? (stock <= 0 && listing.status === 'active' ? 'out_of_stock' : listing.status)

    const { result, error } = await usePatch<{ listing: SellerListing, product: Product }>(
      `/seller/listings/${encodeURIComponent(productId)}`,
      {
        product: {
          ...product,
          id: productId,
        },
        stock,
        status: nextStatus,
      },
      { headers: { 'no-error': true } },
    )

    if (error || !result?.listing) {
      return false
    }

    remember([result.product ?? { ...product, id: productId }])
    upsertListing({ ...result.listing, product: result.product })
    return true
  }

  async function updateListingStock(productId: string, stock: number) {
    const listing = getListing(productId)
    if (!listing) return false
    const status: SellerProductStatus = stock <= 0
      ? (listing.status === 'inactive' ? 'inactive' : 'out_of_stock')
      : (listing.status === 'out_of_stock' ? 'active' : listing.status)
    return updateListingProduct(productId, resolveProduct(productId), stock, status)
  }

  async function addListingProduct(product: Product, stock: number, status: SellerProductStatus = 'pending') {
    const { result, error } = await usePost<{ listing: SellerListing, product: Product }>(
      '/seller/listings',
      {
        product: {
          id: product.id,
          title: product.title,
          shortName: product.shortName,
          brand: product.brand,
          category: product.category,
          categoryLabel: product.categoryLabel,
          price: product.price,
          oldPrice: product.oldPrice,
          image: product.image,
          imageDark: product.imageDark,
          gallery: product.gallery,
          colors: product.colors,
          shortDesc: product.shortDesc,
          specs: product.specs,
          badge: product.badge,
          inStock: product.inStock,
          fastDelivery: product.fastDelivery,
        },
        stock,
        status,
      },
      { headers: { 'no-error': true } },
    )
    if (error || !result) return null

    remember([result.product ?? product])
    const listing = result.listing ?? {
      productId: product.id,
      stock,
      sold: 0,
      views: 0,
      status,
    }
    listings.value = [listing, ...listings.value.filter(l => l.productId !== listing.productId)]
    return listing.productId
  }

  function upsertOrder(order: SellerOrder) {
    const index = orders.value.findIndex(item => item.id === order.id)
    if (index === -1) {
      orders.value = [order, ...orders.value]
      return
    }
    const copy = [...orders.value]
    copy[index] = order
    orders.value = copy
  }

  function getOrderById(id: string) {
    return orders.value.find(order => order.id === id) ?? null
  }

  async function fetchOrders(options?: { force?: boolean, sort?: string }) {
    if (orders.value.length && loaded.value && !options?.force) {
      return { ok: true as const, error: null as null }
    }

    pending.value = true
    try {
      const query = options?.sort ? `?sort=${encodeURIComponent(options.sort)}` : ''
      const { result, error } = await useGet<SellerOrder[]>(
        `/seller/orders${query}`,
        { headers: { 'no-error': true } },
      )
      if (error || !Array.isArray(result)) {
        return { ok: false as const, error: error ?? { message: 'orders-fetch-failed' } }
      }
      orders.value = result.map(o => toSellerOrder(o))
      await hydrateProducts(orders.value.flatMap(o => o.items.map(i => i.productId)))
      return { ok: true as const, error: null as null }
    }
    finally {
      pending.value = false
    }
  }

  async function fetchOrder(id: string, options?: { force?: boolean }) {
    const orderId = id.trim()
    if (!orderId) {
      return { ok: false as const, order: null as SellerOrder | null, error: { message: 'missing-order-id' } }
    }

    const cached = getOrderById(orderId)
    if (cached && !options?.force) {
      return { ok: true as const, order: cached, error: null as null }
    }

    const { result, error } = await useGet<SellerOrder>(
      `/seller/orders/${encodeURIComponent(orderId)}`,
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return {
        ok: false as const,
        order: null as SellerOrder | null,
        error: error ?? { message: 'order-not-found' },
      }
    }

    const order = toSellerOrder(result)
    upsertOrder(order)
    await hydrateProducts(order.items.map(i => i.productId))
    return { ok: true as const, order, error: null as null }
  }

  async function setOrderStatus(id: string, status: SellerOrderStatus) {
    const { result, error } = await usePatch<SellerOrder>(
      `/seller/orders/${encodeURIComponent(id)}/status`,
      { status },
      { headers: { 'no-error': true } },
    )
    if (error) return false
    if (result?.id) {
      upsertOrder(toSellerOrder(result))
      return true
    }
    const current = getOrderById(id)
    if (!current) return false
    upsertOrder({ ...current, status })
    return true
  }

  async function advanceOrder(id: string) {
    const order = orders.value.find(item => item.id === id)
    if (!order) return false
    const next = sellerOrderNextStatus[order.status]
    if (!next) return false
    return setOrderStatus(id, next)
  }

  async function revertOrder(id: string) {
    const order = orders.value.find(item => item.id === id)
    if (!order) return false
    const prev = sellerOrderPrevStatus[order.status]
    if (!prev) return false
    return setOrderStatus(id, prev)
  }

  async function replyToReview(id: string, reply: string) {
    const { result, error } = await usePost<SellerReview>(
      `/seller/reviews/${encodeURIComponent(id)}/reply`,
      { reply },
      { headers: { 'no-error': true } },
    )
    if (error) return false
    if (result) {
      reviews.value = reviews.value.map(review => (review.id === id ? result : review))
      return true
    }
    reviews.value = reviews.value.map(review =>
      review.id === id ? { ...review, reply } : review,
    )
    return true
  }

  async function fetchShop(options?: { force?: boolean }) {
    if (shop.value.name && loaded.value && !options?.force) {
      return { ok: true as const, error: null as null }
    }

    pending.value = true
    try {
      const { result, error } = await useGet<SellerShop>('/seller/shop', {
        headers: { 'no-error': true },
      })
      if (error || !result) {
        return { ok: false as const, error: error ?? { message: 'shop-fetch-failed' } }
      }
      shop.value = { ...defaultSellerShop, ...result }
      applySite(shop.value)
      return { ok: true as const, error: null as null }
    }
    finally {
      pending.value = false
    }
  }

  async function updateShop(payload: Partial<SellerShop>) {
    const body = {
      name: payload.name ?? shop.value.name,
      phone: payload.phone ?? shop.value.phone,
      email: payload.email ?? shop.value.email,
      city: payload.city ?? shop.value.city,
      about: payload.about ?? shop.value.about,
    }
    const { result, error } = await usePut<SellerShop>('/seller/shop', body, {
      headers: { 'no-error': true },
    })
    if (error || !result) return { result: null as SellerShop | null, error }
    shop.value = { ...defaultSellerShop, ...result }
    applySite(shop.value)
    // Keep footer state aligned after site identity sync
    try {
      const { fetchFooter } = useFooter()
      await fetchFooter({ force: true, admin: true })
    }
    catch {
      /* footer may be unused in this context */
    }
    return { result: shop.value, error: null as null }
  }

  async function fetchFinance(options?: { force?: boolean }) {
    if (
      !options?.force
      && loaded.value
      && (payouts.value.length > 0 || sales.value.length > 0)
    ) {
      return { ok: true as const, error: null as null }
    }

    pending.value = true
    try {
      const [payoutsRes, salesRes] = await Promise.all([
        useGet<SellerPayout[]>('/seller/payouts', { headers: { 'no-error': true } }),
        useGet<SellerSalesPoint[]>('/seller/sales', { headers: { 'no-error': true } }),
      ])

      const payoutsOk = Array.isArray(payoutsRes.result)
      const salesOk = Array.isArray(salesRes.result)

      if (payoutsOk) {
        payouts.value = payoutsRes.result!.map(p => toSellerPayout(p))
      }
      if (salesOk) {
        sales.value = salesRes.result!
          .map(point => toSellerSalesPoint(point))
          .filter((point): point is SellerSalesPoint => Boolean(point))
      }

      if (!payoutsOk && !salesOk) {
        return {
          ok: false as const,
          error: payoutsRes.error ?? salesRes.error ?? { message: 'finance-fetch-failed' },
        }
      }

      return { ok: true as const, error: null as null }
    }
    finally {
      pending.value = false
    }
  }

  async function requestPayout() {
    if (wallet.value.available <= 0) {
      return { ok: false as const, error: 'موجودی قابل برداشت ندارید' }
    }
    const { result, error } = await usePost<SellerPayout>(
      '/seller/payouts',
      { amount: wallet.value.available },
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      const message
        = error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
          || error?.data?.message
          || 'ثبت درخواست تسویه ناموفق بود'
      return { ok: false as const, error: message }
    }
    payouts.value = [toSellerPayout(result), ...payouts.value.filter(p => p.id !== result.id)]
    return { ok: true as const, payout: toSellerPayout(result) }
  }

  return {
    shop,
    listings,
    orders,
    reviews,
    payouts,
    sales,
    wallet,
    loaded,
    pending,
    shopInitial,
    activeListings,
    newOrdersCount,
    openOrdersCount,
    unansweredReviews,
    lowStockListings,
    listingProducts,
    resolveProduct,
    getListing,
    fetchListing,
    fetchProductPanel,
    setListingStatus,
    updateListingProduct,
    updateListingStock,
    addListingProduct,
    getOrderById,
    fetchOrders,
    fetchOrder,
    advanceOrder,
    revertOrder,
    setOrderStatus,
    replyToReview,
    updateShop,
    fetchShop,
    requestPayout,
    fetchFinance,
    fetchSeller,
    fetchListings,
  }
}
