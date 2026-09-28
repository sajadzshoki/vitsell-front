<template>
  <header
    class="md:hidden sticky top-0 z-40 flex items-center gap-2 px-3 sm:px-4 py-2 bg-default/95 backdrop-blur-md border-b border-muted"
  >
    <UButton
      type="button"
      color="neutral"
      variant="ghost"
      size="lg"
      icon="i-tabler-arrow-right"
      :aria-label="$t('بازگشت')"
      class="shrink-0 size-11"
      @click="goBack"
    />
    <p class="flex-1 min-w-0 text-sm font-500 text-highlighted truncate text-start">
      {{ title }}
    </p>
    <div
      v-if="$slots.trailing"
      class="shrink-0 flex items-center gap-1"
    >
      <slot name="trailing" />
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  title: string
}>()

const { goBack } = useMobileBackward()
</script>
