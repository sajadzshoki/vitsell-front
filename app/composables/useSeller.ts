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

function listingApiError(error: unknown, fallback: string) {
  if (!error || typeof error !== 'object') return fallback
  const data = 'data' in error
    ? (error as { data?: { errors?: Array<{ message?: string }>, message?: string } }).data
    : undefined
  const fromFields = data?.errors?.map(e => e.message).filter(Boolean).join(' ، ')
  if (fromFields) return fromFields
  if (data?.message) return data.message
  if ('message' in error && typeof (error as { message?: unknown }).message === 'string') {
    return (error as { message: string }).message
  }
  return fallback
}

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

  type ListingApiItem = SellerListing & {
    product?: Product & {
      featured?: boolean
      published?: boolean
      hasVariants?: boolean
      sku?: string | null
      lowStockThreshold?: number
    }
    createdAt?: string | null
    updatedAt?: string | null
  }

  type SellerListingsQuery = {
    q?: string
    status?: string
    category?: string
    brand?: string
    stock?: string
    priceMin?: string | number
    priceMax?: string | number
    dateFrom?: string
    dateTo?: string
    hasDiscount?: boolean | string | number
    hasVariants?: boolean | string | number
    featured?: boolean | string | number
    published?: boolean | string | number
    sort?: string
    page?: number | string
    pageSize?: number | string
    all?: boolean | string | number
  }

  type SellerListingsPage = {
    items: ListingApiItem[]
    total: number
    page: number
    pageSize: number
    statusCounts: Record<string, number>
  }

  const listingsMeta = useState<Omit<SellerListingsPage, 'items'>>('seller-listings-meta', () => ({
    total: 0,
    page: 1,
    pageSize: 10,
    statusCounts: {
      all: 0,
      active: 0,
      pending: 0,
      inactive: 0,
      out_of_stock: 0,
    },
  }))

  type SellerOrdersQuery = {
    q?: string
    status?: string
    payment?: string
    shipping?: string
    paymentMethod?: string
    amountMin?: string | number
    amountMax?: string | number
    dateFrom?: string
    dateTo?: string
    hasDiscount?: boolean | string | number
    hasRefund?: boolean | string | number
    hasReturn?: boolean | string | number
    needsTracking?: boolean | string | number
    sort?: string
    page?: number | string
    pageSize?: number | string
    all?: boolean | string | number
  }

  type SellerOrdersPage = {
    items: SellerOrder[]
    total: number
    page: number
    pageSize: number
    statusCounts: Record<string, number>
    paymentMethodOptions: string[]
  }

  const ordersMeta = useState<Omit<SellerOrdersPage, 'items'>>('seller-orders-meta', () => ({
    total: 0,
    page: 1,
    pageSize: 10,
    statusCounts: {
      all: 0,
      new: 0,
      packing: 0,
      shipped: 0,
      delivered: 0,
      returned: 0,
      cancelled: 0,
    },
    paymentMethodOptions: [] as string[],
  }))

  /** Unfiltered status counts for sidebar / dashboard badges */
  const ordersBadgeCounts = useState<Record<string, number>>('seller-orders-badge-counts', () => ({
    all: 0,
    new: 0,
    packing: 0,
    shipped: 0,
    delivered: 0,
    returned: 0,
    cancelled: 0,
  }))

  function isOrdersBadgeSafeQuery(query: Record<string, string | number | boolean>) {
    return !Object.keys(query).some(key =>
      !['page', 'pageSize', 'sort', 'all', 'status'].includes(key),
    )
  }

  function normalizeOrdersPage(result: unknown): SellerOrdersPage {
    if (Array.isArray(result)) {
      const items = result.map(o => toSellerOrder(o))
      const statusCounts: Record<string, number> = {
        all: items.length,
        new: 0,
        packing: 0,
        shipped: 0,
        delivered: 0,
        returned: 0,
        cancelled: 0,
      }
      for (const order of items) {
        statusCounts[order.status] = (statusCounts[order.status] || 0) + 1
      }
      const paymentMethodOptions = [...new Set(items.map(o => o.paymentMethod).filter(Boolean))]
      return {
        items,
        total: items.length,
        page: 1,
        pageSize: items.length,
        statusCounts,
        paymentMethodOptions,
      }
    }
    const page = (result || {}) as Partial<SellerOrdersPage>
    const items = Array.isArray(page.items) ? page.items.map(o => toSellerOrder(o)) : []
    return {
      items,
      total: Number(page.total) || items.length,
      page: Number(page.page) || 1,
      pageSize: Number(page.pageSize) || items.length || 10,
      statusCounts: {
        all: Number(page.statusCounts?.all) || items.length,
        new: Number(page.statusCounts?.new) || 0,
        packing: Number(page.statusCounts?.packing) || 0,
        shipped: Number(page.statusCounts?.shipped) || 0,
        delivered: Number(page.statusCounts?.delivered) || 0,
        returned: Number(page.statusCounts?.returned) || 0,
        cancelled: Number(page.statusCounts?.cancelled) || 0,
      },
      paymentMethodOptions: Array.isArray(page.paymentMethodOptions)
        ? page.paymentMethodOptions.map(String)
        : [],
    }
  }

  function buildOrdersQuery(input?: SellerOrdersQuery) {
    const query: Record<string, string | number | boolean> = {}
    if (!input) return query
    if (input.q?.trim()) query.q = input.q.trim()
    if (input.status && input.status !== 'all') query.status = input.status
    if (input.payment && input.payment !== 'all') query.payment = input.payment
    if (input.shipping && input.shipping !== 'all') query.shipping = input.shipping
    if (input.paymentMethod && input.paymentMethod !== 'all') query.paymentMethod = input.paymentMethod
    if (input.amountMin != null && input.amountMin !== '') query.amountMin = Number(input.amountMin)
    if (input.amountMax != null && input.amountMax !== '') query.amountMax = Number(input.amountMax)
    if (input.dateFrom?.trim()) query.dateFrom = input.dateFrom.trim().slice(0, 10)
    if (input.dateTo?.trim()) query.dateTo = input.dateTo.trim().slice(0, 10)
    if (input.hasDiscount === true || input.hasDiscount === 'true' || input.hasDiscount === 1) {
      query.hasDiscount = true
    }
    if (input.hasRefund === true || input.hasRefund === 'true' || input.hasRefund === 1) {
      query.hasRefund = true
    }
    if (input.hasReturn === true || input.hasReturn === 'true' || input.hasReturn === 1) {
      query.hasReturn = true
    }
    if (input.needsTracking === true || input.needsTracking === 'true' || input.needsTracking === 1) {
      query.needsTracking = true
    }
    if (input.sort) query.sort = String(input.sort)
    if (input.all === true || input.all === 'true' || input.all === 1) {
      query.all = true
      query.pageSize = Number(input.pageSize) || 500
    }
    else {
      if (input.page != null && input.page !== '') query.page = Number(input.page)
      if (input.pageSize != null && input.pageSize !== '') query.pageSize = Number(input.pageSize)
    }
    return query
  }

  function normalizeListingsResponse(result: unknown): SellerListingsPage {
    if (Array.isArray(result)) {
      return {
        items: result as ListingApiItem[],
        total: result.length,
        page: 1,
        pageSize: result.length,
        statusCounts: {
          all: result.length,
          active: 0,
          pending: 0,
          inactive: 0,
          out_of_stock: 0,
        },
      }
    }
    const page = (result || {}) as Partial<SellerListingsPage>
    return {
      items: Array.isArray(page.items) ? page.items : [],
      total: Number(page.total) || 0,
      page: Number(page.page) || 1,
      pageSize: Number(page.pageSize) || 10,
      statusCounts: {
        all: Number(page.statusCounts?.all) || 0,
        active: Number(page.statusCounts?.active) || 0,
        pending: Number(page.statusCounts?.pending) || 0,
        inactive: Number(page.statusCounts?.inactive) || 0,
        out_of_stock: Number(page.statusCounts?.out_of_stock) || 0,
      },
    }
  }

  function buildListingsQuery(input?: SellerListingsQuery) {
    const booleanKeys = new Set([
      'hasDiscount',
      'hasVariants',
      'featured',
      'published',
      'all',
    ])
    const params: Record<string, string | number | boolean> = {}
    if (!input) {
      params.all = true
      params.pageSize = 500
      return params
    }
    for (const [key, value] of Object.entries(input)) {
      if (value == null || value === '' || value === 'all' || value === false) continue
      if (booleanKeys.has(key)) {
        if (value === true || value === 1 || value === '1') params[key] = true
        continue
      }
      if (key === 'page' || key === 'pageSize' || key === 'priceMin' || key === 'priceMax') {
        const n = Number(value)
        if (Number.isFinite(n)) params[key] = n
        continue
      }
      params[key] = value as string | number | boolean
    }
    if (!params.pageSize && !params.all) params.pageSize = 10
    return params
  }

  function syncCommerceFromListing(item: ListingApiItem) {
    if (!item.product) return
    const { saveCommerce } = useSellerProductCommerce()
    const patch: Record<string, unknown> = {
      featured: Boolean(item.product.featured),
      published: item.product.published !== false,
      sku: item.product.sku || '',
      lowStockThreshold: Number(item.product.lowStockThreshold) || sellerLowStockThreshold,
    }
    if (!item.product.hasVariants) {
      patch.variants = []
    }
    saveCommerce(item.productId, patch as any)
  }

  function normalizeShop(raw: Partial<SellerShop> | null | undefined): SellerShop {
    return {
      name: raw?.name ?? '',
      slug: raw?.slug ?? '',
      phone: raw?.phone ?? '',
      email: raw?.email ?? '',
      city: raw?.city ?? '',
      about: raw?.about ?? '',
      rating: Number(raw?.rating) || 0,
      reviewCount: Number(raw?.reviewCount) || 0,
      joinDate: raw?.joinDate ?? '',
    }
  }

  function normalizeSales(items: SellerSalesPoint[]): SellerSalesPoint[] {
    return items.map(point => ({
      label: point?.label ?? '',
      value: Number(point?.value) || 0,
    }))
  }

  function normalizeOrders(items: SellerOrder[]): SellerOrder[] {
    return items.map(order => ({
      ...order,
      city: order.city ?? '',
      shippingMethod: order.shippingMethod ?? '',
      paymentMethod: order.paymentMethod ?? '',
      customerName: order.customerName ?? '',
      status: order.status,
      address: {
        province: order.address?.province ?? '',
        city: order.address?.city ?? '',
        address: order.address?.address ?? '',
        postalCode: order.address?.postalCode ?? '',
      },
      items: Array.isArray(order.items) ? order.items : [],
    }))
  }

  function applyListings(items: ListingApiItem[]) {
    const products: Product[] = []
    listings.value = items.map((item) => {
      if (item.product) {
        products.push(item.product)
        syncCommerceFromListing(item)
      }
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

  async function fetchListings(options?: {
    force?: boolean
    query?: SellerListingsQuery
  }) {
    const query = buildListingsQuery(options?.query)
    const isPaged = !query.all

    if (
      !isPaged
      && listings.value.length
      && loaded.value
      && !options?.force
      && !options?.query
    ) {
      return {
        ok: true as const,
        error: null as null,
        meta: listingsMeta.value,
      }
    }

    const { result, error } = await useGet<SellerListingsPage | ListingApiItem[]>(
      '/seller/listings',
      {
        headers: { 'no-error': true },
        query,
      },
    )
    if (error || result == null) {
      return {
        ok: false as const,
        error: error ?? { message: 'listings-fetch-failed' },
        meta: listingsMeta.value,
      }
    }

    const page = normalizeListingsResponse(result)
    applyListings(page.items)
    listingsMeta.value = {
      total: page.total,
      page: page.page,
      pageSize: page.pageSize,
      statusCounts: page.statusCounts,
    }
    await hydrateProducts(listings.value.map(l => l.productId))
    return { ok: true as const, error: null as null, meta: listingsMeta.value }
  }

  /** Fetch matching listings for export without replacing the paged UI list. */
  async function fetchListingsExport(query?: SellerListingsQuery) {
    const params = buildListingsQuery({
      ...query,
      all: true,
      pageSize: 500,
      page: undefined,
    })
    const { result, error } = await useGet<SellerListingsPage | ListingApiItem[]>(
      '/seller/listings',
      {
        headers: { 'no-error': true },
        query: params,
      },
    )
    if (error || result == null) {
      return {
        ok: false as const,
        error: error ?? { message: 'listings-export-failed' },
        items: [] as ListingApiItem[],
      }
    }
    const page = normalizeListingsResponse(result)
    const products = page.items
      .map(item => item.product)
      .filter((p): p is NonNullable<typeof p> => Boolean(p))
    if (products.length) remember(products)
    await hydrateProducts(page.items.map(i => i.productId))
    return { ok: true as const, error: null as null, items: page.items }
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
          useGet<SellerListingsPage | ListingApiItem[]>('/seller/listings', {
            headers: { 'no-error': true },
            query: { all: true, pageSize: 500 },
          }),
          useGet<SellerOrdersPage | SellerOrder[]>('/seller/orders', {
            headers: { 'no-error': true },
            query: { all: true, pageSize: 500 },
          }),
          useGet<SellerReviewsPage | SellerReview[]>('/seller/reviews', {
            headers: { 'no-error': true },
            query: { all: true, pageSize: 200 },
          }),
          useGet<SellerPayout[]>('/seller/payouts', { headers: { 'no-error': true } }),
          useGet<SellerSalesPoint[]>('/seller/sales', { headers: { 'no-error': true } }),
        ])

        const shopOk = Boolean(shopRes.result)
        if (shopRes.result) {
          shop.value = { ...defaultSellerShop, ...shopRes.result }
          applySite(shop.value)
        }
        if (Array.isArray(listingsRes.result) || (listingsRes.result as any)?.items) {
          const page = normalizeListingsResponse(listingsRes.result)
          applyListings(page.items)
          listingsMeta.value = {
            total: page.total,
            page: page.page,
            pageSize: page.pageSize,
            statusCounts: page.statusCounts,
          }
        }
        if (Array.isArray(ordersRes.result) || (ordersRes.result as any)?.items) {
          const page = normalizeOrdersPage(ordersRes.result)
          orders.value = page.items
          ordersMeta.value = {
            total: page.total,
            page: page.page,
            pageSize: page.pageSize,
            statusCounts: page.statusCounts,
            paymentMethodOptions: page.paymentMethodOptions,
          }
        }
        if (Array.isArray(reviewsRes.result)) reviews.value = reviewsRes.result
        else if (Array.isArray((reviewsRes.result as any)?.items)) {
          reviews.value = (reviewsRes.result as any).items
        }
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
        useGet<SellerOrdersPage | SellerOrder[]>('/seller/orders', {
          headers: { 'no-error': true },
          query: { all: true, pageSize: 500 },
        }),
        useGet<SellerReview[] | { items: SellerReview[] }>('/seller/reviews', {
          headers: { 'no-error': true },
          query: { all: true, pageSize: 200 },
        }),
      ])
      if (Array.isArray(ordersRes.result) || (ordersRes.result as any)?.items) {
        const page = normalizeOrdersPage(ordersRes.result)
        orders.value = page.items
        ordersMeta.value = {
          total: page.total,
          page: page.page,
          pageSize: page.pageSize,
          statusCounts: page.statusCounts,
          paymentMethodOptions: page.paymentMethodOptions,
        }
      }
      if (Array.isArray(reviewsRes.result)) reviews.value = reviewsRes.result
      else if (Array.isArray((reviewsRes.result as any)?.items)) {
        reviews.value = (reviewsRes.result as any).items
      }
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

  async function deleteListing(productId: string) {
    const id = String(productId || '').trim()
    if (!id) {
      return { ok: false as const, error: 'شناسه محصول نامعتبر است' }
    }

    const { error } = await useDelete(`/seller/listings/${encodeURIComponent(id)}`, {
      headers: { 'no-error': true },
    })
    if (error) {
      const message
        = error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
          || error?.data?.message
          || error?.message
          || 'حذف محصول ناموفق بود'
      return { ok: false as const, error: message }
    }

    listings.value = listings.value.filter(item => item.productId !== id)
    if (listingsMeta.value.total > 0) {
      listingsMeta.value = {
        ...listingsMeta.value,
        total: Math.max(0, listingsMeta.value.total - 1),
      }
    }
    return { ok: true as const, error: null as null }
  }

  type ListingProductExtras = {
    featured?: boolean
    published?: boolean
    hasVariants?: boolean
    sku?: string | null
    lowStockThreshold?: number
  }

  function buildListingProductPayload(
    product: Product,
    productId: string | undefined,
    extras?: ListingProductExtras,
  ) {
    return {
      id: productId || product.id,
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
      description: product.description,
      features: product.features,
      specs: product.specs,
      badge: product.badge,
      inStock: product.inStock,
      fastDelivery: product.fastDelivery,
      featured: extras?.featured,
      published: extras?.published,
      hasVariants: extras?.hasVariants,
      sku: extras?.sku,
      lowStockThreshold: extras?.lowStockThreshold,
    }
  }

  async function updateListingProduct(
    productId: string,
    product: Product,
    stock: number,
    status?: SellerProductStatus,
    extras?: ListingProductExtras,
  ): Promise<{ ok: true } | { ok: false, error: string }> {
    const listing = getListing(productId)
    if (!listing) {
      return { ok: false, error: 'محصول یافت نشد' }
    }

    const nextStatus = status
      ?? (stock <= 0 && listing.status === 'active' ? 'out_of_stock' : listing.status)

    const { result, error } = await usePatch<{ listing: SellerListing, product: Product }>(
      `/seller/listings/${encodeURIComponent(productId)}`,
      {
        product: buildListingProductPayload(product, productId, extras),
        stock,
        status: nextStatus,
      },
      { headers: { 'no-error': true } },
    )

    if (error || !result?.listing) {
      return {
        ok: false,
        error: listingApiError(error, 'ذخیره محصول ناموفق بود'),
      }
    }

    remember([result.product ?? { ...product, id: productId }])
    upsertListing({ ...result.listing, product: result.product })
    return { ok: true }
  }

  async function updateListingStock(productId: string, stock: number) {
    const listing = getListing(productId)
    if (!listing) return false
    const status: SellerProductStatus = stock <= 0
      ? (listing.status === 'inactive' ? 'inactive' : 'out_of_stock')
      : (listing.status === 'out_of_stock' ? 'active' : listing.status)
    const result = await updateListingProduct(productId, resolveProduct(productId), stock, status)
    return result.ok
  }

  async function addListingProduct(
    product: Product,
    stock: number,
    status: SellerProductStatus = 'pending',
    extras?: ListingProductExtras,
  ): Promise<{ ok: true, productId: string } | { ok: false, error: string }> {
    const { result, error } = await usePost<{ listing: SellerListing, product: Product }>(
      '/seller/listings',
      {
        product: buildListingProductPayload(product, product.id, extras),
        stock,
        status,
      },
      { headers: { 'no-error': true } },
    )
    if (error || !result) {
      return {
        ok: false,
        error: listingApiError(error, 'ثبت محصول ناموفق بود'),
      }
    }

    remember([result.product ?? product])
    const listing = result.listing ?? {
      productId: product.id,
      stock,
      sold: 0,
      views: 0,
      status,
    }
    listings.value = [listing, ...listings.value.filter(l => l.productId !== listing.productId)]
    if (result.product) {
      syncCommerceFromListing({ ...listing, product: result.product as ListingApiItem['product'] })
    }
    return { ok: true, productId: listing.productId }
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

  async function fetchOrders(options?: {
    force?: boolean
    query?: SellerOrdersQuery
  }) {
    const query = buildOrdersQuery(options?.query)
    const isPaged = !query.all

    if (
      !isPaged
      && orders.value.length
      && loaded.value
      && !options?.force
      && !options?.query
    ) {
      return { ok: true as const, error: null as null, meta: ordersMeta.value }
    }

    pending.value = true
    try {
      const { result, error } = await useGet<SellerOrdersPage | SellerOrder[]>(
        '/seller/orders',
        { headers: { 'no-error': true }, query },
      )
      if (error || result == null) {
        return {
          ok: false as const,
          error: error ?? { message: 'orders-fetch-failed' },
          meta: ordersMeta.value,
        }
      }
      const page = normalizeOrdersPage(result)
      orders.value = page.items
      ordersMeta.value = {
        total: page.total,
        page: page.page,
        pageSize: page.pageSize,
        statusCounts: page.statusCounts,
        paymentMethodOptions: page.paymentMethodOptions,
      }
      const rawItems = Array.isArray(result)
        ? result
        : (Array.isArray((result as any)?.items) ? (result as any).items : [])
      if (rawItems.length) {
        const { saveCommerce } = useSellerOrderCommerce()
        for (const raw of rawItems) {
          if (!raw?.id) continue
          if (raw.commerce && typeof raw.commerce === 'object') {
            saveCommerce(String(raw.id), {
              ...raw.commerce,
              refunds: Array.isArray(raw.commerce.refunds) ? raw.commerce.refunds : [],
            })
            continue
          }
          if (raw.trackingCode != null || raw.carrier != null || raw.estimatedDelivery != null) {
            saveCommerce(String(raw.id), {
              trackingCode: String(raw.trackingCode ?? ''),
              carrier: String(raw.carrier ?? ''),
              estimatedDelivery: String(raw.estimatedDelivery ?? ''),
              refundedAmount: Number(raw.refundedAmount) || 0,
            })
          }
        }
      }
      await hydrateProducts(orders.value.flatMap(o => o.items.map(i => i.productId)))
      return { ok: true as const, error: null as null, meta: ordersMeta.value }
    }
    finally {
      pending.value = false
    }
  }

  async function fetchOrdersExport(query?: SellerOrdersQuery) {
    const { result, error } = await useGet<SellerOrdersPage | SellerOrder[]>(
      '/seller/orders',
      {
        headers: { 'no-error': true },
        query: buildOrdersQuery({ ...query, all: true, pageSize: 500 }),
      },
    )
    if (error || result == null) {
      return { ok: false as const, items: [] as SellerOrder[], error: error ?? { message: 'orders-export-failed' } }
    }
    const page = normalizeOrdersPage(result)
    return { ok: true as const, items: page.items, error: null as null }
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

    const { result, error } = await useGet<any>(
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
    if (result.commerce) {
      const { saveCommerce } = useSellerOrderCommerce()
      saveCommerce(order.id, {
        ...result.commerce,
        refunds: Array.isArray(result.commerce.refunds) ? result.commerce.refunds : [],
      })
    }
    await hydrateProducts(order.items.map(i => i.productId))
    return {
      ok: true as const,
      order,
      error: null as null,
      detail: result as Record<string, unknown>,
    }
  }

  async function updateOrderTracking(
    id: string,
    payload: { trackingCode?: string, carrier?: string, estimatedDelivery?: string },
  ) {
    const { result, error } = await usePatch<any>(
      `/seller/orders/${encodeURIComponent(id)}/tracking`,
      payload,
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return { ok: false as const, error: error ?? { message: 'tracking-failed' } }
    }
    const order = toSellerOrder(result)
    upsertOrder(order)
    if (result.commerce) {
      const { saveCommerce } = useSellerOrderCommerce()
      saveCommerce(order.id, result.commerce)
    }
    return { ok: true as const, order, detail: result }
  }

  async function addOrderNote(id: string, text: string, author?: string) {
    const { result, error } = await usePost<any>(
      `/seller/orders/${encodeURIComponent(id)}/notes`,
      { text, author },
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return { ok: false as const, error: error ?? { message: 'note-failed' } }
    }
    const order = toSellerOrder(result)
    upsertOrder(order)
    if (result.commerce) {
      const { saveCommerce } = useSellerOrderCommerce()
      saveCommerce(order.id, result.commerce)
    }
    return { ok: true as const, order, detail: result }
  }

  async function createOrderRefund(
    id: string,
    payload: { amount: number, reason?: string, transactionId?: string, status?: string },
  ) {
    const { result, error } = await usePost<any>(
      `/seller/orders/${encodeURIComponent(id)}/refunds`,
      payload,
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return {
        ok: false as const,
        error: error ?? { message: 'refund-failed' },
        message:
          error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
          || error?.data?.message
          || 'بازپرداخت ناموفق بود',
      }
    }
    const order = toSellerOrder(result)
    upsertOrder(order)
    if (result.commerce) {
      const { saveCommerce } = useSellerOrderCommerce()
      saveCommerce(order.id, result.commerce)
    }
    return { ok: true as const, order, detail: result }
  }

  async function setOrderStatus(id: string, status: SellerOrderStatus) {
    const { result, error } = await usePatch<any>(
      `/seller/orders/${encodeURIComponent(id)}/status`,
      { status },
      { headers: { 'no-error': true } },
    )
    if (error) return false
    if (result?.id) {
      upsertOrder(toSellerOrder(result))
      if (result.commerce) {
        const { saveCommerce } = useSellerOrderCommerce()
        saveCommerce(result.id, result.commerce)
      }
      return true
    }
    const current = getOrderById(id)
    if (!current) return false
    upsertOrder({ ...current, status })
    return true
  }

  async function deleteOrder(id: string) {
    const { error } = await useDelete(`/seller/orders/${encodeURIComponent(id)}`, {
      headers: { 'no-error': true },
    })
    if (error) {
      return {
        ok: false as const,
        error:
          error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
          || error?.data?.message
          || error?.message
          || 'حذف سفارش ناموفق بود',
      }
    }
    orders.value = orders.value.filter(o => o.id !== id)
    ordersMeta.value = {
      ...ordersMeta.value,
      total: Math.max(0, (ordersMeta.value.total || 0) - 1),
    }
    return { ok: true as const }
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
    listingsMeta,
    ordersMeta,
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
    deleteListing,
    updateListingProduct,
    updateListingStock,
    addListingProduct,
    getOrderById,
    fetchOrders,
    fetchOrdersExport,
    fetchOrder,
    updateOrderTracking,
    addOrderNote,
    createOrderRefund,
    advanceOrder,
    revertOrder,
    setOrderStatus,
    deleteOrder,
    replyToReview,
    updateShop,
    fetchShop,
    requestPayout,
    fetchFinance,
    fetchSeller,
    fetchListings,
    fetchListingsExport,
  }
}
