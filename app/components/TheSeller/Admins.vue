<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
    <div class="hidden lg:block">
      <TheSellerPageHeader
        :title="$t('کاربران ادمین')"
        :description="$t('مدیریت حساب‌های کارکنان پنل — جدا از مشتریان فروشگاه')"
        :count-label="!loading ? `${listMeta.total.toLocaleString('fa-IR')} ${$t('نفر')}` : undefined"
      >
        <template
          v-if="can('admins.create')"
          #actions
        >
          <UButton
            to="/seller/admins/new"
            color="primary"
            size="sm"
            icon="i-tabler-plus"
            class="cursor-pointer"
          >
            {{ $t('افزودن ادمین') }}
          </UButton>
        </template>
      </TheSellerPageHeader>
    </div>

    <div
      v-if="can('admins.create')"
      class="lg:hidden mb-4"
    >
      <UButton
        to="/seller/admins/new"
        color="primary"
        block
        icon="i-tabler-plus"
        class="cursor-pointer"
      >
        {{ $t('افزودن ادمین') }}
      </UButton>
    </div>

    <TheSellerListToolbar
      v-model:search="search"
      :status="status"
      :tabs="statusTabs"
      :search-placeholder="$t('جستجوی نام، ایمیل یا تلفن')"
      :has-active="hasActiveFilters"
      @update:status="status = $event"
      @clear="clearFilters"
    />

    <div
      v-if="loading && !admins.length"
      class="py-16 grid place-items-center"
    >
      <UIcon
        name="i-tabler-loader-2"
        class="size-8 text-primary animate-spin"
      />
    </div>

    <TheSellerEmptyState
      v-else-if="!admins.length"
      icon="i-tabler-user-shield"
      :message="$t('ادمینی با این فیلتر پیدا نشد')"
    />

    <div
      v-else
      class="space-y-3"
    >
      <div
        v-for="admin in admins"
        :key="admin.id"
        class="bg-muted border border-muted rounded-2xl p-4"
      >
        <div class="flex items-start justify-between gap-3 flex-wrap">
          <div class="min-w-0">
            <div class="font-medium text-highlighted">
              {{ adminFullName(admin) }}
            </div>
            <div
              class="text-[11px] text-muted mt-1 num"
              dir="ltr"
            >
              {{ admin.email }}
              <span v-if="admin.phone"> · {{ admin.phone }}</span>
            </div>
            <div class="flex items-center gap-1.5 mt-2 flex-wrap">
              <UBadge
                :color="sellerAdminStatusMeta[admin.status].color"
                variant="subtle"
                size="xs"
              >
                {{ $t(sellerAdminStatusMeta[admin.status].label) }}
              </UBadge>
              <UBadge
                v-for="roleId in admin.roleIds"
                :key="roleId"
                color="primary"
                variant="subtle"
                size="xs"
              >
                {{ roleName(roleId) }}
              </UBadge>
            </div>
          </div>
          <div class="flex items-center gap-2 flex-wrap">
            <UButton
              :to="`/seller/admins/${admin.id}`"
              color="primary"
              variant="soft"
              size="xs"
              icon="i-tabler-eye"
              class="cursor-pointer"
            >
              {{ $t('جزئیات') }}
            </UButton>
            <UButton
              v-if="can('admins.update')"
              :to="`/seller/admins/${admin.id}?tab=edit`"
              color="neutral"
              variant="soft"
              size="xs"
              icon="i-tabler-pencil"
              class="cursor-pointer"
            >
              {{ $t('ویرایش') }}
            </UButton>
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
  </div>
</template>

<script setup lang="ts">
import { adminFullName, sellerAdminStatusMeta } from '~/data/seller-admins'

const { t } = useI18n()
const toast = useAppToast()
const { can } = useSellerPermissions()
const { admins, listMeta, fetchList } = useSellerAdmins()
const { getById: getRole, ensureLoaded: ensureRoles } = useSellerRoles()
const { search, status, page, hasActiveFilters, clearFilters } = useSellerListQuery({
  defaultStatus: 'all',
})

const pageSize = 8
const loading = ref(false)

const statusTabs = computed(() => {
  const c = listMeta.value.statusCounts
  return [
    { id: 'all', label: 'همه', count: Number(c.all) || 0 },
    { id: 'active', label: 'فعال', count: Number(c.active) || 0 },
    { id: 'inactive', label: 'غیرفعال', count: Number(c.inactive) || 0 },
    { id: 'suspended', label: 'معلق', count: Number(c.suspended) || 0 },
  ]
})

const pageCount = computed(() =>
  Math.max(1, Math.ceil((listMeta.value.total || 0) / (listMeta.value.pageSize || pageSize))),
)

async function loadList() {
  loading.value = true
  try {
    await ensureRoles({ force: true })
    const { ok, error } = await fetchList({
      q: search.value || undefined,
      status: status.value,
      page: page.value,
      pageSize,
    })
    if (!ok) {
      toast.error(t(
        (error as any)?.data?.errors?.[0]?.message
        || (error as any)?.message
        || 'بارگذاری ادمین‌ها ناموفق بود',
      ))
    }
  }
  finally {
    loading.value = false
  }
}

function roleName(roleId: string) {
  return getRole(roleId)?.name || roleId
}

watch(
  [search, status, page],
  () => {
    void loadList()
  },
)

onMounted(() => {
  void loadList()
})
</script>
