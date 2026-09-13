<template>
  <div class="space-y-4">
    <div>
      <div class="text-sm font-medium text-highlighted mb-1">
        {{ $t('هدف‌گیری') }}
      </div>
      <p class="text-[11px] text-muted leading-6 mb-3">
        {{ $t('محدوده اعمال را مشخص کنید. استثناها اختیاری‌اند.') }}
      </p>
      <UFormField :label="$t('محدوده')">
        <USelect
          :model-value="model.scope"
          :items="scopeItems"
          value-key="value"
          class="w-full"
          @update:model-value="patch({ scope: $event as any })"
        />
      </UFormField>
    </div>

    <div
      v-if="model.scope === 'products'"
      class="space-y-3"
    >
      <div class="flex items-center justify-between gap-2 flex-wrap">
        <div class="text-xs font-medium text-toned">
          {{ $t('محصولات') }}
          <span
            v-if="model.productIds.length"
            class="num text-muted ms-1"
          >({{ model.productIds.length.toLocaleString('fa-IR') }})</span>
        </div>
        <div class="flex items-center gap-2">
          <UButton
            type="button"
            size="xs"
            color="neutral"
            variant="soft"
            icon="i-tabler-download"
            class="cursor-pointer"
            @click="downloadProductIdsTemplate"
          >
            {{ $t('قالب CSV') }}
          </UButton>
          <UButton
            type="button"
            size="xs"
            color="primary"
            variant="soft"
            icon="i-tabler-upload"
            class="cursor-pointer"
            @click="productCsvInput?.click()"
          >
            {{ $t('ورود CSV') }}
          </UButton>
          <input
            ref="productCsvInput"
            type="file"
            accept=".csv,text/csv"
            class="sr-only"
            @change="onProductCsv"
          >
        </div>
      </div>
      <USelectMenu
        :model-value="model.productIds"
        :items="productItems"
        value-key="value"
        multiple
        class="w-full"
        :placeholder="$t('جستجو و انتخاب محصول')"
        @update:model-value="patch({ productIds: ($event as string[]) || [] })"
      />
      <div class="max-h-48 overflow-y-auto rounded-xl border border-muted p-3 space-y-2">
        <div class="flex items-center justify-between gap-2 mb-1">
          <span class="text-[11px] text-muted">{{ $t('انتخاب گروهی از لیست') }}</span>
          <UButton
            type="button"
            size="xs"
            color="neutral"
            variant="ghost"
            class="cursor-pointer"
            @click="toggleAllProducts"
          >
            {{ allProductsSelected ? $t('لغو همه') : $t('انتخاب همه') }}
          </UButton>
        </div>
        <UCheckbox
          v-for="item in productItems"
          :key="item.value"
          :model-value="model.productIds.includes(item.value)"
          :label="item.label"
          @update:model-value="toggleList('productIds', item.value, !!$event)"
        />
      </div>
    </div>

    <div
      v-if="model.scope === 'categories'"
      class="space-y-2"
    >
      <div class="text-xs font-medium text-toned">
        {{ $t('دسته‌ها') }}
      </div>
      <div class="max-h-40 overflow-y-auto rounded-xl border border-muted p-3 space-y-2">
        <UCheckbox
          v-for="cat in categoryOptions"
          :key="cat.id"
          :model-value="model.categoryIds.includes(cat.id)"
          :label="cat.name"
          @update:model-value="toggleList('categoryIds', cat.id, !!$event)"
        />
      </div>
    </div>

    <div
      v-if="model.scope === 'brands'"
      class="space-y-2"
    >
      <div class="text-xs font-medium text-toned">
        {{ $t('برندها') }}
      </div>
      <div class="max-h-40 overflow-y-auto rounded-xl border border-muted p-3 space-y-2">
        <UCheckbox
          v-for="brand in brandOptions"
          :key="brand.id"
          :model-value="model.brandIds.includes(brand.id)"
          :label="brand.name"
          @update:model-value="toggleList('brandIds', brand.id, !!$event)"
        />
      </div>
    </div>

    <div
      v-if="showExclusions && model.scope !== 'store'"
      class="pt-2 border-t border-muted space-y-3"
    >
      <div class="text-sm font-medium text-highlighted">
        {{ $t('استثناها') }}
      </div>
      <UFormField
        v-if="model.scope !== 'products'"
        :label="$t('محصولات مستثنی')"
      >
        <USelectMenu
          :model-value="model.excludeProductIds"
          :items="productItems"
          value-key="value"
          multiple
          class="w-full"
          @update:model-value="patch({ excludeProductIds: ($event as string[]) || [] })"
        />
      </UFormField>
      <div
        v-if="model.scope !== 'categories'"
        class="space-y-2"
      >
        <div class="text-xs text-toned">
          {{ $t('دسته‌های مستثنی') }}
        </div>
        <div class="max-h-32 overflow-y-auto rounded-xl border border-muted p-3 space-y-2">
          <UCheckbox
            v-for="cat in categoryOptions"
            :key="`ex-${cat.id}`"
            :model-value="model.excludeCategoryIds.includes(cat.id)"
            :label="cat.name"
            @update:model-value="toggleList('excludeCategoryIds', cat.id, !!$event)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SellerMarketingTargeting } from '~/data/seller-marketing-shared'
import { parseCsvText } from '~/data/seller-import'
import { downloadSellerCsv } from '~/data/seller-export'

const props = withDefaults(defineProps<{
  modelValue: SellerMarketingTargeting
  showExclusions?: boolean
}>(), {
  showExclusions: true,
})

const emit = defineEmits<{
  'update:modelValue': [SellerMarketingTargeting]
}>()

const { t } = useI18n()
const toast = useAppToast()
const { listings, resolveProduct, fetchListings } = useSeller()
const { categories, ensureLoaded: ensureCats } = useSellerCategories()
const { brands, ensureLoaded: ensureBrands } = useSellerBrands()

void ensureCats()
void ensureBrands()
void fetchListings()

const model = computed(() => props.modelValue)
const productCsvInput = ref<HTMLInputElement | null>(null)

const scopeItems = computed(() => [
  { value: 'store', label: t('کل فروشگاه') },
  { value: 'products', label: t('محصولات خاص') },
  { value: 'categories', label: t('دسته‌ها') },
  { value: 'brands', label: t('برندها') },
])

const categoryOptions = computed(() => categories.value.map(c => ({ id: c.id, name: c.name })))
const brandOptions = computed(() => brands.value.map(b => ({ id: b.id, name: b.name })))

const productItems = computed(() =>
  listings.value.map((l) => {
    const p = resolveProduct(l.productId)
    return { value: l.productId, label: p.title || l.productId }
  }),
)

const allProductsSelected = computed(() =>
  productItems.value.length > 0
  && productItems.value.every(p => model.value.productIds.includes(p.value)),
)

function patch(partial: Partial<SellerMarketingTargeting>) {
  emit('update:modelValue', { ...model.value, ...partial })
}

function toggleList(
  key: 'categoryIds' | 'brandIds' | 'excludeCategoryIds' | 'excludeBrandIds' | 'productIds' | 'excludeProductIds',
  id: string,
  on: boolean,
) {
  const current = [...(model.value[key] || [])]
  const next = on ? [...new Set([...current, id])] : current.filter(x => x !== id)
  patch({ [key]: next })
}

function toggleAllProducts() {
  if (allProductsSelected.value) {
    patch({ productIds: [] })
    return
  }
  patch({ productIds: productItems.value.map(p => p.value) })
}

function downloadProductIdsTemplate() {
  downloadSellerCsv(
    'discount-product-ids.csv',
    ['productId'],
    [['iphone-16-pro']],
  )
}

async function onProductCsv(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const text = await file.text()
  const { rows } = parseCsvText(text)
  const ids = rows
    .map(r => (r.productId || r.id || Object.values(r)[0] || '').trim())
    .filter(Boolean)
  if (!ids.length) {
    toast.error(t('شناسه‌ای در فایل یافت نشد'))
    input.value = ''
    return
  }
  patch({ productIds: [...new Set([...model.value.productIds, ...ids])] })
  toast.success(`${ids.length.toLocaleString('fa-IR')} ${t('محصول اضافه شد')}`)
  input.value = ''
}
</script>
