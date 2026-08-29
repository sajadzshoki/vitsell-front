/** Pages that replace navbar + bottom nav with a mobile back header. */
const BACKWARD_EXACT = new Set(['/cart', '/notifications', '/compare'])

export function useMobileBackward() {
  const route = useRoute()
  const router = useRouter()
  const { t } = useI18n()
  const titleOverride = useState<string | null>('mobileBackwardTitle', () => null)
  const titleOwner = useState<symbol | null>('mobileBackwardTitleOwner', () => null)

  const isBackwardPage = computed(() => {
    const path = route.path.replace(/\/$/, '') || '/'
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

  function setTitle(value: string | null, owner?: symbol) {
    if (owner) titleOwner.value = owner
    titleOverride.value = value
  }

  function clearTitle(owner?: symbol) {
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
  const owner = Symbol('mobileBackwardTitle')

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
