import {
  sellerLowStockThreshold,
  sellerOrderNextStatus,
  sellerOrderPrevStatus,
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

const emptyShop = (): SellerShop => ({
  name: '',
  slug: '',
  phone: '',
  email: '',
  city: '',
  about: '',
  rating: 0,
  reviewCount: 0,
  joinDate: '',
})

export function useSeller() {
  const { fetchProduct, getCachedProduct, remember } = useProducts()

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
        if (shopRes.result) shop.value = shopRes.result
        if (Array.isArray(listingsRes.result)) applyListings(listingsRes.result)
        if (Array.isArray(ordersRes.result)) orders.value = ordersRes.result
        if (Array.isArray(reviewsRes.result)) reviews.value = reviewsRes.result
        if (Array.isArray(payoutsRes.result)) payouts.value = payoutsRes.result
        if (Array.isArray(salesRes.result)) sales.value = salesRes.result

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

  async function setListingStatus(productId: string, status: SellerProductStatus) {
    const { result, error } = await usePatch<SellerListing>(
      `/seller/listings/${encodeURIComponent(productId)}`,
      { status },
      { headers: { 'no-error': true } },
    )
    if (!error && result) {
      listings.value = listings.value.map(item =>
        item.productId === productId ? { ...item, ...result } : item,
      )
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

    const nextProduct = { ...product, id: productId }
    remember([(!error && result?.product) ? result.product : nextProduct])

    const nextListing: SellerListing = (!error && result?.listing)
      ? result.listing
      : {
          ...listing,
          stock,
          status: nextStatus,
        }

    listings.value = listings.value.map(item =>
      item.productId === productId ? nextListing : item,
    )
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

  function getOrderById(id: string) {
    return orders.value.find(order => order.id === id) ?? null
  }

  async function setOrderStatus(id: string, status: SellerOrderStatus) {
    const { result, error } = await usePatch<SellerOrder>(
      `/seller/orders/${encodeURIComponent(id)}/status`,
      { status },
      { headers: { 'no-error': true } },
    )
    if (error) return false
    if (result) {
      orders.value = orders.value.map(order => (order.id === id ? result : order))
      return true
    }
    orders.value = orders.value.map(order =>
      order.id === id ? { ...order, status } : order,
    )
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
    shop.value = result
    return { result, error: null as null }
  }

  async function requestPayout() {
    if (wallet.value.available <= 0) return false
    const { result, error } = await usePost<SellerPayout>(
      '/seller/payouts',
      { amount: wallet.value.available },
      { headers: { 'no-error': true } },
    )
    if (error || !result) return false
    payouts.value = [result, ...payouts.value]
    return true
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
    setListingStatus,
    updateListingProduct,
    updateListingStock,
    addListingProduct,
    getOrderById,
    advanceOrder,
    revertOrder,
    setOrderStatus,
    replyToReview,
    updateShop,
    requestPayout,
    fetchSeller,
    fetchListings,
  }
}
