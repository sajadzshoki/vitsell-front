import {
  defaultWalletSummary,
  defaultWalletTransactions,
  walletMaxTopUp,
  walletMinTopUp,
  walletMinWithdraw,
  type WalletSummary,
  type WalletTransaction,
  type WalletTxType,
} from '~/data/account-wallet'

export type WalletTxFilter = 'all' | WalletTxType

function todayJalaliParts() {
  // نمایشی برای mock — تاریخ ثابت فارسی
  return { date: '۱۴۰۳/۰۹/۲۴', time: '۱۲:۰۰' }
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now().toString(36).slice(-6)}`
}

export function useAccountWallet() {
  const summary = useState<WalletSummary>(
    'account-wallet-summary',
    () => ({ ...defaultWalletSummary }),
  )
  const transactions = useState<WalletTransaction[]>(
    'account-wallet-tx',
    () => [...defaultWalletTransactions],
  )
  const loaded = useState('account-wallet-loaded', () => false)

  /** تا آماده‌شدن بک‌اند / زرین‌پال از mock استفاده می‌شود. */
  async function fetchWallet() {
    await new Promise(resolve => setTimeout(resolve, 260))
    if (!loaded.value) {
      summary.value = { ...defaultWalletSummary }
      transactions.value = [...defaultWalletTransactions]
      loaded.value = true
    }
    return { summary: summary.value, transactions: transactions.value }
  }

  function filterTransactions(filter: WalletTxFilter) {
    if (filter === 'all') return transactions.value
    return transactions.value.filter(tx => tx.type === filter)
  }

  async function requestTopUp(amount: number) {
    if (amount < walletMinTopUp || amount > walletMaxTopUp) {
      return { ok: false as const, error: 'invalid_amount' }
    }

    await new Promise(resolve => setTimeout(resolve, 500))

    // شبیه‌سازی پرداخت موفق تا اتصال زرین‌پال
    const { date, time } = todayJalaliParts()
    const tx: WalletTransaction = {
      id: makeId('wt'),
      type: 'topup',
      amount,
      signedAmount: amount,
      status: 'success',
      title: 'شارژ کیف پول',
      description: 'پرداخت آزمایشی (زرین‌پال به‌زودی)',
      date,
      time,
      refId: makeId('ZP').toUpperCase(),
    }

    transactions.value = [tx, ...transactions.value]
    summary.value = {
      ...summary.value,
      balance: summary.value.balance + amount,
      monthTopup: summary.value.monthTopup + amount,
    }

    return { ok: true as const, transaction: tx }
  }

  async function requestWithdraw(amount: number, cardHint?: string) {
    if (amount < walletMinWithdraw) {
      return { ok: false as const, error: 'min_amount' }
    }
    if (amount > summary.value.balance) {
      return { ok: false as const, error: 'insufficient' }
    }

    await new Promise(resolve => setTimeout(resolve, 450))

    const { date, time } = todayJalaliParts()
    const tx: WalletTransaction = {
      id: makeId('wt'),
      type: 'withdraw',
      amount,
      signedAmount: -amount,
      status: 'pending',
      title: 'درخواست برداشت',
      description: cardHint
        ? `واریز به کارت ${cardHint}`
        : 'در انتظار بررسی و واریز',
      date,
      time,
      refId: makeId('WD').toUpperCase(),
    }

    transactions.value = [tx, ...transactions.value]
    summary.value = {
      ...summary.value,
      balance: summary.value.balance - amount,
      pendingWithdraw: summary.value.pendingWithdraw + amount,
    }

    return { ok: true as const, transaction: tx }
  }

  return {
    summary,
    transactions,
    loaded,
    fetchWallet,
    filterTransactions,
    requestTopUp,
    requestWithdraw,
  }
}
