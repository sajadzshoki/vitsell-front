export function useProductCardStyle() {
  const { site } = useSiteSettings()

  const showcase = computed(() => site.value.productCardStyle === 'showcase')

  const carouselPerView = computed((): [number, number, number, number, number] =>
    showcase.value ? [1, 2, 3, 4, 5] : [2, 3, 4, 5, 6],
  )

  const carouselItemClass = computed(() =>
    showcase.value
      ? 'basis-[76%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 ps-3 first:ps-0 flex'
      : 'basis-[48%] sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 ps-3 first:ps-0 flex',
  )

  return {
    showcase,
    carouselPerView,
    carouselItemClass,
  }
}
