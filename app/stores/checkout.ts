import {
  checkoutPaymentOptions,
  checkoutShippingOptions,
  shippingOptionIcon,
  addressToForm,
  emptyAddressForm,
  type CheckoutAddress,
  type CheckoutAddressForm,
  type CheckoutAvailabilityDay,
  type CheckoutPaymentId,
  type CheckoutShippingId,
  type CheckoutShippingOption,
  type CheckoutStepId,
} from '~/data/checkout'
import type { ShopOrder } from '~/data/account'

type StorefrontShippingMethod = {
  id: string
  name: string
  carrier?: string
  estimatedDays?: string
  baseCost?: number
  coverage?: 'nationwide' | 'cities'
  slotsEnabled?: boolean
  expressEnabled?: boolean
  expressPrice?: number
  expressDeadlineHour?: number
}

type AvailabilityResponse = {
  methodId: string
  basePrice: number
  express: {
    enabled: boolean
    available: boolean
    price: number
    deadlineHour: number
  }
  days: CheckoutAvailabilityDay[]
}

export const useCheckoutStore = defineStore('checkout', () => {
  const { site } = useSiteSettings()
  const { cartSubtotal, cartLines } = useShop()

  const step = ref<CheckoutStepId>(0)
  const addresses = ref<CheckoutAddress[]>([])
  const selectedAddressId = ref('')
  const showAddressForm = ref(true)
  const editingAddressId = ref<string | null>(null)
  const addressForm = ref<CheckoutAddressForm>(emptyAddressForm())
  const shippingMethod = ref<CheckoutShippingId>('')
  const paymentMethod = ref<CheckoutPaymentId>('online')
  const placedOrderId = ref<string | null>(null)
  const lastOrderTotal = ref(0)
  const addressesLoaded = ref(false)
  const shippingOptions = ref<CheckoutShippingOption[]>([...checkoutShippingOptions])
  const shippingMethodsLoaded = ref(false)

  const shippingSlotDate = ref('')
  const shippingSlotStart = ref('')
  const shippingSlotEnd = ref('')
  const shippingIsExpress = ref(false)
  const availabilityDays = ref<CheckoutAvailabilityDay[]>([])
  const availabilityLoading = ref(false)
  const expressAvailable = ref(false)
  const expressPrice = ref(0)
  const expressDeadlineHour = ref(12)
  const slotPriceOverride = ref<number | null>(null)

  const selectedAddress = computed(() =>
    addresses.value.find(a => a.id === selectedAddressId.value) ?? null,
  )

  const hasShippingMethod = computed(() =>
    Boolean(shippingMethod.value)
    && shippingOptions.value.some(o => o.id === shippingMethod.value),
  )

  const shippingOption = computed(() =>
    shippingOptions.value.find(o => o.id === shippingMethod.value) ?? null,
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
    if (!hasShippingMethod.value) return 0
    if (shippingIsExpress.value && expressAvailable.value) {
      return expressPrice.value
    }
    if (slotPriceOverride.value != null) return slotPriceOverride.value
    const option = shippingOption.value
    if (!option) return 0
    const base = option.price ?? 0
    const id = option.id || shippingMethod.value
    if (!base || id.includes('pickup') || option.name.includes('حضوری')) return 0
    const threshold = Number(site.value.freeShippingThreshold) || 0
    if (threshold > 0 && cartSubtotal.value >= threshold) return 0
    return base
  })

  const cartProductIds = computed(() =>
    (cartLines.value || []).map(line => String(line.product?.id || '')).filter(Boolean),
  )

  function clearSlotSelection() {
    shippingSlotDate.value = ''
    shippingSlotStart.value = ''
    shippingSlotEnd.value = ''
    shippingIsExpress.value = false
    slotPriceOverride.value = null
    availabilityDays.value = []
    expressAvailable.value = false
  }

  async function fetchShippingMethods() {
    const address = selectedAddress.value
    const query: Record<string, string> = {}
    if (address?.province) query.province = address.province
    if (address?.city) query.city = address.city

    const { result, error } = await useGet<{ items?: StorefrontShippingMethod[] }>(
      '/shipping-methods',
      { query, headers: { 'no-error': true } },
    )
    const items = Array.isArray(result?.items) ? result.items : []
    if (!error && items.length) {
      shippingOptions.value = items.map(row => ({
        id: String(row.id),
        name: String(row.name || row.id),
        desc: [row.carrier, row.estimatedDays].filter(Boolean).join(' · '),
        price: Math.max(0, Math.round(Number(row.baseCost) || 0)),
        icon: shippingOptionIcon(String(row.id), String(row.name || '')),
        coverage: row.coverage === 'cities' ? 'cities' : 'nationwide',
        slotsEnabled: Boolean(row.slotsEnabled),
        expressEnabled: Boolean(row.expressEnabled),
        expressPrice: Math.max(0, Math.round(Number(row.expressPrice) || 0)),
        expressDeadlineHour: Math.min(23, Math.max(0, Number(row.expressDeadlineHour) || 12)),
      }))
    }
    else if (!shippingOptions.value.length) {
      shippingOptions.value = [...checkoutShippingOptions]
    }
    shippingMethodsLoaded.value = true
    if (shippingMethod.value && !shippingOptions.value.some(o => o.id === shippingMethod.value)) {
      shippingMethod.value = ''
      clearSlotSelection()
    }
    if (hasShippingMethod.value && shippingOption.value?.slotsEnabled) {
      await fetchAvailability()
    }
    else if (!hasShippingMethod.value) {
      clearSlotSelection()
    }
    return { error: error ?? null }
  }

  async function fetchAvailability() {
    const methodId = shippingMethod.value
    const opt = shippingOptions.value.find(o => o.id === methodId)
    if (!opt?.slotsEnabled) {
      clearSlotSelection()
      return
    }

    availabilityLoading.value = true
    try {
      const address = selectedAddress.value
      const query: Record<string, string> = {
        days: '7',
      }
      if (address?.province) query.province = address.province
      if (address?.city) query.city = address.city
      if (cartProductIds.value.length) query.productIds = cartProductIds.value.join(',')

      const { result, error } = await useGet<AvailabilityResponse>(
        `/shipping-methods/${encodeURIComponent(methodId)}/availability`,
        { query, headers: { 'no-error': true } },
      )
      if (error || !result) {
        availabilityDays.value = []
        expressAvailable.value = false
        return
      }

      availabilityDays.value = Array.isArray(result.days) ? result.days : []
      expressAvailable.value = Boolean(result.express?.available)
      expressPrice.value = Math.max(0, Math.round(Number(result.express?.price) || 0))
      expressDeadlineHour.value = Math.min(23, Math.max(0, Number(result.express?.deadlineHour) || 12))

      if (!expressAvailable.value) shippingIsExpress.value = false

      // Keep selection if still valid
      const day = availabilityDays.value.find(d => d.date === shippingSlotDate.value)
      if (!day || day.isClosed) {
        const first = availabilityDays.value.find(d => d.hasSelectable)
        shippingSlotDate.value = first?.date || ''
        shippingSlotStart.value = ''
        shippingSlotEnd.value = ''
        slotPriceOverride.value = null
      }
      else if (shippingSlotStart.value) {
        const slot = day.slots.find(
          s => s.startTime === shippingSlotStart.value && s.endTime === shippingSlotEnd.value,
        )
        if (!slot?.selectable) {
          shippingSlotStart.value = ''
          shippingSlotEnd.value = ''
          slotPriceOverride.value = null
        }
        else {
          slotPriceOverride.value = slot.price
        }
      }
    }
    finally {
      availabilityLoading.value = false
    }
  }

  async function selectShippingMethod(id: string) {
    shippingMethod.value = id
    shippingSlotDate.value = ''
    shippingSlotStart.value = ''
    shippingSlotEnd.value = ''
    shippingIsExpress.value = false
    slotPriceOverride.value = null
    if (shippingOptions.value.find(o => o.id === id)?.slotsEnabled) {
      await fetchAvailability()
    }
    else {
      clearSlotSelection()
    }
  }

  async function selectShippingDay(date: string) {
    shippingSlotDate.value = date
    shippingSlotStart.value = ''
    shippingSlotEnd.value = ''
    slotPriceOverride.value = null
  }

  function selectShippingSlot(start: string, end: string) {
    shippingSlotStart.value = start
    shippingSlotEnd.value = end
    const day = availabilityDays.value.find(d => d.date === shippingSlotDate.value)
    const slot = day?.slots.find(s => s.startTime === start && s.endTime === end)
    slotPriceOverride.value = slot?.price ?? null
  }

  async function setShippingExpress(value: boolean) {
    shippingIsExpress.value = value && expressAvailable.value
    if (shippingIsExpress.value) {
      const today = availabilityDays.value.find(d => d.hasSelectable)
      // Prefer first selectable today
      const todayKey = availabilityDays.value[0]?.date
      const day = availabilityDays.value.find(d => d.date === todayKey && d.hasSelectable)
        || today
      if (day) {
        shippingSlotDate.value = day.date
        const slot = day.slots.find(s => s.selectable)
        if (slot) {
          shippingSlotStart.value = slot.startTime
          shippingSlotEnd.value = slot.endTime
        }
      }
    }
  }

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
    if (step.value === 2) {
      if (!shippingMethod.value) return false
      const opt = shippingOptions.value.find(o => o.id === shippingMethod.value)
      if (opt?.slotsEnabled) {
        return Boolean(shippingSlotDate.value && shippingSlotStart.value && shippingSlotEnd.value)
      }
      return true
    }
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

    const payload: Record<string, unknown> = {
      addressId: selectedAddressId.value,
      shippingMethod: shippingMethod.value,
      paymentMethod: paymentMethod.value,
      ...(discountCode ? { discountCode } : {}),
      ...(import.meta.client ? { returnOrigin: window.location.origin } : {}),
    }

    const opt = shippingOptions.value.find(o => o.id === shippingMethod.value)
    if (opt?.slotsEnabled) {
      payload.shippingSlotDate = shippingSlotDate.value
      payload.shippingSlotStart = shippingSlotStart.value
      payload.shippingSlotEnd = shippingSlotEnd.value
      payload.shippingIsExpress = shippingIsExpress.value
    }

    const { result, error } = await usePost<{
      order?: ShopOrder
      orderId?: string
      paymentUrl?: string
    }>('/checkout/place', payload, { headers: { 'no-error': true } })

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
    clearSlotSelection()
  }

  watch(selectedAddressId, () => {
    if (step.value >= 2) void fetchShippingMethods()
  })

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
    shippingOptions,
    shippingMethodsLoaded,
    hasShippingMethod,
    shippingCost,
    shippingSlotDate,
    shippingSlotStart,
    shippingSlotEnd,
    shippingIsExpress,
    availabilityDays,
    availabilityLoading,
    expressAvailable,
    expressPrice,
    expressDeadlineHour,
    fetchAddresses,
    fetchShippingMethods,
    fetchAvailability,
    selectShippingMethod,
    selectShippingDay,
    selectShippingSlot,
    setShippingExpress,
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
