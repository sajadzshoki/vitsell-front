<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
    <div class="hidden lg:flex items-center justify-between mb-5 gap-3">
      <h2 class="font-bold text-highlighted">
        {{ $t('وبلاگ') }}
      </h2>
      <div class="flex items-center gap-3">
        <div class="text-xs text-muted num">
          {{ filtered.length.toLocaleString('fa-IR') }} {{ $t('مطلب') }}
        </div>
        <UButton
          to="/seller/blog/new"
          color="primary"
          size="sm"
          icon="i-tabler-plus"
          class="font-medium"
        >
          {{ $t('افزودن مطلب') }}
        </UButton>
      </div>
    </div>

    <div class="lg:hidden mb-4">
      <UButton
        to="/seller/blog/new"
        color="primary"
        block
        icon="i-tabler-plus"
        class="font-medium"
      >
        {{ $t('افزودن مطلب') }}
      </UButton>
    </div>

    <div class="flex flex-col sm:(flex-row items-center) gap-3 mb-4">
      <TheFormInput
        v-model="query"
        icon="i-tabler-search"
        :placeholder="$t('جستجوی عنوان، دسته یا نویسنده')"
        class="flex-1 w-full"
      />
      <div class="flex items-center gap-2 overflow-x-auto scrollbar-none w-full sm:w-auto">
        <UButton
          v-for="tab in categoryTabs"
          :key="tab.id"
          :color="categoryFilter === tab.id ? 'primary' : 'neutral'"
          :variant="categoryFilter === tab.id ? 'soft' : 'ghost'"
          size="sm"
          class="shrink-0 cursor-pointer"
          @click="categoryFilter = tab.id"
        >
          {{ $t(tab.label) }}
        </UButton>
      </div>
    </div>

    <div class="flex items-center gap-2 overflow-x-auto scrollbar-none mb-4">
      <UButton
        v-for="tab in activeTabs"
        :key="tab.id"
        :color="activeFilter === tab.id ? 'primary' : 'neutral'"
        :variant="activeFilter === tab.id ? 'soft' : 'ghost'"
        size="sm"
        class="shrink-0 cursor-pointer"
        @click="activeFilter = tab.id"
      >
        {{ $t(tab.label) }}
      </UButton>
    </div>

    <div
      v-if="!filtered.length"
      class="text-center py-12"
    >
      <UIcon
        name="i-tabler-news-off"
        class="size-16 text-dimmed mx-auto mb-4"
      />
      <p class="text-sm text-muted mb-4">
        {{ query.trim() || categoryFilter !== 'all' || activeFilter !== 'all'
          ? $t('مطلبی با این فیلتر پیدا نشد')
          : $t('هنوز مطلبی ثبت نشده است') }}
      </p>
      <UButton
        v-if="!query.trim() && categoryFilter === 'all' && activeFilter === 'all'"
        to="/seller/blog/new"
        color="primary"
        variant="soft"
        icon="i-tabler-plus"
      >
        {{ $t('افزودن اولین مطلب') }}
      </UButton>
    </div>

    <div
      v-else
      class="space-y-3"
    >
      <div
        v-for="post in filtered"
        :key="post.id"
        class="bg-muted border border-muted rounded-2xl p-3 sm:p-4"
      >
        <div class="flex items-start gap-3">
          <div class="size-20 sm:w-28 sm:h-20 rounded-xl bg-default border border-muted overflow-hidden shrink-0">
            <img
              v-if="post.image"
              :src="post.image"
              :alt="post.title"
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
                <div class="text-sm font-medium text-highlighted line-clamp-2">
                  {{ $t(post.title) }}
                </div>
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
                  v-if="post.popular"
                  color="error"
                  variant="subtle"
                  size="sm"
                  class="font-medium"
                >
                  {{ $t('محبوب') }}
                </UBadge>
                <UBadge
                  :color="post.active ? 'success' : 'neutral'"
                  variant="subtle"
                  size="sm"
                  class="font-medium"
                >
                  {{ post.active ? $t('منتشر شده') : $t('پیش‌نویس') }}
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
                :to="`/seller/blog/${post.id}`"
                color="primary"
                variant="soft"
                size="xs"
                icon="i-tabler-pencil"
              >
                {{ $t('ویرایش') }}
              </UButton>
              <UButton
                type="button"
                :color="post.active ? 'neutral' : 'success'"
                variant="ghost"
                size="xs"
                :icon="post.active ? 'i-tabler-eye-off' : 'i-tabler-eye'"
                class="cursor-pointer"
                @click="onToggleActive(post.id, !post.active)"
              >
                {{ post.active ? $t('پیش‌نویس') : $t('انتشار') }}
              </UButton>
              <UButton
                :to="getBlogPostPath(post.id)"
                target="_blank"
                color="neutral"
                variant="ghost"
                size="xs"
                icon="i-tabler-external-link"
              >
                {{ $t('مشاهده') }}
              </UButton>
              <UButton
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

    <UModal
      v-model:open="deleteOpen"
      :title="$t('حذف مطلب')"
      :description="$t('این عمل فقط در نشست فعلی فرانت اعمال می‌شود و قابل بازگشت نیست.')"
    >
      <template #body>
        <div
          v-if="pendingDelete"
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
            @click="deleteOpen = false"
          >
            {{ $t('انصراف') }}
          </UButton>
          <UButton
            color="error"
            class="font-bold cursor-pointer"
            @click="onDelete"
          >
            {{ $t('حذف') }}
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { collectBlogCategories, type SellerBlogPost } from '~/data/seller-blog'
import { getBlogPostPath } from '~/data/static-pages'

const { t } = useI18n()
const toast = useAppToast()
const { posts, ensureSeeded, deletePost, setActive } = useBlog()

ensureSeeded()

const query = ref('')
const categoryFilter = ref('all')
const activeFilter = ref<'all' | 'active' | 'draft'>('all')
const deleteOpen = ref(false)
const pendingDelete = ref<SellerBlogPost | null>(null)

const categoryTabs = computed(() => [
  { id: 'all', label: 'همه دسته‌ها' },
  ...collectBlogCategories(posts.value).map(id => ({ id, label: id })),
])

const activeTabs = [
  { id: 'all' as const, label: 'همه وضعیت‌ها' },
  { id: 'active' as const, label: 'منتشر شده' },
  { id: 'draft' as const, label: 'پیش‌نویس' },
]

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return posts.value.filter((post) => {
    if (categoryFilter.value !== 'all' && post.category !== categoryFilter.value) return false
    if (activeFilter.value === 'active' && !post.active) return false
    if (activeFilter.value === 'draft' && post.active) return false
    if (!q) return true
    return (
      post.title.toLowerCase().includes(q)
      || post.category.toLowerCase().includes(q)
      || post.author.toLowerCase().includes(q)
      || post.id.toLowerCase().includes(q)
    )
  })
})

function onToggleActive(id: string, active: boolean) {
  const result = setActive(id, active)
  if (!result.ok) {
    toast.error(t(result.error))
    return
  }
  toast.success(active ? t('مطلب منتشر شد') : t('مطلب به پیش‌نویس رفت'))
}

function confirmDelete(post: SellerBlogPost) {
  pendingDelete.value = post
  deleteOpen.value = true
}

function onDelete() {
  if (!pendingDelete.value) return
  const result = deletePost(pendingDelete.value.id)
  deleteOpen.value = false
  pendingDelete.value = null
  if (!result.ok) {
    toast.error(t(result.error))
    return
  }
  toast.success(t('مطلب حذف شد'))
}
</script>
