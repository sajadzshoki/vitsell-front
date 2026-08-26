export function useAddressDelete() {
  const open = useState('address-delete-open', () => false)
  const pendingId = useState<string | null>('address-delete-id', () => null)

  const checkoutStore = useCheckoutStore()

  const pendingAddress = computed(() =>
    pendingId.value
      ? checkoutStore.addresses.find(a => a.id === pendingId.value) ?? null
      : null,
  )

  function requestDelete(id: string) {
    pendingId.value = id
    open.value = true
  }

  function cancelDelete() {
    open.value = false
    pendingId.value = null
  }

  function confirmDelete() {
    const id = pendingId.value
    if (!id) return null

    const wasEditing = checkoutStore.editingAddressId === id
    checkoutStore.removeAddress(id)
    cancelDelete()

    return { id, wasEditing }
  }

  return {
    open,
    pendingId,
    pendingAddress,
    requestDelete,
    cancelDelete,
    confirmDelete,
  }
}
