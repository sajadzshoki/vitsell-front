/**
 * Show carousel arrows only from md up, and only when item count
 * exceeds visible slides (mobile-first: base / sm / md / lg / xl).
 * On phone, swipe/drag only — no prev/next buttons.
 */
export function useShowCarouselArrows(
  itemCount: MaybeRefOrGetter<number>,
  perView: MaybeRefOrGetter<readonly [number, number, number, number, number]> = [2, 3, 4, 5, 6],
) {
  const breakpoints = useBreakpoints({
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  })

  const isXl = breakpoints.greaterOrEqual('xl')
  const isLg = breakpoints.greaterOrEqual('lg')
  const isMd = breakpoints.greaterOrEqual('md')
  const isSm = breakpoints.greaterOrEqual('sm')

  /** Avoid SSR/client mismatch: decide after mount */
  const ready = ref(false)
  onMounted(() => {
    ready.value = true
  })

  const visible = computed(() => {
    const [base, sm, md, lg, xl] = toValue(perView)
    if (isXl.value) return xl
    if (isLg.value) return lg
    if (isMd.value) return md
    if (isSm.value) return sm
    return base
  })

  const showArrows = computed(() => {
    if (!ready.value) return false
    // Phone / narrow: swipe only (same UX as CircleStrip on mobile)
    if (!isMd.value) return false
    return toValue(itemCount) > visible.value
  })

  return { showArrows, visible }
}
