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

    <div class="bg-default border border-muted rounded-2xl p-4 sm:p-5">
      <div class="flex items-center gap-3 sm:gap-4">
        <div class="size-12 rounded-2xl bg-primary/10 text-primary grid place-items-center shrink-0 overflow-hidden">
          <img
            v-if="!isSearchQuery && categoryImage"
            :src="categoryImage"
            :alt="heading"
            class="size-full object-cover"
            loading="lazy"
          >
          <UIcon
            v-else
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
          <p
            v-if="total > 0"
            class="text-xs text-muted mt-1 num"
          >
            {{ total.toLocaleString('fa-IR') }} {{ $t('کالا پیدا شده') }}
          </p>
        </div>
      </div>

      <div
        v-if="subs.length"
        class="flex gap-2.5 overflow-x-auto scrollbar-none mt-4 pt-4 border-t border-muted"
        :aria-label="$t('زیردسته‌ها')"
      >
        <NuxtLink
          v-for="item in visibleSubs"
          :key="item.id"
          :to="toSearchRoute({ category: item.id })"
          class="group flex flex-col items-center justify-center gap-2 shrink-0 w-[6.5rem] sm:w-28 min-h-[7rem] px-2 py-3 rounded-xl bg-muted hover:bg-elevated transition-all text-center cursor-pointer"
        >
          <div class="size-12 sm:size-14 rounded-xl bg-default overflow-hidden grid place-items-center shadow-sm">
            <img
              v-if="subImage(item)"
              :src="subImage(item)!"
              :alt="item.name"
              class="size-full object-cover"
              loading="lazy"
            >
            <UIcon
              v-else
              :name="getCategoryIcon(item.id)"
              class="size-6 sm:size-7 text-muted group-hover:text-primary transition"
            />
          </div>
          <span class="text-[11px] sm:text-xs text-toned leading-tight line-clamp-2 group-hover:text-primary transition">
            {{ $t(item.name) }}
          </span>
        </NuxtLink>

        <button
          v-if="hiddenCount > 0 && !expanded"
          type="button"
          class="flex flex-col items-center justify-center gap-1.5 shrink-0 w-[6.5rem] sm:w-28 min-h-[7rem] px-2 py-3 rounded-xl bg-muted hover:bg-elevated transition-all text-center cursor-pointer"
          @click="expanded = true"
        >
          <span class="text-2xl font-bold text-highlighted num leading-none">
            {{ hiddenCount.toLocaleString('fa-IR') }}
          </span>
          <span class="text-[11px] sm:text-xs text-toned leading-tight">
            {{ $t('مشاهده') }}
            <br>
            {{ $t('دسته‌بندی دیگر') }}
          </span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import type { SearchSubcategoryChip } from '~/data/categories'
import { getCategoryIcon, toSearchRoute } from '~/data/categories'

const VISIBLE_LIMIT = 7

const props = withDefaults(defineProps<{
  heading: string
  total: number
  isSearchQuery: boolean
  categoryId?: string
  categoryImage?: string | null
  subs?: SearchSubcategoryChip[]
}>(), {
  categoryId: '',
  categoryImage: null,
  subs: () => [],
})

const expanded = ref(false)

watch(
  () => props.categoryId,
  () => {
    expanded.value = false
  },
)

const visibleSubs = computed(() =>
  expanded.value ? props.subs : props.subs.slice(0, VISIBLE_LIMIT),
)

const hiddenCount = computed(() =>
  Math.max(0, props.subs.length - VISIBLE_LIMIT),
)

function subImage(item: SearchSubcategoryChip) {
  return item.image || props.categoryImage || null
}
</script>
