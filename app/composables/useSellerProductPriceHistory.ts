export type SellerPriceHistoryEntry = {
  id: string
  productId: string
  price: number
  oldPrice: number | null
  at: string
  note: string
}

export function useSellerProductPriceHistory() {
  const history = useState<SellerPriceHistoryEntry[]>(
    'seller-product-price-history',
    () => [],
  )

  function forProduct(productId: string) {
    return history.value
      .filter(item => item.productId === productId)
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
  }

  function ensureSeed(productId: string, price: number, oldPrice?: number | null) {
    if (history.value.some(item => item.productId === productId)) return
    history.value = [
      {
        id: `ph-${productId}-seed`,
        productId,
        price,
        oldPrice: oldPrice ?? null,
        at: new Date(Date.now() - 14 * 24 * 3600_000).toISOString(),
        note: 'قیمت اولیه',
      },
      ...history.value,
    ]
  }

  function pushChange(
    productId: string,
    price: number,
    oldPrice: number | null,
    note = 'تغییر قیمت',
  ) {
    const entry: SellerPriceHistoryEntry = {
      id: `ph-${Date.now().toString(36)}`,
      productId,
      price,
      oldPrice,
      at: new Date().toISOString(),
      note,
    }
    history.value = [entry, ...history.value]
    return entry
  }

  return {
    history,
    forProduct,
    ensureSeed,
    pushChange,
  }
}
