<template>
  <section class="bg-default border border-muted rounded-2xl p-5 md:p-6">
    <div class="flex gap-2 overflow-x-auto pb-1 mb-5 scrollbar-none -mx-1 px-1">
      <UButton
        v-for="category in categoriesWithAll"
        :key="category.id"
        type="button"
        :color="activeCategory === category.id ? 'primary' : 'neutral'"
        :variant="activeCategory === category.id ? 'soft' : 'ghost'"
        size="sm"
        class="shrink-0 rounded-full font-medium"
        @click="selectCategory(category.id)"
      >
        <UIcon
          v-if="category.icon"
          :name="category.icon"
          class="size-4"
        />
        {{ $t(category.label) }}
        <span
          v-if="category.count !== undefined"
          class="text-[10px] num opacity-70"
        >
          ({{ category.count }})
        </span>
      </UButton>
    </div>

    <div class="flex flex-col divide-y divide-muted">
      <div
        v-for="(item, index) in filteredItems"
        :key="`${item.categoryId}-${index}`"
        class="py-0.5"
      >
        <button
          type="button"
          class="w-full flex items-center justify-between gap-3 py-4 text-start transition-colors"
          :class="openIndex === index ? 'text-primary' : 'hover:text-primary'"
          :aria-expanded="openIndex === index"
          @click="toggle(index)"
        >
          <span class="text-sm font-semibold text-highlighted flex-1 min-w-0">
            {{ $t(item.question) }}
          </span>
          <UIcon
            name="i-tabler-chevron-down"
            class="size-4 text-dimmed shrink-0 transition-transform duration-300 ease-out"
            :class="openIndex === index && 'rotate-180'"
          />
        </button>

        <div
          class="grid transition-[grid-template-rows] duration-300 ease-out"
          :class="openIndex === index ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
        >
          <div class="overflow-hidden">
            <div class="pb-4 text-sm text-toned leading-7">
              {{ $t(item.answer) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="filteredItems.length === 0"
      class="py-10 text-center text-sm text-muted"
    >
      {{ $t('سوالی در این دسته یافت نشد.') }}
    </div>

    <div class="mt-6 pt-5 border-t border-muted flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <p class="text-sm text-toned">
        {{ $t('پاسخ سوال خود را پیدا نکردید؟') }}
      </p>
      <UButton
        to="/contact"
        color="primary"
        variant="soft"
        size="sm"
        trailing-icon="i-tabler-arrow-left"
      >
        {{ $t('تماس با پشتیبانی') }}
      </UButton>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { StaticFaqCategory, StaticFaqItem } from '~/data/static-pages'

const props = defineProps<{
  categories: StaticFaqCategory[]
  items: StaticFaqItem[]
}>()

const activeCategory = ref('all')
const openIndex = ref<number | null>(0)

const categoriesWithAll = computed(() => [
  {
    id: 'all',
    label: 'همه',
    icon: 'i-tabler-layout-grid',
    count: props.items.length,
  },
  ...props.categories.map((category) => ({
    ...category,
    count: props.items.filter(item => item.categoryId === category.id).length,
  })),
])

const filteredItems = computed(() =>
  activeCategory.value === 'all'
    ? props.items
    : props.items.filter(item => item.categoryId === activeCategory.value),
)

function selectCategory(id: string) {
  activeCategory.value = id
  openIndex.value = filteredItems.value.length ? 0 : null
}

function toggle(index: number) {
  openIndex.value = openIndex.value === index ? null : index
}

watch(filteredItems, (items) => {
  if (openIndex.value !== null && openIndex.value >= items.length) {
    openIndex.value = items.length ? 0 : null
  }
})
</script>
