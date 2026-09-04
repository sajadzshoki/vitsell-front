export type SellerSystemIntegrationStatus = 'live' | 'sandbox' | 'mock' | 'unconfigured'

export type SellerSystemIntegration = {
  id: string
  label: string
  status: SellerSystemIntegrationStatus
  hint: string
}

export type SellerSystemEvent = {
  id: string
  summary: string
  actorName: string
  createdAt: string
  source?: string
}

export type SellerSystemOverview = {
  stats: {
    admins: { total: number, active: number }
    roles: { total: number }
    permissions: { total: number }
    products: { total: number }
    orders: { total: number }
    blog: { total: number }
    pages: { total: number }
    media: { total: number }
    banners: { total: number }
  }
  integrations: SellerSystemIntegration[]
  recentEvents: SellerSystemEvent[]
  generatedAt: string
}

function emptyOverview(): SellerSystemOverview {
  return {
    stats: {
      admins: { total: 0, active: 0 },
      roles: { total: 0 },
      permissions: { total: 0 },
      products: { total: 0 },
      orders: { total: 0 },
      blog: { total: 0 },
      pages: { total: 0 },
      media: { total: 0 },
      banners: { total: 0 },
    },
    integrations: [],
    recentEvents: [],
    generatedAt: new Date().toISOString(),
  }
}

function apiErrorMessage(error: any, fallback: string) {
  return (
    error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
    || error?.data?.message
    || error?.message
    || fallback
  )
}

export function useSellerSystem() {
  const overview = useState<SellerSystemOverview>('seller-system-overview', emptyOverview)
  const seeded = useState('seller-system-seeded', () => false)
  const pending = useState('seller-system-pending', () => false)

  async function fetchOverview(options?: { force?: boolean }) {
    if (seeded.value && !options?.force) {
      return { ok: true as const, error: null as null }
    }
    pending.value = true
    try {
      const { result, error } = await useGet<SellerSystemOverview>('/seller/system', {
        headers: { 'no-error': true },
        server: false,
      })
      if (error || !result?.stats) {
        return {
          ok: false as const,
          error: apiErrorMessage(error, 'بارگذاری نمای سیستم ناموفق بود'),
        }
      }
      overview.value = {
        stats: {
          admins: {
            total: Number(result.stats.admins?.total) || 0,
            active: Number(result.stats.admins?.active) || 0,
          },
          roles: { total: Number(result.stats.roles?.total) || 0 },
          permissions: { total: Number(result.stats.permissions?.total) || 0 },
          products: { total: Number(result.stats.products?.total) || 0 },
          orders: { total: Number(result.stats.orders?.total) || 0 },
          blog: { total: Number(result.stats.blog?.total) || 0 },
          pages: { total: Number(result.stats.pages?.total) || 0 },
          media: { total: Number(result.stats.media?.total) || 0 },
          banners: { total: Number(result.stats.banners?.total) || 0 },
        },
        integrations: Array.isArray(result.integrations) ? result.integrations : [],
        recentEvents: Array.isArray(result.recentEvents) ? result.recentEvents : [],
        generatedAt: result.generatedAt || new Date().toISOString(),
      }
      seeded.value = true
      return { ok: true as const, error: null as null }
    }
    finally {
      pending.value = false
    }
  }

  return {
    overview,
    pending,
    fetchOverview,
  }
}
