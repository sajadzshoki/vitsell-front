<template>
  <div class="flex flex-col gap-4 md:gap-5">
    <!-- امتیاز و لینک‌ها -->
    <div class="flex items-center gap-2 flex-wrap text-xs">
      <div class="flex items-center gap-1 bg-warning/10 text-warning rounded-lg px-2 py-1">
        <UIcon
          name="i-tabler-star-filled"
          class="size-3.5"
        />
        <span class="text-sm font-bold num">
          {{ product.rating.toLocaleString('fa-IR') }}
        </span>
      </div>

      <button
        type="button"
        class="text-muted hover:text-primary transition cursor-pointer num"
        @click="emit('open-reviews')"
      >
        {{ product.reviews.toLocaleString('fa-IR') }} {{ $t('دیدگاه') }}
      </button>

      <span class="size-1 rounded-full bg-accented" />

      <button
        type="button"
        class="text-muted hover:text-primary transition cursor-pointer num"
        @click="emit('open-questions')"
      >
        {{ questionsCount.toLocaleString('fa-IR') }} {{ $t('پرسش') }}
      </button>
    </div>

    <!-- رنگ -->
    <div
      v-if="product.colors?.length"
      class="pb-4 border-b border-muted"
    >
      <div class="text-xs text-muted mb-1.5">
        {{ $t('رنگ') }}:
        <span class="text-highlighted font-medium">
          {{ product.colors[colorIndex]?.name }}
        </span>
      </div>
      <div class="flex items-center gap-2 flex-wrap">
        <button
          v-for="(c, i) in product.colors"
          :key="c.name"
          type="button"
          class="size-9 rounded-full border-2 grid place-items-center transition cursor-pointer"
          :class="colorIndex === i ? 'border-primary' : 'border-muted'"
          :aria-label="c.name"
          @click="colorIndex = i"
        >
          <span
            class="size-7 rounded-full block border border-muted"
            :style="{ backgroundColor: c.hex }"
          />
        </button>
      </div>
    </div>

    <!-- ارسال سریع -->
    <div
      v-if="product.fastDelivery"
      class="flex items-center gap-2.5 rounded-xl bg-info/10 text-info px-3 py-2.5"
    >
      <UIcon
        name="i-tabler-truck-delivery"
        class="size-5 shrink-0"
      />
      <span class="text-xs md:text-sm font-medium text-highlighted">
        {{ $t('امکان ارسال سریع برای این کالا') }}
      </span>
    </div>

    <!-- توضیحات — مستقیم بالای ویژگی‌ها -->
    <div
      v-if="introText"
      class="space-y-1.5"
    >
      <h3 class="text-sm font-bold text-highlighted">
        {{ $t('توضیحات') }}
      </h3>
      <p class="text-sm text-toned leading-7">
        {{ introText }}
      </p>
    </div>

    <!-- ویژگی‌ها -->
    <div
      v-if="highlightSpecs.length"
      class="pt-1"
    >
      <h3 class="text-sm md:text-base font-bold text-highlighted mb-2.5 md:mb-3">
        {{ $t('ویژگی‌ها') }}
      </h3>

      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-2.5">
        <div
          v-for="spec in highlightSpecs"
          :key="spec.key"
          class="rounded-xl bg-muted px-3 py-2.5 md:(px-3.5 py-3) min-h-16 flex flex-col gap-1 text-start"
        >
          <span class="text-[10px] md:text-[11px] text-muted leading-4 line-clamp-1">
            {{ $t(spec.key) }}
          </span>
          <span class="text-xs md:text-sm font-semibold text-highlighted leading-5 line-clamp-2">
            {{ spec.value }}
          </span>
        </div>
      </div>

      <UButton
        variant="link"
        color="primary"
        size="sm"
        class="mt-2 px-0 font-medium"
        trailing-icon="i-tabler-chevron-left"
        @click="emit('open-specs')"
      >
        {{ $t('مشاهده همه مشخصات') }}
      </UButton>
    </div>

    <ul
      v-else-if="features.length"
      class="space-y-1.5"
    >
      <li
        v-for="feature in features"
        :key="feature"
        class="flex items-center gap-2 text-xs text-toned"
      >
        <UIcon
          name="i-tabler-check"
          class="size-4 text-success shrink-0"
        />
        {{ $t(feature) }}
      </li>
    </ul>

    <!-- نکته مرجوعی -->
    <div class="flex gap-2.5 rounded-xl bg-muted px-3 py-3 text-start">
      <UIcon
        name="i-tabler-info-circle"
        class="size-5 shrink-0 text-muted mt-0.5"
      />
      <p class="text-[11px] md:text-xs text-toned leading-5">
        {{ $t(returnNote) }}
      </p>
    </div>

    <!-- مزیت ارسال / عضویت -->
    <div class="rounded-xl border border-primary/20 bg-primary/5 px-3.5 py-3.5 space-y-2">
      <div class="flex items-center gap-2 text-primary">
        <UIcon
          name="i-tabler-rosette-discount-check"
          class="size-5 shrink-0"
        />
        <span class="text-sm font-bold">
          {{ $t('ارسال رایگان برای سفارش‌های خاص') }}
        </span>
      </div>
      <ul class="space-y-1.5 text-[11px] md:text-xs text-toned ps-7">
        <li class="list-disc">
          {{ $t('ارسال سریع در شهرهای تحت پوشش') }}
        </li>
        <li class="list-disc">
          {{ $t('ضمانت اصالت و سلامت فیزیکی کالا') }}
        </li>
        <li class="list-disc">
          {{ $t('پشتیبانی پاسخ‌گو پس از خرید') }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  getProductHighlightSpecs,
  getProductReturnNote,
} from '~/data/product-detail'
import type { Product } from '~/data/products'
import { htmlToPlainText } from '~/data/seo'

const props = defineProps<{
  product: Product
}>()

const emit = defineEmits<{
  'open-reviews': []
  'open-specs': []
  'open-questions': []
}>()

const colorIndex = defineModel<number>('colorIndex', { default: 0 })

const { questions } = useProductDetail(() => props.product)

const features = computed(() => props.product.features ?? [])
const highlightSpecs = computed(() => getProductHighlightSpecs(props.product, 6))
const returnNote = computed(() => getProductReturnNote(props.product))
const questionsCount = computed(() => questions.value.length)

const introText = computed(() => {
  const short = htmlToPlainText(props.product.shortDesc)
  if (short) return short
  const raw = htmlToPlainText(props.product.description)
  if (!raw) return ''
  return raw.split(/\n+/).map(p => p.trim()).find(Boolean) ?? ''
})
</script>
