<template>
  <div class="flex flex-col h-full min-h-0">
    <div class="px-4 pt-1 pb-3 flex items-center justify-between gap-2 border-b border-muted">
      <UButton
        to="/cart"
        color="primary"
        variant="soft"
        size="sm"
        trailing-icon="i-tabler-chevron-left"
        class="font-medium cursor-pointer"
        @click="emit('close')"
      >
        {{ $t('برو به سبد خرید') }}
      </UButton>
    </div>

    <div class="px-4 pt-4 pb-2">
      <h3 class="text-base font-bold text-highlighted">
        {{ $t('خریدت رو کامل‌تر کن') }}
      </h3>
    </div>

    <div class="px-4 pb-4 flex-1 overflow-y-auto min-h-0">
      <div
        v-if="pending"
        class="py-8 text-center text-sm text-muted"
      >
        {{ $t('در حال بارگذاری...') }}
      </div>
      <template v-else-if="items.length">
        <TheProductRelatedAddRow
          v-for="item in items"
          :key="item.id"
          :product="item"
        />
      </template>
      <div
        v-else
        class="py-8 text-center text-sm text-muted"
      >
        {{ $t('محصول مرتبطی یافت نشد') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/data/products'

defineProps<{
  items: Product[]
  pending?: boolean
}>()

const emit = defineEmits<{
  close: []
}>()
</script>
