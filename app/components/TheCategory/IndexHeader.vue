<template>
  <section
    class="relative overflow-hidden rounded-3xl border border-muted bg-default mt-4"
  >
    <div
      class="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-info/5 pointer-events-none"
      aria-hidden="true"
    />
    <div
      class="absolute -top-16 -start-16 size-48 rounded-full bg-primary/5 blur-3xl pointer-events-none"
      aria-hidden="true"
    />
    <div
      class="absolute -bottom-20 -end-10 size-56 rounded-full bg-info/5 blur-3xl pointer-events-none"
      aria-hidden="true"
    />

    <div class="relative p-6 lg:(p-8 gap-8) flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
      <div class="flex flex-col gap-3 max-w-xl">
        <UBadge
          color="primary"
          variant="subtle"
          size="sm"
          class="w-fit font-semibold"
        >
          {{ $t('مرور سریع') }}
        </UBadge>
        <h1 class="text-2xl lg:text-3xl font-black text-highlighted leading-tight">
          {{ $t('دسته‌بندی کالاها') }}
        </h1>
        <p class="text-sm text-muted leading-7">
          {{ $t('بیش از') }}
          <span class="font-bold text-default num">{{ categoryCount.toLocaleString('fa-IR') }}</span>
          {{ $t('دسته اصلی — زیردسته مورد نظر را انتخاب کنید یا مستقیم جستجو کنید') }}
        </p>
      </div>

      <div class="flex flex-col gap-2.5 lg:items-end shrink-0">
        <span class="text-xs font-semibold text-dimmed">
          {{ $t('جستجوهای پرطرفدار') }}
        </span>
        <div class="flex flex-wrap gap-2 lg:justify-end">
          <NuxtLink
            v-for="term in popularSearches"
            :key="term"
            :to="toSearchRoute({ q: term })"
            class="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-xs font-medium bg-elevated text-toned hover:(bg-primary/10 text-primary) border border-muted transition"
          >
            <UIcon name="i-tabler-search" class="size-3.5 shrink-0" />
            {{ term }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { popularSearches, toSearchRoute } from '~/data/categories'

const { menus } = useMegaMenu()
const categoryCount = computed(() => menus.value.length)
</script>
