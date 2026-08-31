<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
    <div class="hidden lg:flex items-center justify-between mb-5 gap-3">
      <h2 class="font-bold text-highlighted">
        {{ $t('دسته‌بندی‌ها') }}
      </h2>
      <div class="flex items-center gap-3">
        <div class="text-xs text-muted num">
          {{ filtered.length.toLocaleString('fa-IR') }} {{ $t('دسته') }}
        </div>
        <UButton
          to="/seller/categories/new"
          color="primary"
          size="sm"
          icon="i-tabler-plus"
          class="font-medium"
        >
          {{ $t('افزودن دسته‌بندی') }}
        </UButton>
      </div>
    </div>

    <div class="lg:hidden mb-4">
      <UButton
        to="/seller/categories/new"
        color="primary"
        block
        icon="i-tabler-plus"
        class="font-medium"
      >
        {{ $t('افزودن دسته‌بندی') }}
      </UButton>
    </div>

    <TheFormInput
      v-model="query"
      icon="i-tabler-search"
      :placeholder="$t('جستجوی دسته‌بندی')"
      class="mb-4"
    />

    <div
      v-if="pending && !categories.length"
      class="py-16 grid place-items-center"
    >
      <UIcon
        name="i-tabler-loader-2"
        class="size-8 text-primary animate-spin"
      />
    </div>

    <div
      v-else-if="!filtered.length"
      class="text-center py-12"
    >
      <UIcon
        name="i-tabler-category"
        class="size-16 text-dimmed mx-auto mb-4"
      />
      <p class="text-sm text-muted mb-4">
        {{ query.trim() ? $t('دسته‌ای با این جستجو پیدا نشد') : $t('هنوز دسته‌بندی‌ای ثبت نشده است') }}
      </p>
      <UButton
        v-if="!query.trim()"
        to="/seller/categories/new"
        color="primary"
        variant="soft"
        icon="i-tabler-plus"
      >
        {{ $t('افزودن اولین دسته‌بندی') }}
      </UButton>
    </div>

    <div
      v-else
      class="space-y-3"
    >
      <div
        v-for="category in filtered"
        :key="category.id"
        class="bg-muted border border-muted rounded-2xl p-3 sm:p-4"
      >
        <div class="flex items-start gap-3">
          <div class="size-16 rounded-xl bg-default border border-muted grid place-items-center shrink-0 overflow-hidden">
            <img
              v-if="category.image"
              :src="category.image"
              :alt="category.name"
              class="size-full object-cover"
            >
            <UIcon
              v-else
              :name="resolveCategoryIconName(category.icon)"
              class="size-7 text-primary"
            />
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <div class="text-sm font-medium text-highlighted truncate">
                  {{ category.name }}
                </div>
                <div
                  class="text-[11px] text-muted num mt-0.5"
                  dir="ltr"
                >
                  {{ category.id }}
                </div>
              </div>
              <UBadge
                color="neutral"
                variant="subtle"
                size="sm"
                class="shrink-0 font-medium inline-flex items-center gap-1"
              >
                <UIcon
                  :name="resolveCategoryIconName(category.icon)"
                  class="size-3.5"
                />
                {{ category.icon }}
              </UBadge>
            </div>

            <div class="mt-2 flex flex-wrap gap-3 text-[11px] text-muted">
              <span>
                {{ $t('گروه') }}:
                <span class="font-bold num text-highlighted">
                  {{ category.subs.length.toLocaleString('fa-IR') }}
                </span>
              </span>
              <span>
                {{ $t('آیتم') }}:
                <span class="font-bold num text-highlighted">
                  {{ countSubItems(category.subs).toLocaleString('fa-IR') }}
                </span>
              </span>
              <span>
                {{ $t('پیشنهاد') }}:
                <span class="font-bold num text-highlighted">
                  {{ (category.suggested?.length ?? 0).toLocaleString('fa-IR') }}
                </span>
              </span>
            </div>

            <div class="mt-3 flex items-center gap-2 flex-wrap">
              <UButton
                :to="`/seller/categories/${category.id}`"
                color="primary"
                variant="soft"
                size="xs"
                icon="i-tabler-pencil"
              >
                {{ $t('ویرایش') }}
              </UButton>
              <UButton
                type="button"
                color="error"
                variant="ghost"
                size="xs"
                icon="i-tabler-trash"
                @click="openDelete(category)"
              >
                {{ $t('حذف') }}
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <UModal
      v-model:open="deleteOpen"
      :title="$t('حذف دسته‌بندی')"
      :description="$t('در صورت داشتن محصول وابسته، حذف انجام نمی‌شود.')"
    >
      <template #body>
        <div
          v-if="pendingDelete"
          class="rounded-xl border border-muted bg-muted/40 p-4 text-sm space-y-2"
        >
          <div class="flex items-center justify-between gap-3">
            <span class="text-muted">{{ $t('نام') }}</span>
            <span class="font-medium text-highlighted">{{ pendingDelete.name }}</span>
          </div>
          <div class="flex items-center justify-between gap-3">
            <span class="text-muted">{{ $t('شناسه') }}</span>
            <span
              class="num font-medium text-highlighted"
              dir="ltr"
            >{{ pendingDelete.id }}</span>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex items-center gap-2 w-full justify-end">
          <UButton
            color="neutral"
            variant="outline"
            @click="deleteOpen = false"
          >
            {{ $t('انصراف') }}
          </UButton>
          <UButton
            color="error"
            class="font-bold"
            :loading="deleting"
            @click="confirmDelete"
          >
            {{ $t('حذف') }}
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import {
  countSubItems,
  resolveCategoryIconName,
  type SellerCategory,
} from '~/data/seller-categories'

const { t } = useI18n()
const toast = useAppToast()
const { categories, pending, ensureLoaded, deleteCategory } = useSellerCategories()

const query = ref('')
const deleteOpen = ref(false)
const pendingDelete = ref<SellerCategory | null>(null)
const deleting = ref(false)

await ensureLoaded({ force: true })

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return categories.value
  return categories.value.filter(c =>
    c.name.includes(query.value.trim())
    || c.id.toLowerCase().includes(q)
    || c.icon.toLowerCase().includes(q),
  )
})

function openDelete(category: SellerCategory) {
  pendingDelete.value = category
  deleteOpen.value = true
}

async function confirmDelete() {
  if (!pendingDelete.value) return
  deleting.value = true
  try {
    const result = await deleteCategory(pendingDelete.value.id)
    deleteOpen.value = false
    pendingDelete.value = null
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success(t('دسته‌بندی حذف شد'))
  }
  finally {
    deleting.value = false
  }
}
</script>
