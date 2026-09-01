/** Shared marketing schedule / targeting helpers (Phase 5). */

export type SellerMarketingDiscountType = 'percent' | 'fixed'

export type SellerMarketingTargetScope =
  | 'store'
  | 'products'
  | 'categories'
  | 'brands'

export type SellerMarketingTargeting = {
  scope: SellerMarketingTargetScope
  productIds: string[]
  categoryIds: string[]
  brandIds: string[]
  excludeProductIds: string[]
  excludeCategoryIds: string[]
  excludeBrandIds: string[]
}

export type SellerScheduleStatus =
  | 'draft'
  | 'scheduled'
  | 'active'
  | 'paused'
  | 'expired'
  | 'ended'
  | 'archived'
  | 'cancelled'

export const emptyMarketingTargeting = (): SellerMarketingTargeting => ({
  scope: 'store',
  productIds: [],
  categoryIds: [],
  brandIds: [],
  excludeProductIds: [],
  excludeCategoryIds: [],
  excludeBrandIds: [],
})

export const sellerScheduleStatusMeta: Record<
  SellerScheduleStatus,
  { label: string, color: 'primary' | 'success' | 'warning' | 'error' | 'neutral' | 'info' }
> = {
  draft: { label: 'پیش‌نویس', color: 'neutral' },
  scheduled: { label: 'زمان‌بندی‌شده', color: 'info' },
  active: { label: 'فعال', color: 'success' },
  paused: { label: 'متوقف', color: 'warning' },
  expired: { label: 'منقضی', color: 'error' },
  ended: { label: 'پایان‌یافته', color: 'neutral' },
  archived: { label: 'بایگانی', color: 'neutral' },
  cancelled: { label: 'لغو شده', color: 'error' },
}

export function rangesOverlap(
  aStart: string | null | undefined,
  aEnd: string | null | undefined,
  bStart: string | null | undefined,
  bEnd: string | null | undefined,
): boolean {
  const as = aStart ? Date.parse(aStart) : Number.NEGATIVE_INFINITY
  const ae = aEnd ? Date.parse(aEnd) : Number.POSITIVE_INFINITY
  const bs = bStart ? Date.parse(bStart) : Number.NEGATIVE_INFINITY
  const be = bEnd ? Date.parse(bEnd) : Number.POSITIVE_INFINITY
  if (Number.isNaN(as) || Number.isNaN(ae) || Number.isNaN(bs) || Number.isNaN(be)) return false
  return as <= be && bs <= ae
}

export function isValidScheduleWindow(startsAt: string, endsAt: string): boolean {
  const s = Date.parse(startsAt)
  const e = Date.parse(endsAt)
  if (Number.isNaN(s) || Number.isNaN(e)) return false
  return e > s
}

export function deriveScheduleStatus(opts: {
  startsAt?: string | null
  endsAt?: string | null
  active?: boolean
  paused?: boolean
  archived?: boolean
  cancelled?: boolean
  draft?: boolean
  now?: Date
}): SellerScheduleStatus {
  if (opts.archived) return 'archived'
  if (opts.cancelled) return 'cancelled'
  if (opts.draft) return 'draft'
  if (opts.paused || opts.active === false) {
    const now = opts.now ?? new Date()
    const end = opts.endsAt ? Date.parse(opts.endsAt) : NaN
    if (!Number.isNaN(end) && end <= now.getTime()) return 'ended'
    if (opts.paused) return 'paused'
    if (opts.active === false) {
      const start = opts.startsAt ? Date.parse(opts.startsAt) : NaN
      if (!Number.isNaN(start) && start > now.getTime()) return 'cancelled'
      return 'paused'
    }
  }
  const now = opts.now ?? new Date()
  const start = opts.startsAt ? Date.parse(opts.startsAt) : Number.NEGATIVE_INFINITY
  const end = opts.endsAt ? Date.parse(opts.endsAt) : Number.POSITIVE_INFINITY
  if (!Number.isNaN(end) && end <= now.getTime()) return opts.endsAt ? 'expired' : 'ended'
  if (!Number.isNaN(start) && start > now.getTime()) return 'scheduled'
  return 'active'
}

export function sortByPriorityThenStart<T extends { priority?: number, startsAt?: string | null }>(
  items: T[],
): T[] {
  return [...items].sort((a, b) => {
    const pa = a.priority ?? 0
    const pb = b.priority ?? 0
    if (pa !== pb) return pa - pb
    const sa = a.startsAt ? Date.parse(a.startsAt) : 0
    const sb = b.startsAt ? Date.parse(b.startsAt) : 0
    return sa - sb
  })
}

export function targetingFingerprint(t: SellerMarketingTargeting): string {
  return [
    t.scope,
    [...t.productIds].sort().join(','),
    [...t.categoryIds].sort().join(','),
    [...t.brandIds].sort().join(','),
  ].join('|')
}

export function hasTargetOverlap(
  a: SellerMarketingTargeting,
  b: SellerMarketingTargeting,
): boolean {
  if (a.scope === 'store' || b.scope === 'store') return true
  if (a.scope !== b.scope) return false
  const pick = (t: SellerMarketingTargeting) => {
    if (t.scope === 'products') return t.productIds
    if (t.scope === 'categories') return t.categoryIds
    return t.brandIds
  }
  const setB = new Set(pick(b))
  return pick(a).some(id => setB.has(id))
}

export type ScheduleConflictCandidate = {
  id: string
  name: string
  startsAt?: string | null
  endsAt?: string | null
  active?: boolean
  targeting?: SellerMarketingTargeting
}

/** Informational only — not a stacking engine */
export function findScheduleConflicts(
  current: ScheduleConflictCandidate,
  others: ScheduleConflictCandidate[],
): ScheduleConflictCandidate[] {
  return others.filter((other) => {
    if (other.id === current.id) return false
    if (other.active === false || current.active === false) return false
    if (!rangesOverlap(current.startsAt, current.endsAt, other.startsAt, other.endsAt)) return false
    if (current.targeting && other.targeting) {
      return hasTargetOverlap(current.targeting, other.targeting)
    }
    return true
  })
}

export function formatCountdown(endsAt: string, now = new Date()): string {
  const end = Date.parse(endsAt)
  if (Number.isNaN(end)) return '—'
  const ms = end - now.getTime()
  if (ms <= 0) return 'پایان یافته'
  const hours = Math.floor(ms / 3_600_000)
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days} روز و ${hours % 24} ساعت`
  const mins = Math.floor((ms % 3_600_000) / 60_000)
  return `${hours} ساعت و ${mins} دقیقه`
}

export function overlapsDateRange(
  startsAt: string | null | undefined,
  endsAt: string | null | undefined,
  rangeStart: string | null | undefined,
  rangeEnd: string | null | undefined,
): boolean {
  if (!rangeStart && !rangeEnd) return true
  return rangesOverlap(startsAt, endsAt, rangeStart, rangeEnd)
}
