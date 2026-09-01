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
      class="space-y-2"
    >
      <div class="text-xs font-medium text-toned">
        {{ $t('محصولات') }}
      </div>
      <USelectMenu
        :model-value="model.productIds"
        :items="productItems"
        value-key="value"
        multiple
        class="w-full"
        :placeholder="$t('انتخاب محصول')"
        @update:model-value="patch({ productIds: ($event as string[]) || [] })"
      />
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
const { listings, resolveProduct, fetchListings } = useSeller()
const { categories, ensureLoaded: ensureCats } = useSellerCategories()
const { brands, ensureLoaded: ensureBrands } = useSellerBrands()

void ensureCats()
void ensureBrands()
void fetchListings()

const model = computed(() => props.modelValue)

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
</script>
