<script setup lang="ts" generic="T">
/**
 * UCarousel wrapper: arrows from md up only, and only when items overflow.
 */
const props = withDefaults(defineProps<{
  items: T[]
  /** When false, never show arrows. When true, show only if overflow. */
  arrows?: boolean
  /** Visible slides at base / sm / md / lg / xl */
  perView?: [number, number, number, number, number]
}>(), {
  arrows: true,
  perView: () => [2, 3, 4, 5, 6],
})

defineOptions({ inheritAttrs: false })

const { showArrows } = useShowCarouselArrows(
  () => props.items?.length ?? 0,
  () => props.perView,
)

const arrowsEnabled = computed(() => Boolean(props.arrows) && showArrows.value)
</script>

<template>
  <UCarousel
    v-bind="$attrs"
    :items="items"
    :arrows="arrowsEnabled"
  >
    <template #default="slotProps">
      <slot v-bind="slotProps" />
    </template>
  </UCarousel>
</template>
