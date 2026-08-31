import {
  buildDefaultContentPromos,
  buildDefaultDiscountCodes,
  formToContentPromo,
  formToDiscountCode,
  type SellerContentPromo,
  type SellerContentPromoForm,
  type SellerDiscountCode,
  type SellerDiscountCodeForm,
} from '~/data/seller-promotions'

export function useSellerPromotions() {
  const codes = useState<SellerDiscountCode[]>('seller-discount-codes', () => [])
  const promos = useState<SellerContentPromo[]>('seller-content-promos', () => [])
  const seeded = useState('seller-promotions-seeded', () => false)

  function ensureLoaded() {
    if (!seeded.value) {
      codes.value = buildDefaultDiscountCodes()
      promos.value = buildDefaultContentPromos()
      seeded.value = true
    }
    return { codes: codes.value, promos: promos.value }
  }

  function getCode(code: string) {
    return codes.value.find(c => c.code === code.toUpperCase())
  }

  function getPromo(id: string) {
    return promos.value.find(p => p.id === id)
  }

  function createCode(form: SellerDiscountCodeForm) {
    const next = formToDiscountCode(form)
    if (getCode(next.code)) {
      return { ok: false as const, error: 'این کد تخفیف از قبل وجود دارد' }
    }
    if (new Date(next.endsAt).getTime() <= new Date(next.startsAt).getTime()) {
      return { ok: false as const, error: 'زمان پایان باید بعد از شروع باشد' }
    }
    codes.value = [next, ...codes.value]
    return { ok: true as const, item: next }
  }

  function updateCode(code: string, form: SellerDiscountCodeForm) {
    const index = codes.value.findIndex(c => c.code === code.toUpperCase())
    if (index === -1) {
      return { ok: false as const, error: 'کد تخفیف پیدا نشد' }
    }
    const previous = codes.value[index]!
    const next = formToDiscountCode({ ...form, code: previous.code }, previous)
    if (new Date(next.endsAt).getTime() <= new Date(next.startsAt).getTime()) {
      return { ok: false as const, error: 'زمان پایان باید بعد از شروع باشد' }
    }
    const copy = [...codes.value]
    copy[index] = next
    codes.value = copy
    return { ok: true as const, item: next }
  }

  function deleteCode(code: string) {
    if (!getCode(code)) {
      return { ok: false as const, error: 'کد تخفیف پیدا نشد' }
    }
    codes.value = codes.value.filter(c => c.code !== code.toUpperCase())
    return { ok: true as const }
  }

  function setCodeActive(code: string, active: boolean) {
    const index = codes.value.findIndex(c => c.code === code.toUpperCase())
    if (index === -1) {
      return { ok: false as const, error: 'کد تخفیف پیدا نشد' }
    }
    const copy = [...codes.value]
    copy[index] = {
      ...copy[index]!,
      active,
      updatedAt: new Date().toISOString(),
    }
    codes.value = copy
    return { ok: true as const, item: copy[index]! }
  }

  function createPromo(form: SellerContentPromoForm) {
    const next = formToContentPromo(form)
    if (getPromo(next.id)) {
      return { ok: false as const, error: 'شناسه پرومو تکراری است' }
    }
    promos.value = [next, ...promos.value]
    return { ok: true as const, item: next }
  }

  function updatePromo(id: string, form: SellerContentPromoForm) {
    const index = promos.value.findIndex(p => p.id === id)
    if (index === -1) {
      return { ok: false as const, error: 'پرومو پیدا نشد' }
    }
    const previous = promos.value[index]!
    const next = formToContentPromo({ ...form, id: previous.id }, previous)
    const copy = [...promos.value]
    copy[index] = next
    promos.value = copy
    return { ok: true as const, item: next }
  }

  function deletePromo(id: string) {
    if (!getPromo(id)) {
      return { ok: false as const, error: 'پرومو پیدا نشد' }
    }
    promos.value = promos.value.filter(p => p.id !== id)
    return { ok: true as const }
  }

  function setPromoActive(id: string, active: boolean) {
    const index = promos.value.findIndex(p => p.id === id)
    if (index === -1) {
      return { ok: false as const, error: 'پرومو پیدا نشد' }
    }
    const copy = [...promos.value]
    copy[index] = {
      ...copy[index]!,
      active,
      updatedAt: new Date().toISOString(),
    }
    promos.value = copy
    return { ok: true as const, item: copy[index]! }
  }

  return {
    codes: computed(() => codes.value),
    promos: computed(() => promos.value),
    seeded,
    ensureLoaded,
    getCode,
    getPromo,
    createCode,
    updateCode,
    deleteCode,
    setCodeActive,
    createPromo,
    updatePromo,
    deletePromo,
    setPromoActive,
  }
}
