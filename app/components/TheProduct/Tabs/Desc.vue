<template>
  <div class="space-y-6 md:space-y-8">
    <div class="text-sm text-toned space-y-2.5 md:space-y-4 leading-6 md:leading-8">
      <p v-if="leadDesc">
        {{ leadDesc }}
      </p>
      <p
        v-for="(paragraph, i) in descParagraphs"
        :key="i"
      >
        {{ paragraph }}
      </p>
      <p
        v-if="!leadDesc && !descParagraphs.length"
        class="text-muted"
      >
        {{ $t('توضیحات این محصول هنوز ثبت نشده است.') }}
      </p>
    </div>

    <section
      v-if="product.video"
      class="space-y-3"
    >
      <h3 class="text-sm md:text-base font-bold text-highlighted">
        {{ $t('ویدیو معرفی') }}
      </h3>
      <div class="relative w-full overflow-hidden rounded-2xl bg-inverted aspect-video border border-muted">
        <video
          class="size-full object-cover"
          :src="product.video"
          :poster="product.image"
          controls
          playsinline
          preload="metadata"
          :aria-label="$t('ویدیو معرفی محصول')"
        />
      </div>
    </section>

    <section
      v-if="mediaImages.length"
      class="space-y-3"
    >
      <h3 class="text-sm md:text-base font-bold text-highlighted">
        {{ $t('تصاویر معرفی') }}
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        <figure
          v-for="(src, i) in mediaImages"
          :key="`${src}-${i}`"
          class="overflow-hidden rounded-2xl bg-muted border border-muted"
        >
          <img
            :src="src"
            :alt="`${product.title} — ${$t('تصویر')} ${(i + 1).toLocaleString('fa-IR')}`"
            class="w-full aspect-[4/3] object-cover"
            loading="lazy"
            decoding="async"
          >
        </figure>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/data/products'

const props = defineProps<{
  product: Product
}>()

const leadDesc = computed(() => props.product.shortDesc?.trim() || '')

const descParagraphs = computed(() => {
  const raw = props.product.description?.trim()
  if (!raw) return [] as string[]
  return raw.split(/\n+/).map(p => p.trim()).filter(Boolean)
})

const mediaImages = computed(() => {
  const fromDesc = props.product.descImages?.filter(Boolean) ?? []
  if (fromDesc.length) return fromDesc
  const gallery = props.product.gallery?.filter(Boolean) ?? []
  return gallery.filter(src => src !== props.product.image)
})
</script>
