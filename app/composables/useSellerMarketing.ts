export type SellerMarketingKpiBucket = {
  total: number
  active: number
  localOnly?: boolean
}

export type SellerMarketingCouponRow = {
  code: string
  usageCount: number
  totalDiscountAmount: number
  active: boolean
  startsAt: string | null
  endsAt: string | null
}

export type SellerMarketingSummary = {
  range: { from: string | null, to: string | null }
  kpis: {
    discounts: SellerMarketingKpiBucket
    campaigns: SellerMarketingKpiBucket
    banners: SellerMarketingKpiBucket
    deals: SellerMarketingKpiBucket
    coupons: SellerMarketingKpiBucket
    promos: SellerMarketingKpiBucket
    notifications: SellerMarketingKpiBucket
  }
  coupons: {
    usageTotal: number
    discountTotal: number
    top: SellerMarketingCouponRow[]
  }
}

export type SellerMarketingQuery = {
  from?: string | null
  to?: string | null
}

function emptySummary(): SellerMarketingSummary {
  const zero = { total: 0, active: 0 }
  return {
    range: { from: null, to: null },
    kpis: {
      discounts: { ...zero },
      campaigns: { ...zero },
      banners: { ...zero },
      deals: { ...zero },
      coupons: { ...zero },
      promos: { ...zero },
      notifications: { ...zero },
    },
    coupons: {
      usageTotal: 0,
      discountTotal: 0,
      top: [],
    },
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

function toSummary(raw: any): SellerMarketingSummary {
  const base = emptySummary()
  if (!raw || typeof raw !== 'object') return base
  const k = raw.kpis || {}
  const pick = (key: keyof SellerMarketingSummary['kpis'], localOnly?: boolean) => {
    const row = k[key] || {}
    return {
      total: Number(row.total) || 0,
      active: Number(row.active) || 0,
      ...(localOnly || row.localOnly ? { localOnly: true as const } : {}),
    }
  }
  return {
    range: {
      from: raw.range?.from ?? null,
      to: raw.range?.to ?? null,
    },
    kpis: {
      discounts: pick('discounts'),
      campaigns: pick('campaigns'),
      banners: pick('banners'),
      deals: pick('deals'),
      coupons: pick('coupons'),
      promos: pick('promos'),
      notifications: pick('notifications'),
    },
    coupons: {
      usageTotal: Number(raw.coupons?.usageTotal) || 0,
      discountTotal: Number(raw.coupons?.discountTotal) || 0,
      top: Array.isArray(raw.coupons?.top)
        ? raw.coupons.top.map((c: any) => ({
            code: String(c.code || ''),
            usageCount: Number(c.usageCount) || 0,
            totalDiscountAmount: Number(c.totalDiscountAmount) || 0,
            active: Boolean(c.active),
            startsAt: c.startsAt ?? null,
            endsAt: c.endsAt ?? null,
          }))
        : [],
    },
  }
}

export function useSellerMarketing() {
  const summary = useState<SellerMarketingSummary>('seller-marketing-summary', () => emptySummary())
  const pending = useState('seller-marketing-pending', () => false)

  async function fetchSummary(query?: SellerMarketingQuery) {
    pending.value = true
    try {
      const params: Record<string, string> = {}
      if (query?.from?.trim()) params.from = query.from.trim()
      if (query?.to?.trim()) params.to = query.to.trim()

      const { result, error } = await useGet<SellerMarketingSummary>(
        '/seller/marketing',
        { query: params, headers: { 'no-error': true }, server: false },
      )

      if (error || result == null) {
        summary.value = emptySummary()
        return {
          ok: false as const,
          error: error ?? { message: apiErrorMessage(error, 'بارگذاری داشبورد بازاریابی ناموفق بود') },
        }
      }

      summary.value = toSummary(result)
      return { ok: true as const, error: null as null }
    }
    finally {
      pending.value = false
    }
  }

  return {
    summary,
    pending: computed(() => pending.value),
    fetchSummary,
  }
}
