import {
  checkoutPaymentOptions,
  checkoutShippingOptions,
  addressToForm,
  emptyAddressForm,
  type CheckoutAddress,
  type CheckoutAddressForm,
  type CheckoutPaymentId,
  type CheckoutShippingId,
  type CheckoutStepId,
} from '~/data/checkout'
import type { ShopOrder } from '~/data/account'

export const useCheckoutStore = defineStore('checkout', () => {
  const { site } = useSiteSettings()
  const { cartSubtotal } = useShop()

  const step = ref<CheckoutStepId>(0)
  const addresses = ref<CheckoutAddress[]>([])
  const selectedAddressId = ref('')
  const showAddressForm = ref(true)
  const editingAddressId = ref<string | null>(null)
  const addressForm = ref<CheckoutAddressForm>(emptyAddressForm())
  const shippingMethod = ref<CheckoutShippingId>('express')
  const paymentMethod = ref<CheckoutPaymentId>('online')
  const placedOrderId = ref<string | null>(null)
  const lastOrderTotal = ref(0)
  const addressesLoaded = ref(false)

  const selectedAddress = computed(() =>
    addresses.value.find(a => a.id === selectedAddressId.value) ?? null,
  )

  const shippingOption = computed(() =>
    checkoutShippingOptions.find(o => o.id === shippingMethod.value),
  )

  const paymentOptions = computed(() =>
    checkoutPaymentOptions.filter((option) => {
      if (option.id === 'online') return site.value.onlinePaymentEnabled !== false
      if (option.id === 'cod') return site.value.codPaymentEnabled !== false
      if (option.id === 'installment') return site.value.installmentPaymentEnabled !== false
      return true
    }),
  )

  const paymentOption = computed(() =>
    paymentOptions.value.find(o => o.id === paymentMethod.value),
  )

  watch(
    paymentOptions,
    (options) => {
      if (!options.length) return
      if (!options.some(o => o.id === paymentMethod.value)) {
        paymentMethod.value = options[0]!.id
      }
    },
    { immediate: true },
  )

  const shippingCost = computed(() => {
    const base = shippingOption.value?.price ?? 0
    if (!base || shippingMethod.value === 'pickup') return 0
    const threshold = Number(site.value.freeShippingThreshold) || 0
    if (threshold > 0 && cartSubtotal.value >= threshold) {
      if (shippingMethod.value === 'express') return Math.min(base, 45_000)
      return 0
    }
    return base
  })

  async function fetchAddresses() {
    const { result, error } = await useGet<CheckoutAddress[]>('/account/addresses', {
      headers: { 'no-error': true },
    })
    if (error) {
      return { result: null as CheckoutAddress[] | null, error }
    }
    addresses.value = Array.isArray(result) ? result : []
    addressesLoaded.value = true
    const stillSelected = addresses.value.some(a => a.id === selectedAddressId.value)
    if (!stillSelected) {
      selectedAddressId.value =
        addresses.value.find(a => a.isDefault)?.id
        ?? addresses.value[0]?.id
        ?? ''
    }
    showAddressForm.value = addresses.value.length === 0
    return { result: addresses.value, error: null as null }
  }

  function goToStep(next: CheckoutStepId) {
    if (next > step.value) return
    step.value = next
  }

  function canGoNext(cartHasItems: boolean) {
    if (!cartHasItems && step.value === 0) return false
    if (step.value === 0) return cartHasItems
    if (step.value === 1) return !!selectedAddressId.value
    if (step.value === 2) return !!shippingMethod.value
    if (step.value === 3) return !!paymentMethod.value && paymentOptions.value.length > 0
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

  async function removeAddress(id: string) {
    const { error } = await useDelete(`/account/addresses/${encodeURIComponent(id)}`, {
      headers: { 'no-error': true },
    })
    if (error) return { ok: false as const, error }
    await fetchAddresses()
    if (editingAddressId.value === id) cancelAddressForm()
    return { ok: true as const, error: null }
  }

  async function submitAddressForm() {
    const f = addressForm.value
    if (!f.fullName.trim() || !f.phone.trim() || !f.address.trim()) {
      return { ok: false as const, error: null }
    }

    const editingId = editingAddressId.value
    const existing = editingId
      ? addresses.value.find(a => a.id === editingId)
      : null

    const payload = {
      title: f.title.trim() || 'منزل',
      fullName: f.fullName.trim(),
      phone: f.phone.trim(),
      province: f.province.trim() || 'تهران',
      city: f.city.trim() || 'تهران',
      address: f.address.trim(),
      postalCode: f.postalCode.trim(),
      isDefault: existing?.isDefault ?? addresses.value.length === 0,
    }

    if (editingId) {
      const { result, error } = await usePut<CheckoutAddress>(
        `/account/addresses/${encodeURIComponent(editingId)}`,
        payload,
        { headers: { 'no-error': true } },
      )
      if (error || !result) return { ok: false as const, error }
    }
    else {
      const { result, error } = await usePost<CheckoutAddress>('/account/addresses', payload, {
        headers: { 'no-error': true },
      })
      if (error || !result) return { ok: false as const, error }
      selectedAddressId.value = result.id
    }

    editingAddressId.value = null
    addressForm.value = emptyAddressForm()
    showAddressForm.value = false
    await fetchAddresses()
    return { ok: true as const, error: null }
  }

  async function placeOrder(total: number, discountCode?: string | null) {
    if (!selectedAddressId.value) return null

    const { result, error } = await usePost<{
      order?: ShopOrder
      orderId?: string
      paymentUrl?: string
    }>('/checkout/place', {
      addressId: selectedAddressId.value,
      shippingMethod: shippingMethod.value,
      paymentMethod: paymentMethod.value,
      ...(discountCode ? { discountCode } : {}),
      ...(import.meta.client ? { returnOrigin: window.location.origin } : {}),
    }, { headers: { 'no-error': true } })

    if (error || !result) return null

    if (result.paymentUrl) {
      if (import.meta.client) {
        window.location.href = result.paymentUrl
      }
      placedOrderId.value = result.orderId ?? null
      lastOrderTotal.value = total
      return result.orderId ?? null
    }

    const id = result.order?.id ?? result.orderId ?? null
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
    addressesLoaded,
    selectedAddress,
    shippingOption,
    paymentOptions,
    paymentOption,
    shippingCost,
    fetchAddresses,
    goToStep,
    canGoNext,
    nextStep,
    prevStep,
    beginAddAddress,
    beginEditAddress,
    cancelAddressForm,
    removeAddress,
    submitAddressForm,
    placeOrder,
    resetAfterOrder,
  }
})
