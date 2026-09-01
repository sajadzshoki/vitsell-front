<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
    <div class="hidden lg:block">
      <TheSellerPageHeader
        :title="$t('کاربران ادمین')"
        :description="$t('مدیریت حساب‌های کارکنان پنل — جدا از مشتریان فروشگاه')"
        :count-label="`${filtered.length.toLocaleString('fa-IR')} ${$t('نفر')}`"
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

    <TheSellerEmptyState
      v-if="!filtered.length"
      icon="i-tabler-user-shield"
      :message="$t('ادمینی با این فیلتر پیدا نشد')"
    />

    <div
      v-else
      class="space-y-3"
    >
      <div
        v-for="admin in paged"
        :key="admin.id"
        class="bg-muted border border-muted rounded-2xl p-4"
      >
        <div class="flex items-start justify-between gap-3 flex-wrap">
          <div class="min-w-0">
            <div class="font-medium text-highlighted">
              {{ adminFullName(admin) }}
            </div>
            <div class="text-[11px] text-muted mt-1 num" dir="ltr">
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
        :total="filtered.length"
        :items-per-page="pageSize"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { adminFullName, sellerAdminStatusMeta } from '~/data/seller-admins'

const { can } = useSellerPermissions()
const { admins, ensureLoaded } = useSellerAdmins()
const { getById: getRole, ensureLoaded: ensureRoles } = useSellerRoles()
const { search, status, page, hasActiveFilters, clearFilters } = useSellerListQuery({
  defaultStatus: 'all',
})

ensureLoaded()
ensureRoles()

const pageSize = 8
const statusTabs = computed(() => [
  { id: 'all', label: 'همه', count: admins.value.length },
  { id: 'active', label: 'فعال', count: admins.value.filter(a => a.status === 'active').length },
  { id: 'inactive', label: 'غیرفعال', count: admins.value.filter(a => a.status === 'inactive').length },
  { id: 'suspended', label: 'معلق', count: admins.value.filter(a => a.status === 'suspended').length },
])

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return admins.value.filter((admin) => {
    if (status.value !== 'all' && admin.status !== status.value) return false
    if (!q) return true
    return (
      adminFullName(admin).toLowerCase().includes(q)
      || admin.email.toLowerCase().includes(q)
      || admin.phone.includes(q)
    )
  })
})

const pageCount = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))

const paged = computed(() => {
  const start = (page.value - 1) * pageSize
  return filtered.value.slice(start, start + pageSize)
})

function roleName(roleId: string) {
  return getRole(roleId)?.name || roleId
}
</script>
