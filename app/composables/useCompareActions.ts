export function useCompareActions() {
  const { t } = useI18n()
  const toast = useAppToast()
  const compareStore = useCompareStore()

  function toggleCompare(id: string) {
    const result = compareStore.toggleCompare(id)

    if (result === 'limit') {
      toast.warning(t('حداکثر ۴ محصول قابل مقایسه است'))
      return result
    }

    if (result === 'added') {
      toast.success(t('به لیست مقایسه اضافه شد'))
    }

    return result
  }

  return {
    compareStore,
    toggleCompare,
    isInCompare: compareStore.isInCompare,
    compareCount: computed(() => compareStore.count),
    hasCompareItems: computed(() => compareStore.hasItems),
  }
}
