/** Pages that replace navbar + bottom nav with a mobile back header. */
const BACKWARD_EXACT = new Set(['/notifications', '/compare'])

export function useMobileBackward() {
  const route = useRoute()
  const router = useRouter()
  const { t } = useI18n()
  const titleOverride = useState<string | null>('mobileBackwardTitle', () => null)
  const titleOwner = useState<string | null>('mobileBackwardTitleOwner', () => null)
  const { cartLines } = useShop()
  const checkout = useCheckoutStore()
  const { step, placedOrderId } = storeToRefs(checkout)

  const isEmptyCartLanding = computed(() =>
    cartLines.value.length === 0 && step.value === 0 && !placedOrderId.value,
  )

  const isBackwardPage = computed(() => {
    const path = route.path.replace(/\/$/, '') || '/'
    // Empty cart: keep main header + bottom nav on mobile
    if (path === '/cart') return !isEmptyCartLanding.value
    if (BACKWARD_EXACT.has(path)) return true
    return /^\/product\/[^/]+$/.test(path)
  })

  const title = computed(() => {
    if (titleOverride.value) return titleOverride.value
    const path = route.path.replace(/\/$/, '') || '/'
    if (path === '/cart') return t('سبد خرید')
    if (path === '/notifications') return t('اعلان‌ها')
    if (path === '/compare') return t('مقایسه محصولات')
    return t('جزئیات محصول')
  })

  function setTitle(value: string | null, owner?: string) {
    if (owner) titleOwner.value = owner
    titleOverride.value = value
  }

  function clearTitle(owner?: string) {
    if (owner && titleOwner.value !== owner) return
    titleOverride.value = null
    if (!owner || titleOwner.value === owner) titleOwner.value = null
  }

  function goBack() {
    if (import.meta.client && window.history.length > 1) {
      router.back()
      return
    }
    navigateTo('/')
  }

  return {
    isBackwardPage,
    title,
    setTitle,
    clearTitle,
    goBack,
  }
}

/** Bind a reactive title while the page is mounted. */
export function useMobileBackwardTitle(source: MaybeRefOrGetter<string | null | undefined>) {
  const { setTitle, clearTitle } = useMobileBackward()
  const owner = useId()

  watch(
    () => toValue(source),
    (value) => {
      setTitle(value?.trim() ? value : null, owner)
    },
    { immediate: true },
  )

  onBeforeUnmount(() => {
    clearTitle(owner)
  })
}
