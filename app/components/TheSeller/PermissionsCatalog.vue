<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0 space-y-6">
    <TheSellerPageHeader
      :title="$t('کاتالوگ دسترسی‌ها')"
      :description="$t('فهرست فقط‌خواندنی مجوزهای پنل — برای تخصیص از نقش‌ها استفاده کنید')"
      :count-label="`${sellerAllPermissions.length.toLocaleString('fa-IR')} ${$t('مجوز')}`"
    >
      <template #actions>
        <UButton
          to="/seller/roles"
          color="primary"
          variant="soft"
          size="sm"
          class="cursor-pointer"
        >
          {{ $t('نقش‌ها') }}
        </UButton>
      </template>
    </TheSellerPageHeader>

    <TheFormInput
      v-model="query"
      icon="i-tabler-search"
      :placeholder="$t('جستجوی مجوز')"
    />

    <div
      v-for="group in filteredGroups"
      :key="group.id"
      class="space-y-2"
    >
      <h3 class="text-sm font-bold text-highlighted">
        {{ $t(group.label) }}
        <span class="text-muted font-normal num ms-1">
          ({{ group.items.length.toLocaleString('fa-IR') }})
        </span>
      </h3>
      <div class="bg-muted border border-muted rounded-2xl divide-y divide-muted">
        <div
          v-for="item in group.items"
          :key="item.key"
          class="px-4 py-3 flex items-start justify-between gap-3 flex-wrap"
        >
          <div class="min-w-0">
            <div class="text-sm text-highlighted">
              {{ $t(item.label) }}
            </div>
            <div
              class="text-[11px] text-muted num mt-0.5"
              dir="ltr"
            >
              {{ item.key }}
            </div>
          </div>
          <UBadge
            v-if="item.expandsTo?.length"
            color="info"
            variant="subtle"
            size="xs"
          >
            {{ $t('گسترده') }}
          </UBadge>
        </div>
      </div>
    </div>

    <TheSellerEmptyState
      v-if="!filteredGroups.length"
      icon="i-tabler-key-off"
      :message="$t('مجوزی یافت نشد')"
    />
  </div>
</template>

<script setup lang="ts">
import {
  sellerAllPermissions,
  sellerPermissionCatalog,
  sellerPermissionGroups,
} from '~/data/seller-permissions'

const query = ref('')

const filteredGroups = computed(() => {
  const q = query.value.trim().toLowerCase()
  return sellerPermissionGroups
    .map((group) => {
      const items = sellerPermissionCatalog.filter((p) => {
        if (p.group !== group.id) return false
        if (!q) return true
        return p.key.toLowerCase().includes(q) || p.label.includes(query.value.trim())
      })
      return { ...group, items }
    })
    .filter(g => g.items.length > 0)
})
</script>
