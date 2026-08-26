import {
  checkoutPaymentOptions,
  checkoutShippingOptions,
  defaultAddresses,
  addressToForm,
  emptyAddressForm,
  type CheckoutAddress,
  type CheckoutAddressForm,
  type CheckoutPaymentId,
  type CheckoutShippingId,
  type CheckoutStepId,
} from '~/data/checkout'

export const useCheckoutStore = defineStore('checkout', () => {
  const step = ref<CheckoutStepId>(0)
  const addresses = ref<CheckoutAddress[]>(structuredClone(defaultAddresses))
  const selectedAddressId = ref(
    addresses.value.find(a => a.isDefault)?.id ?? addresses.value[0]?.id ?? '',
  )
  const showAddressForm = ref(addresses.value.length === 0)
  const editingAddressId = ref<string | null>(null)
  const addressForm = ref<CheckoutAddressForm>(emptyAddressForm())
  const shippingMethod = ref<CheckoutShippingId>('express')
  const paymentMethod = ref<CheckoutPaymentId>('online')
  const placedOrderId = ref<string | null>(null)
  const lastOrderTotal = ref(0)

  const selectedAddress = computed(() =>
    addresses.value.find(a => a.id === selectedAddressId.value) ?? null,
  )

  const shippingOption = computed(() =>
    checkoutShippingOptions.find(o => o.id === shippingMethod.value),
  )

  const paymentOption = computed(() =>
    checkoutPaymentOptions.find(o => o.id === paymentMethod.value),
  )

  const shippingCost = computed(() => shippingOption.value?.price ?? 0)

  function goToStep(next: CheckoutStepId) {
    if (next > step.value) return
    step.value = next
  }

  function canGoNext(cartHasItems: boolean) {
    if (!cartHasItems && step.value === 0) return false
    if (step.value === 0) return cartHasItems
    if (step.value === 1) return !!selectedAddressId.value
    if (step.value === 2) return !!shippingMethod.value
    if (step.value === 3) return !!paymentMethod.value
    return true
  }

  function nextStep() {
    if (step.value < 4) {
      step.value = (step.value + 1) as CheckoutStepId
    }
  }

  function prevStep() {
    if (step.value > 0) {
      step.value = (step.value - 1) as CheckoutStepId
    }
  }

  function beginAddAddress() {
    editingAddressId.value = null
    addressForm.value = emptyAddressForm()
  }

  function beginEditAddress(id: string) {
    const address = addresses.value.find(a => a.id === id)
    if (!address) return
    editingAddressId.value = id
    addressForm.value = addressToForm(address)
  }

  function cancelAddressForm() {
    editingAddressId.value = null
    addressForm.value = emptyAddressForm()
  }

  function removeAddress(id: string) {
    const removed = addresses.value.find(a => a.id === id)
    let next = addresses.value.filter(a => a.id !== id)

    if (removed?.isDefault && next.length > 0) {
      next = next.map((a, index) => ({ ...a, isDefault: index === 0 }))
    }

    addresses.value = next

    if (selectedAddressId.value === id) {
      selectedAddressId.value = next.find(a => a.isDefault)?.id ?? next[0]?.id ?? ''
    }

    if (editingAddressId.value === id) {
      cancelAddressForm()
    }

    if (next.length === 0) {
      showAddressForm.value = true
    }
  }

  function addAddress(payload: Omit<CheckoutAddress, 'id'>) {
    const id = `a${Date.now()}`
    const next: CheckoutAddress = { ...payload, id }
    if (next.isDefault) {
      addresses.value = addresses.value.map(a => ({ ...a, isDefault: false }))
    }
    addresses.value = [...addresses.value, next]
    selectedAddressId.value = id
    showAddressForm.value = false
    addressForm.value = emptyAddressForm()
  }

  function submitAddressForm() {
    const f = addressForm.value
    if (!f.fullName.trim() || !f.phone.trim() || !f.address.trim()) return false

    const payload = {
      title: f.title.trim() || 'منزل',
      fullName: f.fullName.trim(),
      phone: f.phone.trim(),
      province: f.province.trim() || 'تهران',
      city: f.city.trim() || 'تهران',
      address: f.address.trim(),
      postalCode: f.postalCode.trim(),
    }

    if (editingAddressId.value) {
      const id = editingAddressId.value
      const prev = addresses.value.find(a => a.id === id)
      if (!prev) return false

      addresses.value = addresses.value.map(a =>
        a.id === id ? { ...payload, id, isDefault: prev.isDefault } : a,
      )
      editingAddressId.value = null
      addressForm.value = emptyAddressForm()
      showAddressForm.value = false
      return true
    }

    addAddress({
      ...payload,
      isDefault: addresses.value.length === 0,
    })
    return true
  }

  function placeOrder(total: number) {
    const id = `BZ-${Math.floor(100000 + Math.random() * 900000)}`
    placedOrderId.value = id
    lastOrderTotal.value = total
    return id
  }

  function resetAfterOrder() {
    step.value = 0
    placedOrderId.value = null
    lastOrderTotal.value = 0
  }

  return {
    step,
    addresses,
    selectedAddressId,
    showAddressForm,
    editingAddressId,
    addressForm,
    shippingMethod,
    paymentMethod,
    placedOrderId,
    lastOrderTotal,
    selectedAddress,
    shippingOption,
    paymentOption,
    shippingCost,
    goToStep,
    canGoNext,
    nextStep,
    prevStep,
    addAddress,
    beginAddAddress,
    beginEditAddress,
    cancelAddressForm,
    removeAddress,
    submitAddressForm,
    placeOrder,
    resetAfterOrder,
  }
})
