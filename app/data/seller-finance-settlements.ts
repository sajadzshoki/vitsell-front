import type { SellerPayout } from '~/data/seller'

/** Gateway/bank settlement — single-vendor (NOT marketplace seller payout) */

export type SellerSettlementStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'reconciled'

export type SellerSettlementSource = 'gateway' | 'bank' | 'manual'

export type SellerSettlement = {
  id: string
  source: SellerSettlementSource
  gateway: string
  amount: number
  fees: number
  netAmount: number
  status: SellerSettlementStatus
  settlementDate: string
  reference: string
  relatedPaymentIds: string[]
  relatedTransactionIds: string[]
  note: string
  createdAt: string
  updatedAt: string
}

export const sellerSettlementStatusMeta: Record<
  SellerSettlementStatus,
  { label: string, color: 'success' | 'warning' | 'error' | 'info' | 'neutral' }
> = {
  pending: { label: 'در انتظار', color: 'warning' },
  processing: { label: 'در حال پردازش', color: 'info' },
  completed: { label: 'تکمیل‌شده', color: 'success' },
  failed: { label: 'ناموفق', color: 'error' },
  reconciled: { label: 'مغایرت‌گیری‌شده', color: 'info' },
}

export const sellerSettlementSourceMeta: Record<SellerSettlementSource, { label: string }> = {
  gateway: { label: 'تسویه درگاه' },
  bank: { label: 'واریز بانکی' },
  manual: { label: 'ثبت دستی' },
}

export function mapPayoutToSettlement(payout: SellerPayout): SellerSettlement {
  const status: SellerSettlementStatus = payout.status === 'paid' ? 'completed' : 'pending'
  const fees = Math.round(payout.amount * 0.01)
  return {
    id: payout.id.startsWith('stl-') ? payout.id : `stl-${payout.id}`,
    source: 'gateway',
    gateway: 'زرین‌پال',
    amount: payout.amount,
    fees,
    netAmount: Math.max(0, payout.amount - fees),
    status,
    settlementDate: payout.date,
    reference: payout.status === 'paid' ? `REF-${payout.id}` : '',
    relatedPaymentIds: [],
    relatedTransactionIds: [],
    note: '',
    createdAt: payout.date,
    updatedAt: payout.date,
  }
}

export function mergeSettlementOverlay(
  fromApi: SellerSettlement[],
  overlay: Record<string, Partial<SellerSettlement>>,
): SellerSettlement[] {
  return fromApi.map((s) => {
    const extra = overlay[s.id]
    return extra ? { ...s, ...extra, id: s.id } : s
  })
}
