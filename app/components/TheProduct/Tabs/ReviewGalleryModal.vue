<template>
  <UModal
    v-model:open="open"
    fullscreen
    :title="$t('گالری تصاویر خریداران')"
    :description="productTitle || $t('تصاویر کاربران')"
    :ui="{
      content: 'bg-inverted divide-y-0',
      header: 'bg-transparent border-0 min-h-0 p-3 sm:p-4 absolute top-0 inset-x-0 z-20',
      title: 'sr-only',
      description: 'sr-only',
      body: 'bg-transparent p-0 sm:p-0 flex flex-col overflow-hidden h-dvh',
      close: 'text-inverted hover:bg-default/10',
    }"
  >
    <template #body>
      <div class="flex flex-col h-dvh overflow-hidden pt-14 pb-4">
        <!-- Tabs -->
        <div
          v-if="showOfficialTab"
          class="flex items-center justify-center gap-6 sm:gap-8 px-4 mb-3 shrink-0"
        >
          <button
            type="button"
            class="relative pb-2 text-sm font-medium transition-all  cursor-pointer"
            :class="tab === 'official' ? 'text-inverted' : 'text-inverted/50 hover:text-inverted/80'"
            @click="setTab('official')"
          >
            {{ $t('رسمی') }}
            <span
              v-if="tab === 'official'"
              class="absolute bottom-0 inset-x-0 h-0.5 rounded-full bg-inverted"
            />
          </button>
          <button
            type="button"
            class="relative pb-2 text-sm font-medium transition-all  cursor-pointer"
            :class="tab === 'buyers' ? 'text-inverted' : 'text-inverted/50 hover:text-inverted/80'"
            @click="setTab('buyers')"
          >
            {{ $t('خریداران') }}
            <span
              v-if="tab === 'buyers'"
              class="absolute bottom-0 inset-x-0 h-0.5 rounded-full bg-inverted"
            />
          </button>
        </div>

        <!-- Main split -->
        <div class="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-3 sm:px-6">
          <!-- Review panel (buyers) -->
          <aside
            v-if="tab === 'buyers' && activeReview"
            class="md:col-span-4 order-2 md:order-1 flex flex-col gap-3 text-inverted md:max-h-[calc(100dvh-11rem)] md:overflow-y-auto"
          >
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-sm font-medium">{{ activeReview.name }}</span>
              <UBadge
                v-if="activeReview.verified"
                color="success"
                variant="soft"
                size="xs"
              >
                {{ $t('خریدار') }}
              </UBadge>
            </div>
            <div class="flex gap-0.5">
              <UIcon
                v-for="star in 5"
                :key="star"
                name="i-tabler-star-filled"
                class="size-4"
                :class="star <= activeReview.rating ? 'text-warning' : 'text-inverted/25'"
              />
            </div>
            <p class="text-sm leading-7 text-inverted/90">
              {{ $t(activeReview.text) }}
            </p>
            <div class="mt-auto pt-2 flex items-center gap-4 text-inverted/60">
              <span class="inline-flex items-center gap-1.5 text-xs">
                <UIcon name="i-tabler-thumb-up" class="size-4" />
                <span class="num">{{ activeReview.helpfulCount.toLocaleString('fa-IR') }}</span>
              </span>
            </div>
          </aside>

          <!-- Large image -->
          <div
            class="relative order-1 md:order-2 flex items-center justify-center min-h-[42dvh] md:min-h-0"
            :class="tab === 'buyers' && activeReview ? 'md:col-span-8' : 'md:col-span-12'"
          >
            <img
              :src="currentSrc"
              :alt="productTitle || $t('تصویر')"
              class="max-h-[58dvh] md:max-h-[68dvh] w-auto max-w-full object-contain rounded-2xl"
              loading="eager"
              decoding="async"
              draggable="false"
            >

            <template v-if="currentList.length > 1">
              <UButton
                type="button"
                icon="i-tabler-chevron-right"
                color="neutral"
                variant="solid"
                size="md"
                square
                class="absolute start-0 sm:start-2 top-1/2 -translate-y-1/2 z-10 rounded-full shadow-md !opacity-80 hover:!opacity-100"
                :disabled="activeIndex <= 0"
                :aria-label="$t('تصویر قبلی')"
                @click="goPrev"
              />
              <UButton
                type="button"
                icon="i-tabler-chevron-left"
                color="neutral"
                variant="solid"
                size="md"
                square
                class="absolute end-0 sm:end-2 top-1/2 -translate-y-1/2 z-10 rounded-full shadow-md !opacity-80 hover:!opacity-100"
                :disabled="activeIndex >= currentList.length - 1"
                :aria-label="$t('تصویر بعدی')"
                @click="goNext"
              />
            </template>
          </div>
        </div>

        <!-- Thumbnails: single-row horizontal strip (avoids layout collapse with many images) -->
        <div class="shrink-0 px-3 sm:px-6 mt-3 pb-1">
          <div
            ref="thumbStrip"
            class="flex gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none overscroll-x-contain max-w-5xl mx-auto py-1 cursor-default"
          >
            <button
              v-for="(item, index) in currentList"
              :key="`${tab}-${item}-${index}`"
              type="button"
              class="size-16 sm:size-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all cursor-pointer"
              :class="activeIndex === index ? 'border-primary' : 'border-inverted/20 hover:border-inverted/50'"
              :aria-label="$t('تصویر')"
              :data-thumb="index"
              @click="activeIndex = index"
            >
              <img
                :src="mediaSrc(item)"
                :alt="productTitle || $t('تصویر')"
                class="size-full object-cover"
                loading="lazy"
                decoding="async"
              >
            </button>
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { ProductBuyerPhoto, ProductReview } from '~/data/product-detail'

const props = withDefaults(defineProps<{
  buyerPhotos: ProductBuyerPhoto[]
  officialImages?: string[]
  productTitle?: string
  /** Prefer buyers tab when opening from a review thumbnail */
  initialTab?: 'official' | 'buyers'
  startIndex?: number
}>(), {
  officialImages: () => [],
  initialTab: 'buyers',
  startIndex: 0,
})

const open = defineModel<boolean>('open', { default: false })

const tab = ref<'official' | 'buyers'>('buyers')
const activeIndex = ref(0)
const thumbStrip = ref<HTMLElement | null>(null)

const showOfficialTab = computed(() => props.officialImages.length > 0)

const officialList = computed(() => props.officialImages.filter(Boolean))
const buyerUrls = computed(() => props.buyerPhotos.map(p => p.url))

const currentList = computed(() =>
  tab.value === 'official' ? officialList.value : buyerUrls.value,
)

const currentSrc = computed(() => mediaSrc(currentList.value[activeIndex.value] || ''))

const activeReview = computed<ProductReview | null>(() => {
  if (tab.value !== 'buyers') return null
  return props.buyerPhotos[activeIndex.value]?.review ?? null
})

watch(open, (isOpen) => {
  if (!isOpen) return
  tab.value = props.initialTab === 'official' && showOfficialTab.value
    ? 'official'
    : (buyerUrls.value.length ? 'buyers' : 'official')
  nextTick(() => {
    const max = Math.max(currentList.value.length - 1, 0)
    activeIndex.value = Math.min(Math.max(props.startIndex, 0), max)
    scrollThumbIntoView(activeIndex.value)
  })
})

watch(activeIndex, (index) => {
  scrollThumbIntoView(index)
})

function setTab(next: 'official' | 'buyers') {
  if (next === 'official' && !showOfficialTab.value) return
  if (next === 'buyers' && !buyerUrls.value.length) return
  if (tab.value === next) return
  tab.value = next
  activeIndex.value = 0
}

function mediaSrc(url: string) {
  return resolveMediaUrl(url) || '/images/noImage.png'
}

function scrollThumbIntoView(index: number) {
  nextTick(() => {
    const el = thumbStrip.value?.querySelector(`[data-thumb="${index}"]`) as HTMLElement | null
    el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  })
}

function onThumbWheel(event: WheelEvent) {
  const el = event.currentTarget as HTMLElement | null
  if (!el) return
  if (el.scrollWidth <= el.clientWidth + 1) return

  const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY)
    ? event.deltaX
    : event.deltaY
  if (!delta) return

  event.preventDefault()
  el.scrollBy({ left: delta })
}

watch(thumbStrip, (el) => {
  if (!el || (el as any)._thumbWheelBound) return
  el.addEventListener('wheel', onThumbWheel, { passive: false })
  ;(el as any)._thumbWheelBound = true
}, { immediate: true })

onBeforeUnmount(() => {
  thumbStrip.value?.removeEventListener('wheel', onThumbWheel)
})

function goPrev() {
  if (activeIndex.value <= 0) return
  activeIndex.value -= 1
}

function goNext() {
  if (activeIndex.value >= currentList.value.length - 1) return
  activeIndex.value += 1
}
</script>
