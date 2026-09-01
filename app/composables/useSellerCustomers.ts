import {
  buildDefaultCustomers,
  customerFullName,
  emptyCustomerForm,
  toCustomerForm,
  type SellerCustomer,
  type SellerCustomerFormValues,
  type SellerCustomerStatus,
} from '~/data/seller-customers'

export function useSellerCustomers() {
  const items = useState<SellerCustomer[]>('seller-customers', () => [])
  const seeded = useState('seller-customers-seeded', () => false)

  function ensureLoaded() {
    if (!seeded.value) {
      items.value = buildDefaultCustomers()
      seeded.value = true
    }
    return items.value
  }

  const customers = computed(() => items.value)

  function getById(id: string) {
    return items.value.find(c => c.id === id) ?? null
  }

  function updateCustomer(id: string, form: SellerCustomerFormValues) {
    ensureLoaded()
    const index = items.value.findIndex(c => c.id === id)
    if (index === -1) return { ok: false as const, error: 'مشتری پیدا نشد' }
    const previous = items.value[index]!
    const next: SellerCustomer = {
      ...previous,
      firstName: form.firstName.trim() || previous.firstName,
      lastName: form.lastName.trim() || previous.lastName,
      email: form.email.trim(),
      phone: form.phone.trim(),
      status: form.status,
    }
    const copy = [...items.value]
    copy[index] = next
    items.value = copy
    return { ok: true as const, customer: next }
  }

  function setStatus(id: string, status: SellerCustomerStatus) {
    ensureLoaded()
    const customer = getById(id)
    if (!customer) return { ok: false as const, error: 'مشتری پیدا نشد' }
    return updateCustomer(id, { ...toCustomerForm(customer), status })
  }

  return {
    customers,
    ensureLoaded,
    getById,
    updateCustomer,
    setStatus,
    customerFullName,
    emptyCustomerForm,
    toCustomerForm,
  }
}
