<template>
  <div class="flex flex-col sm:(flex-row items-start justify-between) gap-3 mb-5">
    <div class="min-w-0">
      <h2 class="font-bold text-highlighted text-base md:text-lg">
        {{ title }}
      </h2>
      <p
        v-if="description"
        class="text-xs text-muted mt-1 leading-6"
      >
        {{ description }}
      </p>
      <p
        v-if="countLabel"
        class="text-xs text-muted mt-1 num"
      >
        {{ countLabel }}
      </p>
    </div>
    <div
      v-if="$slots.actions"
      class="flex items-center gap-2 shrink-0 w-full sm:w-auto"
    >
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description?: string
  countLabel?: string
}>()
</script>
