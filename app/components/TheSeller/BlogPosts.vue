<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
    <div class="hidden lg:block">
      <TheSellerPageHeader
        :title="$t('وبلاگ')"
        :description="$t('مدیریت مطالب، دسته‌ها و برچسب‌های وبلاگ')"
        :count-label="!loading ? `${listMeta.total.toLocaleString('fa-IR')} ${$t('مطلب')}` : undefined"
      >
        <template #actions>
          <div class="flex items-center gap-2 flex-wrap">
            <UButton
              v-if="can('blog.view')"
              to="/seller/blog/categories"
              color="neutral"
              variant="soft"
              size="sm"
              icon="i-tabler-category"
              class="cursor-pointer"
            >
              {{ $t('دسته‌ها') }}
            </UButton>
            <UButton
              v-if="can('blog.view')"
              to="/seller/blog/tags"
              color="neutral"
              variant="soft"
              size="sm"
              icon="i-tabler-tags"
              class="cursor-pointer"
            >
              {{ $t('برچسب‌ها') }}
            </UButton>
            <UButton
              v-if="can('blog.create')"
              to="/seller/blog/new"
              color="primary"
              size="sm"
              icon="i-tabler-plus"
              class="cursor-pointer font-medium"
            >
              {{ $t('افزودن مطلب') }}
            </UButton>
          </div>
        </template>
      </TheSellerPageHeader>
    </div>

    <div class="lg:hidden mb-4 space-y-2">
      <UButton
        v-if="can('blog.create')"
        to="/seller/blog/new"
        color="primary"
        block
        icon="i-tabler-plus"
        class="cursor-pointer font-medium"
      >
        {{ $t('افزودن مطلب') }}
      </UButton>
      <div class="flex gap-2">
        <UButton
          to="/seller/blog/categories"
          color="neutral"
          variant="soft"
          block
          icon="i-tabler-category"
          class="cursor-pointer"
        >
          {{ $t('دسته‌ها') }}
        </UButton>
        <UButton
          to="/seller/blog/tags"
          color="neutral"
          variant="soft"
          block
          icon="i-tabler-tags"
          class="cursor-pointer"
        >
          {{ $t('برچسب‌ها') }}
        </UButton>
      </div>
    </div>

    <TheSellerListToolbar
      v-model:search="search"
      :status="status"
      :tabs="statusTabs"
      :search-placeholder="$t('جستجوی عنوان، دسته یا نویسنده')"
      :has-active="hasActiveFilters || authorFilter !== 'all' || categoryFilter !== 'all' || featuredOnly"
      @update:status="status = $event"
      @clear="clearAll"
    >
      <template #extra>
        <USelect
          v-model="authorFilter"
          :items="authorItems"
          value-key="value"
          class="w-40"
          :placeholder="$t('نویسنده')"
        />
        <USelect
          v-model="categoryFilter"
          :items="categoryItems"
          value-key="value"
          class="w-40"
          :placeholder="$t('دسته')"
        />
        <UButton
          type="button"
          size="sm"
          :color="featuredOnly ? 'primary' : 'neutral'"
          :variant="featuredOnly ? 'soft' : 'ghost'"
          icon="i-tabler-star"
          class="cursor-pointer shrink-0"
          @click="featuredOnly = !featuredOnly"
        >
          {{ $t('ویژه') }}
        </UButton>
      </template>
    </TheSellerListToolbar>

    <div
      v-if="selectedIds.length && canBulk"
      class="mb-4 flex items-center gap-2 flex-wrap rounded-xl border border-primary/30 bg-primary/5 p-3"
    >
      <span class="text-xs text-toned num">
        {{ selectedIds.length.toLocaleString('fa-IR') }} {{ $t('انتخاب‌شده') }}
      </span>
      <USelect
        v-model="bulkAction"
        :items="bulkActionItems"
        value-key="value"
        class="w-44"
        :placeholder="$t('اقدام گروهی')"
      />
      <UButton
        type="button"
        color="primary"
        size="xs"
        class="cursor-pointer"
        :disabled="!bulkAction || bulkRunning"
        :loading="bulkRunning"
        @click="runBulk"
      >
        {{ $t('اجرا') }}
      </UButton>
      <UButton
        type="button"
        color="neutral"
        variant="ghost"
        size="xs"
        class="cursor-pointer"
        @click="selectedIds = []"
      >
        {{ $t('لغو انتخاب') }}
      </UButton>
    </div>

    <div
      v-if="loading"
      class="py-16 flex justify-center"
    >
      <UIcon
        name="i-tabler-loader-2"
        class="size-8 text-primary animate-spin"
      />
    </div>

    <TheSellerEmptyState
      v-else-if="!posts.length"
      icon="i-tabler-news-off"
      :message="hasActiveFilters || authorFilter !== 'all' || categoryFilter !== 'all' || featuredOnly
        ? $t('مطلبی با این فیلتر پیدا نشد')
        : $t('هنوز مطلبی ثبت نشده است')"
    >
      <template
        v-if="!hasActiveFilters && authorFilter === 'all' && categoryFilter === 'all' && !featuredOnly && can('blog.create')"
        #actions
      >
        <UButton
          to="/seller/blog/new"
          color="primary"
          variant="soft"
          icon="i-tabler-plus"
          class="cursor-pointer"
        >
          {{ $t('افزودن اولین مطلب') }}
        </UButton>
      </template>
    </TheSellerEmptyState>

    <div
      v-else
      class="space-y-3"
    >
      <div
        v-if="canBulk"
        class="flex items-center gap-2 text-xs text-muted"
      >
        <UCheckbox
          :model-value="allPageSelected"
          :indeterminate="somePageSelected && !allPageSelected"
          :label="$t('انتخاب همهٔ صفحه')"
          @update:model-value="toggleSelectPage(!!$event)"
        />
      </div>

      <div
        v-for="post in posts"
        :key="post.id"
        class="bg-muted border border-muted rounded-2xl p-3 sm:p-4"
      >
        <div class="flex items-start gap-3">
          <UCheckbox
            v-if="canBulk"
            :model-value="selectedIds.includes(post.id)"
            class="mt-1 shrink-0"
            @update:model-value="toggleSelect(post.id, !!$event)"
          />

          <div class="size-20 sm:w-28 sm:h-20 rounded-xl bg-default border border-muted overflow-hidden shrink-0">
            <img
              v-if="post.image"
              :src="post.image"
              :alt="post.imageAlt || post.title"
              class="size-full object-cover"
            >
            <div
              v-else
              class="size-full grid place-items-center"
            >
              <TheIcon
                icon-type="img"
                name="noImage.png"
                class="size-8 opacity-60"
              />
            </div>
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2 flex-wrap">
              <div class="min-w-0">
                <NuxtLink
                  :to="`/seller/blog/${post.id}`"
                  class="text-sm font-medium text-highlighted line-clamp-2 block hover:text-primary transition-all  cursor-pointer"
                >
                  {{ $t(post.title) }}
                </NuxtLink>
                <div
                  class="text-[11px] text-muted mt-0.5 truncate num"
                  dir="ltr"
                >
                  {{ post.id }}
                </div>
              </div>
              <div class="flex items-center gap-1.5 flex-wrap">
                <UBadge
                  color="primary"
                  variant="subtle"
                  size="sm"
                  class="font-medium"
                >
                  {{ $t(post.category) }}
                </UBadge>
                <UBadge
                  v-if="post.featured"
                  color="warning"
                  variant="subtle"
                  size="sm"
                  class="font-medium"
                >
                  {{ $t('ویژه') }}
                </UBadge>
                <UBadge
                  :color="sellerBlogStatusMeta[post.status].color"
                  variant="subtle"
                  size="sm"
                  class="font-medium"
                >
                  {{ $t(sellerBlogStatusMeta[post.status].label) }}
                </UBadge>
              </div>
            </div>

            <div class="mt-2 text-[11px] text-muted flex flex-wrap gap-x-3 gap-y-1">
              <span>{{ $t('نویسنده') }}: {{ $t(post.author) }}</span>
              <span class="num">{{ $t(post.date) }}</span>
              <span>{{ $t(post.readTime) }}</span>
              <span class="num">
                {{ (post.engagement ?? 0).toLocaleString('fa-IR') }} {{ $t('تعامل') }}
              </span>
            </div>

            <div class="mt-3 flex items-center gap-2 flex-wrap">
              <UButton
                v-if="can('blog.update')"
                :to="`/seller/blog/${post.id}`"
                color="primary"
                variant="soft"
                size="xs"
                icon="i-tabler-pencil"
                class="cursor-pointer"
              >
                {{ $t('ویرایش') }}
              </UButton>
              <UButton
                v-if="can('blog.publish') && post.status !== 'published'"
                type="button"
                color="success"
                variant="ghost"
                size="xs"
                icon="i-tabler-eye"
                class="cursor-pointer"
                @click="onSetStatus(post.id, 'published')"
              >
                {{ $t('انتشار') }}
              </UButton>
              <UButton
                v-if="can('blog.publish') && post.status === 'published'"
                type="button"
                color="neutral"
                variant="ghost"
                size="xs"
                icon="i-tabler-archive"
                class="cursor-pointer"
                @click="onSetStatus(post.id, 'archived')"
              >
                {{ $t('بایگانی') }}
              </UButton>
              <UButton
                :to="`/blog/${post.id}?preview=1`"
                target="_blank"
                color="neutral"
                variant="ghost"
                size="xs"
                icon="i-tabler-external-link"
                class="cursor-pointer"
              >
                {{ $t('پیش‌نمایش') }}
              </UButton>
              <UButton
                v-if="can('blog.delete')"
                type="button"
                color="error"
                variant="ghost"
                size="xs"
                icon="i-tabler-trash"
                class="cursor-pointer"
                @click="confirmDelete(post)"
              >
                {{ $t('حذف') }}
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="pageCount > 1"
      class="mt-5 flex justify-center"
    >
      <UPagination
        v-model:page="page"
        :total="listMeta.total"
        :items-per-page="listMeta.pageSize || pageSize"
      />
    </div>

    <UModal
      v-model:open="deleteOpen"
      :title="bulkDeleteMode ? $t('حذف گروهی') : $t('حذف مطلب')"
      :description="$t('این عمل قابل بازگشت نیست.')"
    >
      <template #body>
        <div
          v-if="bulkDeleteMode"
          class="text-sm text-toned"
        >
          {{ $t('{n} مطلب حذف می‌شود', { n: selectedIds.length.toLocaleString('fa-IR') }) }}
        </div>
        <div
          v-else-if="pendingDelete"
          class="rounded-xl border border-muted bg-muted/40 p-4 text-sm space-y-2"
        >
          <div class="font-medium text-highlighted">
            {{ $t(pendingDelete.title) }}
          </div>
          <div
            class="text-[11px] text-muted num"
            dir="ltr"
          >
            {{ pendingDelete.id }}
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex items-center gap-2 w-full justify-end">
          <UButton
            color="neutral"
            variant="outline"
            class="cursor-pointer"
            :disabled="deleting"
            @click="closeDelete"
          >
            {{ $t('انصراف') }}
          </UButton>
          <UButton
            color="error"
            class="font-bold cursor-pointer"
            :loading="deleting"
            @click="onDeleteConfirm"
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
  sellerBlogStatusMeta,
  type SellerBlogPost,
  type SellerBlogStatus,
} from '~/data/seller-blog'

const pageSize = 10

const { t } = useI18n()
const toast = useAppToast()
const { can } = useSellerPermissions()
const {
  posts,
  listMeta,
  pending,
  fetchList,
  deletePost,
  setStatus,
} = useSellerBlog()
const { search, status, page, hasActiveFilters, clearFilters } = useSellerListQuery({
  defaultStatus: 'all',
})

const loading = ref(true)
const authorFilter = ref('all')
const categoryFilter = ref('all')
const featuredOnly = ref(false)
const deleteOpen = ref(false)
const pendingDelete = ref<SellerBlogPost | null>(null)
const bulkDeleteMode = ref(false)
const selectedIds = ref<string[]>([])
const bulkAction = ref('')
const bulkRunning = ref(false)
const deleting = ref(false)

const canBulk = computed(() => can('blog.publish') || can('blog.delete'))

const bulkActionItems = computed(() => {
  const items: { value: string, label: string }[] = []
  if (can('blog.publish')) {
    items.push({ value: 'publish', label: t('انتشار') })
    items.push({ value: 'archive', label: t('بایگانی') })
  }
  if (can('blog.delete')) {
    items.push({ value: 'delete', label: t('حذف') })
  }
  return items
})

const statusTabs = computed(() => {
  const c = listMeta.value.statusCounts
  return [
    { id: 'all', label: t('همه'), count: Number(c.all) || 0 },
    ...(Object.keys(sellerBlogStatusMeta) as SellerBlogStatus[]).map(id => ({
      id,
      label: t(sellerBlogStatusMeta[id].label),
      count: Number(c[id]) || 0,
    })),
  ]
})

const authorItems = computed(() => [
  { value: 'all', label: t('همه نویسنده‌ها') },
  ...listMeta.value.authors.map(a => ({ value: a, label: a })),
])

const categoryItems = computed(() => [
  { value: 'all', label: t('همه دسته‌ها') },
  ...listMeta.value.categories.map(id => ({ value: id, label: id })),
])

const pageCount = computed(() =>
  Math.max(1, Math.ceil((listMeta.value.total || 0) / (listMeta.value.pageSize || pageSize))),
)

const allPageSelected = computed(() =>
  posts.value.length > 0 && posts.value.every(p => selectedIds.value.includes(p.id)),
)

const somePageSelected = computed(() =>
  posts.value.some(p => selectedIds.value.includes(p.id)),
)

function apiErrorMessage(error: any, fallback: string) {
  return (
    error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
    || error?.data?.message
    || error?.message
    || fallback
  )
}

async function loadList() {
  loading.value = true
  try {
    const { ok, error } = await fetchList({
      q: search.value || undefined,
      status: status.value,
      category: categoryFilter.value,
      author: authorFilter.value,
      featured: featuredOnly.value || undefined,
      page: page.value,
      pageSize,
    })
    if (!ok) {
      toast.error(t(apiErrorMessage(error, 'بارگذاری مطالب ناموفق بود')))
    }
  }
  finally {
    loading.value = false
  }
}

async function clearAll() {
  selectedIds.value = []
  authorFilter.value = 'all'
  categoryFilter.value = 'all'
  featuredOnly.value = false
  await clearFilters()
}

function toggleSelect(id: string, on: boolean) {
  if (on) {
    if (!selectedIds.value.includes(id)) selectedIds.value = [...selectedIds.value, id]
  }
  else {
    selectedIds.value = selectedIds.value.filter(x => x !== id)
  }
}

function toggleSelectPage(on: boolean) {
  const ids = posts.value.map(p => p.id)
  if (on) selectedIds.value = [...new Set([...selectedIds.value, ...ids])]
  else selectedIds.value = selectedIds.value.filter(id => !ids.includes(id))
}

async function onSetStatus(id: string, next: SellerBlogStatus) {
  const result = await setStatus(id, next)
  if (!result.ok) {
    toast.error(t(result.error || 'تغییر وضعیت ناموفق بود'))
    return
  }
  toast.success(t(sellerBlogStatusMeta[next].label))
  await loadList()
}

async function runBulk() {
  if (!bulkAction.value || !selectedIds.value.length) return
  if (bulkAction.value === 'delete') {
    bulkDeleteMode.value = true
    pendingDelete.value = null
    deleteOpen.value = true
    return
  }
  bulkRunning.value = true
  try {
    const next: SellerBlogStatus = bulkAction.value === 'publish' ? 'published' : 'archived'
    for (const id of selectedIds.value) {
      await setStatus(id, next)
    }
    toast.success(t('مطالب به‌روزرسانی شدند'))
    selectedIds.value = []
    bulkAction.value = ''
    await loadList()
  }
  finally {
    bulkRunning.value = false
  }
}

function confirmDelete(post: SellerBlogPost) {
  bulkDeleteMode.value = false
  pendingDelete.value = post
  deleteOpen.value = true
}

function closeDelete() {
  deleteOpen.value = false
  pendingDelete.value = null
  bulkDeleteMode.value = false
}

async function onDeleteConfirm() {
  deleting.value = true
  try {
    if (bulkDeleteMode.value) {
      for (const id of selectedIds.value) {
        await deletePost(id)
      }
      toast.success(t('مطالب حذف شدند'))
      selectedIds.value = []
      bulkAction.value = ''
      closeDelete()
      await loadList()
      return
    }
    if (!pendingDelete.value) return
    const result = await deletePost(pendingDelete.value.id)
    closeDelete()
    if (!result.ok) {
      toast.error(t(result.error || 'حذف ناموفق بود'))
      return
    }
    toast.success(t('مطلب حذف شد'))
    await loadList()
  }
  finally {
    deleting.value = false
  }
}

watch(
  [search, status, page, authorFilter, categoryFilter, featuredOnly],
  () => {
    void loadList()
  },
)

onMounted(() => {
  void loadList()
})
</script>
