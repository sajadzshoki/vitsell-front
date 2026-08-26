<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
    <div class="hidden lg:flex items-center justify-between mb-5 gap-3">
      <h2 class="font-bold text-highlighted">{{ $t('محصولات فروشگاه') }}</h2>
      <div class="text-xs text-muted num">
        {{ filtered.length.toLocaleString('fa-IR') }} {{ $t('کالا') }}
      </div>
    </div>

    <div class="flex flex-col sm:(flex-row items-center) gap-3 mb-4">
      <TheFormInput
        v-model="query"
        icon="i-tabler-search"
        :placeholder="$t('جستجوی محصول')"
        class="flex-1 w-full"
      />
      <div class="flex items-center gap-2 overflow-x-auto scrollbar-none w-full sm:w-auto">
        <UButton
          v-for="tab in statusTabs"
          :key="tab.id"
          :color="statusFilter === tab.id ? 'primary' : 'neutral'"
          :variant="statusFilter === tab.id ? 'soft' : 'ghost'"
          size="sm"
          class="shrink-0"
          @click="statusFilter = tab.id"
        >
          {{ $t(tab.label) }}
        </UButton>
      </div>
    </div>

    <div
      v-if="filtered.length === 0"
      class="text-center py-12"
    >
      <UIcon name="i-tabler-package" class="size-16 text-dimmed mx-auto mb-4" />
      <p class="text-sm text-muted">{{ $t('محصولی با این فیلتر پیدا نشد') }}</p>
    </div>
    <div
      v-else
      class="space-y-3"
    >
      <TheSellerProductRow
        v-for="listing in filtered"
        :key="listing.productId"
        :listing="listing"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SellerProductStatus } from '~/data/seller'
import { getProductById } from '~/data/products'

const { listings } = useSeller()

const query = ref('')
const statusFilter = ref<'all' | SellerProductStatus>('all')

const statusTabs = [
  { id: 'all' as const, label: 'همه' },
  { id: 'active' as const, label: 'فعال' },
  { id: 'pending' as const, label: 'در انتظار' },
  { id: 'inactive' as const, label: 'غیرفعال' },
  { id: 'out_of_stock' as const, label: 'ناموجود' },
]

const filtered = computed(() => {
  const q = query.value.trim()
  return listings.value.filter((listing) => {
    if (statusFilter.value !== 'all' && listing.status !== statusFilter.value) {
      return false
    }
    if (!q) return true
    return getProductById(listing.productId).title.includes(q)
  })
})
</script>
