<template>
  <div
    class="flex flex-1 min-h-0 w-full overflow-hidden md:(border border-muted rounded-2xl min-h-[28rem] shadow-sm)"
  >
    <!-- Main categories rail (start / right in RTL) -->
    <aside
      class="shrink-0 bg-muted overflow-y-auto scrollbar-none border-e border-muted"
      :class="compact ? 'w-[4.75rem]' : 'w-[4.75rem] md:w-56'"
      :aria-label="$t('دسته‌بندی‌های اصلی')"
    >
      <ul class="flex flex-col">
        <li
          v-for="c in categories"
          :key="c.id"
        >
          <button
            type="button"
            class="relative w-full flex flex-col items-center gap-1 px-1 py-3 text-center transition md:(flex-row gap-3 px-4 py-3 text-start)"
            :class="c.id === activeId
              ? 'bg-default text-primary font-semibold'
              : 'text-toned hover:(bg-elevated text-primary)'"
            @click="selectCategory(c.id)"
          >
            <span
              v-if="c.id === activeId"
              class="absolute inset-y-0 start-0 w-0.5 bg-primary md:hidden"
              aria-hidden="true"
            />
            <UIcon
              :name="getCategoryIcon(c.id)"
              class="shrink-0 transition"
              :class="[
                compact ? 'size-6' : 'size-6 md:size-5',
                c.id === activeId ? 'text-primary' : 'text-dimmed',
              ]"
            />
            <span
              class="leading-tight line-clamp-2"
              :class="compact ? 'text-[10px] font-medium' : 'text-[10px] md:text-sm font-medium'"
            >
              {{ $t(c.name) }}
            </span>
          </button>
        </li>
      </ul>
    </aside>

    <!-- Subcategories panel -->
    <div class="flex-1 min-w-0 bg-default overflow-y-auto scrollbar-none">
      <template v-if="activeCategory">
        <NuxtLink
          :to="toCategoryRoute(activeCategory.id)"
          class="flex items-center gap-2 px-4 py-3.5 border-b border-muted text-sm font-bold text-default hover:(bg-muted text-primary) transition"
        >
          <span class="flex-1 text-start">
            {{ $t('همه محصولات') }} {{ $t(activeCategory.name) }}
          </span>
          <UIcon
            name="i-tabler-chevron-left"
            class="size-4 shrink-0 text-dimmed"
          />
        </NuxtLink>

        <nav
          v-if="activeCategory.subs.length"
          class="flex flex-col"
          :aria-label="$t('زیردسته‌ها')"
        >
          <div
            v-for="sub in activeCategory.subs"
            :key="sub.name"
            class="border-b border-muted last:border-b-0"
          >
            <button
              type="button"
              class="w-full flex items-center gap-2 px-4 py-3.5 text-start text-sm font-medium text-default hover:bg-muted transition"
              @click="toggleSub(sub.name)"
            >
              <span class="flex-1">{{ $t(sub.name) }}</span>
              <UIcon
                name="i-tabler-chevron-down"
                class="size-4 shrink-0 text-dimmed transition"
                :class="{ 'rotate-180': isSubExpanded(sub.name) }"
              />
            </button>

            <ul
              v-if="isSubExpanded(sub.name)"
              class="pb-2 bg-muted/40"
            >
              <li
                v-for="item in sub.items"
                :key="item"
              >
                <NuxtLink
                  :to="toSearchRoute({ q: item, category: activeCategory.id })"
                  class="block px-4 py-2.5 ps-6 text-xs text-toned hover:(bg-muted text-primary) transition"
                >
                  {{ item }}
                </NuxtLink>
              </li>
            </ul>
          </div>
        </nav>

        <div
          v-else
          class="px-4 py-8 text-center"
        >
          <p class="text-sm text-dimmed mb-4">
            {{ $t('زیردسته‌ای یافت نشد.') }}
          </p>
          <UButton
            :to="toCategoryRoute(activeCategory.id)"
            color="primary"
            variant="soft"
            size="sm"
          >
            {{ $t('مشاهده محصولات') }}
          </UButton>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getCategoryIcon, toCategoryRoute, toSearchRoute } from '~/data/categories'

defineProps<{
  compact?: boolean
}>()

const {
  categories,
  activeId,
  activeCategory,
  selectCategory,
  toggleSub,
  isSubExpanded,
} = useCategoryBrowser()
</script>
