<template>
  <section
    v-if="pending || products.length"
    class="mt-6 md:mt-10"
  >
    <div class="flex items-center justify-between mb-3.5 md:mb-5 gap-3">
      <div class="min-w-0">
        <h2 class="text-base md:text-lg font-bold text-highlighted">
          {{ title }}
        </h2>
        <p
          v-if="subtitle"
          class="text-xs text-muted mt-1 leading-5"
        >
          {{ subtitle }}
        </p>
      </div>
      <UButton
        v-if="viewAllTo && products.length >= 6"
        :to="viewAllTo"
        color="primary"
        variant="link"
        size="sm"
        trailing-icon="i-tabler-arrow-left"
        class="font-medium shrink-0"
      >
        {{ $t('مشاهده همه') }}
      </UButton>
    </div>

    <div
      v-if="pending && !products.length"
      class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4"
    >
      <div
        v-for="i in 6"
        :key="i"
        class="rounded-2xl border border-muted bg-muted/40 aspect-[3/4] animate-pulse"
      />
    </div>

    <div
      v-else
      :class="showcase
        ? 'grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4'
        : 'grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4'"
    >
      <TheProductStoreCard
        v-for="product in products"
        :key="product.id"
        :product="product"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Product } from '~/data/products'

const { showcase } = useProductCardStyle()

withDefaults(defineProps<{
  title: string
  subtitle?: string
  products: Product[]
  pending?: boolean
  viewAllTo?: string | Record<string, unknown>
}>(), {
  pending: false,
})
</script>
