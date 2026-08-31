<template>
  <section v-if="columns.length">
    <div class="bg-default border border-muted rounded-2xl p-4 md:p-5">
      <div class="flex items-center gap-2 mb-4">
        <UIcon name="i-tabler-flame" class="size-5 text-warning shrink-0" />
        <h2 class="text-base md:text-lg font-bold text-highlighted">
          {{ $t('پرفروش‌ترین‌ها') }}
        </h2>
      </div>

      <div class="relative">
        <UCarousel
          v-slot="{ item: column }"
          :items="columns"
          arrows
          :prev="{ color: 'neutral', variant: 'solid', size: 'md' }"
          :next="{ color: 'neutral', variant: 'solid', size: 'md' }"
          prev-icon="i-tabler-chevron-right"
          next-icon="i-tabler-chevron-left"
          :ui="{
            item: 'basis-full sm:basis-1/2 lg:basis-1/3 ps-3 first:ps-0',
            container: 'ms-0',
            prev: 'start-0 z-20',
            next: 'end-0 z-20',
          }"
          class="w-full"
        >
          <div class="flex flex-col gap-1 pe-2">
            <NuxtLink
              v-for="entry in column"
              :key="entry.product.id"
              :to="{ name: 'product-id', params: { id: entry.product.id } }"
              class="flex items-center gap-3 p-2 rounded-xl hover:bg-primary/5 transition cursor-pointer group"
            >
              <span
                class="size-8 rounded-full bg-error text-inverted text-sm font-bold grid place-items-center shrink-0 num"
              >
                {{ entry.rank.toLocaleString('fa-IR') }}
              </span>
              <p class="flex-1 min-w-0 text-sm text-toned line-clamp-2 group-hover:text-primary transition leading-6">
                {{ entry.product.title }}
              </p>
              <div class="size-14 sm:size-16 rounded-lg bg-muted overflow-hidden shrink-0">
                <TheIcon
                  v-if="entry.product.image"
                  :name="entry.product.image"
                  icon-type="img"
                  class="!w-full !h-full object-cover"
                />
                <TheIcon
                  v-else
                  name="noImage.png"
                  icon-type="img"
                  class="!w-full !h-full object-contain p-2 opacity-60"
                />
              </div>
            </NuxtLink>
          </div>
        </UCarousel>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Product } from '~/data/products'

const { bestSellers, catalogProducts } = useHome()

const ranked = computed(() => {
  const list = (bestSellers.value.length ? bestSellers.value : catalogProducts.value).slice(0, 12)
  return list.map((product, index) => ({
    rank: index + 1,
    product,
  }))
})

const columns = computed(() => {
  const rows = 3
  const chunks: { rank: number, product: Product }[][] = []
  for (let i = 0; i < ranked.value.length; i += rows) {
    chunks.push(ranked.value.slice(i, i + rows))
  }
  return chunks
})
</script>
