export type WalletTxType = 'topup' | 'purchase' | 'refund' | 'reward' | 'withdraw'

export type WalletTxStatus = 'success' | 'pending' | 'failed'

export type WalletTransaction = {
  id: string
  type: WalletTxType
  amount: number
  /** مثبت = واریز به کیف، منفی = کسر از کیف */
  signedAmount: number
  status: WalletTxStatus
  title: string
  description?: string
  date: string
  time: string
  refId?: string
}

export type WalletSummary = {
  balance: number
  pendingWithdraw: number
  monthTopup: number
  monthSpent: number
}

export const walletTopUpPresets = [
  100_000,
  200_000,
  500_000,
  1_000_000,
  2_000_000,
  5_000_000,
] as const

export const walletMinTopUp = 50_000
export const walletMaxTopUp = 50_000_000
export const walletMinWithdraw = 100_000

export const walletTxTypeMeta: Record<
  WalletTxType,
  {
    label: string
    icon: string
    color: 'success' | 'error' | 'primary' | 'warning' | 'info'
    sign: 'credit' | 'debit'
  }
> = {
  topup: {
    label: 'شارژ کیف پول',
    icon: 'i-tabler-plus',
    color: 'success',
    sign: 'credit',
  },
  purchase: {
    label: 'خرید',
    icon: 'i-tabler-shopping-bag',
    color: 'error',
    sign: 'debit',
  },
  refund: {
    label: 'بازگشت وجه',
    icon: 'i-tabler-refresh',
    color: 'info',
    sign: 'credit',
  },
  reward: {
    label: 'پاداش',
    icon: 'i-tabler-gift',
    color: 'warning',
    sign: 'credit',
  },
  withdraw: {
    label: 'برداشت',
    icon: 'i-tabler-arrow-up-right',
    color: 'primary',
    sign: 'debit',
  },
}

export const walletTxStatusMeta: Record<
  WalletTxStatus,
  { label: string; color: 'success' | 'warning' | 'error' }
> = {
  success: { label: 'موفق', color: 'success' },
  pending: { label: 'در انتظار', color: 'warning' },
  failed: { label: 'ناموفق', color: 'error' },
}

export const defaultWalletSummary: WalletSummary = {
  balance: 2_450_000,
  pendingWithdraw: 500_000,
  monthTopup: 3_000_000,
  monthSpent: 1_850_000,
}

export const defaultWalletTransactions: WalletTransaction[] = [
  {
    id: 'wt-01',
    type: 'topup',
    amount: 1_000_000,
    signedAmount: 1_000_000,
    status: 'success',
    title: 'شارژ کیف پول',
    description: 'پرداخت از طریق زرین‌پال',
    date: '۱۴۰۳/۰۹/۲۲',
    time: '۱۴:۳۲',
    refId: 'ZP-984512',
  },
  {
    id: 'wt-02',
    type: 'purchase',
    amount: 890_000,
    signedAmount: -890_000,
    status: 'success',
    title: 'پرداخت سفارش BZ-109204',
    description: 'خرید از موجودی کیف پول',
    date: '۱۴۰۳/۰۹/۲۰',
    time: '۱۱:۱۵',
    refId: 'BZ-109204',
  },
  {
    id: 'wt-03',
    type: 'withdraw',
    amount: 500_000,
    signedAmount: -500_000,
    status: 'pending',
    title: 'درخواست برداشت',
    description: 'واریز به کارت ‎۶۰۳۷-****-****-۴۵۱۲',
    date: '۱۴۰۳/۰۹/۱۸',
    time: '۰۹:۴۰',
    refId: 'WD-1102',
  },
  {
    id: 'wt-04',
    type: 'reward',
    amount: 150_000,
    signedAmount: 150_000,
    status: 'success',
    title: 'پاداش خوش‌آمدگویی',
    description: 'اعتبار هدیه عضویت',
    date: '۱۴۰۳/۰۹/۱۵',
    time: '۱۶:۰۵',
  },
  {
    id: 'wt-05',
    type: 'refund',
    amount: 320_000,
    signedAmount: 320_000,
    status: 'success',
    title: 'بازگشت وجه سفارش BZ-107833',
    description: 'لغو سفارش و بازگشت به کیف پول',
    date: '۱۴۰۳/۰۹/۱۰',
    time: '۱۳:۲۲',
    refId: 'BZ-107833',
  },
  {
    id: 'wt-06',
    type: 'purchase',
    amount: 960_000,
    signedAmount: -960_000,
    status: 'success',
    title: 'پرداخت سفارش BZ-108911',
    description: 'خرید از موجودی کیف پول',
    date: '۱۴۰۳/۰۹/۰۳',
    time: '۲۰:۱۸',
    refId: 'BZ-108911',
  },
  {
    id: 'wt-07',
    type: 'topup',
    amount: 2_000_000,
    signedAmount: 2_000_000,
    status: 'success',
    title: 'شارژ کیف پول',
    description: 'پرداخت از طریق زرین‌پال',
    date: '۱۴۰۳/۰۸/۲۸',
    time: '۱۰:۵۰',
    refId: 'ZP-971203',
  },
  {
    id: 'wt-08',
    type: 'topup',
    amount: 200_000,
    signedAmount: 200_000,
    status: 'failed',
    title: 'شارژ ناموفق',
    description: 'پرداخت در درگاه لغو شد',
    date: '۱۴۰۳/۰۸/۲۵',
    time: '۱۸:۱۲',
    refId: 'ZP-968841',
  },
]
