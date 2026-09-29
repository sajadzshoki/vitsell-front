<template>
  <section
    v-if="preview.length"
    class="bg-default border border-muted rounded-2xl p-4 sm:p-5"
  >
    <div class="flex items-center justify-between gap-3 mb-4">
      <h3 class="font-bold text-highlighted">{{ $t('علاقه‌مندی‌های اخیر') }}</h3>
      <NuxtLink
        to="/account/wishlist"
        class="text-xs text-primary font-medium hover:underline cursor-pointer"
      >
        {{ $t('مشاهده همه') }}
        <UIcon
          name="i-tabler-chevron-left"
          class="size-3.5 inline-block align-[-2px]"
        />
      </NuxtLink>
    </div>

    <div :class="showcase
      ? 'grid grid-cols-1 min-[480px]:grid-cols-2 gap-3'
      : 'grid grid-cols-2 sm:grid-cols-4 gap-3'"
    >
      <TheProductStoreCard
        v-for="product in preview"
        :key="product.id"
        :product="product"
        compact
      />
    </div>
  </section>
</template>

<script setup lang="ts">
const { showcase } = useProductCardStyle()
const { wishlistProducts } = useShop()

const preview = computed(() => wishlistProducts.value.slice(0, 4))
</script>
