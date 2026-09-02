<template>
  <section v-if="brands.length">
    <div class="flex items-center justify-center gap-2 mb-3 sm:mb-5">
      <UIcon
        name="i-tabler-device-mobile"
        class="size-4 sm:size-5 text-primary shrink-0"
      />
      <h2 class="text-base sm:text-lg md:text-xl font-bold text-highlighted text-center">
        {{ $t('برترین‌های موبایل') }}
      </h2>
    </div>

    <div class="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
      <NuxtLink
        v-for="brand in brands"
        :key="brand.id"
        :to="brand.to"
        class="group flex flex-col items-center gap-1.5 sm:gap-2.5 cursor-pointer"
      >
        <div
          class="relative w-full aspect-[4/5] sm:aspect-square rounded-xl sm:rounded-2xl bg-inverted overflow-hidden border border-muted/40 transition-all duration-300 group-hover:(border-primary/40 shadow-md)"
        >
          <div
            class="absolute inset-0 bg-primary/10 opacity-70 pointer-events-none"
            aria-hidden="true"
          />
          <div
            class="absolute -bottom-1/4 inset-x-1/4 h-1/2 rounded-full bg-primary/25 blur-2xl pointer-events-none transition-opacity group-hover:opacity-90"
            aria-hidden="true"
          />

          <img
            :src="brand.image"
            :alt="$t(brand.name)"
            class="relative z-10 size-full object-contain object-center p-1.5 sm:p-3 drop-shadow-lg transition-all duration-300 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          >
        </div>

        <span
          class="text-[11px] sm:text-sm font-medium text-toned text-center leading-tight group-hover:text-primary transition"
        >
          {{ $t(brand.name) }}
        </span>
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
const { topMobileBrands: brands } = useHome()
</script>
