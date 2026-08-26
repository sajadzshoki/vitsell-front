<template>
  <section>
    <div class="bg-default rounded-3xl p-6 flex items-center flex-wrap justify-around gap-6">
      <button
        v-for="brand in brands"
        :key="brand"
        type="button"
        class="text-lg md:text-2xl font-bold text-dimmed hover:text-highlighted transition tracking-wide cursor-pointer"
      >
        {{ brand }}
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { homeBrands } from '~/data/home'

const brands = homeBrands
</script>
