<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
    <div class="hidden lg:block">
      <TheSellerPageHeader
        :title="$t('صفحات ثابت')"
        :description="$t('مدیریت صفحات استاتیک سایت — عنوان، مسیر، وضعیت و سئو')"
        :count-label="!loading ? `${listMeta.total.toLocaleString('fa-IR')} ${$t('صفحه')}` : undefined"
      >
        <template #actions>
          <UButton
            v-if="can('pages.create')"
            to="/seller/pages/new"
            color="primary"
            size="sm"
            icon="i-tabler-plus"
            class="cursor-pointer font-medium"
          >
            {{ $t('افزودن صفحه') }}
          </UButton>
        </template>
      </TheSellerPageHeader>
    </div>

    <div class="lg:hidden mb-4">
      <UButton
        v-if="can('pages.create')"
        to="/seller/pages/new"
        color="primary"
        block
        icon="i-tabler-plus"
        class="cursor-pointer"
      >
        {{ $t('افزودن صفحه') }}
      </UButton>
    </div>

    <TheSellerListToolbar
      v-model:search="search"
      :status="status"
      :tabs="statusTabs"
      :search-placeholder="$t('جستجوی عنوان یا مسیر')"
      :has-active="hasActiveFilters"
      @update:status="status = $event"
      @clear="clearFilters"
    />

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
      v-else-if="!pages.length"
      icon="i-tabler-file-text"
      :message="hasActiveFilters ? $t('صفحه‌ای با این فیلتر پیدا نشد') : $t('هنوز صفحه‌ای ثبت نشده است')"
    >
      <template
        v-if="!hasActiveFilters && can('pages.create')"
        #actions
      >
        <UButton
          to="/seller/pages/new"
          color="primary"
          variant="soft"
          icon="i-tabler-plus"
          class="cursor-pointer"
        >
          {{ $t('افزودن اولین صفحه') }}
        </UButton>
      </template>
    </TheSellerEmptyState>

    <div
      v-else
      class="space-y-3"
    >
      <div
        v-for="pageItem in pages"
        :key="pageItem.id"
        class="bg-muted border border-muted rounded-2xl p-3 sm:p-4"
      >
        <div class="flex items-start gap-3">
          <div class="size-12 rounded-xl bg-default border border-muted shrink-0 grid place-items-center">
            <UIcon
              :name="pageItem.icon || 'i-tabler-file-text'"
              class="size-5 text-toned"
            />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2 flex-wrap">
              <div class="min-w-0">
                <NuxtLink
                  :to="`/seller/pages/${pageItem.id}`"
                  class="text-sm font-medium text-highlighted truncate block hover:text-primary transition cursor-pointer"
                >
                  {{ pageItem.title }}
                </NuxtLink>
                <div
                  class="text-[11px] text-muted mt-0.5 num"
                  dir="ltr"
                >
                  {{ pageItem.path }}
                </div>
              </div>
              <UBadge
                :color="sellerPageStatusMeta[pageItem.status].color"
                variant="subtle"
                size="xs"
              >
                {{ $t(sellerPageStatusMeta[pageItem.status].label) }}
              </UBadge>
            </div>
            <p
              v-if="pageItem.subtitle"
              class="text-[11px] text-muted mt-2 line-clamp-2"
            >
              {{ pageItem.subtitle }}
            </p>
            <div class="mt-3 flex items-center gap-2 flex-wrap">
              <UButton
                v-if="can('pages.update')"
                :to="`/seller/pages/${pageItem.id}`"
                color="primary"
                variant="soft"
                size="xs"
                icon="i-tabler-pencil"
                class="cursor-pointer"
              >
                {{ $t('ویرایش') }}
              </UButton>
              <UButton
                :to="viewHref(pageItem.path)"
                target="_blank"
                external
                color="neutral"
                variant="ghost"
                size="xs"
                icon="i-tabler-external-link"
                class="cursor-pointer"
              >
                {{ $t('مشاهده') }}
              </UButton>
              <UButton
                v-if="can('pages.delete')"
                type="button"
                color="error"
                variant="ghost"
                size="xs"
                icon="i-tabler-trash"
                class="cursor-pointer"
                @click="openDelete(pageItem)"
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
      :title="$t('حذف صفحه')"
      :description="$t('این عمل قابل بازگشت نیست.')"
    >
      <template #body>
        <div
          v-if="pendingDelete"
          class="text-sm font-medium text-highlighted"
        >
          {{ pendingDelete.title }}
        </div>
      </template>
      <template #footer>
        <div class="flex items-center gap-2 w-full justify-end">
          <UButton
            color="neutral"
            variant="outline"
            class="cursor-pointer"
            :disabled="deleting"
            @click="deleteOpen = false"
          >
            {{ $t('انصراف') }}
          </UButton>
          <UButton
            color="error"
            class="font-bold cursor-pointer"
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
  sellerPageStatusMeta,
  type SellerManagedPage,
  type SellerPageStatus,
} from '~/data/seller-pages'

const pageSize = 10

const { t } = useI18n()
const toast = useAppToast()
const { can } = useSellerPermissions()
const { isAdminApp, storeUrl } = useAppMode()
const {
  pages,
  listMeta,
  fetchList,
  deletePage,
} = useSellerPages()
const { search, status, page, hasActiveFilters, clearFilters } = useSellerListQuery({
  defaultStatus: 'all',
})

const loading = ref(true)
const deleteOpen = ref(false)
const pendingDelete = ref<SellerManagedPage | null>(null)
const deleting = ref(false)

const statusTabs = computed(() => {
  const c = listMeta.value.statusCounts
  return [
    { id: 'all', label: t('همه'), count: Number(c.all) || 0 },
    ...(Object.keys(sellerPageStatusMeta) as SellerPageStatus[]).map(id => ({
      id,
      label: t(sellerPageStatusMeta[id].label),
      count: Number(c[id]) || 0,
    })),
  ]
})

const pageCount = computed(() =>
  Math.max(1, Math.ceil((listMeta.value.total || 0) / (listMeta.value.pageSize || pageSize))),
)

function viewHref(path: string) {
  if (!isAdminApp) return path
  const base = storeUrl.replace(/\/+$/, '')
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}

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
      page: page.value,
      pageSize,
    })
    if (!ok) {
      toast.error(t(apiErrorMessage(error, 'بارگذاری صفحات ناموفق بود')))
    }
  }
  finally {
    loading.value = false
  }
}

function openDelete(item: SellerManagedPage) {
  pendingDelete.value = item
  deleteOpen.value = true
}

async function confirmDelete() {
  if (!pendingDelete.value) return
  deleting.value = true
  try {
    const result = await deletePage(pendingDelete.value.id)
    deleteOpen.value = false
    pendingDelete.value = null
    if (!result.ok) {
      toast.error(t(result.error || 'حذف ناموفق بود'))
      return
    }
    toast.success(t('صفحه حذف شد'))
    await loadList()
  }
  finally {
    deleting.value = false
  }
}

watch([search, status, page], () => {
  void loadList()
})

onMounted(() => {
  void loadList()
})
</script>
