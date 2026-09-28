<template>
  <div class="space-y-6 md:space-y-8">
    <div class="text-sm text-toned space-y-2.5 md:space-y-4 leading-6 md:leading-8">
      <div
        v-if="safeLeadHtml"
        class="blog-prose"
        v-html="safeLeadHtml"
      />
      <div
        v-if="safeBodyHtml"
        class="blog-prose"
        v-html="safeBodyHtml"
      />
      <p
        v-if="!safeLeadHtml && !safeBodyHtml"
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
          v-for="(item, i) in mediaImages"
          :key="`${item.src}-${i}`"
          class="overflow-hidden rounded-2xl bg-muted border border-muted"
        >
          <img
            :src="item.src"
            :alt="item.alt"
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
import { productImageAlt } from '~/data/products'
import { contentToHtml, isEmptyHtml, sanitizeBlogHtml } from '~/data/seller-blog'

const props = defineProps<{
  product: Product
}>()

function escapeAttr(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
}

function rewriteLeakedImageAlts(html: string, title: string) {
  const safeTitle = escapeAttr(title.trim())
  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    if (!/\balt\s*=/i.test(tag)) return tag
    return tag.replace(/\balt\s*=\s*(["'])([\s\S]*?)\1/i, (full, quote: string, alt: string) => {
      if (!/technolife|تکنولایف/i.test(alt)) return full
      return `alt=${quote}${safeTitle}${quote}`
    })
  })
}

function toSafeHtml(raw: string | null | undefined) {
  const value = raw?.trim()
  if (!value || isEmptyHtml(value)) return ''
  const html = resolveHtmlMediaUrls(sanitizeBlogHtml(contentToHtml([value])))
  return rewriteLeakedImageAlts(html, props.product.title)
}

function resolveHtmlMediaUrls(html: string) {
  return html.replace(
    /(<img\b[^>]*\bsrc=["'])([^"']+)(["'][^>]*>)/gi,
    (_tag, before: string, src: string, after: string) => {
      const resolved = resolveMediaUrl(src)
      return `${before}${resolved || src}${after}`
    },
  )
}

const safeLeadHtml = computed(() => toSafeHtml(props.product.shortDesc))
const safeBodyHtml = computed(() => toSafeHtml(props.product.description))

const mediaImages = computed(() => {
  return (props.product.descImages ?? [])
    .filter(Boolean)
    .map(src => ({
      src: resolveMediaUrl(src) || src,
      alt: productImageAlt(props.product.imageAlts, src, props.product.title),
    }))
})
</script>
