<template>
  <div class="mt-6 overflow-hidden md:bg-default md:rounded-3xl md:border md:border-muted">
    <UTabs
      v-model="activeTab"
      :items="tabItems"
      variant="link"
      color="primary"
      class="w-full"
      :ui="{
        list: 'border-b border-muted rounded-none overflow-x-auto gap-0 px-0 md:px-4',
        trigger: 'whitespace-nowrap font-medium px-3 py-2.5 text-xs md:px-5 md:py-4 md:text-sm',
        content: 'px-0 pt-4 pb-2 md:p-6 lg:p-8',
      }"
    >
      <template #specs>
        <TheProductTabsSpecs :spec-groups="specGroups" />
      </template>

      <template #desc>
        <div class="text-sm text-toned space-y-3 md:space-y-4 leading-7 md:leading-8">
          <p>{{ leadDesc }}</p>
          <p
            v-for="(paragraph, i) in descParagraphs"
            :key="i"
          >
            {{ $t(paragraph) }}
          </p>
        </div>
      </template>

      <template #reviews>
        <TheProductTabsReviews :product="product" />
      </template>

      <template #questions>
        <TheProductTabsQuestions :product="product" />
      </template>
    </UTabs>
  </div>
</template>

<script setup lang="ts">
import {
  productDefaultDesc,
  productDescParagraphs,
} from '~/data/product-detail'
import type { Product } from '~/data/products'

const props = defineProps<{
  product: Product
}>()

const activeTab = defineModel<string>({ default: 'specs' })

const { t } = useI18n()
const { specGroups } = useProductDetail(() => props.product)

const descParagraphs = productDescParagraphs

const leadDesc = computed(() =>
  props.product.shortDesc || t(productDefaultDesc),
)

const tabItems = computed(() => [
  { label: t('مشخصات فنی'), value: 'specs', slot: 'specs' as const },
  { label: t('معرفی محصول'), value: 'desc', slot: 'desc' as const },
  { label: t('دیدگاه‌ها'), value: 'reviews', slot: 'reviews' as const },
  { label: t('سؤالات و پاسخ‌ها'), value: 'questions', slot: 'questions' as const },
])
</script>
