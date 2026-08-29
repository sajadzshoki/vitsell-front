<template>
  <div
    class="flex min-h-[32rem] w-full overflow-hidden rounded-3xl border border-muted bg-default shadow-xl shadow-primary/5"
  >
    <!-- Categories sidebar -->
    <aside
      class="w-72 shrink-0 bg-muted/60 border-e border-muted py-4 overflow-y-auto scrollbar-none"
      :aria-label="$t('دسته‌بندی‌های اصلی')"
    >
      <p class="px-5 pb-3 text-xs font-bold text-dimmed uppercase tracking-wide">
        {{ $t('دسته‌های اصلی') }}
      </p>
      <ul class="flex flex-col gap-0.5 px-2">
        <li
          v-for="c in categories"
          :key="c.id"
        >
          <button
            type="button"
            class="group w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-start transition"
            :class="c.id === activeId
              ? 'bg-default shadow-sm text-primary font-bold'
              : 'text-toned hover:(bg-elevated text-primary)'"
            @mouseenter="selectCategory(c.id)"
            @click="selectCategory(c.id)"
          >
            <span
              class="size-10 shrink-0 rounded-xl grid place-items-center transition"
              :class="c.id === activeId
                ? 'bg-primary/10 text-primary'
                : 'bg-elevated text-dimmed group-hover:(bg-primary/10 text-primary)'"
            >
              <UIcon :name="getCategoryIcon(c.id)" class="size-5" />
            </span>
            <span class="flex-1 min-w-0 text-sm truncate">
              {{ $t(c.name) }}
            </span>
            <span
              v-if="productCountByCategory[c.id]"
              class="text-[10px] font-medium text-dimmed num shrink-0"
              :class="c.id === activeId ? 'text-primary/70' : ''"
            >
              {{ productCountByCategory[c.id]?.toLocaleString('fa-IR') }}
            </span>
            <UIcon
              v-if="c.id === activeId"
              name="i-tabler-chevron-left"
              class="size-4 shrink-0 text-primary/60"
            />
          </button>
        </li>
      </ul>
    </aside>

    <!-- Subcategories panel -->
    <div class="relative flex-1 min-w-0 overflow-y-auto scrollbar-none">
      <div
        class="absolute top-0 end-0 size-64 bg-gradient-to-bl from-primary/5 to-transparent pointer-events-none"
        aria-hidden="true"
      />

      <div
        v-if="activeCategory"
        class="relative p-6 lg:p-8"
      >
        <div class="flex flex-wrap items-start justify-between gap-4 mb-8 pb-6 border-b border-muted">
          <div class="flex items-center gap-4 min-w-0">
            <span class="size-14 shrink-0 rounded-2xl bg-primary/10 text-primary grid place-items-center">
              <UIcon :name="getCategoryIcon(activeCategory.id)" class="size-7" />
            </span>
            <div class="min-w-0">
              <h2 class="text-xl lg:text-2xl font-black text-highlighted truncate">
                {{ $t(activeCategory.name) }}
              </h2>
              <p class="text-sm text-muted mt-1">
                <template v-if="activeCategory.subs.length">
                  {{ activeCategory.subs.length.toLocaleString('fa-IR') }}
                  {{ $t('زیردسته') }}
                  <span class="text-dimmed mx-1">·</span>
                </template>
                <span class="num">
                  {{ (productCountByCategory[activeCategory.id] ?? 0).toLocaleString('fa-IR') }}
                </span>
                {{ $t('کالا') }}
              </p>
            </div>
          </div>

          <UButton
            :to="toCategoryRoute(activeCategory.id)"
            color="primary"
            size="md"
            trailing-icon="i-tabler-arrow-left"
            class="font-bold shrink-0"
          >
            {{ $t('مشاهده همه محصولات') }}
          </UButton>
        </div>

        <div
          v-if="activeCategory.subs.length"
          class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-8"
        >
          <article
            v-for="sub in activeCategory.subs"
            :key="sub.name"
            class="group/sub"
          >
            <h3 class="font-bold text-default text-sm mb-4 flex items-center gap-2">
              <span class="size-2 rounded-full bg-primary shrink-0" />
              {{ $t(sub.name) }}
            </h3>
            <ul class="space-y-1">
              <li
                v-for="item in sub.items"
                :key="item"
              >
                <NuxtLink
                  :to="toSearchRoute({ q: item, category: activeCategory.id })"
                  class="flex items-center gap-2 py-2 px-3 -mx-3 rounded-xl text-sm text-muted hover:(bg-primary/5 text-primary) transition group/link"
                >
                  <UIcon
                    name="i-tabler-chevron-left"
                    class="size-3.5 shrink-0 opacity-0 group-hover/link:opacity-100 transition"
                  />
                  <span>{{ item }}</span>
                </NuxtLink>
              </li>
            </ul>
          </article>
        </div>

        <div
          v-else
          class="flex flex-col items-center justify-center py-16 text-center"
        >
          <span class="size-16 rounded-2xl bg-muted text-dimmed grid place-items-center mb-4">
            <UIcon :name="getCategoryIcon(activeCategory.id)" class="size-8" />
          </span>
          <p class="text-sm text-dimmed mb-5 max-w-xs">
            {{ $t('زیردسته‌ای برای این دسته ثبت نشده — می‌توانید مستقیم محصولات را ببینید') }}
          </p>
          <UButton
            :to="toCategoryRoute(activeCategory.id)"
            color="primary"
            variant="soft"
            trailing-icon="i-tabler-arrow-left"
          >
            {{ $t('رفتن به صفحه دسته') }}
          </UButton>
        </div>

        <div
          v-if="activeCategory.subs.length"
          class="mt-10 pt-6 border-t border-muted"
        >
          <p class="text-xs font-semibold text-dimmed mb-3">
            {{ $t('پیشنهاد جستجو در') }} {{ $t(activeCategory.name) }}
          </p>
          <div class="flex flex-wrap gap-2">
            <NuxtLink
              v-for="term in suggestedTerms"
              :key="term"
              :to="toSearchRoute({ q: term, category: activeCategory.id })"
              class="inline-flex items-center h-8 px-3 rounded-lg text-xs font-medium bg-muted text-toned hover:(bg-primary/10 text-primary) transition"
            >
              {{ term }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  getCategoryIcon,
  toCategoryRoute,
  toSearchRoute,
} from '~/data/categories'

const {
  categories,
  productCounts: productCountByCategory,
  activeId,
  activeCategory,
  selectCategory,
} = useCategoryBrowser()

const suggestedTerms = computed(() => {
  const subs = activeCategory.value?.subs ?? []
  const fromSubs = subs.flatMap(s => s.items).slice(0, 4)
  if (fromSubs.length) return fromSubs
  return [activeCategory.value?.name].filter(Boolean) as string[]
})
</script>
