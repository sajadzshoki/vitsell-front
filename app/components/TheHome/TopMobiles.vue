<template>
  <section v-if="brands.length">
    <h2 class="text-lg md:text-xl font-bold text-highlighted text-center mb-6">
      {{ $t('برترین‌های موبایل') }}
    </h2>

    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
      <NuxtLink
        v-for="brand in brands"
        :key="brand.id"
        :to="brand.to"
        class="group flex flex-col items-center gap-3 cursor-pointer"
      >
        <div
          class="relative w-full aspect-square rounded-3xl bg-primary/10 overflow-hidden grid place-items-center transition group-hover:(bg-primary/15 shadow-sm)"
        >
          <img
            :src="brand.images[0]"
            :alt="$t(brand.name)"
            class="absolute w-[46%] start-[12%] top-[18%] drop-shadow-lg transition duration-300 object-contain origin-bottom"
            style="transform: rotate(-12deg)"
            loading="lazy"
            decoding="async"
          >
          <img
            :src="brand.images[1]"
            :alt="$t(brand.name)"
            class="absolute w-[48%] end-[10%] top-[22%] drop-shadow-xl transition duration-300 object-contain origin-bottom z-10"
            style="transform: rotate(12deg)"
            loading="lazy"
            decoding="async"
          >
        </div>
        <span class="text-sm font-medium text-toned group-hover:text-primary transition">
          {{ $t(brand.name) }}
        </span>
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
const { topMobileBrands: brands } = useHome()
</script>
