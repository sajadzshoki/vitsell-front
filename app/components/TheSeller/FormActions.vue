<template>
  <!-- Spacer so page content is not covered by the fixed bar -->
  <div
    class="shrink-0"
    :style="{ height: 'calc(4.75rem + env(safe-area-inset-bottom, 0px))' }"
    aria-hidden="true"
  />
  <div
    class="fixed inset-x-0 bottom-0 z-40 border-t border-default bg-default/95 backdrop-blur-md"
    style="padding-bottom: env(safe-area-inset-bottom, 0px)"
  >
    <div
      class="mx-auto w-full px-3 sm:px-4 lg:px-6 py-3 flex items-center gap-3 flex-wrap"
      :class="justifyClass"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  /** `start` = primary then cancel (most forms); `between` = cancel / save split */
  justify?: 'start' | 'between' | 'end'
}>(), {
  justify: 'start',
})

const justifyClass = computed(() => {
  if (props.justify === 'between') return 'justify-between'
  if (props.justify === 'end') return 'justify-end'
  return 'justify-start'
})
</script>
