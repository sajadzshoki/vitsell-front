<template>
  <section v-if="products.length">
    <div class="flex items-center justify-between mb-5 gap-3">
      <div>
        <h2 class="text-lg md:text-xl font-bold text-highlighted">
          {{ $t('پرفروش‌ترین‌ها') }}
        </h2>
        <p class="text-xs text-muted mt-1">
          {{ $t('محبوب‌ترین محصولات این هفته در بازار') }}
        </p>
      </div>
      <UButton
        to="/search/category-mobile"
        color="primary"
        variant="link"
        size="sm"
        trailing-icon="i-tabler-arrow-left"
        class="font-medium shrink-0"
      >
        {{ $t('مشاهده همه') }}
      </UButton>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
      <TheProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
const { bestSellers, catalogProducts } = useHome()

const products = computed(() => {
  const list = bestSellers.value.length ? bestSellers.value : catalogProducts.value
  return list.slice(0, 10)
})
</script>
