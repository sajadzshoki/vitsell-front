import {
  buildDefaultSellerDiscounts,
  emptyDiscountForm,
  formToDiscount,
  toDiscountForm,
  discountIdPattern,
  type SellerDiscount,
  type SellerDiscountFormValues,
  type SellerDiscountStatus,
} from '~/data/seller-discounts'
import { isValidScheduleWindow } from '~/data/seller-marketing-shared'

export function useSellerDiscounts() {
  const items = useState<SellerDiscount[]>('seller-discounts', () => [])
  const seeded = useState('seller-discounts-seeded', () => false)

  function ensureLoaded() {
    if (!seeded.value) {
      items.value = buildDefaultSellerDiscounts()
      seeded.value = true
    }
    return items.value
  }

  const discounts = computed(() => items.value)
  const activeDiscounts = computed(() => items.value.filter(d => d.status === 'active'))

  function getById(id: string) {
    return items.value.find(d => d.id === id) ?? null
  }

  function validate(form: SellerDiscountFormValues) {
    if (!form.name.trim()) return 'نام الزامی است'
    if (!form.id.trim() || !discountIdPattern.test(form.id.trim())) return 'شناسه نامعتبر است'
    const value = Number(form.value)
    if (form.type === 'percent' && (value < 1 || value > 99)) return 'درصد باید بین ۱ تا ۹۹ باشد'
    if (form.type === 'fixed' && value <= 0) return 'مبلغ تخفیف باید مثبت باشد'
    if (!isValidScheduleWindow(
      form.startsAt.includes('T') ? new Date(form.startsAt).toISOString() : form.startsAt,
      form.endsAt.includes('T') ? new Date(form.endsAt).toISOString() : form.endsAt,
    )) {
      // datetime-local compare
      if (form.endsAt <= form.startsAt) return 'پایان باید بعد از شروع باشد'
    }
    if (form.endsAt && form.startsAt && form.endsAt <= form.startsAt) {
      return 'پایان باید بعد از شروع باشد'
    }
    return null
  }

  function createDiscount(form: SellerDiscountFormValues) {
    ensureLoaded()
    const err = validate(form)
    if (err) return { ok: false as const, error: err }
    const id = form.id.trim()
    if (items.value.some(d => d.id === id)) return { ok: false as const, error: 'شناسه تکراری است' }
    const discount = formToDiscount(form)
    items.value = [discount, ...items.value]
    return { ok: true as const, discount }
  }

  function updateDiscount(id: string, form: SellerDiscountFormValues) {
    ensureLoaded()
    const index = items.value.findIndex(d => d.id === id)
    if (index === -1) return { ok: false as const, error: 'تخفیف پیدا نشد' }
    const err = validate({ ...form, id })
    if (err) return { ok: false as const, error: err }
    const next = formToDiscount({ ...form, id }, items.value[index])
    const copy = [...items.value]
    copy[index] = next
    items.value = copy
    return { ok: true as const, discount: next }
  }

  function deleteDiscount(id: string) {
    ensureLoaded()
    if (!items.value.some(d => d.id === id)) return { ok: false as const, error: 'تخفیف پیدا نشد' }
    items.value = items.value.filter(d => d.id !== id)
    return { ok: true as const }
  }

  function setStatus(id: string, status: SellerDiscountStatus) {
    const d = getById(id)
    if (!d) return { ok: false as const, error: 'تخفیف پیدا نشد' }
    return updateDiscount(id, { ...toDiscountForm(d), status })
  }

  return {
    discounts,
    activeDiscounts,
    ensureLoaded,
    getById,
    createDiscount,
    updateDiscount,
    deleteDiscount,
    setStatus,
    emptyDiscountForm,
    toDiscountForm,
  }
}
