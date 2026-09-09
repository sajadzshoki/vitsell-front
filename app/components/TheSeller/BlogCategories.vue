<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
    <div class="hidden lg:block">
      <TheSellerPageHeader
        :title="$t('دسته‌های وبلاگ')"
        :description="$t('دسته‌بندی محتوایی مطالب وبلاگ')"
        :count-label="`${filtered.length.toLocaleString('fa-IR')} ${$t('دسته')}`"
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
              to="/seller/blog/categories/new"
              color="primary"
              size="sm"
              icon="i-tabler-plus"
              class="cursor-pointer font-medium"
            >
              {{ $t('افزودن دسته') }}
            </UButton>
          </div>
        </template>
      </TheSellerPageHeader>
    </div>

    <div class="lg:hidden mb-4 space-y-2">
      <UButton
        v-if="can('blog.create')"
        to="/seller/blog/categories/new"
        color="primary"
        block
        icon="i-tabler-plus"
        class="cursor-pointer"
      >
        {{ $t('افزودن دسته') }}
      </UButton>
    </div>

    <TheSellerListToolbar
      v-model:search="search"
      :status="status"
      :tabs="statusTabs"
      :search-placeholder="$t('جستجوی نام یا اسلاگ')"
      :has-active="hasActiveFilters"
      @update:status="status = $event"
      @clear="clearFilters"
    />

    <TheSellerEmptyState
      v-if="!filtered.length"
      icon="i-tabler-category"
      :message="hasActiveFilters ? $t('دسته‌ای با این فیلتر پیدا نشد') : $t('هنوز دسته‌ای ثبت نشده است')"
    />

    <div
      v-else
      class="space-y-3"
    >
      <div
        v-for="cat in paged"
        :key="cat.id"
        class="bg-muted border border-muted rounded-2xl p-3 sm:p-4"
      >
        <div class="flex items-start gap-3">
          <div class="size-14 rounded-xl bg-default border border-muted overflow-hidden shrink-0 grid place-items-center">
            <img
              v-if="cat.image"
              :src="cat.image"
              :alt="cat.name"
              class="size-full object-cover"
            >
            <UIcon
              v-else
              name="i-tabler-category"
              class="size-6 text-dimmed"
            />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2 flex-wrap">
              <div class="min-w-0">
                <NuxtLink
                  :to="`/seller/blog/categories/${cat.id}`"
                  class="text-sm font-medium text-highlighted truncate block hover:text-primary transition-all  cursor-pointer"
                >
                  {{ cat.name }}
                </NuxtLink>
                <div
                  class="text-[11px] text-muted mt-0.5 num"
                  dir="ltr"
                >
                  {{ cat.slug }}
                </div>
              </div>
              <UBadge
                :color="cat.status === 'active' ? 'success' : 'neutral'"
                variant="subtle"
                size="xs"
              >
                {{ cat.status === 'active' ? $t('فعال') : $t('غیرفعال') }}
              </UBadge>
            </div>
            <p
              v-if="cat.description"
              class="text-[11px] text-muted mt-2 line-clamp-2"
            >
              {{ cat.description }}
            </p>
            <div class="mt-3 flex items-center gap-2 flex-wrap">
              <UButton
                v-if="can('blog.update')"
                :to="`/seller/blog/categories/${cat.id}`"
                color="primary"
                variant="soft"
                size="xs"
                icon="i-tabler-pencil"
                class="cursor-pointer"
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
                @click="openDelete(cat)"
              >
                {{ $t('حذف') }}
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <TheSellerPagination
      v-model:page="page"
      v-model:page-size="pageSize"
      :total="filtered.length"
    />

    <UModal
      v-model:open="deleteOpen"
      :title="$t('حذف دسته')"
      :description="$t('این عمل فقط در نشست فعلی فرانت اعمال می‌شود و قابل بازگشت نیست.')"
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
import type { SellerBlogCategory } from '~/data/seller-blog-taxonomy'

const { t } = useI18n()
const toast = useAppToast()
const { can } = useSellerPermissions()
const { categories, ensureLoaded, deleteCategory } = useSellerBlogCategories()
const { search, status, page, pageSize, hasActiveFilters, clearFilters } = useSellerListQuery({
  defaultStatus: 'all',
  defaultPageSize: 10,
})

ensureLoaded()

const deleteOpen = ref(false)
const pendingDelete = ref<SellerBlogCategory | null>(null)

const statusTabs = computed(() => [
  { id: 'all', label: t('همه'), count: categories.value.length },
  { id: 'active', label: t('فعال'), count: categories.value.filter(c => c.status === 'active').length },
  { id: 'inactive', label: t('غیرفعال'), count: categories.value.filter(c => c.status === 'inactive').length },
])

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return categories.value.filter((cat) => {
    if (status.value !== 'all' && cat.status !== status.value) return false
    if (!q) return true
    return (
      cat.name.toLowerCase().includes(q)
      || cat.slug.toLowerCase().includes(q)
      || cat.id.toLowerCase().includes(q)
    )
  })
})

const paged = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filtered.value.slice(start, start + pageSize.value)
})

function openDelete(cat: SellerBlogCategory) {
  pendingDelete.value = cat
  deleteOpen.value = true
}

function confirmDelete() {
  if (!pendingDelete.value) return
  const result = deleteCategory(pendingDelete.value.id)
  deleteOpen.value = false
  pendingDelete.value = null
  if (!result.ok) {
    toast.error(t(result.error))
    return
  }
  toast.success(t('دسته حذف شد'))
}
</script>
