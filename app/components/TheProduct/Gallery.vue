<template>
  <div class="flex flex-col gap-3">
    <div
      ref="stageRef"
      class="relative w-full rounded-2xl overflow-hidden bg-muted md:aspect-square cursor-zoom-in select-none"
      role="button"
      tabindex="0"
      :aria-label="$t('بزرگ‌نمایی تصویر')"
      @mousemove="onMove"
      @mouseenter="onEnter"
      @mouseleave="onLeave"
      @click="openFullscreen"
      @keydown.enter.prevent="openFullscreen"
    >
      <img
        :src="imageSrc(currentImage)"
        :alt="product.title"
        class="size-full object-cover will-change-transform transition-[scale] duration-150 ease-out"
        :style="zoomStyle"
        draggable="false"
        loading="eager"
        decoding="async"
      >

      <UBadge
        v-if="discount > 0"
        color="error"
        size="lg"
        class="absolute top-4 inset-e-4 font-bold num shadow-lg shadow-error/30 pointer-events-none z-10"
      >
        {{ discount.toLocaleString('fa-IR') }}٪ {{ $t('تخفیف') }}
      </UBadge>

      <div
        class="absolute bottom-4 inset-s-4 flex items-center gap-2 z-10"
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
    </div>

    <div class="flex gap-2 overflow-x-auto no-scrollbar pb-1">
      <button
        v-for="(image, index) in gallery"
        :key="`${image}-${index}`"
        type="button"
        class="size-20 shrink-0 rounded-xl overflow-hidden border-2 transition"
        :class="active === index ? 'border-primary' : 'border-muted hover:border-accented'"
        :aria-label="$t('تصویر محصول')"
        @click="active = index"
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
        body: 'bg-transparent p-0 sm:p-0 flex flex-col items-center justify-center gap-4 min-h-dvh',
        close: 'text-inverted hover:bg-default/10',
      }"
    >
      <template #body>
        <div class="relative w-full max-w-5xl px-4 flex flex-col items-center gap-4">
          <img
            :src="imageSrc(currentImage)"
            :alt="product.title"
            class="max-h-[70dvh] w-auto max-w-full object-contain rounded-2xl"
            loading="eager"
            decoding="async"
          >

          <div class="flex gap-2 overflow-x-auto no-scrollbar max-w-full pb-1">
            <button
              v-for="(image, index) in gallery"
              :key="`fs-${image}-${index}`"
              type="button"
              class="size-16 sm:size-20 shrink-0 rounded-xl overflow-hidden border-2 transition"
              :class="active === index ? 'border-primary' : 'border-inverted/20 hover:border-inverted/50'"
              :aria-label="$t('تصویر محصول')"
              @click="active = index"
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

const liked = computed(() => isInWishlist(props.product.id))

const gallery = computed(() => {
  const images = props.product.gallery?.filter(Boolean) ?? []
  if (images.length) return images
  const fallback = props.product.image || 'noImage.png'
  return [fallback, fallback, fallback, fallback]
})

const currentImage = computed(() => gallery.value[active.value] || 'noImage.png')

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

function canHoverZoom() {
  if (!import.meta.client) return false
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
}

function onEnter() {
  if (!canHoverZoom() || fullscreen.value) return
  zooming.value = true
}

function onLeave() {
  zooming.value = false
  origin.value = { x: 50, y: 50 }
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

function openFullscreen() {
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
