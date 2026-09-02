<template>
  <section v-if="products.length">
    <div class="rounded-3xl overflow-hidden border border-muted">
      <div class="px-5 py-4 flex items-center justify-between gap-3 text-inverted bg-primary">
        <div class="flex items-center gap-3 min-w-0">
          <UIcon name="i-tabler-bolt-filled" class="size-6 text-warning shrink-0" />
          <div class="min-w-0">
            <div class="font-bold text-sm md:text-base truncate">
              {{ $t('پیشنهاد شگفت‌انگیز') }}
            </div>
            <div class="text-[11px] text-inverted/80 truncate">
              {{ $t('تخفیف‌های ویژه این دسته') }}
            </div>
          </div>
        </div>
        <UButton
          :to="viewAllRoute"
          color="neutral"
          variant="solid"
          size="sm"
          class="bg-default/20 text-inverted hover:bg-default/30 shrink-0"
        >
          {{ $t('مشاهده همه') }}
        </UButton>
      </div>

      <div class="bg-default">
        <UCarousel
          v-slot="{ item }"
          :items="products"
          arrows
          :prev="{ color: 'neutral', variant: 'solid', size: 'md' }"
          :next="{ color: 'neutral', variant: 'solid', size: 'md' }"
          prev-icon="i-tabler-chevron-right"
          next-icon="i-tabler-chevron-left"
          :ui="{
            item: 'basis-[48%] sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 ps-3 flex',
            container: 'ms-0 p-4 items-stretch',
            prev: 'start-1 sm:start-2 z-20',
            next: 'end-1 sm:end-2 z-20',
          }"
          class="w-full"
        >
          <TheProductCard :product="item" compact />
        </UCarousel>
      </div>
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
