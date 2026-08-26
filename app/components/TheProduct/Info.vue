<template>
  <div>
    <div class="flex items-center gap-3 pb-4 mb-4 border-b border-muted flex-wrap">
      <div class="flex items-center gap-1 bg-warning/10 text-warning rounded-lg px-2 py-1">
        <UIcon name="i-tabler-star-filled" class="size-4" />
        <span class="text-sm font-bold num">
          {{ product.rating.toLocaleString('fa-IR') }}
        </span>
      </div>
      <span class="text-xs text-muted num">
        {{ product.reviews.toLocaleString('fa-IR') }} {{ $t('دیدگاه ثبت شده') }}
      </span>
      <span class="size-1 rounded-full bg-accented" />
      <UButton
        variant="link"
        color="primary"
        size="xs"
        class="p-0"
        @click="emit('open-reviews')"
      >
        {{ $t('مشاهده نظرات') }}
      </UButton>
    </div>

    <div
      v-if="product.colors?.length"
      class="mb-5"
    >
      <div class="text-xs text-muted mb-2">
        {{ $t('رنگ') }}:
        <span class="text-highlighted font-medium">
          {{ product.colors[colorIndex]?.name }}
        </span>
      </div>
      <div class="flex items-center gap-2">
        <button
          v-for="(c, i) in product.colors"
          :key="c.name"
          type="button"
          class="size-9 rounded-full border-2 grid place-items-center transition"
          :class="colorIndex === i ? 'border-primary' : 'border-muted'"
          :aria-label="c.name"
          @click="colorIndex = i"
        >
          <span
            class="size-7 rounded-full block border border-muted"
            :style="{ backgroundColor: c.hex }"
          />
        </button>
      </div>
    </div>

    <p
      v-if="product.shortDesc"
      class="text-sm text-toned leading-7 mb-5"
    >
      {{ product.shortDesc }}
    </p>

    <ul class="space-y-2 mb-5">
      <li
        v-for="feature in features"
        :key="feature"
        class="flex items-center gap-2 text-xs text-toned"
      >
        <UIcon name="i-tabler-check" class="size-4 text-success shrink-0" />
        {{ $t(feature) }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { productDetailFeatures } from '~/data/product-detail'
import type { Product } from '~/data/products'

defineProps<{
  product: Product
}>()

const emit = defineEmits<{
  'open-reviews': []
}>()

const colorIndex = defineModel<number>('colorIndex', { default: 0 })

const features = productDetailFeatures
</script>
