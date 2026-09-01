<template>
  <div class="text-center py-12 px-4">
    <UIcon
      :name="icon"
      class="size-16 text-dimmed mx-auto mb-4"
    />
    <p
      v-if="title"
      class="text-sm font-medium text-highlighted mb-1"
    >
      {{ title }}
    </p>
    <p class="text-sm text-muted mb-4">
      {{ message }}
    </p>
    <div
      v-if="$slots.actions"
      class="flex items-center justify-center gap-2 flex-wrap"
    >
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  icon?: string
  title?: string
  message?: string
}>(), {
  icon: 'i-tabler-inbox',
  title: '',
  message: 'موردی یافت نشد',
})
</script>
