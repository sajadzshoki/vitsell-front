<template>
  <section>
    <div class="flex items-center justify-between mb-5 gap-3">
      <div>
        <h2 class="text-lg md:text-xl font-bold text-highlighted">
          {{ $t('محصولات پرطرفدار') }}
        </h2>
        <p class="text-xs text-muted mt-1">
          {{ $t('پرفروش‌ترین کالاهای این دسته') }}
        </p>
      </div>
      <UButton
        :to="viewAllRoute"
        color="primary"
        variant="link"
        size="sm"
        trailing-icon="i-tabler-arrow-left"
        class="font-medium shrink-0"
      >
        {{ $t('مشاهده همه') }}
      </UButton>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4">
      <TheProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
        compact
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Product } from '~/data/products'

defineProps<{
  products: Product[]
  viewAllRoute: string | { path: string, query?: Record<string, string> }
}>()
</script>
