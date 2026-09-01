<template>
  <div class="space-y-4">
    <div>
      <h3 class="font-bold text-highlighted">
        {{ $t('واریانت‌های پویا') }}
      </h3>
      <p class="text-xs text-muted mt-1 leading-6">
        {{ $t('ویژگی‌های واریانت را انتخاب کنید، مقادیر را مشخص کنید، سپس ترکیب‌ها را بسازید. Color/Size اجباری نیست.') }}
      </p>
    </div>

    <div
      v-if="!scopedAttributes.length"
      class="rounded-xl border border-dashed border-muted p-6 text-center"
    >
      <p class="text-sm text-muted mb-3">
        {{ $t('هنوز ویژگی فعالی تعریف نشده است') }}
      </p>
      <UButton
        to="/seller/attributes/new"
        color="primary"
        variant="soft"
        size="sm"
        icon="i-tabler-plus"
        class="cursor-pointer"
      >
        {{ $t('تعریف ویژگی') }}
      </UButton>
    </div>

    <template v-else>
      <div class="space-y-3">
        <div
          v-for="(axis, axisIndex) in localAxes"
          :key="axisIndex"
          class="rounded-xl border border-muted bg-muted/30 p-3 space-y-3"
        >
          <div class="flex items-end gap-2 flex-wrap">
            <UFormField
              class="flex-1 min-w-[10rem]"
              :label="$t('ویژگی')"
            >
              <USelect
                :model-value="axis.attributeId"
                :items="attributeSelectItems"
                value-key="value"
                class="w-full"
                :placeholder="$t('انتخاب ویژگی')"
                @update:model-value="onAxisAttribute(axisIndex, String($event ?? ''))"
              />
            </UFormField>
            <UButton
              type="button"
              color="error"
              variant="ghost"
              size="sm"
              icon="i-tabler-trash"
              class="cursor-pointer"
              :aria-label="$t('حذف محور')"
              @click="removeAxis(axisIndex)"
            />
          </div>
          <div
            v-if="axis.attributeId"
            class="flex flex-wrap gap-2"
          >
            <UButton
              v-for="value in valuesFor(axis.attributeId)"
              :key="value.id"
              type="button"
              size="xs"
              :color="axis.valueIds.includes(value.id) ? 'primary' : 'neutral'"
              :variant="axis.valueIds.includes(value.id) ? 'soft' : 'outline'"
              class="cursor-pointer"
              @click="toggleValue(axisIndex, value.id)"
            >
              <span
                v-if="value.meta"
                class="size-3 rounded-full border border-default me-1.5 shrink-0"
                :style="{ backgroundColor: value.meta }"
              />
              {{ value.label }}
            </UButton>
          </div>
        </div>

        <UButton
          type="button"
          color="neutral"
          variant="soft"
          size="sm"
          icon="i-tabler-plus"
          class="cursor-pointer"
          :disabled="localAxes.length >= scopedAttributes.length"
          @click="addAxis"
        >
          {{ $t('افزودن محور ویژگی') }}
        </UButton>
      </div>

      <div class="flex items-center gap-2 flex-wrap">
        <UButton
          type="button"
          color="primary"
          size="sm"
          icon="i-tabler-topology-star-3"
          class="cursor-pointer"
          :disabled="!canGenerate"
          @click="generate"
        >
          {{ $t('ساخت ترکیب‌ها') }}
          <span
            v-if="previewCount > 0"
            class="num ms-1"
          >({{ previewCount.toLocaleString('fa-IR') }})</span>
        </UButton>
        <UButton
          v-if="localVariants.length"
          type="button"
          color="neutral"
          variant="ghost"
          size="sm"
          icon="i-tabler-trash"
          class="cursor-pointer"
          @click="clearVariants"
        >
          {{ $t('پاک کردن واریانت‌ها') }}
        </UButton>
      </div>

      <div
        v-if="localVariants.length"
        class="space-y-3"
      >
        <div class="flex items-center justify-between gap-2 flex-wrap">
          <h4 class="text-sm font-bold text-toned">
            {{ $t('ویرایش واریانت‌ها') }}
            <span class="text-muted font-medium num">({{ localVariants.length.toLocaleString('fa-IR') }})</span>
          </h4>
          <div class="flex items-center gap-2 flex-wrap">
            <TheFormInput
              v-model="bulkPrice"
              class="w-32"
              :placeholder="$t('قیمت گروهی')"
              dir="ltr"
              digits-only
            />
            <TheFormInput
              v-model="bulkStock"
              class="w-28"
              :placeholder="$t('موجودی گروهی')"
              dir="ltr"
              digits-only
            />
            <UButton
              type="button"
              color="neutral"
              variant="soft"
              size="xs"
              class="cursor-pointer"
              @click="applyBulk"
            >
              {{ $t('اعمال گروهی') }}
            </UButton>
          </div>
        </div>

        <div
          v-for="(variant, vIndex) in localVariants"
          :key="variant.id"
          class="rounded-xl border border-muted bg-default p-3 space-y-3"
        >
          <div class="flex items-start justify-between gap-2">
            <div>
              <div class="text-sm font-medium text-highlighted">
                {{ variantLabel(variant) }}
              </div>
              <div
                class="text-[11px] text-muted num mt-0.5"
                dir="ltr"
              >
                {{ variant.key }}
              </div>
            </div>
            <div class="flex items-center gap-1">
              <UBadge
                :color="variant.status === 'active' ? 'success' : 'neutral'"
                variant="subtle"
                size="xs"
              >
                {{ variant.status === 'active' ? $t('فعال') : $t('غیرفعال') }}
              </UBadge>
              <UButton
                type="button"
                color="error"
                variant="ghost"
                size="xs"
                icon="i-tabler-x"
                class="cursor-pointer"
                :aria-label="$t('حذف')"
                @click="removeVariant(vIndex)"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <TheFormInput
              :model-value="variant.sku"
              :label="$t('SKU')"
              dir="ltr"
              @update:model-value="patchVariant(vIndex, { sku: $event })"
            />
            <TheFormInput
              :model-value="variant.barcode"
              :label="$t('بارکد')"
              dir="ltr"
              @update:model-value="patchVariant(vIndex, { barcode: $event })"
            />
            <TheFormInput
              :model-value="String(variant.price || '')"
              :label="$t('قیمت')"
              dir="ltr"
              digits-only
              @update:model-value="patchVariant(vIndex, { price: Number($event.replace(/\D/g, '') || 0) })"
            />
            <TheFormInput
              :model-value="variant.salePrice != null ? String(variant.salePrice) : ''"
              :label="$t('قیمت فروش')"
              dir="ltr"
              digits-only
              @update:model-value="patchVariant(vIndex, { salePrice: $event ? Number($event.replace(/\D/g, '') || 0) : null })"
            />
            <TheFormInput
              :model-value="String(variant.stock)"
              :label="$t('موجودی')"
              dir="ltr"
              digits-only
              @update:model-value="patchVariant(vIndex, { stock: Number($event.replace(/\D/g, '') || 0) })"
            />
            <TheFormInput
              :model-value="String(variant.lowStockThreshold)"
              :label="$t('آستانه کم‌موجودی')"
              dir="ltr"
              digits-only
              @update:model-value="patchVariant(vIndex, { lowStockThreshold: Number($event.replace(/\D/g, '') || 0) })"
            />
            <TheFormInput
              :model-value="variant.weight"
              :label="$t('وزن')"
              dir="ltr"
              @update:model-value="patchVariant(vIndex, { weight: $event })"
            />
            <UFormField :label="$t('وضعیت')">
              <USelect
                :model-value="variant.status"
                :items="statusItems"
                value-key="value"
                class="w-full"
                @update:model-value="patchVariant(vIndex, { status: ($event as 'active' | 'inactive') })"
              />
            </UFormField>
          </div>

          <TheSellerImageUpload
            :model-value="variant.image"
            :label="$t('تصویر واریانت')"
            :alt="variantLabel(variant)"
            icon="i-tabler-photo"
            @update:model-value="patchVariant(vIndex, { image: $event })"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { generateVariantCombinations } from '~/data/seller-attributes'
import {
  createVariantFromCombo,
  variantLabel,
  type SellerProductVariant,
  type SellerProductVariantAxis,
} from '~/data/seller-product-variants'
import { parsePriceInput } from '~/data/seller-product-form'

const props = defineProps<{
  axes: SellerProductVariantAxis[]
  variants: SellerProductVariant[]
  basePrice?: string
  baseStock?: string
  categoryId?: string
}>()

const emit = defineEmits<{
  'update:axes': [SellerProductVariantAxis[]]
  'update:variants': [SellerProductVariant[]]
}>()

const { t } = useI18n()
const { activeAttributes, attributesForCategory, ensureLoaded } = useSellerAttributes()
ensureLoaded()

const scopedAttributes = computed(() => {
  const base = props.categoryId
    ? attributesForCategory(props.categoryId)
    : activeAttributes.value
  const variantAttrs = base.filter(a => a.variantDefining)
  return variantAttrs.length ? variantAttrs : base
})

const localAxes = computed({
  get: () => props.axes,
  set: (value) => emit('update:axes', value),
})

const localVariants = computed({
  get: () => props.variants,
  set: (value) => emit('update:variants', value),
})

const bulkPrice = ref('')
const bulkStock = ref('')

const attributeSelectItems = computed(() =>
  scopedAttributes.value.map(a => ({ value: a.id, label: a.name })),
)

const statusItems = computed(() => [
  { value: 'active', label: t('فعال') },
  { value: 'inactive', label: t('غیرفعال') },
])

function valuesFor(attributeId: string) {
  return scopedAttributes.value.find(a => a.id === attributeId)?.values
    ?? activeAttributes.value.find(a => a.id === attributeId)?.values
    ?? []
}

const previewCount = computed(() => {
  const axes = buildGenerateAxes()
  if (!axes.length) return 0
  return generateVariantCombinations(axes).length
})

const canGenerate = computed(() =>
  localAxes.value.length > 0
  && localAxes.value.every(a => a.attributeId && a.valueIds.length > 0),
)

function buildGenerateAxes() {
  return localAxes.value
    .map((axis) => {
      const attr = scopedAttributes.value.find(a => a.id === axis.attributeId)
        ?? activeAttributes.value.find(a => a.id === axis.attributeId)
      if (!attr) return null
      const values = attr.values.filter(v => axis.valueIds.includes(v.id))
      return {
        attributeId: attr.id,
        attributeName: attr.name,
        values,
      }
    })
    .filter(Boolean) as { attributeId: string, attributeName: string, values: { id: string, label: string, value: string, meta?: string | null, sortOrder: number }[] }[]
}

function addAxis() {
  localAxes.value = [...localAxes.value, { attributeId: '', valueIds: [] }]
}

function removeAxis(index: number) {
  localAxes.value = localAxes.value.filter((_, i) => i !== index)
}

function onAxisAttribute(index: number, attributeId: string) {
  const next = localAxes.value.map((axis, i) =>
    i === index ? { attributeId, valueIds: [] } : axis,
  )
  localAxes.value = next
}

function toggleValue(axisIndex: number, valueId: string) {
  const next = localAxes.value.map((axis, i) => {
    if (i !== axisIndex) return axis
    const has = axis.valueIds.includes(valueId)
    return {
      ...axis,
      valueIds: has
        ? axis.valueIds.filter(id => id !== valueId)
        : [...axis.valueIds, valueId],
    }
  })
  localAxes.value = next
}

function generate() {
  const axes = buildGenerateAxes()
  const combos = generateVariantCombinations(axes)
  const existingByKey = new Map(localVariants.value.map(v => [v.key, v]))
  const defaults = {
    price: parsePriceInput(props.basePrice || '') || 0,
    stock: Number.parseInt((props.baseStock || '0').replace(/\D/g, '') || '0', 10),
  }
  localVariants.value = combos.map((combo) => {
    const prev = existingByKey.get(combo.key)
    if (prev) {
      return {
        ...prev,
        options: combo.options,
      }
    }
    return createVariantFromCombo(combo, defaults)
  })
}

function clearVariants() {
  localVariants.value = []
  localAxes.value = []
}

function removeVariant(index: number) {
  localVariants.value = localVariants.value.filter((_, i) => i !== index)
}

function patchVariant(index: number, patch: Partial<SellerProductVariant>) {
  localVariants.value = localVariants.value.map((v, i) =>
    i === index ? { ...v, ...patch } : v,
  )
}

function applyBulk() {
  const price = bulkPrice.value ? Number(bulkPrice.value.replace(/\D/g, '') || 0) : null
  const stock = bulkStock.value ? Number(bulkStock.value.replace(/\D/g, '') || 0) : null
  if (price == null && stock == null) return
  localVariants.value = localVariants.value.map(v => ({
    ...v,
    ...(price != null ? { price } : {}),
    ...(stock != null ? { stock } : {}),
  }))
}
</script>
