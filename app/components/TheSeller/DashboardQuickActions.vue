<template>
  <div
    v-if="actions.length"
    class="bg-default border border-muted rounded-2xl p-5"
  >
    <h3 class="font-bold text-highlighted mb-4">
      {{ $t('دسترسی سریع') }}
    </h3>
    <div class="grid grid-cols-2 md:grid-cols-5 gap-2">
      <UButton
        v-for="action in actions"
        :key="action.id"
        :to="action.to"
        color="neutral"
        variant="soft"
        class="justify-start cursor-pointer"
        :icon="action.icon"
      >
        {{ $t(action.label) }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SellerQuickAction } from '~/data/seller-dashboard'

defineProps<{
  actions: SellerQuickAction[]
}>()
</script>
