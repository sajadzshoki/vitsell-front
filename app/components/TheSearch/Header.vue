<template>
  <header class="mb-4">
    <nav class="hidden md:flex text-xs text-muted items-center gap-2 mb-4 flex-wrap">
      <NuxtLink to="/" class="hover:text-primary transition">
        {{ $t('خانه') }}
      </NuxtLink>
      <span class="text-dimmed">/</span>
      <span class="text-toned">
        {{ isSearchQuery ? $t('نتایج جستجو') : $t('محصولات') }}
      </span>
    </nav>

    <div class="bg-default border border-muted rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
      <div class="size-12 rounded-2xl bg-primary/10 text-primary grid place-items-center shrink-0">
        <UIcon
          :name="isSearchQuery ? 'i-tabler-search' : 'i-tabler-category'"
          class="size-6"
        />
      </div>
      <div class="flex-1 min-w-0">
        <h1 class="text-base sm:text-lg font-bold text-highlighted">
          <template v-if="isSearchQuery">
            {{ $t('نتایج جستجو برای') }}
            «<span class="text-primary">{{ heading }}</span>»
          </template>
          <template v-else>
            {{ heading }}
          </template>
        </h1>
        <p class="text-xs text-muted mt-1 num">
          {{ total.toLocaleString('fa-IR') }} {{ $t('کالا پیدا شده') }}
        </p>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  heading: string
  total: number
  isSearchQuery: boolean
}>()
</script>
