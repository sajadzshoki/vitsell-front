<template>
  <header class="lg:hidden flex items-center gap-2 mb-4 py-1 sticky top-[var(--account-nav-offset,0px)] z-20 bg-muted/95 backdrop-blur-sm -mx-1">
    <UButton
      type="button"
      color="neutral"
      variant="ghost"
      size="lg"
      icon="i-tabler-arrow-right"
      :aria-label="$t('بازگشت به پیشخوان')"
      class="shrink-0"
      @click="navigateTo('/seller')"
    />
    <h1 class="text-base font-bold text-highlighted truncate">
      {{ $t(title || '') }}
    </h1>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>
