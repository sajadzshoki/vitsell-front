<template>
  <div
    v-if="show"
    class="mt-5 flex flex-col gap-3 sm:(flex-row items-center justify-between)"
  >
    <div class="flex items-center gap-3 flex-wrap justify-center sm:justify-start">
      <p class="text-xs text-muted num">
        {{ $t('صفحه') }}
        {{ page.toLocaleString('fa-IR') }}
        {{ $t('از') }}
        {{ pageCount.toLocaleString('fa-IR') }}
        <span class="text-dimmed mx-1">·</span>
        {{ total.toLocaleString('fa-IR') }}
        {{ $t('مورد') }}
      </p>
      <div class="flex items-center gap-2">
        <span class="text-xs text-muted whitespace-nowrap">{{ $t('در هر صفحه') }}</span>
        <USelect
          :model-value="String(pageSize)"
          :items="sizeItems"
          value-key="value"
          class="w-24"
          size="sm"
          @update:model-value="onPageSizeChange"
        />
      </div>
    </div>

    <div class="flex items-center justify-center gap-1.5 flex-wrap">
      <UButton
        type="button"
        color="neutral"
        variant="soft"
        size="sm"
        icon="i-tabler-chevrons-right"
        class="cursor-pointer"
        :disabled="page <= 1"
        :aria-label="$t('صفحه اول')"
        @click="goTo(1)"
      />
      <UPagination
        :page="page"
        :total="total"
        :items-per-page="pageSize"
        :sibling-count="siblingCount"
        color="neutral"
        active-color="primary"
        size="sm"
        @update:page="goTo"
      />
      <UButton
        type="button"
        color="neutral"
        variant="soft"
        size="sm"
        icon="i-tabler-chevrons-left"
        class="cursor-pointer"
        :disabled="page >= pageCount"
        :aria-label="$t('صفحه آخر')"
        @click="goTo(pageCount)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  total: number
  /** Hide when only one page and total fits; still show if total > 0 for page-size control */
  alwaysShowSize?: boolean
  siblingCount?: number
  pageSizeOptions?: number[]
}>(), {
  alwaysShowSize: true,
  siblingCount: 1,
  pageSizeOptions: () => [10, 20, 50, 100],
})

const page = defineModel<number>('page', { default: 1 })
const pageSize = defineModel<number>('pageSize', { default: 10 })

const pageCount = computed(() =>
  Math.max(1, Math.ceil((Number(props.total) || 0) / Math.max(1, pageSize.value))),
)

const show = computed(() => {
  const total = Number(props.total) || 0
  if (total <= 0) return false
  if (props.alwaysShowSize) return true
  return pageCount.value > 1
})

const sizeItems = computed(() =>
  props.pageSizeOptions.map(n => ({
    value: String(n),
    label: n.toLocaleString('fa-IR'),
  })),
)

function goTo(next: number) {
  const clamped = Math.min(pageCount.value, Math.max(1, Math.floor(Number(next) || 1)))
  if (clamped === page.value) return
  page.value = clamped
}

function onPageSizeChange(value: string | number) {
  const next = Math.max(1, Math.floor(Number(value) || pageSize.value))
  if (next === pageSize.value) return
  pageSize.value = next
  page.value = 1
}

watch(pageCount, (count) => {
  if (page.value > count) page.value = count
})
</script>
