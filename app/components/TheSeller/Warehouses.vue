<template>
  <TheSellerForbidden
    v-if="!can('warehouses.view')"
    :message="$t('برای مشاهده انبارها مجوز warehouses.view لازم است')"
  />

  <div
    v-else
    class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0"
  >
    <div class="hidden lg:block">
      <TheSellerPageHeader
        :title="$t('انبارها')"
        :description="$t('مدیریت انبارهای فیزیکی و پیش‌فرض ارسال')"
        :count-label="`${filtered.length.toLocaleString('fa-IR')} ${$t('انبار')}`"
      >
        <template
          v-if="can('warehouses.create')"
          #actions
        >
          <UButton
            to="/seller/warehouses/new"
            color="primary"
            size="sm"
            icon="i-tabler-plus"
            class="cursor-pointer"
          >
            {{ $t('افزودن انبار') }}
          </UButton>
        </template>
      </TheSellerPageHeader>
    </div>

    <div
      v-if="can('warehouses.create')"
      class="lg:hidden mb-4"
    >
      <UButton
        to="/seller/warehouses/new"
        color="primary"
        block
        icon="i-tabler-plus"
        class="cursor-pointer"
      >
        {{ $t('افزودن انبار') }}
      </UButton>
    </div>

    <TheSellerListToolbar
      v-model:search="search"
      :status="status"
      :tabs="statusTabs"
      :search-placeholder="$t('جستجوی نام، کد یا شهر')"
      :has-active="hasActiveFilters"
      @update:status="status = $event"
      @clear="clearFilters"
    />

    <TheSellerEmptyState
      v-if="!filtered.length"
      icon="i-tabler-building-warehouse"
      :message="warehouses.length === 0 ? $t('هنوز انباری ثبت نشده') : $t('انباری با این فیلتر پیدا نشد')"
    >
      <template
        v-if="warehouses.length === 0 && can('warehouses.create')"
        #actions
      >
        <UButton
          to="/seller/warehouses/new"
          color="primary"
          variant="soft"
          icon="i-tabler-plus"
          class="cursor-pointer"
        >
          {{ $t('افزودن اولین انبار') }}
        </UButton>
      </template>
    </TheSellerEmptyState>

    <div
      v-else
      class="space-y-3"
    >
      <div
        v-for="warehouse in filtered"
        :key="warehouse.id"
        class="bg-muted border border-muted rounded-2xl p-4"
      >
        <div class="flex items-start justify-between gap-3 flex-wrap">
          <div class="min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-medium text-highlighted">{{ warehouse.name }}</span>
              <UBadge
                v-if="warehouse.isDefault"
                color="primary"
                variant="subtle"
                size="xs"
              >
                {{ $t('پیش‌فرض') }}
              </UBadge>
              <UBadge
                :color="warehouse.status === 'active' ? 'success' : 'neutral'"
                variant="subtle"
                size="xs"
              >
                {{ warehouse.status === 'active' ? $t('فعال') : $t('غیرفعال') }}
              </UBadge>
            </div>
            <div class="text-[11px] text-muted mt-1 num" dir="ltr">
              {{ warehouse.code }}
              <span v-if="warehouse.city"> · {{ warehouse.city }}</span>
            </div>
            <div
              v-if="warehouse.address"
              class="text-xs text-toned mt-2 leading-6"
            >
              {{ warehouse.address }}
            </div>
          </div>
          <div class="flex items-center gap-2 flex-wrap">
            <UButton
              :to="`/seller/warehouses/${warehouse.id}`"
              color="primary"
              variant="soft"
              size="xs"
              :icon="can('warehouses.update') ? 'i-tabler-pencil' : 'i-tabler-eye'"
              class="cursor-pointer"
            >
              {{ can('warehouses.update') ? $t('ویرایش') : $t('جزئیات') }}
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { can } = useSellerPermissions()
const { warehouses, ensureWarehouses } = useSellerInventory()
const { search, status, hasActiveFilters, clearFilters } = useSellerListQuery({
  defaultStatus: 'all',
})

ensureWarehouses()

const statusTabs = computed(() => [
  { id: 'all', label: 'همه', count: warehouses.value.length },
  { id: 'active', label: 'فعال', count: warehouses.value.filter(w => w.status === 'active').length },
  { id: 'inactive', label: 'غیرفعال', count: warehouses.value.filter(w => w.status === 'inactive').length },
])

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return warehouses.value.filter((warehouse) => {
    if (status.value !== 'all' && warehouse.status !== status.value) return false
    if (!q) return true
    return (
      warehouse.name.toLowerCase().includes(q)
      || warehouse.code.toLowerCase().includes(q)
      || warehouse.city.toLowerCase().includes(q)
      || warehouse.address.toLowerCase().includes(q)
    )
  })
})
</script>
