import { formatPrice } from '~/data/products'
import {
  sellerDashboardQuickActions,
  type SellerDashboardAlert,
  type SellerDashboardKpi,
  type SellerDashboardNamedValue,
  type SellerDashboardRangeId,
  type SellerDashboardSeriesPoint,
} from '~/data/seller-dashboard'
import type { SellerPermission } from '~/data/seller-permissions'

export function useSellerDashboard() {
  const {
    orders,
    listings,
    sales,
    wallet,
    payouts,
    newOrdersCount,
    unansweredReviews,
    lowStockListings,
    resolveProduct,
  } = useSeller()
  const { unansweredCount: unansweredQuestions, ensureLoaded: ensureQuestions } = useSellerQuestions()
  const { pendingCount: pendingReturns, ensureLoaded: ensureReturns } = useSellerReturns()
  const { pendingCount: pendingRefunds, ensureLoaded: ensureRefunds } = useSellerRefunds()
  const { banners, ensureLoaded: ensureBanners } = useSellerBanners()
  const { deals, ensureLoaded: ensureDeals } = useSellerDeals()
  const { codes, ensureLoaded: ensurePromos } = useSellerPromotions()
  const { recent: recentAudit, ensureLoaded: ensureAudit } = useSellerAudit()
  const { can } = useSellerPermissions()

  const range = useState<SellerDashboardRangeId>('seller-dashboard-range', () => 'last_7')

  function hydrateSideData() {
    void ensureQuestions()
    void ensureReturns()
    void ensureRefunds()
    ensureBanners()
    void ensureDeals()
    void ensurePromos()
    void ensureAudit()
  }

  const orderStatusCounts = computed(() => {
    const counts: Record<string, number> = {
      new: 0,
      packing: 0,
      shipped: 0,
      delivered: 0,
      returned: 0,
      cancelled: 0,
    }
    for (const order of orders.value) {
      counts[order.status] = (counts[order.status] || 0) + 1
    }
    return counts
  })

  const productStatusCounts = computed(() => {
    const counts = {
      total: listings.value.length,
      active: 0,
      inactive: 0,
      out_of_stock: 0,
    }
    for (const item of listings.value) {
      if (item.status === 'active') counts.active += 1
      else if (item.status === 'inactive') counts.inactive += 1
      else if (item.status === 'out_of_stock') counts.out_of_stock += 1
    }
    return counts
  })

  const totalStock = computed(() =>
    listings.value.reduce((sum, item) => sum + Math.max(0, item.stock), 0),
  )

  const inventoryValue = computed(() =>
    listings.value.reduce((sum, item) => {
      const product = resolveProduct(item.productId)
      return sum + item.stock * (product.price || 0)
    }, 0),
  )

  const weekSalesTotal = computed(() =>
    sales.value.reduce((sum, point) => sum + point.value, 0),
  )

  const todaySales = computed(() => {
    if (!sales.value.length) return 0
    return sales.value[sales.value.length - 1]?.value ?? 0
  })

  const previousPeriodSales = computed(() => {
    if (sales.value.length < 2) return weekSalesTotal.value * 0.85
    const half = Math.floor(sales.value.length / 2)
    return sales.value.slice(0, half).reduce((s, p) => s + p.value, 0)
  })

  const salesDelta = computed(() => {
    const prev = previousPeriodSales.value || 1
    const current = weekSalesTotal.value
    return Math.round(((current - prev) / prev) * 100)
  })

  const averageOrderValue = computed(() => {
    if (!orders.value.length) return 0
    const total = orders.value.reduce((s, o) => s + o.total, 0)
    return Math.round(total / orders.value.length)
  })

  const todayOrders = computed(() => newOrdersCount.value)

  const monthlySalesEstimate = computed(() =>
    Math.round(weekSalesTotal.value * 4.2),
  )

  /** Mock customer KPIs until customers admin API exists */
  const customerStats = computed(() => ({
    total: 1284,
    new: 46,
    active: 812,
    returning: 318,
  }))

  const activeMarketing = computed(() => {
    ensureBanners()
    const activeBanners = banners.value.filter(b => b.active).length
    const activeDeals = deals.value.filter(d => d.active).length
    const activeCodes = codes.value.filter(c => c.active).length
    return { activeBanners, activeDeals, activeCodes }
  })

  const pendingPayouts = computed(() =>
    payouts.value.filter(p => p.status === 'pending').length,
  )

  const kpis = computed((): SellerDashboardKpi[] => {
    const list: SellerDashboardKpi[] = []
    if (can('analytics.view') || can('finance.view') || can('dashboard.view')) {
      list.push(
        {
          id: 'today-sales',
          label: 'فروش امروز',
          value: formatPrice(todaySales.value),
          delta: salesDelta.value,
          icon: 'i-tabler-currency-dollar',
          tone: 'primary',
          to: '/seller/finance',
        },
        {
          id: 'week-sales',
          label: 'فروش هفته',
          value: formatPrice(weekSalesTotal.value),
          hint: 'بر اساس داده فروش',
          icon: 'i-tabler-chart-bar',
          tone: 'success',
          to: '/seller/finance',
        },
        {
          id: 'aov',
          label: 'میانگین سفارش',
          value: formatPrice(averageOrderValue.value),
          icon: 'i-tabler-receipt-2',
          tone: 'info',
          to: '/seller/orders',
        },
        {
          id: 'month-sales',
          label: 'برآورد ماه',
          value: formatPrice(monthlySalesEstimate.value),
          hint: 'تقریبی از روند هفته',
          icon: 'i-tabler-calendar-stats',
          tone: 'neutral',
        },
      )
    }
    if (can('orders.view')) {
      list.push(
        {
          id: 'pending-orders',
          label: 'سفارش جدید',
          value: orderStatusCounts.value.new.toLocaleString('fa-IR'),
          icon: 'i-tabler-bell',
          tone: 'warning',
          to: '/seller/orders',
        },
        {
          id: 'processing',
          label: 'در آماده‌سازی',
          value: orderStatusCounts.value.packing.toLocaleString('fa-IR'),
          icon: 'i-tabler-box',
          tone: 'info',
          to: '/seller/orders',
        },
      )
    }
    if (can('products.view')) {
      list.push(
        {
          id: 'active-products',
          label: 'محصول فعال',
          value: productStatusCounts.value.active.toLocaleString('fa-IR'),
          icon: 'i-tabler-package',
          tone: 'success',
          to: '/seller/products',
        },
        {
          id: 'oos',
          label: 'ناموجود',
          value: productStatusCounts.value.out_of_stock.toLocaleString('fa-IR'),
          icon: 'i-tabler-package-off',
          tone: 'error',
          to: '/seller/products?status=out_of_stock',
        },
      )
    }
    if (can('finance.view')) {
      list.push({
        id: 'wallet',
        label: 'قابل برداشت',
        value: formatPrice(wallet.value.available),
        icon: 'i-tabler-wallet',
        tone: 'primary',
        to: '/seller/finance',
      })
    }
    return list
  })

  const salesSeries = computed((): SellerDashboardSeriesPoint[] => {
    if (sales.value.length) {
      return sales.value.map(p => ({ label: p.label, value: p.value }))
    }
    return [
      { label: 'ش', value: 12_000_000 },
      { label: 'ی', value: 18_000_000 },
      { label: 'د', value: 9_000_000 },
      { label: 'س', value: 22_000_000 },
      { label: 'چ', value: 16_000_000 },
      { label: 'پ', value: 28_000_000 },
      { label: 'ج', value: 14_000_000 },
    ]
  })

  const ordersSeries = computed((): SellerDashboardSeriesPoint[] => {
    // Derive a simple series from order volume mock scaled by status mix
    const base = Math.max(orders.value.length, 7)
    return salesSeries.value.map((point, index) => ({
      label: point.label,
      value: Math.max(1, Math.round((base / 7) * (0.6 + (index % 3) * 0.2))),
    }))
  })

  const orderStatusDistribution = computed((): SellerDashboardNamedValue[] =>
    Object.entries(orderStatusCounts.value).map(([id, value]) => ({
      id,
      label: id,
      value,
    })),
  )

  const topProducts = computed((): SellerDashboardNamedValue[] => {
    return [...listings.value]
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5)
      .map((item) => {
        const product = resolveProduct(item.productId)
        return {
          id: item.productId,
          label: product.title || item.productId,
          value: item.sold,
          meta: formatPrice(product.price),
        }
      })
  })

  const alerts = computed((): SellerDashboardAlert[] => {
    const items: SellerDashboardAlert[] = []
    if (can('products.view') && lowStockListings.value.length) {
      items.push({
        id: 'low-stock',
        title: 'موجودی رو به اتمام',
        description: `${lowStockListings.value.length} محصول نیاز به تأمین دارد`,
        severity: 'warning',
        to: '/seller/products',
        count: lowStockListings.value.length,
      })
    }
    if (can('products.view') && productStatusCounts.value.out_of_stock) {
      items.push({
        id: 'oos',
        title: 'ناموجود',
        description: `${productStatusCounts.value.out_of_stock} محصول موجودی صفر دارد`,
        severity: 'error',
        to: '/seller/products?status=out_of_stock',
        count: productStatusCounts.value.out_of_stock,
      })
    }
    if (can('orders.view') && orderStatusCounts.value.new) {
      items.push({
        id: 'pending-orders',
        title: 'سفارش‌های جدید',
        description: 'نیاز به بررسی و آماده‌سازی',
        severity: 'info',
        to: '/seller/orders',
        count: orderStatusCounts.value.new,
      })
    }
    if (can('questions.view') && unansweredQuestions.value) {
      items.push({
        id: 'questions',
        title: 'پرسش بدون پاسخ',
        description: 'مشتریان منتظر پاسخ هستند',
        severity: 'warning',
        to: '/seller/questions',
        count: unansweredQuestions.value,
      })
    }
    if (can('reviews.view') && unansweredReviews.value) {
      items.push({
        id: 'reviews',
        title: 'نظرات بدون پاسخ',
        description: 'نظرات در انتظار پاسخ فروشگاه',
        severity: 'info',
        to: '/seller/reviews',
        count: unansweredReviews.value,
      })
    }
    if (can('finance.view') && pendingPayouts.value) {
      items.push({
        id: 'payouts',
        title: 'تسویه در انتظار',
        description: 'درخواست‌های تسویه پرداخت‌نشده',
        severity: 'warning',
        to: '/seller/finance',
        count: pendingPayouts.value,
      })
    }
    if (can('orders.view') && orderStatusCounts.value.returned) {
      items.push({
        id: 'returns-orders',
        title: 'سفارش مرجوعی',
        description: 'نیاز به پیگیری مرجوعی',
        severity: 'error',
        to: '/seller/returns',
        count: orderStatusCounts.value.returned,
      })
    }
    if (can('returns.view') && pendingReturns.value) {
      items.push({
        id: 'return-requests',
        title: 'درخواست مرجوعی',
        description: 'درخواست‌های در انتظار بررسی',
        severity: 'warning',
        to: '/seller/returns',
        count: pendingReturns.value,
      })
    }
    if (can('refunds.view') && pendingRefunds.value) {
      items.push({
        id: 'refunds',
        title: 'بازپرداخت در انتظار',
        description: 'بازپرداخت‌های پردازش‌نشده',
        severity: 'error',
        to: '/seller/refunds',
        count: pendingRefunds.value,
      })
    }
    return items
  })

  const quickActions = computed(() =>
    sellerDashboardQuickActions.filter(action =>
      can(action.permission as SellerPermission),
    ),
  )

  const activity = computed(() => recentAudit(8))

  return {
    range,
    hydrateSideData,
    kpis,
    salesSeries,
    ordersSeries,
    orderStatusCounts,
    orderStatusDistribution,
    productStatusCounts,
    customerStats,
    activeMarketing,
    totalStock,
    inventoryValue,
    topProducts,
    alerts,
    quickActions,
    activity,
    todayOrders,
    weekSalesTotal,
    averageOrderValue,
    wallet,
    pendingPayouts,
    lowStockListings,
  }
}
