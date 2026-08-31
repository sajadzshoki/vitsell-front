import {
  walletMaxTopUp,
  walletMinTopUp,
  walletMinWithdraw,
  type WalletSummary,
  type WalletTransaction,
  type WalletTxType,
} from '~/data/account-wallet'

export type WalletTxFilter = 'all' | WalletTxType

const emptySummary = (): WalletSummary => ({
  balance: 0,
  pendingWithdraw: 0,
  monthTopup: 0,
  monthSpent: 0,
})

export function useAccountWallet() {
  const summary = useState<WalletSummary>('account-wallet-summary', emptySummary)
  const transactions = useState<WalletTransaction[]>('account-wallet-tx', () => [])
  const loaded = useState('account-wallet-loaded', () => false)

  async function fetchWallet(options?: { force?: boolean }) {
    if (loaded.value && !options?.force) {
      return { summary: summary.value, transactions: transactions.value, error: null as null }
    }

    const { result, error } = await useGet<{
      summary: WalletSummary
      transactions: WalletTransaction[]
    }>('/account/wallet', { headers: { 'no-error': true } })

    if (error || !result) {
      return { summary: summary.value, transactions: transactions.value, error }
    }

    summary.value = result.summary
    transactions.value = Array.isArray(result.transactions) ? result.transactions : []
    loaded.value = true
    return { summary: summary.value, transactions: transactions.value, error: null as null }
  }

  function filterTransactions(filter: WalletTxFilter) {
    if (filter === 'all') return transactions.value
    return transactions.value.filter(tx => tx.type === filter)
  }

  async function requestTopUp(amount: number) {
    if (amount < walletMinTopUp || amount > walletMaxTopUp) {
      return { ok: false as const, error: 'invalid_amount' as const }
    }

    const { result, error } = await usePost<{ paymentUrl: string, transactionId: string }>(
      '/account/wallet/topup',
      { amount },
      { headers: { 'no-error': true } },
    )

    if (error || !result?.paymentUrl) {
      return { ok: false as const, error: 'payment_failed' as const }
    }

    return {
      ok: true as const,
      paymentUrl: result.paymentUrl,
      transactionId: result.transactionId,
    }
  }

  async function requestWithdraw(amount: number, cardNumber: string) {
    if (amount < walletMinWithdraw) {
      return { ok: false as const, error: 'min_amount' as const }
    }
    if (amount > summary.value.balance) {
      return { ok: false as const, error: 'insufficient' as const }
    }

    const card = String(cardNumber ?? '').replace(/\D/g, '')
    if (card.length !== 16) {
      return { ok: false as const, error: 'invalid_card' as const }
    }

    const { result, error } = await usePost<{
      transaction: WalletTransaction
      summary: WalletSummary
    }>(
      '/account/wallet/withdraw',
      { amount, cardNumber: card },
      { headers: { 'no-error': true } },
    )

    if (error || !result) {
      const field = error?.data?.errors?.[0]?.field
      if (field === 'amount') {
        return { ok: false as const, error: 'insufficient' as const }
      }
      if (field === 'cardNumber') {
        return { ok: false as const, error: 'invalid_card' as const }
      }
      return { ok: false as const, error: 'failed' as const }
    }

    summary.value = result.summary
    transactions.value = [result.transaction, ...transactions.value.filter(t => t.id !== result.transaction.id)]
    return { ok: true as const, transaction: result.transaction }
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
