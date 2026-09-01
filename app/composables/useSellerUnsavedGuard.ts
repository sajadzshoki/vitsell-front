/**
 * Shared unsaved-changes navigation guard for seller forms.
 * Call markClean() after successful save / initial load snapshot.
 */
export function useSellerUnsavedGuard(isDirty: Ref<boolean> | ComputedRef<boolean>, message?: string) {
  const { t } = useI18n()
  const allowLeave = ref(false)

  function markClean() {
    allowLeave.value = false
  }

  function allowNextNavigation() {
    allowLeave.value = true
  }

  onBeforeRouteLeave(() => {
    if (allowLeave.value || !toValue(isDirty)) {
      allowLeave.value = false
      return true
    }
    // eslint-disable-next-line no-alert
    const ok = window.confirm(message || t('تغییرات ذخیره نشده دارید. خارج می‌شوید؟'))
    if (ok) allowLeave.value = false
    return ok
  })

  return {
    allowLeave,
    markClean,
    allowNextNavigation,
  }
}
