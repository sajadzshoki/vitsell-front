/** Shared finance period presets, date helpers, and KPI aggregators (single-vendor store). */

export type FinancePeriodId =
  | 'today'
  | 'yesterday'
  | 'last_7'
  | 'last_30'
  | 'this_month'
  | 'last_month'
  | 'custom'

export type FinanceDateRange = {
  start: Date
  end: Date
  previousStart: Date
  previousEnd: Date
}

export const financePeriodOptions: { id: FinancePeriodId, label: string }[] = [
  { id: 'today', label: 'امروز' },
  { id: 'yesterday', label: 'دیروز' },
  { id: 'last_7', label: '۷ روز اخیر' },
  { id: 'last_30', label: '۳۰ روز اخیر' },
  { id: 'this_month', label: 'این ماه' },
  { id: 'last_month', label: 'ماه قبل' },
  { id: 'custom', label: 'بازه سفارشی' },
]

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function endOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(23, 59, 59, 999)
  return x
}

function addDays(d: Date, n: number) {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

export function parseFinanceDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value
  const raw = String(value).trim()
  if (!raw) return null
  // Persian display dates like ۱۴۰۳/۰۶/۱۰ or 1403/06/10 — treat as today-relative fallback via ISO only
  const iso = Date.parse(raw)
  if (!Number.isNaN(iso)) return new Date(iso)
  // dd/mm/yyyy or yyyy-mm-dd loose
  const m = raw.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})/)
  if (m) {
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
    return Number.isNaN(d.getTime()) ? null : d
  }
  return null
}

export function isDateInRange(value: string | Date | null | undefined, start: Date, end: Date) {
  const d = parseFinanceDate(value)
  if (!d) return false
  return d >= start && d <= end
}

export function resolveFinanceRange(
  period: FinancePeriodId,
  customStart?: string | null,
  customEnd?: string | null,
  now = new Date(),
): FinanceDateRange {
  const todayStart = startOfDay(now)
  const todayEnd = endOfDay(now)

  let start = todayStart
  let end = todayEnd

  if (period === 'today') {
    start = todayStart
    end = todayEnd
  }
  else if (period === 'yesterday') {
    start = startOfDay(addDays(now, -1))
    end = endOfDay(addDays(now, -1))
  }
  else if (period === 'last_7') {
    start = startOfDay(addDays(now, -6))
    end = todayEnd
  }
  else if (period === 'last_30') {
    start = startOfDay(addDays(now, -29))
    end = todayEnd
  }
  else if (period === 'this_month') {
    start = new Date(now.getFullYear(), now.getMonth(), 1)
    end = todayEnd
  }
  else if (period === 'last_month') {
    start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    end = endOfDay(new Date(now.getFullYear(), now.getMonth(), 0))
  }
  else if (period === 'custom') {
    const cs = parseFinanceDate(customStart) ?? todayStart
    const ce = parseFinanceDate(customEnd) ?? todayEnd
    start = startOfDay(cs)
    end = endOfDay(ce)
  }

  const ms = end.getTime() - start.getTime()
  const previousEnd = new Date(start.getTime() - 1)
  const previousStart = new Date(previousEnd.getTime() - ms)

  return { start, end, previousStart, previousEnd }
}

export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null
  return Math.round(((current - previous) / previous) * 1000) / 10
}

export type FinanceKpiBundle = {
  grossRevenue: number
  netRevenue: number
  todayRevenue: number
  weekRevenue: number
  monthRevenue: number
  revenuePrev: number
  revenueChangePct: number | null
  paidOrders: number
  unpaidOrders: number
  failedPayments: number
  refundedOrders: number
  partiallyRefundedOrders: number
  successfulPayments: number
  pendingPayments: number
  failedPaymentCount: number
  paymentVolume: number
  avgTransactionValue: number
  totalRefunded: number
  pendingRefunds: number
  completedRefunds: number
  failedRefunds: number
  pendingReceivables: number
  pendingSettlements: number
  openReconciliationIssues: number
}

export function emptyFinanceKpis(): FinanceKpiBundle {
  return {
    grossRevenue: 0,
    netRevenue: 0,
    todayRevenue: 0,
    weekRevenue: 0,
    monthRevenue: 0,
    revenuePrev: 0,
    revenueChangePct: null,
    paidOrders: 0,
    unpaidOrders: 0,
    failedPayments: 0,
    refundedOrders: 0,
    partiallyRefundedOrders: 0,
    successfulPayments: 0,
    pendingPayments: 0,
    failedPaymentCount: 0,
    paymentVolume: 0,
    avgTransactionValue: 0,
    totalRefunded: 0,
    pendingRefunds: 0,
    completedRefunds: 0,
    failedRefunds: 0,
    pendingReceivables: 0,
    pendingSettlements: 0,
    openReconciliationIssues: 0,
  }
}
