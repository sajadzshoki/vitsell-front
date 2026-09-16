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
        class="text-muted hover:text-primary transition-all  cursor-pointer num"
        @click="emit('open-reviews')"
      >
        {{ product.reviews.toLocaleString('fa-IR') }} {{ $t('دیدگاه') }}
      </button>

      <span class="size-1 rounded-full bg-accented" />

      <button
        type="button"
        class="text-muted hover:text-primary transition-all  cursor-pointer num"
        @click="emit('open-questions')"
      >
        {{ questionsCount.toLocaleString('fa-IR') }} {{ $t('پرسش') }}
      </button>
    </div>

    <!-- واریانت‌ها -->
    <div
      v-if="variantAxes.length"
      class="pb-4 border-b border-muted"
    >
      <div
        v-for="axis in variantAxes"
        :key="axis.attributeId"
        class="mb-4 last:mb-0"
      >
        <div class="text-xs text-muted mb-2">
          {{ axis.attributeName }}:
          <span class="text-highlighted font-medium">
            {{ selectedLabel(axis.attributeId) }}
          </span>
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <button
            v-for="option in axis.options"
            :key="option.valueId"
            type="button"
            class="min-h-9 inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer"
            :class="selectedOptions[axis.attributeId] === option.valueId
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-muted bg-default text-toned hover:(border-primary/50 text-primary)'"
            @click="selectOption(axis.attributeId, option.valueId)"
          >
            <span
              v-if="option.meta"
              class="size-5 rounded-full block border border-muted shrink-0"
              :style="{ backgroundColor: option.meta }"
            />
            {{ option.label }}
          </button>
        </div>
      </div>

      <div
        v-if="selectedVariant"
        class="mt-3 inline-flex items-center gap-2 text-xs"
        :class="selectedVariant.stock > 0 && selectedVariant.status === 'active' ? 'text-success' : 'text-error'"
      >
        <UIcon
          :name="selectedVariant.stock > 0 && selectedVariant.status === 'active'
            ? 'i-tabler-package'
            : 'i-tabler-package-off'"
          class="size-4"
        />
        {{ selectedVariant.stock > 0 && selectedVariant.status === 'active'
          ? `${$t('موجودی این ترکیب')}: ${selectedVariant.stock.toLocaleString('fa-IR')}`
          : $t('این ترکیب ناموجود است') }}
      </div>
    </div>

    <!-- رنگ قدیمی برای محصولاتی که هنوز واریانت ندارند -->
    <div
      v-else-if="product.colors?.length"
      class="pb-4 border-b border-muted"
    >
      <div class="text-xs text-muted mb-1.5">
        {{ $t('رنگ') }}:
        <span class="text-highlighted font-medium">{{ product.colors[colorIndex]?.name }}</span>
      </div>
      <div class="flex items-center gap-2 flex-wrap">
        <button
          v-for="(c, i) in product.colors"
          :key="c.name"
          type="button"
          class="size-9 rounded-full border-2 grid place-items-center transition-all  cursor-pointer"
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

    <!-- برچسب‌ها -->
    <div
      v-if="publicTags.length"
      class="flex flex-wrap gap-2 pb-4 border-b border-muted"
    >
      <NuxtLink
        v-for="tag in publicTags"
        :key="tag"
        :to="{ path: '/search', query: { q: tag } }"
        class="inline-flex items-center rounded-lg bg-muted px-2.5 py-1 text-xs text-toned hover:(bg-primary/10 text-primary) transition-colors cursor-pointer"
      >
        {{ tag }}
      </NuxtLink>
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
import {
  variantMatchesSelection,
  type SellerProductVariantOption,
} from '~/data/seller-product-variants'

const props = defineProps<{
  product: Product
}>()

const emit = defineEmits<{
  'open-reviews': []
  'open-specs': []
  'open-questions': []
}>()

const colorIndex = defineModel<number>('colorIndex', { default: 0 })
const selectedOptions = defineModel<Record<string, string>>('selectedOptions', { default: {} })

const { questions } = useProductDetail(() => props.product)

const features = computed(() => props.product.features ?? [])
const publicTags = computed(() =>
  (props.product.tags ?? []).filter(tag => !/^technolife$|^tl:/i.test(tag.trim())),
)
const highlightSpecs = computed(() => getProductHighlightSpecs(props.product, 6))
const returnNote = computed(() => getProductReturnNote(props.product))
const questionsCount = computed(() => questions.value.length)

const variantAxes = computed(() => {
  const variants = props.product.variants ?? []
  return (props.product.variantAxes ?? []).map((axis) => {
    const options = new Map<string, SellerProductVariantOption>()
    for (const variant of variants) {
      for (const option of variant.options) {
        if (option.attributeId === axis.attributeId && axis.valueIds.includes(option.valueId)) {
          options.set(option.valueId, option)
        }
      }
    }
    const first = options.values().next().value as SellerProductVariantOption | undefined
    return {
      attributeId: axis.attributeId,
      attributeName: first?.attributeName || axis.attributeId,
      options: axis.valueIds
        .map(valueId => options.get(valueId))
        .filter((option): option is SellerProductVariantOption => Boolean(option)),
    }
  }).filter(axis => axis.options.length)
})

const selectedVariant = computed(() =>
  (props.product.variants ?? []).find(variant =>
    variantMatchesSelection(variant, selectedOptions.value),
  ) ?? null,
)

function selectOption(attributeId: string, valueId: string) {
  selectedOptions.value = { ...selectedOptions.value, [attributeId]: valueId }
}

function selectedLabel(attributeId: string) {
  const valueId = selectedOptions.value[attributeId]
  return variantAxes.value
    .find(axis => axis.attributeId === attributeId)
    ?.options.find(option => option.valueId === valueId)
    ?.label ?? ''
}

const introText = computed(() => {
  const short = htmlToPlainText(props.product.shortDesc)
  if (short) return short
  const raw = htmlToPlainText(props.product.description)
  if (!raw) return ''
  return raw.split(/\n+/).map(p => p.trim()).find(Boolean) ?? ''
})
</script>
