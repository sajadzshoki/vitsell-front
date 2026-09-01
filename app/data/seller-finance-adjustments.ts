/** Append-only financial adjustments — never mutate historical payment/refund rows */

export type SellerFinanceAdjustmentType =
  | 'accounting_correction'
  | 'manual_refund_adjustment'
  | 'fee_correction'
  | 'other'

export type SellerFinanceAdjustment = {
  id: string
  type: SellerFinanceAdjustmentType
  amount: number
  reason: string
  orderId: string | null
  actorId: string
  actorName: string
  createdAt: string
}

export const sellerFinanceAdjustmentTypeMeta: Record<SellerFinanceAdjustmentType, { label: string }> = {
  accounting_correction: { label: 'اصلاح حسابداری' },
  manual_refund_adjustment: { label: 'تعدیل بازپرداخت' },
  fee_correction: { label: 'اصلاح کارمزد' },
  other: { label: 'سایر' },
}

export function buildDefaultAdjustments(): SellerFinanceAdjustment[] {
  return []
}
