<template>
  <section v-if="products.length">
    <div class="flex items-center justify-between mb-4 gap-3">
      <div class="min-w-0">
        <div class="flex items-center gap-2">
          <UIcon
            name="i-tabler-sparkles"
            class="size-5 text-primary shrink-0"
          />
          <h2 class="text-base md:text-lg font-bold text-highlighted">
            {{ $t(personalized ? 'پیشنهاد برای شما' : 'پیشنهادهای منتخب') }}
          </h2>
        </div>
        <p class="text-xs text-muted mt-1">
          {{
            personalized
              ? $t('بر اساس بازدیدها و علاقه‌مندی‌های شما')
              : $t('محبوب‌ترین محصولات برای شروع خرید')
          }}
        </p>
      </div>
      <UButton
        :to="viewAllTo"
        color="primary"
        variant="link"
        size="sm"
        trailing-icon="i-tabler-chevron-left"
        class="font-medium shrink-0"
      >
        {{ $t('نمایش همه') }}
      </UButton>
    </div>

    <div class="bg-default border border-muted rounded-2xl overflow-hidden">
      <UCarousel
        v-slot="{ item }"
        :items="products"
        arrows
        :prev="{ color: 'neutral', variant: 'solid', size: 'md' }"
        :next="{ color: 'neutral', variant: 'solid', size: 'md' }"
        prev-icon="i-tabler-chevron-right"
        next-icon="i-tabler-chevron-left"
        :ui="{
          item: 'basis-[48%] sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 ps-3 first:ps-0',
          container: 'ms-0 p-3 md:p-4',
          prev: 'start-1 sm:start-2 z-20',
          next: 'end-1 sm:end-2 z-20',
        }"
        class="w-full"
      >
        <TheProductCard
          :product="item"
          compact
        />
      </UCarousel>
    </div>
  </section>
</template>

<script setup lang="ts">
const {
  recommendations,
  personalized,
  recCategories,
  fetchRecommendations,
  hydrateLocal,
} = useUserActivity()

hydrateLocal()

await fetchRecommendations({ limit: 12 })

const products = computed(() => recommendations.value)
const viewAllTo = computed(() => {
  const cat = recCategories.value[0]
  return cat ? `/search?category=${encodeURIComponent(cat)}` : '/search'
})
</script>
