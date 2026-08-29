<template>
  <template v-if="items.length > 0 && !isComparePage">
    <div
      v-if="items.length === 1"
      class="fixed inset-x-0 z-[60] flex justify-center px-4 pointer-events-none"
      :class="barBottomClass"
    >
      <div class="pointer-events-auto flex items-center gap-2 bg-inverted text-inverted text-xs rounded-full px-4 py-2.5 shadow-xl">
        <UIcon name="i-tabler-arrows-diff" class="size-4 shrink-0" />
        <span>{{ $t('برای مقایسه، یک محصول دیگر انتخاب کنید') }}</span>
      </div>
    </div>

    <div
      v-else
      class="fixed inset-x-0 z-[60] px-3 lg:px-0 flex justify-center pointer-events-none"
      :class="barBottomClass"
    >
      <div class="pointer-events-auto w-full lg:w-auto max-w-2xl bg-default/95 backdrop-blur border border-muted shadow-2xl rounded-t-2xl lg:rounded-2xl px-3 sm:px-4 py-3">
        <div class="flex items-center gap-2 sm:gap-3">
          <div class="flex -space-x-2 shrink-0">
            <button
              v-for="(product, index) in items"
              :key="product.id"
              type="button"
              class="relative size-9 sm:size-10 rounded-xl border-2 border-default bg-muted overflow-hidden shadow-sm"
              :style="{ zIndex: items.length - index }"
              :aria-label="$t('حذف از مقایسه')"
              @click="onToggle(product.id)"
            >
              <TheIcon
                :name="product.image || 'noImage.png'"
                icon-type="img"
                class="!size-full object-cover"
              />
              <span class="absolute top-0 inset-s-0 size-3.5 rounded-ee-md bg-inverted/90 text-inverted grid place-items-center">
                <UIcon name="i-tabler-x" class="size-2.5" />
              </span>
            </button>
          </div>

          <div class="flex-1 min-w-0 hidden sm:block">
            <div class="text-xs font-bold text-highlighted">
              {{ $t('مقایسه محصولات') }}
            </div>
            <div class="text-[11px] text-dimmed num mt-0.5">
              {{ items.length.toLocaleString('fa-IR') }} {{ $t('کالا انتخاب شده') }}
            </div>
          </div>
          <div class="flex-1 min-w-0 sm:hidden" />

          <UButton
            type="button"
            color="neutral"
            variant="outline"
            size="md"
            square
            class="shrink-0"
            icon="i-tabler-x"
            :aria-label="$t('پاک کردن همه')"
            @click="compareStore.clearCompare()"
          />

          <UButton
            type="button"
            color="primary"
            size="lg"
            class="shrink-0 font-bold shadow-lg shadow-primary/25"
            icon="i-tabler-arrows-diff"
            :to="{ name: 'compare' }"
          >
            {{ $t('مقایسه') }}
            <span class="hidden sm:inline">{{ $t('محصولات') }}</span>
          </UButton>
        </div>
      </div>
    </div>

    <div :class="spacerClass" />
  </template>
</template>

<script setup lang="ts">
const route = useRoute()
const compareStore = useCompareStore()
const { isBackwardPage } = useMobileBackward()

const items = computed(() => compareStore.products)

const pathNorm = computed(() => route.path.replace(/\/$/, '') || '/')
const isComparePage = computed(() => pathNorm.value === '/compare')

/** Product / cart use a taller fixed buy bar; other pages use bottom nav. */
const hasMobileBuyBar = computed(() => {
  return /^\/product\/[^/]+$/.test(pathNorm.value) || pathNorm.value === '/cart'
})

const barBottomClass = computed(() => {
  if (hasMobileBuyBar.value) {
    return 'bottom-[calc(5.25rem+env(safe-area-inset-bottom))] lg:bottom-4'
  }
  if (isBackwardPage.value) {
    return 'bottom-4'
  }
  return 'bottom-[calc(3.75rem+env(safe-area-inset-bottom))] lg:bottom-4'
})

const spacerClass = computed(() => {
  const base = items.value.length === 1 ? 'h-14' : 'h-24'
  if (hasMobileBuyBar.value) {
    return items.value.length === 1 ? 'h-28 lg:h-14' : 'h-40 lg:h-24'
  }
  return base
})

function onToggle(id: string) {
  compareStore.toggleCompare(id)
}
</script>
