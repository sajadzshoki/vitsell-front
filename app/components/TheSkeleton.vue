<script setup lang="ts">
export type SkeletonVariant =
  | 'hero'
  | 'circle'
  | 'product-card'
  | 'product-carousel'
  | 'deals'
  | 'category'
  | 'brand'
  | 'feature'
  | 'blog'
  | 'promo'
  | 'ranked'
  | 'product-detail'
  | 'product-grid'
  | 'product-list'
  | 'search-header'
  | 'search-filters'
  | 'category-hero'
  | 'chip-row'
  | 'list-card'
  | 'address-card'
  | 'wallet'
  | 'form'
  | 'dashboard'
  | 'seo-text'
  | 'article-grid'

const props = withDefaults(defineProps<{
  variant: SkeletonVariant
  count?: number
}>(), {
  count: undefined,
})

const defaults: Record<SkeletonVariant, number> = {
  hero: 1,
  circle: 8,
  'product-card': 1,
  'product-carousel': 6,
  deals: 6,
  category: 10,
  brand: 6,
  feature: 4,
  blog: 5,
  promo: 1,
  ranked: 3,
  'product-detail': 1,
  'product-grid': 8,
  'product-list': 6,
  'search-header': 1,
  'search-filters': 1,
  'category-hero': 1,
  'chip-row': 8,
  'list-card': 3,
  'address-card': 2,
  wallet: 1,
  form: 1,
  dashboard: 1,
  'seo-text': 1,
  'article-grid': 4,
}

const n = computed(() => props.count ?? defaults[props.variant])
</script>

<template>
  <!-- Hero carousel — same frame as TheHeroCarousel (4:1 / 2:1) -->
  <USkeleton
    v-if="variant === 'hero'"
    class="w-full aspect-[4/1] <md:aspect-[2/1] rounded-none"
  />

  <!-- Circle strip -->
  <div
    v-else-if="variant === 'circle'"
    class="flex gap-2 overflow-hidden py-1 px-9 sm:px-10"
  >
    <div
      v-for="i in n"
      :key="i"
      class="flex flex-col items-center gap-1.5 shrink-0 w-[4.5rem] sm:w-[6.25rem] md:w-[6.75rem] lg:w-[7.25rem] px-1.5"
    >
      <USkeleton class="size-14 sm:size-16 md:size-[4.5rem] rounded-full shrink-0" />
      <USkeleton class="h-3 w-10 sm:w-12 rounded-lg" />
      <USkeleton class="h-3 w-8 rounded-lg" />
    </div>
  </div>

  <!-- Single compact product card -->
  <div
    v-else-if="variant === 'product-card'"
    class="flex flex-col w-full bg-default border border-muted rounded-2xl p-3 <md:(p-2 rounded-xl)"
  >
    <USkeleton class="aspect-square w-full rounded-xl mb-3" />
    <USkeleton class="h-3 w-1/3 rounded-lg mb-2" />
    <USkeleton class="h-4 w-full rounded-lg mb-1.5" />
    <USkeleton class="h-4 w-2/3 rounded-lg mb-3" />
    <USkeleton class="h-5 w-1/2 rounded-lg" />
  </div>

  <!-- Product carousel section (ForYou / shelves) -->
  <div
    v-else-if="variant === 'product-carousel'"
    class="flex flex-col gap-4"
  >
    <div class="flex items-center justify-between gap-3">
      <div class="min-w-0 flex-1 space-y-2">
        <USkeleton class="h-5 w-40 md:w-52 rounded-lg" />
        <USkeleton class="h-3 w-56 md:w-72 rounded-lg" />
      </div>
      <USkeleton class="h-4 w-20 rounded-lg shrink-0" />
    </div>
    <div class="bg-default border border-muted rounded-2xl overflow-hidden p-3 md:p-4">
      <div class="flex gap-3 overflow-hidden">
        <div
          v-for="i in n"
          :key="i"
          class="basis-[48%] sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 shrink-0 flex flex-col bg-default border border-muted rounded-2xl p-3 <md:(p-2 rounded-xl)"
        >
          <USkeleton class="aspect-square w-full rounded-xl mb-3" />
          <USkeleton class="h-3 w-1/3 rounded-lg mb-2" />
          <USkeleton class="h-4 w-full rounded-lg mb-1.5" />
          <USkeleton class="h-4 w-2/3 rounded-lg mb-3" />
          <USkeleton class="h-5 w-1/2 rounded-lg" />
        </div>
      </div>
    </div>
  </div>

  <!-- Deals of the day -->
  <div
    v-else-if="variant === 'deals'"
    class="rounded-3xl overflow-hidden border border-primary/50"
  >
    <div class="px-5 py-4 flex items-center justify-between gap-3 bg-primary/20">
      <div class="flex items-center gap-3 min-w-0 flex-1">
        <USkeleton class="size-6 rounded-lg shrink-0" />
        <div class="min-w-0 space-y-2 flex-1">
          <USkeleton class="h-4 w-36 rounded-lg" />
          <USkeleton class="h-3 w-28 rounded-lg" />
        </div>
      </div>
      <div class="flex items-center gap-1.5 shrink-0">
        <USkeleton
          v-for="i in 3"
          :key="i"
          class="size-9 rounded-lg"
        />
      </div>
    </div>
    <div class="bg-default/80 p-4">
      <div class="flex gap-3 overflow-hidden">
        <div
          v-for="i in n"
          :key="i"
          class="basis-[48%] sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 shrink-0 flex flex-col bg-default border border-muted rounded-2xl p-3 <md:(p-2 rounded-xl)"
        >
          <USkeleton class="aspect-square w-full rounded-xl mb-3" />
          <USkeleton class="h-3 w-1/3 rounded-lg mb-2" />
          <USkeleton class="h-4 w-full rounded-lg mb-1.5" />
          <USkeleton class="h-4 w-2/3 rounded-lg mb-3" />
          <USkeleton class="h-5 w-1/2 rounded-lg" />
        </div>
      </div>
    </div>
  </div>

  <!-- Categories grid -->
  <div
    v-else-if="variant === 'category'"
    class="bg-default border border-muted rounded-2xl sm:rounded-3xl p-3 sm:p-4 md:p-6"
  >
    <div class="flex items-center justify-between mb-3 sm:mb-5 gap-2">
      <div class="space-y-1.5 min-w-0 flex-1">
        <USkeleton class="h-4 sm:h-5 w-36 sm:w-40 rounded-lg" />
        <USkeleton class="h-3 w-44 sm:w-56 rounded-lg" />
      </div>
      <USkeleton class="h-4 w-16 sm:w-20 rounded-lg shrink-0" />
    </div>
    <div class="sm:hidden flex gap-2 overflow-hidden px-7">
      <div
        v-for="i in n"
        :key="`m-${i}`"
        class="flex flex-col items-center gap-1.5 shrink-0 w-[22%]"
      >
        <USkeleton class="size-14 rounded-full shrink-0" />
        <USkeleton class="h-2.5 w-10 rounded-lg" />
      </div>
    </div>
    <div class="hidden sm:grid grid-cols-5 lg:grid-cols-10 gap-3 md:gap-4">
      <div
        v-for="i in n"
        :key="`d-${i}`"
        class="flex flex-col items-center gap-2"
      >
        <USkeleton class="size-20 md:size-[4.75rem] lg:size-[5.25rem] rounded-full" />
        <USkeleton class="h-3 w-14 rounded-lg" />
      </div>
    </div>
  </div>

  <!-- Brand names row -->
  <div
    v-else-if="variant === 'brand'"
    class="bg-default rounded-3xl p-6 flex items-center flex-wrap justify-around gap-6"
  >
    <USkeleton
      v-for="i in n"
      :key="i"
      class="h-7 md:h-8 rounded-lg"
      :class="i % 2 === 0 ? 'w-20 md:w-28' : 'w-16 md:w-24'"
    />
  </div>

  <!-- Hero features -->
  <div
    v-else-if="variant === 'feature'"
    class="grid grid-cols-2 md:grid-cols-4 gap-3"
  >
    <div
      v-for="i in n"
      :key="i"
      class="bg-default rounded-2xl p-3 flex items-center gap-3"
    >
      <USkeleton class="size-11 rounded-xl shrink-0" />
      <div class="min-w-0 flex-1 space-y-2">
        <USkeleton class="h-3.5 w-full rounded-lg" />
        <USkeleton class="h-3 w-2/3 rounded-lg" />
      </div>
    </div>
  </div>

  <!-- Blog carousel -->
  <div
    v-else-if="variant === 'blog'"
    class="bg-default border border-muted rounded-2xl p-4 md:p-6"
  >
    <div class="flex items-center justify-between mb-4 gap-3">
      <USkeleton class="h-5 w-44 rounded-lg" />
      <USkeleton class="h-4 w-28 rounded-lg shrink-0" />
    </div>
    <div class="flex gap-3 overflow-hidden">
      <div
        v-for="i in n"
        :key="i"
        class="basis-[85%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 shrink-0"
      >
        <USkeleton class="w-full aspect-[4/3] rounded-xl" />
      </div>
    </div>
  </div>

  <!-- Promo banner -->
  <div
    v-else-if="variant === 'promo'"
    class="rounded-3xl border border-muted bg-default p-6 md:p-8"
  >
    <div class="flex flex-col lg:(flex-row items-center) gap-6 md:gap-8">
      <div class="flex-1 min-w-0 space-y-3">
        <USkeleton class="h-6 w-28 rounded-full" />
        <USkeleton class="h-7 w-3/4 max-w-md rounded-lg" />
        <USkeleton class="h-4 w-full max-w-xl rounded-lg" />
        <USkeleton class="h-4 w-5/6 max-w-lg rounded-lg" />
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <USkeleton
            v-for="i in 3"
            :key="i"
            class="h-14 rounded-2xl"
          />
        </div>
        <USkeleton class="h-11 w-40 rounded-xl mt-2" />
      </div>
      <USkeleton class="size-28 md:size-36 rounded-3xl shrink-0" />
    </div>
  </div>

  <!-- Ranked best sellers -->
  <div
    v-else-if="variant === 'ranked'"
    class="bg-default border border-muted rounded-2xl p-4 md:p-5"
  >
    <div class="flex items-center gap-2 mb-4">
      <USkeleton class="size-5 rounded-lg shrink-0" />
      <USkeleton class="h-5 w-36 rounded-lg" />
    </div>
    <div class="flex gap-3 overflow-hidden">
      <div
        v-for="col in n"
        :key="col"
        class="basis-full sm:basis-1/2 lg:basis-1/3 shrink-0 flex flex-col gap-1 pe-2"
      >
        <div
          v-for="row in 3"
          :key="row"
          class="flex items-center gap-3 p-2"
        >
          <USkeleton class="size-8 rounded-full shrink-0" />
          <div class="flex-1 min-w-0 space-y-1.5">
            <USkeleton class="h-3 w-full rounded-lg" />
            <USkeleton class="h-3 w-2/3 rounded-lg" />
          </div>
          <USkeleton class="size-14 sm:size-16 rounded-lg shrink-0" />
        </div>
      </div>
    </div>
  </div>

  <!-- Product detail page -->
  <div
    v-else-if="variant === 'product-detail'"
    class="w-screen max-w-[100vw] ms-[calc(50%-50vw)] px-3 sm:px-4 lg:px-6"
  >
    <div class="mx-auto max-w-9xl w-full py-4">
      <USkeleton class="hidden md:block h-4 w-72 rounded-lg mb-4" />
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-5 items-start">
        <section class="lg:col-span-9 md:bg-default md:rounded-3xl md:border md:border-muted md:p-4 lg:p-6 min-w-0">
          <USkeleton class="hidden md:block h-7 w-2/3 rounded-lg mb-4" />
          <div class="grid grid-cols-1 md:grid-cols-12 gap-3 lg:gap-5">
            <div class="md:col-span-5 flex flex-col gap-3">
              <USkeleton class="aspect-square w-full rounded-2xl" />
              <div class="flex gap-2">
                <USkeleton
                  v-for="i in 4"
                  :key="i"
                  class="size-14 rounded-xl shrink-0"
                />
              </div>
            </div>
            <div class="md:col-span-7 space-y-3">
              <USkeleton class="h-6 w-3/4 rounded-lg" />
              <USkeleton class="h-4 w-40 rounded-lg" />
              <USkeleton class="h-4 w-full rounded-lg" />
              <USkeleton class="h-4 w-5/6 rounded-lg" />
              <div class="flex gap-2 pt-2">
                <USkeleton
                  v-for="i in 4"
                  :key="i"
                  class="size-10 rounded-full"
                />
              </div>
              <USkeleton class="h-12 w-48 rounded-xl mt-4" />
            </div>
          </div>
        </section>
        <aside class="lg:col-span-3">
          <USkeleton class="h-72 w-full rounded-2xl" />
        </aside>
        <div class="lg:col-span-9 space-y-3 mt-2">
          <USkeleton class="h-10 w-full max-w-md rounded-xl" />
          <USkeleton class="h-48 w-full rounded-2xl" />
        </div>
      </div>
      <div class="mt-8">
        <div class="flex items-center justify-between mb-4">
          <USkeleton class="h-5 w-36 rounded-lg" />
          <USkeleton class="h-4 w-20 rounded-lg" />
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          <div
            v-for="i in 6"
            :key="i"
            class="flex flex-col bg-default border border-muted rounded-2xl p-3"
          >
            <USkeleton class="aspect-square w-full rounded-xl mb-3" />
            <USkeleton class="h-4 w-full rounded-lg mb-1.5" />
            <USkeleton class="h-4 w-2/3 rounded-lg mb-3" />
            <USkeleton class="h-5 w-1/2 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Product grid (search / category popular) -->
  <div
    v-else-if="variant === 'product-grid'"
    class="grid grid-cols-2 gap-1 md:(grid-cols-3 gap-4) xl:grid-cols-4"
  >
    <div
      v-for="i in n"
      :key="i"
      class="flex flex-col w-full bg-default border border-muted rounded-2xl p-3 <md:(p-2 rounded-xl)"
    >
      <USkeleton class="aspect-square w-full rounded-xl mb-3" />
      <USkeleton class="h-3 w-1/3 rounded-lg mb-2" />
      <USkeleton class="h-4 w-full rounded-lg mb-1.5" />
      <USkeleton class="h-4 w-2/3 rounded-lg mb-3" />
      <USkeleton class="h-5 w-1/2 rounded-lg" />
    </div>
  </div>

  <!-- Product list (search list layout) -->
  <div
    v-else-if="variant === 'product-list'"
    class="flex flex-col gap-2"
  >
    <div
      v-for="i in n"
      :key="i"
      class="flex flex-row gap-3 sm:gap-4 items-stretch bg-default border border-muted rounded-2xl p-3"
    >
      <USkeleton class="w-28 sm:w-36 md:w-40 aspect-square rounded-xl shrink-0" />
      <div class="flex-1 min-w-0 space-y-2 py-1">
        <USkeleton class="h-3 w-24 rounded-lg" />
        <USkeleton class="h-4 w-full rounded-lg" />
        <USkeleton class="h-4 w-3/4 rounded-lg" />
        <USkeleton class="h-5 w-32 rounded-lg mt-3" />
      </div>
    </div>
  </div>

  <!-- Search header -->
  <div
    v-else-if="variant === 'search-header'"
    class="mb-4"
  >
    <USkeleton class="hidden md:block h-3 w-40 rounded-lg mb-4" />
    <div class="bg-default border border-muted rounded-2xl p-4 sm:p-5">
      <div class="flex items-center gap-3 sm:gap-4">
        <USkeleton class="size-12 rounded-2xl shrink-0" />
        <div class="flex-1 min-w-0 space-y-2">
          <USkeleton class="h-5 w-48 sm:w-64 rounded-lg" />
          <USkeleton class="h-3 w-28 rounded-lg" />
        </div>
      </div>
    </div>
  </div>

  <!-- Search filters sidebar -->
  <div
    v-else-if="variant === 'search-filters'"
    class="bg-default border border-muted rounded-2xl overflow-hidden"
  >
    <div class="flex items-center justify-between gap-3 px-4 py-3 border-b border-muted">
      <USkeleton class="h-5 w-24 rounded-lg" />
      <USkeleton class="h-4 w-16 rounded-lg" />
    </div>
    <div
      v-for="i in 5"
      :key="i"
      class="px-4 py-3 border-b border-muted space-y-3"
    >
      <USkeleton class="h-4 w-28 rounded-lg" />
      <USkeleton class="h-9 w-full rounded-xl" />
      <USkeleton
        v-if="i % 2 === 0"
        class="h-9 w-full rounded-xl"
      />
    </div>
  </div>

  <!-- Category page hero -->
  <div
    v-else-if="variant === 'category-hero'"
    class="relative overflow-hidden rounded-3xl border border-muted bg-default"
  >
    <div class="grid grid-cols-1 md:grid-cols-2 min-h-56 md:min-h-72">
      <div class="flex flex-col justify-center p-6 sm:p-8 lg:p-10 order-2 md:order-1 space-y-3">
        <USkeleton class="h-3 w-24 rounded-lg" />
        <USkeleton class="h-9 w-3/4 rounded-lg" />
        <USkeleton class="h-4 w-full max-w-lg rounded-lg" />
        <USkeleton class="h-4 w-5/6 max-w-md rounded-lg" />
        <USkeleton class="h-11 w-44 rounded-xl mt-2" />
      </div>
      <USkeleton class="order-1 md:order-2 min-h-48 md:min-h-full rounded-none" />
    </div>
  </div>

  <!-- Chip / quick-nav row -->
  <div
    v-else-if="variant === 'chip-row'"
    class="flex items-center gap-2 overflow-hidden pb-1"
  >
    <USkeleton
      v-for="i in n"
      :key="i"
      class="h-10 rounded-xl shrink-0"
      :class="i % 3 === 0 ? 'w-28' : i % 2 === 0 ? 'w-24' : 'w-20'"
    />
  </div>

  <!-- Account list cards (orders / reviews) -->
  <div
    v-else-if="variant === 'list-card'"
    class="space-y-3"
  >
    <USkeleton
      v-for="i in n"
      :key="i"
      class="h-28 md:h-32 w-full rounded-2xl"
    />
  </div>

  <!-- Address cards -->
  <div
    v-else-if="variant === 'address-card'"
    class="grid grid-cols-1 md:grid-cols-2 gap-3"
  >
    <USkeleton
      v-for="i in n"
      :key="i"
      class="h-36 w-full rounded-2xl"
    />
  </div>

  <!-- Wallet -->
  <div
    v-else-if="variant === 'wallet'"
    class="space-y-4"
  >
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <USkeleton
        v-for="i in 4"
        :key="i"
        class="h-32 rounded-2xl"
      />
    </div>
    <div class="flex gap-2">
      <USkeleton class="h-11 w-36 rounded-lg" />
      <USkeleton class="h-11 w-36 rounded-lg" />
    </div>
    <USkeleton class="h-64 rounded-2xl" />
  </div>

  <!-- Profile / form -->
  <div
    v-else-if="variant === 'form'"
    class="space-y-5"
  >
    <div class="bg-default border border-muted rounded-2xl p-5 md:p-6 space-y-4">
      <USkeleton class="hidden lg:block h-5 w-44 rounded-lg mb-2" />
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="i in 6"
          :key="i"
          class="space-y-2"
        >
          <USkeleton class="h-3.5 w-20 rounded-lg" />
          <USkeleton class="h-10 w-full rounded-xl" />
        </div>
      </div>
      <div class="flex gap-3 pt-2">
        <USkeleton class="h-11 w-36 rounded-xl" />
        <USkeleton class="h-11 w-28 rounded-xl" />
      </div>
    </div>
    <div class="bg-default border border-muted rounded-2xl p-5 md:p-6 space-y-4">
      <USkeleton class="h-5 w-40 rounded-lg" />
      <USkeleton class="h-3 w-64 rounded-lg" />
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="i in 3"
          :key="i"
          class="space-y-2"
        >
          <USkeleton class="h-3.5 w-24 rounded-lg" />
          <USkeleton class="h-10 w-full rounded-xl" />
        </div>
      </div>
    </div>
  </div>

  <!-- Account dashboard -->
  <div
    v-else-if="variant === 'dashboard'"
    class="space-y-4 sm:space-y-5"
  >
    <USkeleton class="h-36 sm:h-40 rounded-2xl" />
    <USkeleton class="h-28 rounded-2xl" />
    <div class="bg-default border border-muted rounded-2xl p-4 sm:p-5 space-y-3">
      <USkeleton class="h-5 w-32 rounded-lg" />
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <USkeleton
          v-for="i in 8"
          :key="i"
          class="h-24 rounded-2xl"
        />
      </div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <USkeleton class="h-40 rounded-2xl" />
      <USkeleton class="h-40 rounded-2xl" />
    </div>
    <div class="bg-default border border-muted rounded-2xl p-5 space-y-3">
      <div class="flex items-center justify-between mb-2">
        <USkeleton class="h-5 w-40 rounded-lg" />
        <USkeleton class="h-3 w-20 rounded-lg" />
      </div>
      <USkeleton
        v-for="i in 3"
        :key="i"
        class="h-28 rounded-2xl"
      />
    </div>
  </div>

  <!-- SEO text block -->
  <div
    v-else-if="variant === 'seo-text'"
    class="space-y-3 text-start"
  >
    <USkeleton class="h-5 w-56 rounded-lg" />
    <USkeleton class="h-3.5 w-full rounded-lg" />
    <USkeleton class="h-3.5 w-full rounded-lg" />
    <USkeleton class="h-3.5 w-5/6 rounded-lg" />
    <USkeleton class="h-3.5 w-4/5 rounded-lg" />
  </div>

  <!-- Article / blog cards grid -->
  <div
    v-else-if="variant === 'article-grid'"
    class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
  >
    <div
      v-for="i in n"
      :key="i"
      class="bg-default border border-muted rounded-2xl overflow-hidden"
    >
      <USkeleton class="aspect-[16/10] w-full rounded-none" />
      <div class="p-4 space-y-2">
        <USkeleton class="h-3 w-24 rounded-lg" />
        <USkeleton class="h-4 w-full rounded-lg" />
        <USkeleton class="h-4 w-3/4 rounded-lg" />
        <USkeleton class="h-3 w-full rounded-lg" />
      </div>
    </div>
  </div>
</template>
