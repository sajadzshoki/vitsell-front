<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
    <div class="hidden lg:block">
      <TheSellerPageHeader
        :title="$t('نقش‌ها و دسترسی‌ها')"
        :description="$t('نقش‌های سیستمی و سفارشی — تخصیص مجوز بر اساس ماژول')"
        :count-label="!loading ? `${listMeta.total.toLocaleString('fa-IR')} ${$t('نقش')}` : undefined"
      >
        <template
          v-if="can('roles.create')"
          #actions
        >
          <UButton
            to="/seller/roles/new"
            color="primary"
            size="sm"
            icon="i-tabler-plus"
            class="cursor-pointer"
          >
            {{ $t('نقش جدید') }}
          </UButton>
        </template>
      </TheSellerPageHeader>
    </div>

    <div
      v-if="can('roles.create')"
      class="lg:hidden mb-4"
    >
      <UButton
        to="/seller/roles/new"
        color="primary"
        block
        icon="i-tabler-plus"
        class="cursor-pointer"
      >
        {{ $t('نقش جدید') }}
      </UButton>
    </div>

    <TheSellerListToolbar
      v-model:search="search"
      :status="status"
      :tabs="statusTabs"
      :search-placeholder="$t('جستجوی نقش')"
      :has-active="hasActiveFilters"
      @update:status="status = $event"
      @clear="clearFilters"
    />

    <div
      v-if="loading && !roles.length"
      class="py-16 grid place-items-center"
    >
      <UIcon
        name="i-tabler-loader-2"
        class="size-8 text-primary animate-spin"
      />
    </div>

    <TheSellerEmptyState
      v-else-if="!roles.length"
      icon="i-tabler-lock-access"
      :message="hasActiveFilters ? $t('نقشی با این فیلتر پیدا نشد') : $t('نقشی پیدا نشد')"
    >
      <template
        v-if="can('roles.create') && !hasActiveFilters"
        #actions
      >
        <UButton
          to="/seller/roles/new"
          color="primary"
          variant="soft"
          icon="i-tabler-plus"
          class="cursor-pointer"
        >
          {{ $t('نقش جدید') }}
        </UButton>
      </template>
    </TheSellerEmptyState>

    <div
      v-else
      class="space-y-3"
    >
      <div
        v-for="role in roles"
        :key="role.id"
        class="bg-muted border border-muted rounded-2xl p-4"
      >
        <div class="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div class="font-medium text-highlighted flex items-center gap-2 flex-wrap">
              {{ role.name }}
              <UBadge
                v-if="role.isSystem"
                color="info"
                variant="subtle"
                size="xs"
              >
                {{ $t('سیستمی') }}
              </UBadge>
              <UBadge
                :color="role.status === 'active' ? 'success' : 'neutral'"
                variant="subtle"
                size="xs"
              >
                {{ role.status === 'active' ? $t('فعال') : $t('غیرفعال') }}
              </UBadge>
            </div>
            <p class="text-xs text-muted mt-1 leading-6">
              {{ role.description }}
            </p>
            <div class="text-[11px] text-toned mt-2 num">
              {{ role.permissions.length.toLocaleString('fa-IR') }} {{ $t('مجوز') }}
              ·
              {{ roleAdminCount(role).toLocaleString('fa-IR') }} {{ $t('ادمین') }}
            </div>
          </div>
          <div class="flex items-center gap-2 flex-wrap">
            <UButton
              v-if="can('roles.create')"
              type="button"
              color="neutral"
              variant="soft"
              size="xs"
              icon="i-tabler-copy"
              class="cursor-pointer"
              @click="onClone(role.id)"
            >
              {{ $t('کپی') }}
            </UButton>
            <UButton
              :to="`/seller/roles/${role.id}`"
              color="primary"
              variant="soft"
              size="xs"
              icon="i-tabler-pencil"
              class="cursor-pointer"
            >
              {{ can('roles.update') ? $t('ویرایش') : $t('مشاهده') }}
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <TheSellerPagination
      v-model:page="page"
      v-model:page-size="pageSize"
      :total="listMeta.total"
    />
  </div>
</template>

<script setup lang="ts">
import { adminFullName } from '~/data/seller-admins'
import type { SellerRole } from '~/data/seller-roles'

const { t } = useI18n()
const toast = useAppToast()
const { can } = useSellerPermissions()
const {
  roles,
  listMeta,
  fetchList,
  countAdminsForRole,
  cloneRole,
} = useSellerRoles()
const { admins, ensureLoaded: ensureAdmins, currentAdminUser } = useSellerAdmins()
const { appendLog } = useSellerAudit()
const { search, status, page, pageSize, hasActiveFilters, clearFilters } = useSellerListQuery({
  defaultStatus: 'all',
  defaultPageSize: 20,
})

const loading = ref(false)

const statusTabs = computed(() => {
  const c = listMeta.value.statusCounts
  return [
    { id: 'all', label: 'همه', count: Number(c.all) || 0 },
    { id: 'active', label: 'فعال', count: Number(c.active) || 0 },
    { id: 'inactive', label: 'غیرفعال', count: Number(c.inactive) || 0 },
  ]
})


function roleAdminCount(role: SellerRole) {
  if (role.adminCount != null) return role.adminCount
  return countAdminsForRole(role.id, admins.value)
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
    void ensureAdmins({ force: false })
    const { ok, error } = await fetchList({
      q: search.value || undefined,
      status: status.value,
      page: page.value,
      pageSize: pageSize.value,
    })
    if (!ok) {
      toast.error(t(apiErrorMessage(error, 'بارگذاری نقش‌ها ناموفق بود')))
    }
  }
  finally {
    loading.value = false
  }
}

async function onClone(id: string) {
  const result = await cloneRole(id)
  if (!result.ok || !result.role) {
    toast.error(t(result.error || 'کپی ناموفق بود'))
    return
  }
  const actor = currentAdminUser()
  appendLog({
    actorId: actor?.id || 'unknown',
    actorName: actor ? adminFullName(actor) : t('سیستم'),
    action: 'create',
    entity: 'role',
    entityId: result.role.id,
    summary: t('نقش کپی شد'),
    newValue: result.role.key,
  })
  toast.success(t('نقش کپی شد'))
  await loadList()
}

watch(
  [search, status, page, pageSize],
  () => {
    void loadList()
  },
)

onMounted(() => {
  void loadList()
})
</script>
