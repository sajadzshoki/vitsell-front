<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
    <div class="hidden lg:block">
      <TheSellerPageHeader
        :title="$t('برچسب‌های وبلاگ')"
        :description="$t('برچسب‌های مطالب — ایجاد سریع از فرم مطلب هم ممکن است')"
        :count-label="`${filtered.length.toLocaleString('fa-IR')} ${$t('برچسب')}`"
      >
        <template #actions>
          <div class="flex items-center gap-2 flex-wrap">
            <UButton
              to="/seller/blog"
              color="neutral"
              variant="soft"
              size="sm"
              icon="i-tabler-arrow-right"
              class="cursor-pointer"
            >
              {{ $t('مطالب') }}
            </UButton>
            <UButton
              v-if="can('blog.create')"
              type="button"
              color="primary"
              size="sm"
              icon="i-tabler-plus"
              class="cursor-pointer font-medium"
              @click="openCreate"
            >
              {{ $t('افزودن برچسب') }}
            </UButton>
          </div>
        </template>
      </TheSellerPageHeader>
    </div>

    <div class="lg:hidden mb-4">
      <UButton
        v-if="can('blog.create')"
        type="button"
        color="primary"
        block
        icon="i-tabler-plus"
        class="cursor-pointer"
        @click="openCreate"
      >
        {{ $t('افزودن برچسب') }}
      </UButton>
    </div>

    <TheSellerListToolbar
      v-model:search="search"
      :search-placeholder="$t('جستجوی نام یا اسلاگ')"
      :has-active="hasActiveFilters"
      @clear="clearFilters"
    />

    <TheSellerEmptyState
      v-if="!filtered.length"
      icon="i-tabler-tags"
      :message="hasActiveFilters ? $t('برچسبی با این فیلتر پیدا نشد') : $t('هنوز برچسبی ثبت نشده است')"
    />

    <div
      v-else
      class="space-y-3"
    >
      <div
        v-for="tag in paged"
        :key="tag.id"
        class="bg-muted border border-muted rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-3 flex-wrap"
      >
        <div class="min-w-0">
          <div class="text-sm font-medium text-highlighted">
            {{ tag.name }}
          </div>
          <div
            class="text-[11px] text-muted mt-0.5 num"
            dir="ltr"
          >
            {{ tag.slug }} · {{ tag.usageCount.toLocaleString('fa-IR') }} {{ $t('استفاده') }}
          </div>
        </div>
        <div class="flex items-center gap-2">
          <UButton
            v-if="can('blog.update')"
            type="button"
            color="primary"
            variant="soft"
            size="xs"
            icon="i-tabler-pencil"
            class="cursor-pointer"
            @click="openEdit(tag)"
          >
            {{ $t('ویرایش') }}
          </UButton>
          <UButton
            v-if="can('blog.delete')"
            type="button"
            color="error"
            variant="ghost"
            size="xs"
            icon="i-tabler-trash"
            class="cursor-pointer"
            @click="openDelete(tag)"
          >
            {{ $t('حذف') }}
          </UButton>
        </div>
      </div>
    </div>

    <div
      v-if="pageCount > 1"
      class="mt-5 flex justify-center"
    >
      <UPagination
        v-model:page="page"
        :total="filtered.length"
        :items-per-page="pageSize"
      />
    </div>

    <UModal
      v-model:open="formOpen"
      :title="editing ? $t('ویرایش برچسب') : $t('افزودن برچسب')"
    >
      <template #body>
        <div class="space-y-4">
          <TheFormInput
            v-model="form.name"
            :label="$t('نام')"
            required
            :error="formErrors.name"
          />
          <TheFormInput
            v-model="form.slug"
            :label="$t('اسلاگ')"
            dir="ltr"
            :error="formErrors.slug"
            :help="$t('اختیاری — از نام ساخته می‌شود')"
          />
        </div>
      </template>
      <template #footer>
        <div class="flex items-center gap-2 w-full justify-end">
          <UButton
            color="neutral"
            variant="outline"
            class="cursor-pointer"
            @click="formOpen = false"
          >
            {{ $t('انصراف') }}
          </UButton>
          <UButton
            color="primary"
            class="font-bold cursor-pointer"
            :loading="saving"
            @click="onSaveTag"
          >
            {{ $t('ذخیره') }}
          </UButton>
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="deleteOpen"
      :title="$t('حذف برچسب')"
      :description="$t('اگر برچسب در مطلبی استفاده شده باشد حذف نمی‌شود.')"
    >
      <template #body>
        <div
          v-if="pendingDelete"
          class="text-sm font-medium text-highlighted"
        >
          {{ pendingDelete.name }}
        </div>
      </template>
      <template #footer>
        <div class="flex items-center gap-2 w-full justify-end">
          <UButton
            color="neutral"
            variant="outline"
            class="cursor-pointer"
            @click="deleteOpen = false"
          >
            {{ $t('انصراف') }}
          </UButton>
          <UButton
            color="error"
            class="font-bold cursor-pointer"
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
  emptyBlogTagForm,
  toBlogTagForm,
  type SellerBlogTag,
  type SellerBlogTagForm,
} from '~/data/seller-blog-taxonomy'

const { t } = useI18n()
const toast = useAppToast()
const { can } = useSellerPermissions()
const { tags, ensureLoaded, createTag, updateTag, deleteTag } = useSellerBlogTags()
const { search, page, hasActiveFilters, clearFilters } = useSellerListQuery()

ensureLoaded()

const pageSize = 15
const formOpen = ref(false)
const editing = ref<SellerBlogTag | null>(null)
const form = ref<SellerBlogTagForm>(emptyBlogTagForm())
const formErrors = ref<Partial<Record<'name' | 'slug', string>>>({})
const saving = ref(false)
const deleteOpen = ref(false)
const pendingDelete = ref<SellerBlogTag | null>(null)

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return tags.value.filter((tag) => {
    if (!q) return true
    return (
      tag.name.toLowerCase().includes(q)
      || tag.slug.toLowerCase().includes(q)
      || tag.id.toLowerCase().includes(q)
    )
  })
})

const pageCount = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))
const paged = computed(() => {
  const start = (page.value - 1) * pageSize
  return filtered.value.slice(start, start + pageSize)
})

function openCreate() {
  editing.value = null
  form.value = emptyBlogTagForm()
  formErrors.value = {}
  formOpen.value = true
}

function openEdit(tag: SellerBlogTag) {
  editing.value = tag
  form.value = toBlogTagForm(tag)
  formErrors.value = {}
  formOpen.value = true
}

function openDelete(tag: SellerBlogTag) {
  pendingDelete.value = tag
  deleteOpen.value = true
}

function onSaveTag() {
  formErrors.value = {}
  if (!form.value.name.trim()) {
    formErrors.value = { name: t('نام الزامی است') }
    return
  }
  saving.value = true
  try {
    const result = editing.value
      ? updateTag(editing.value.id, form.value)
      : createTag(form.value)
    if (!result.ok) {
      toast.error(t(result.error))
      return
    }
    toast.success(editing.value ? t('برچسب به‌روز شد') : t('برچسب اضافه شد'))
    formOpen.value = false
  }
  finally {
    saving.value = false
  }
}

function confirmDelete() {
  if (!pendingDelete.value) return
  const result = deleteTag(pendingDelete.value.id)
  deleteOpen.value = false
  pendingDelete.value = null
  if (!result.ok) {
    toast.error(t(result.error))
    return
  }
  toast.success(t('برچسب حذف شد'))
}
</script>
