import {
  defaultSellerListings,
  defaultSellerOrders,
  defaultSellerPayouts,
  defaultSellerReviews,
  defaultSellerSales,
  defaultSellerShop,
  defaultSellerWallet,
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
import { getProductById, registerCatalogProduct, type Product } from '~/data/products'

export function useSeller() {
  const shop = useState<SellerShop>('seller-shop', () =>
    structuredClone(defaultSellerShop),
  )
  const listings = useState<SellerListing[]>('seller-listings', () =>
    structuredClone(defaultSellerListings),
  )
  const orders = useState<SellerOrder[]>('seller-orders', () =>
    structuredClone(defaultSellerOrders),
  )
  const reviews = useState<SellerReview[]>('seller-reviews', () =>
    structuredClone(defaultSellerReviews),
  )
  const payouts = useState<SellerPayout[]>('seller-payouts', () =>
    structuredClone(defaultSellerPayouts),
  )
  const sales = useState<SellerSalesPoint[]>('seller-sales', () =>
    structuredClone(defaultSellerSales),
  )
  const wallet = useState('seller-wallet', () =>
    structuredClone(defaultSellerWallet),
  )

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

  const listingProducts = computed(() =>
    listings.value.map(listing => ({
      ...listing,
      product: getProductById(listing.productId),
    })),
  )

  function getListing(productId: string) {
    return listings.value.find(item => item.productId === productId) ?? null
  }

  function setListingStatus(productId: string, status: SellerProductStatus) {
    listings.value = listings.value.map(item =>
      item.productId === productId ? { ...item, status } : item,
    )
  }

  function addListingProduct(product: Product, stock: number) {
    registerCatalogProduct(product)
    listings.value = [
      {
        productId: product.id,
        stock,
        sold: 0,
        views: 0,
        status: 'pending',
      },
      ...listings.value,
    ]
    return product.id
  }

  function getOrderById(id: string) {
    return orders.value.find(order => order.id === id) ?? null
  }

  function advanceOrder(id: string) {
    const order = orders.value.find(item => item.id === id)
    if (!order) return false
    const next = sellerOrderNextStatus[order.status]
    if (!next) return false
    setOrderStatus(id, next)
    return true
  }

  function revertOrder(id: string) {
    const order = orders.value.find(item => item.id === id)
    if (!order) return false
    const prev = sellerOrderPrevStatus[order.status]
    if (!prev) return false
    setOrderStatus(id, prev)
    return true
  }

  function setOrderStatus(id: string, status: SellerOrderStatus) {
    orders.value = orders.value.map(order =>
      order.id === id ? { ...order, status } : order,
    )
  }

  function replyToReview(id: string, reply: string) {
    reviews.value = reviews.value.map(review =>
      review.id === id ? { ...review, reply } : review,
    )
  }

  function requestPayout() {
    if (wallet.value.available <= 0) return false
    const amount = wallet.value.available
    payouts.value = [
      {
        id: `PO-${Date.now().toString().slice(-4)}`,
        date: new Intl.DateTimeFormat('fa-IR').format(new Date()),
        amount,
        status: 'pending',
      },
      ...payouts.value,
    ]
    wallet.value = {
      ...wallet.value,
      pending: wallet.value.pending + amount,
      available: 0,
    }
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
    shopInitial,
    activeListings,
    newOrdersCount,
    openOrdersCount,
    unansweredReviews,
    lowStockListings,
    listingProducts,
    getListing,
    setListingStatus,
    addListingProduct,
    getOrderById,
    advanceOrder,
    revertOrder,
    setOrderStatus,
    replyToReview,
    requestPayout,
  }
}
