<template>
  <div class="flex flex-col gap-2">
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
        v-if="discount > 0"
        color="error"
        size="lg"
        class="absolute top-3 inset-e-3 font-bold num shadow-lg shadow-error/30 pointer-events-none z-10"
      >
        {{ discount.toLocaleString('fa-IR') }}٪ {{ $t('تخفیف') }}
      </UBadge>

      <div
        class="absolute bottom-3 inset-s-3 flex items-center gap-2 z-10"
        @click.stop
      >
        <UButton
          type="button"
          :icon="liked ? 'i-tabler-heart-filled' : 'i-tabler-heart'"
          :color="liked ? 'error' : 'neutral'"
          variant="solid"
          size="md"
          square
          class="rounded-full shadow-md backdrop-blur"
          :class="liked ? '' : 'bg-default/95 text-toned'"
          :aria-label="$t('علاقه‌مندی')"
          @click="toggleWishlist(product.id)"
        />
        <UButton
          type="button"
          icon="i-tabler-share"
          color="neutral"
          variant="solid"
          size="md"
          square
          class="rounded-full shadow-md backdrop-blur bg-default/95 text-toned"
          :aria-label="$t('اشتراک‌گذاری')"
          @click="onShare"
        />
      </div>

      <div
        v-if="gallery.length > 1"
        class="absolute bottom-14 inset-x-0 z-10 flex justify-center gap-1.5 pointer-events-none"
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
        :key="`${image}-${index}`"
        type="button"
        class="size-16 md:size-20 shrink-0 rounded-xl overflow-hidden border-2 transition"
        :class="active === index ? 'border-primary' : 'border-muted hover:border-accented'"
        :aria-label="$t('تصویر محصول')"
        @click="select(index)"
      >
        <TheIcon
          :name="image || 'noImage.png'"
          icon-type="img"
          class="!size-full object-cover"
        />
      </button>
    </div>

    <UModal
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

          <div class="flex gap-1.5 overflow-x-auto no-scrollbar max-w-full pb-1">
            <button
              v-for="(image, index) in gallery"
              :key="`fs-${image}-${index}`"
              type="button"
              class="size-14 sm:size-16 shrink-0 rounded-xl overflow-hidden border-2 transition"
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

const props = defineProps<{
  product: Product
}>()

const { isInWishlist, toggleWishlist } = useShop()

const active = ref(0)
const fullscreen = ref(false)
const zooming = ref(false)
const origin = ref({ x: 50, y: 50 })
const stageRef = ref<HTMLElement | null>(null)
const carousel = ref<{ emblaApi?: { scrollTo: (index: number) => void } | null } | null>(null)
const fsCarousel = ref<{ emblaApi?: { scrollTo: (index: number) => void } | null } | null>(null)
const dragMoved = ref(false)

const liked = computed(() => isInWishlist(props.product.id))

const colorMode = useColorMode()

const gallery = computed(() => {
  const images = props.product.gallery?.filter(Boolean) ?? []
  if (images.length) return images
  const dark = props.product.imageDark?.trim()
  const light = props.product.image?.trim()
  const fallback = (colorMode.value === 'dark' && dark ? dark : light) || 'noImage.png'
  return [fallback, fallback, fallback, fallback]
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
  zooming.value = false
})

function imageSrc(name: string) {
  if (!name) return '/images/noImage.png'
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
      // cancelled
    }
  }
  try {
    await navigator.clipboard.writeText(url)
  }
  catch {
    // unavailable
  }
}
</script>
