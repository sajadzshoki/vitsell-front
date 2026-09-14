<template>
  <div class="space-y-5">
    <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0 space-y-4">
      <div class="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 class="font-bold text-highlighted">
            {{ $t('دسته‌بندی سوالات') }}
          </h3>
          <p class="text-xs text-muted mt-1 leading-5">
            {{ $t('دسته‌ها برای فیلتر سوالات در صفحه FAQ استفاده می‌شوند.') }}
          </p>
        </div>
        <UButton
          type="button"
          color="primary"
          variant="soft"
          size="xs"
          icon="i-tabler-plus"
          class="cursor-pointer"
          @click="addCategory"
        >
          {{ $t('افزودن دسته') }}
        </UButton>
      </div>

      <div
        v-for="(category, index) in categories"
        :key="`cat-${index}`"
        class="grid grid-cols-1 md:grid-cols-12 gap-3 items-start rounded-xl border border-muted p-3 bg-muted/30"
      >
        <TheFormInput
          :model-value="category.id"
          class="md:col-span-3"
          :label="$t('شناسه')"
          dir="ltr"
          :error="categoryErrors[index]?.id"
          :help="$t('لاتین، یکتا')"
          @update:model-value="onCategoryId(index, $event)"
        />
        <TheFormInput
          :model-value="category.label"
          class="md:col-span-4"
          :label="$t('عنوان')"
          :error="categoryErrors[index]?.label"
          @update:model-value="patchCategory(index, { label: $event })"
        />
        <div class="md:col-span-4">
          <TheSellerIconPicker
            :model-value="category.icon"
            :label="$t('آیکون')"
            @update:model-value="patchCategory(index, { icon: $event })"
          />
        </div>
        <div class="md:col-span-1 flex md:justify-end md:pt-7">
          <UButton
            type="button"
            color="error"
            variant="ghost"
            size="sm"
            icon="i-tabler-trash"
            class="cursor-pointer"
            :aria-label="$t('حذف')"
            @click="removeCategory(index)"
          />
        </div>
      </div>

      <p
        v-if="!categories.length"
        class="text-xs text-muted"
      >
        {{ $t('دسته‌ای اضافه نشده است') }}
      </p>
    </div>

    <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0 space-y-4">
      <div class="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 class="font-bold text-highlighted">
            {{ $t('سوال و پاسخ') }}
          </h3>
          <p class="text-xs text-muted mt-1 leading-5">
            {{ $t('هر سوال باید به یکی از دسته‌ها متصل باشد.') }}
          </p>
        </div>
        <UButton
          type="button"
          color="primary"
          variant="soft"
          size="xs"
          icon="i-tabler-plus"
          class="cursor-pointer"
          :disabled="!categories.length"
          @click="addItem"
        >
          {{ $t('افزودن سوال') }}
        </UButton>
      </div>

      <div
        v-for="(item, index) in items"
        :key="`item-${index}`"
        class="space-y-3 rounded-xl border border-muted p-3 bg-muted/30"
      >
        <div class="flex items-start justify-between gap-2">
          <span class="text-xs text-muted">
            {{ $t('سوال') }} {{ (index + 1).toLocaleString('fa-IR') }}
          </span>
          <UButton
            type="button"
            color="error"
            variant="ghost"
            size="xs"
            icon="i-tabler-trash"
            class="cursor-pointer"
            :aria-label="$t('حذف')"
            @click="removeItem(index)"
          />
        </div>
        <UFormField
          :label="$t('دسته')"
          :error="itemErrors[index]?.categoryId"
        >
          <USelect
            :model-value="item.categoryId"
            :items="categorySelectItems"
            value-key="value"
            class="w-full"
            @update:model-value="patchItem(index, { categoryId: String($event || '') })"
          />
        </UFormField>
        <TheFormInput
          :model-value="item.question"
          :label="$t('سوال')"
          :error="itemErrors[index]?.question"
          @update:model-value="patchItem(index, { question: $event })"
        />
        <UFormField
          :label="$t('پاسخ')"
          :error="itemErrors[index]?.answer"
        >
          <UTextarea
            :model-value="item.answer"
            :rows="3"
            class="w-full"
            @update:model-value="patchItem(index, { answer: String($event || '') })"
          />
        </UFormField>
      </div>

      <p
        v-if="!items.length"
        class="text-xs text-muted"
      >
        {{ $t('سوالی اضافه نشده است') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  emptyFaqCategory,
  emptyFaqItem,
  type SellerFaqCategoryForm,
  type SellerFaqItemForm,
} from '~/data/seller-pages'
import { slugifyLatin } from '~/data/seo'

const categories = defineModel<SellerFaqCategoryForm[]>('categories', { required: true })
const items = defineModel<SellerFaqItemForm[]>('items', { required: true })

const { t } = useI18n()

const categoryErrors = ref<Array<Partial<Record<'id' | 'label', string>>>>([])
const itemErrors = ref<Array<Partial<Record<'categoryId' | 'question' | 'answer', string>>>>([])

const categorySelectItems = computed(() =>
  categories.value
    .filter(c => c.id.trim() && c.label.trim())
    .map(c => ({ value: c.id, label: c.label })),
)

function patchCategory(index: number, patch: Partial<SellerFaqCategoryForm>) {
  const next = [...categories.value]
  const current = next[index]
  if (!current) return
  next[index] = { ...current, ...patch }
  categories.value = next
}

function onCategoryId(index: number, raw: string) {
  const previous = categories.value[index]?.id || ''
  const nextId = slugifyLatin(raw) || raw.trim().toLowerCase().replace(/\s+/g, '-')
  patchCategory(index, { id: nextId })
  if (previous && previous !== nextId) {
    items.value = items.value.map(item =>
      item.categoryId === previous ? { ...item, categoryId: nextId } : item,
    )
  }
}

function patchItem(index: number, patch: Partial<SellerFaqItemForm>) {
  const next = [...items.value]
  const current = next[index]
  if (!current) return
  next[index] = { ...current, ...patch }
  items.value = next
}

function addCategory() {
  categories.value = [...categories.value, emptyFaqCategory()]
}

function removeCategory(index: number) {
  const removed = categories.value[index]
  categories.value = categories.value.filter((_, i) => i !== index)
  if (removed?.id) {
    items.value = items.value.filter(item => item.categoryId !== removed.id)
  }
}

function addItem() {
  const first = categorySelectItems.value[0]?.value || ''
  items.value = [emptyFaqItem(first), ...items.value]
}

function removeItem(index: number) {
  items.value = items.value.filter((_, i) => i !== index)
}

function validate() {
  const catErrs: typeof categoryErrors.value = categories.value.map(() => ({}))
  const seen = new Set<string>()
  categories.value.forEach((category, index) => {
    const id = category.id.trim()
    const label = category.label.trim()
    if (!id) catErrs[index]!.id = t('شناسه الزامی است')
    else if (seen.has(id)) catErrs[index]!.id = t('شناسه تکراری است')
    else seen.add(id)
    if (!label) catErrs[index]!.label = t('عنوان الزامی است')
  })

  const ids = new Set(
    categories.value.map(c => c.id.trim()).filter(Boolean),
  )
  const itemErrs: typeof itemErrors.value = items.value.map(() => ({}))
  items.value.forEach((item, index) => {
    if (!item.categoryId.trim() || !ids.has(item.categoryId.trim())) {
      itemErrs[index]!.categoryId = t('دسته را انتخاب کنید')
    }
    if (!item.question.trim()) itemErrs[index]!.question = t('سوال الزامی است')
    if (!item.answer.trim()) itemErrs[index]!.answer = t('پاسخ الزامی است')
  })

  categoryErrors.value = catErrs
  itemErrors.value = itemErrs

  const hasCatError = catErrs.some(e => Object.keys(e).length)
  const hasItemError = itemErrs.some(e => Object.keys(e).length)
  if (!categories.value.length) {
    return false
  }
  if (!items.value.length) {
    return false
  }
  return !hasCatError && !hasItemError
}

defineExpose({ validate })
</script>
