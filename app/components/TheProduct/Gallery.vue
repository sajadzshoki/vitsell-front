<template>
  <div class="flex flex-col gap-2">
    <div class="flex flex-col gap-2 md:(flex-row items-start)">
      <!-- ستون عکس + بندانگشتی‌ها (عرض یکسان = هم‌تراز) -->
      <div class="order-1 md:order-2 flex-1 min-w-0 flex flex-col gap-2">
        <div
          v-if="buyerPhotos.length"
          class="flex items-center gap-4 px-0.5"
        >
          <button
            type="button"
            class="relative pb-1.5 text-sm font-medium transition-all  cursor-pointer"
            :class="galleryTab === 'official' ? 'text-highlighted' : 'text-muted hover:text-toned'"
            @click="setGalleryTab('official')"
          >
            {{ $t('رسمی') }}
            <span
              v-if="galleryTab === 'official'"
              class="absolute bottom-0 inset-x-0 h-0.5 rounded-full bg-primary"
            />
          </button>
          <button
            type="button"
            class="relative pb-1.5 text-sm font-medium transition-all  cursor-pointer"
            :class="galleryTab === 'buyers' ? 'text-highlighted' : 'text-muted hover:text-toned'"
            @click="setGalleryTab('buyers')"
          >
            {{ $t('خریداران') }}
            <span class="text-xs text-dimmed num ms-1">({{ buyerPhotos.length.toLocaleString('fa-IR') }})</span>
            <span
              v-if="galleryTab === 'buyers'"
              class="absolute bottom-0 inset-x-0 h-0.5 rounded-full bg-primary"
            />
          </button>
        </div>

        <div class="relative w-full rounded-2xl overflow-hidden bg-muted">
          <UCarousel
            ref="carousel"
            v-slot="{ item, index }"
            :items="gallery"
            :start-index="active"
            wheel-gestures
            class="w-full"
            :ui="{
              item: 'basis-full min-w-full ps-0',
              container: 'ms-0',
              viewport: 'overflow-hidden',
            }"
            @select="onSelect"
          >
            <div
              class="relative w-full aspect-square cursor-zoom-in select-none"
              role="button"
              tabindex="0"
              :aria-label="$t('بزرگ‌نمایی تصویر')"
              @pointerdown="onPointerDown"
              @pointermove="onPointerMove"
              @mousemove="onMove"
              @mouseenter="onEnter"
              @mouseleave="onLeave"
              @click="openFullscreen"
              @keydown.enter.prevent="openFullscreen"
            >
              <img
                :src="imageSrc(item)"
                :alt="product.title"
                class="size-full object-cover will-change-transform transition-[scale] duration-150 ease-out pointer-events-none"
                :style="active === index ? zoomStyle : undefined"
                draggable="false"
                loading="eager"
                decoding="async"
              >
            </div>
          </UCarousel>

          <UBadge
            v-if="discount > 0 && galleryTab === 'official'"
            color="error"
            size="lg"
            class="absolute top-3 inset-e-3 font-bold num shadow-lg shadow-error/30 pointer-events-none z-10"
          >
            {{ discount.toLocaleString('fa-IR') }}٪ {{ $t('تخفیف') }}
          </UBadge>

          <template v-if="gallery.length > 1">
            <UButton
              type="button"
              icon="i-tabler-chevron-right"
              color="neutral"
              variant="solid"
              size="sm"
              square
              class="absolute start-2 top-1/2 -translate-y-1/2 z-20 rounded-full shadow-md !opacity-80 hover:!opacity-100"
              :disabled="active <= 0"
              :aria-label="$t('تصویر قبلی')"
              @click.stop="goPrev"
            />
            <UButton
              type="button"
              icon="i-tabler-chevron-left"
              color="neutral"
              variant="solid"
              size="sm"
              square
              class="absolute end-2 top-1/2 -translate-y-1/2 z-20 rounded-full shadow-md !opacity-80 hover:!opacity-100"
              :disabled="active >= gallery.length - 1"
              :aria-label="$t('تصویر بعدی')"
              @click.stop="goNext"
            />
          </template>

          <div
            v-if="gallery.length > 1"
            class="absolute bottom-3 inset-x-0 z-10 flex justify-center gap-1.5 pointer-events-none"
          >
            <span
              v-for="(_, index) in gallery"
              :key="`dot-${index}`"
              class="size-1.5 rounded-full transition-all"
              :class="active === index ? 'bg-primary w-4' : 'bg-inverted/25'"
            />
          </div>
        </div>

        <div class="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          <button
            v-for="(image, index) in gallery"
            :key="`${galleryTab}-${image}-${index}`"
            type="button"
            class="size-16 md:size-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all  cursor-pointer"
            :class="active === index ? 'border-primary' : 'border-muted hover:border-accented'"
            :aria-label="galleryTab === 'buyers' ? $t('تصویر خریدار') : $t('تصویر محصول')"
            @click="select(index)"
          >
            <img
              :src="imageSrc(image)"
              :alt="product.title"
              class="size-full object-cover"
              loading="lazy"
              decoding="async"
            >
          </button>
        </div>

        <!-- موبایل: آیکون‌ها زیر گالری بندانگشتی -->
        <div class="flex md:hidden flex-row gap-2">
          <UButton
            type="button"
            :icon="liked ? 'i-tabler-heart-filled' : 'i-tabler-heart'"
            :color="liked ? 'error' : 'neutral'"
            variant="outline"
            size="md"
            square
            class="rounded-xl"
            :aria-label="$t('علاقه‌مندی')"
            @click="toggleWishlist(product.id)"
          />
          <UButton
            type="button"
            icon="i-tabler-share"
            color="neutral"
            variant="outline"
            size="md"
            square
            class="rounded-xl"
            :aria-label="$t('اشتراک‌گذاری')"
            @click="onShare"
          />
          <UButton
            type="button"
            icon="i-tabler-chart-line"
            color="neutral"
            variant="outline"
            size="md"
            square
            class="rounded-xl"
            :aria-label="$t('نمودار قیمت')"
            @click="priceChartOpen = true"
          />
        </div>
      </div>

      <!-- دسکتاپ RTL: سمت راست (start) عکس -->
      <div class="hidden md:(flex order-1 flex-col gap-2 shrink-0)">
        <UButton
          type="button"
          :icon="liked ? 'i-tabler-heart-filled' : 'i-tabler-heart'"
          :color="liked ? 'error' : 'neutral'"
          variant="outline"
          size="md"
          square
          class="rounded-xl"
          :aria-label="$t('علاقه‌مندی')"
          @click="toggleWishlist(product.id)"
        />
        <UButton
          type="button"
          icon="i-tabler-share"
          color="neutral"
          variant="outline"
          size="md"
          square
          class="rounded-xl"
          :aria-label="$t('اشتراک‌گذاری')"
          @click="onShare"
        />
        <UButton
          type="button"
          icon="i-tabler-chart-line"
          color="neutral"
          variant="outline"
          size="md"
          square
          class="rounded-xl"
          :aria-label="$t('نمودار قیمت')"
          @click="priceChartOpen = true"
        />
      </div>
    </div>

    <TheProductPriceChartModal
      v-model:open="priceChartOpen"
      :product="product"
    />

    <TheProductTabsReviewGalleryModal
      v-if="buyerPhotos.length"
      v-model:open="fullscreen"
      :buyer-photos="buyerPhotos"
      :official-images="officialGallery"
      :product-title="product.title"
      :initial-tab="galleryTab"
      :start-index="active"
    />

    <UModal
      v-else
      v-model:open="fullscreen"
      fullscreen
      :title="$t('گالری تصاویر')"
      :description="product.title"
      :ui="{
        content: 'bg-inverted/95 divide-y-0',
        header: 'bg-transparent border-0 min-h-0 p-3 sm:p-4 absolute top-0 inset-x-0 z-10',
        title: 'sr-only',
        description: 'sr-only',
        body: 'bg-transparent p-0 sm:p-0 flex flex-col items-center justify-center gap-3 min-h-dvh',
        close: 'text-inverted hover:bg-default/10',
      }"
    >
      <template #body>
        <div class="relative w-full max-w-5xl px-3 sm:px-4 flex flex-col items-center gap-3">
          <div class="relative w-full">
            <UCarousel
              ref="fsCarousel"
              v-slot="{ item }"
              :items="gallery"
              :start-index="active"
              wheel-gestures
              class="w-full"
              :ui="{
                item: 'basis-full min-w-full ps-0',
                container: 'ms-0',
              }"
              @select="onSelect"
            >
              <img
                :src="imageSrc(item)"
                :alt="product.title"
                class="max-h-[70dvh] w-auto max-w-full mx-auto object-contain rounded-2xl"
                loading="eager"
                decoding="async"
                draggable="false"
              >
            </UCarousel>

            <template v-if="gallery.length > 1">
              <UButton
                type="button"
                icon="i-tabler-chevron-right"
                color="neutral"
                variant="solid"
                size="md"
                square
                class="absolute start-0 sm:start-2 top-1/2 -translate-y-1/2 z-20 rounded-full shadow-md !opacity-80 hover:!opacity-100"
                :disabled="active <= 0"
                :aria-label="$t('تصویر قبلی')"
                @click.stop="goPrev"
              />
              <UButton
                type="button"
                icon="i-tabler-chevron-left"
                color="neutral"
                variant="solid"
                size="md"
                square
                class="absolute end-0 sm:end-2 top-1/2 -translate-y-1/2 z-20 rounded-full shadow-md !opacity-80 hover:!opacity-100"
                :disabled="active >= gallery.length - 1"
                :aria-label="$t('تصویر بعدی')"
                @click.stop="goNext"
              />
            </template>
          </div>

          <div class="flex gap-1.5 overflow-x-auto no-scrollbar max-w-full pb-1">
            <button
              v-for="(image, index) in gallery"
              :key="`fs-${image}-${index}`"
              type="button"
              class="size-14 sm:size-16 shrink-0 rounded-xl overflow-hidden border-2 transition-all  cursor-pointer"
              :class="active === index ? 'border-primary' : 'border-inverted/20 hover:border-inverted/50'"
              :aria-label="$t('تصویر محصول')"
              @click="select(index)"
            >
              <img
                :src="imageSrc(image)"
                :alt="product.title"
                class="size-full object-cover"
                loading="lazy"
                decoding="async"
              >
            </button>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/data/products'
import { products as localProducts } from '~/data/products'
import { collectBuyerPhotos } from '~/data/product-detail'

const props = defineProps<{
  product: Product
}>()

const { t } = useI18n()
const toast = useAppToast()
const { isInWishlist, toggleWishlist } = useShop()
const { allReviews } = useProductDetail(() => props.product)

const active = ref(0)
const fullscreen = ref(false)
const priceChartOpen = ref(false)
const zooming = ref(false)
const origin = ref({ x: 50, y: 50 })
const stageRef = ref<HTMLElement | null>(null)
const carousel = ref<{ emblaApi?: { scrollTo: (index: number) => void } | null } | null>(null)
const fsCarousel = ref<{ emblaApi?: { scrollTo: (index: number) => void } | null } | null>(null)
const dragMoved = ref(false)
const galleryTab = ref<'official' | 'buyers'>('official')

const liked = computed(() => isInWishlist(props.product.id))

const colorMode = useColorMode()

const buyerPhotos = computed(() => collectBuyerPhotos(allReviews.value))

const officialGallery = computed(() => {
  const fromProduct = props.product.gallery?.filter(Boolean) ?? []
  const fromLocal = localProducts
    .find(p => p.id === props.product.id)
    ?.gallery
    ?.filter(Boolean) ?? []
  // Prefer richer local mock gallery when API/seed payload is still short.
  const images = fromLocal.length > fromProduct.length ? fromLocal : fromProduct
  if (images.length) return images

  const dark = props.product.imageDark?.trim()
  const light = props.product.image?.trim()
  const fallback = (colorMode.value === 'dark' && dark ? dark : light) || 'noImage.png'
  return [fallback]
})

const gallery = computed(() => {
  if (galleryTab.value === 'buyers' && buyerPhotos.value.length) {
    return buyerPhotos.value.map(p => p.url)
  }
  return officialGallery.value
})

const discount = computed(() => {
  const { oldPrice, price } = props.product
  if (!oldPrice) return 0
  return Math.round(((oldPrice - price) / oldPrice) * 100)
})

const zoomStyle = computed(() => {
  if (!zooming.value) return undefined
  return {
    transformOrigin: `${origin.value.x}% ${origin.value.y}%`,
    scale: '2',
  }
})

watch(() => props.product.id, () => {
  active.value = 0
  fullscreen.value = false
  priceChartOpen.value = false
  zooming.value = false
  galleryTab.value = 'official'
})

watch(galleryTab, () => {
  active.value = 0
  nextTick(() => {
    carousel.value?.emblaApi?.scrollTo(0)
  })
})

function setGalleryTab(tab: 'official' | 'buyers') {
  if (tab === 'buyers' && !buyerPhotos.value.length) return
  galleryTab.value = tab
}

function imageSrc(name: string) {
  if (!name) return '/images/noImage.png'
  const resolved = resolveMediaUrl(name)
  if (resolved) return resolved
  if (name.startsWith('http') || name.startsWith('/')) return name
  if (name.includes('/')) return `/${name}`
  return `/images/${name}`
}

function onSelect(index: number) {
  active.value = index
  zooming.value = false
}

function select(index: number) {
  active.value = index
  carousel.value?.emblaApi?.scrollTo(index)
  fsCarousel.value?.emblaApi?.scrollTo(index)
}

function goPrev() {
  if (active.value <= 0) return
  select(active.value - 1)
}

function goNext() {
  if (active.value >= gallery.value.length - 1) return
  select(active.value + 1)
}

function canHoverZoom() {
  if (!import.meta.client) return false
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
}

function onEnter(event: MouseEvent) {
  if (!canHoverZoom() || fullscreen.value) return
  stageRef.value = event.currentTarget as HTMLElement
  zooming.value = true
}

function onLeave() {
  zooming.value = false
  origin.value = { x: 50, y: 50 }
  stageRef.value = null
}

function onMove(event: MouseEvent) {
  if (!zooming.value || !stageRef.value) return
  const rect = stageRef.value.getBoundingClientRect()
  if (!rect.width || !rect.height) return
  origin.value = {
    x: ((event.clientX - rect.left) / rect.width) * 100,
    y: ((event.clientY - rect.top) / rect.height) * 100,
  }
}

function onPointerDown() {
  dragMoved.value = false
}

function onPointerMove(event: PointerEvent) {
  if (event.buttons === 0) return
  if (Math.abs(event.movementX) + Math.abs(event.movementY) > 4) {
    dragMoved.value = true
    zooming.value = false
  }
}

function openFullscreen() {
  if (dragMoved.value) return
  zooming.value = false
  fullscreen.value = true
}

async function onShare() {
  const url = import.meta.client ? window.location.href : ''
  if (!url) return

  if (navigator.share) {
    try {
      await navigator.share({ title: props.product.title, url })
      return
    }
    catch {
      // cancelled or unavailable — fall through to clipboard
    }
  }
  try {
    await navigator.clipboard.writeText(url)
    toast.success(t('لینک محصول کپی شد'))
  }
  catch {
    toast.error(t('کپی لینک ناموفق بود'))
  }
}
</script>
