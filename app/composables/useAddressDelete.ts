export function useAddressDelete() {
  const open = useState('address-delete-open', () => false)
  const pendingId = useState<string | null>('address-delete-id', () => null)
  const deleting = useState('address-delete-busy', () => false)

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
    if (deleting.value) return
    open.value = false
    pendingId.value = null
  }

  async function confirmDelete() {
    const id = pendingId.value
    if (!id || deleting.value) return null

    const wasEditing = checkoutStore.editingAddressId === id
    deleting.value = true
    try {
      const { ok, error } = await checkoutStore.removeAddress(id)
      if (!ok) {
        return { id, wasEditing, ok: false as const, error }
      }
      open.value = false
      pendingId.value = null
      return { id, wasEditing, ok: true as const, error: null }
    }
    finally {
      deleting.value = false
    }
  }

  return {
    open,
    pendingId,
    pendingAddress,
    deleting,
    requestDelete,
    cancelDelete,
    confirmDelete,
  }
}
