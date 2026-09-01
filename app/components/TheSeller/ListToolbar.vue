<template>
  <div class="flex flex-col gap-3 mb-4">
    <div class="flex flex-col sm:(flex-row items-center) gap-3">
      <TheFormInput
        v-if="showSearch"
        :model-value="search"
        icon="i-tabler-search"
        :placeholder="searchPlaceholder"
        class="flex-1 w-full"
        @update:model-value="onSearch"
      />
      <div
        v-if="tabs?.length"
        class="flex items-center gap-2 overflow-x-auto scrollbar-none w-full sm:w-auto"
      >
        <UButton
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          :color="status === tab.id ? 'primary' : 'neutral'"
          :variant="status === tab.id ? 'soft' : 'ghost'"
          size="sm"
          class="shrink-0 cursor-pointer"
          @click="$emit('update:status', tab.id)"
        >
          {{ tab.label }}
          <span
            v-if="tab.count != null"
            class="num ms-1"
          >
            {{ tab.count.toLocaleString('fa-IR') }}
          </span>
        </UButton>
      </div>
      <div
        v-if="$slots.extra"
        class="flex items-center gap-2 shrink-0"
      >
        <slot name="extra" />
      </div>
    </div>
    <div
      v-if="showClear && hasActive"
      class="flex items-center justify-end"
    >
      <UButton
        type="button"
        color="neutral"
        variant="ghost"
        size="xs"
        icon="i-tabler-filter-off"
        class="cursor-pointer"
        @click="$emit('clear')"
      >
        {{ clearLabel }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
export type SellerListToolbarTab = {
  id: string
  label: string
  count?: number
}

withDefaults(defineProps<{
  search?: string
  status?: string
  tabs?: SellerListToolbarTab[]
  searchPlaceholder?: string
  showSearch?: boolean
  showClear?: boolean
  hasActive?: boolean
  clearLabel?: string
}>(), {
  search: '',
  status: 'all',
  tabs: () => [],
  searchPlaceholder: 'جستجو',
  showSearch: true,
  showClear: true,
  hasActive: false,
  clearLabel: 'پاک کردن فیلترها',
})

const emit = defineEmits<{
  'update:search': [value: string]
  'update:status': [value: string]
  clear: []
}>()

function onSearch(value: string | number) {
  emit('update:search', String(value ?? ''))
}
</script>
