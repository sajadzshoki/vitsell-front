<template>
  <UDrawer
    v-model:open="open"
    direction="right"
    :title="$t('دسته‌بندی کالاها')"
    :handle="false"
    close
    :ui="{ content: 'max-w-sm w-[80vw]' }"
  >
    <template #body>
      <nav class="flex flex-col -mx-4">
        <NuxtLink
          to="/seller"
          class="flex items-center gap-3 px-4 py-3.5 text-start border-b border-muted hover:bg-muted transition"
          @click="open = false"
        >
          <UIcon name="i-tabler-building-store" class="size-5 text-primary shrink-0" />
          <span class="flex-1 text-sm font-medium text-primary">{{ $t('فروشنده شوید') }}</span>
          <UIcon name="i-tabler-chevron-left" class="size-4 text-dimmed shrink-0" />
        </NuxtLink>
        <div
          v-for="c in categories"
          :key="c.id"
          class="border-b border-muted"
        >
          <div class="flex items-center">
            <NuxtLink
              :to="toCategoryRoute(c.id)"
              class="flex flex-1 items-center gap-3 px-4 py-3.5 text-start hover:bg-muted transition min-w-0"
              @click="open = false"
            >
              <UIcon :name="getCategoryIcon(c.id)" class="size-5 text-muted shrink-0" />
              <span class="flex-1 text-sm font-medium text-default truncate">{{ $t(c.name) }}</span>
            </NuxtLink>
            <button
              v-if="c.subs.length"
              type="button"
              class="size-11 shrink-0 grid place-items-center text-dimmed hover:bg-muted transition"
              :aria-label="$t('زیردسته‌ها')"
              @click="toggle(c.id)"
            >
              <UIcon
                name="i-tabler-chevron-down"
                class="size-4 transition"
                :class="{ 'rotate-180': expanded === c.id }"
              />
            </button>
          </div>

          <div
            v-if="expanded === c.id && c.subs.length"
            class="bg-muted/60 pb-2"
          >
            <div
              v-for="sub in c.subs"
              :key="sub.name"
              class="px-4 py-2"
            >
              <p class="text-xs font-bold text-default mb-1.5">
                {{ $t(sub.name) }}
              </p>
              <NuxtLink
                v-for="item in sub.items"
                :key="item"
                :to="toSearchRoute({ q: item, category: c.id })"
                class="block text-xs text-muted hover:text-primary py-1.5 ps-3 transition"
                @click="open = false"
              >
                {{ item }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </nav>
    </template>
  </UDrawer>
</template>

<script setup lang="ts">
import { getCategoryIcon, toCategoryRoute, toSearchRoute } from '~/data/categories'

const open = defineModel<boolean>('open', { default: false })
const expanded = ref('')

const { categories, fetchCategories } = useCategories()
await fetchCategories({ withCounts: false })

function toggle(id: string) {
  expanded.value = expanded.value === id ? '' : id
}
</script>
