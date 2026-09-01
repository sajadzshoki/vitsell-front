<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
    <div class="hidden lg:flex items-center justify-between mb-5 gap-3">
      <h2 class="font-bold text-highlighted">
        {{ $t('محصولات فروشگاه') }}
      </h2>
      <div class="flex items-center gap-3">
        <div
          v-if="!loading"
          class="text-xs text-muted num"
        >
          {{ filtered.length.toLocaleString('fa-IR') }} {{ $t('کالا') }}
        </div>
        <UButton
          to="/seller/products/new"
          color="primary"
          size="sm"
          icon="i-tabler-plus"
          class="font-medium"
        >
          {{ $t('افزودن محصول') }}
        </UButton>
      </div>
    </div>

    <div class="lg:hidden mb-4">
      <UButton
        to="/seller/products/new"
        color="primary"
        block
        icon="i-tabler-plus"
        class="font-medium"
      >
        {{ $t('افزودن محصول') }}
      </UButton>
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
          type="button"
          :color="statusFilter === tab.id ? 'primary' : 'neutral'"
          :variant="statusFilter === tab.id ? 'soft' : 'ghost'"
          size="sm"
          class="shrink-0 cursor-pointer"
          @click="onStatusChange(tab.id)"
        >
          {{ $t(tab.label) }}
          <span
            v-if="tab.id !== 'all'"
            class="num ms-1"
          >
            {{ countBy(tab.id).toLocaleString('fa-IR') }}
          </span>
        </UButton>
      </div>
    </div>

    <div
      v-if="loading"
      class="space-y-3"
    >
      <USkeleton
        v-for="n in 5"
        :key="n"
        class="h-28 rounded-2xl"
      />
    </div>

    <div
      v-else-if="filtered.length === 0"
      class="text-center py-12"
    >
      <UIcon
        name="i-tabler-package"
        class="size-16 text-dimmed mx-auto mb-4"
      />
      <p class="text-sm text-muted mb-4">
        {{ listings.length === 0 ? $t('هنوز محصولی ثبت نشده') : $t('محصولی با این فیلتر پیدا نشد') }}
      </p>
      <UButton
        to="/seller/products/new"
        color="primary"
        variant="soft"
        icon="i-tabler-plus"
      >
        {{ $t('افزودن اولین محصول') }}
      </UButton>
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

const { t } = useI18n()
const toast = useAppToast()
const { listings, resolveProduct, fetchListings } = useSeller()

const loading = ref(true)
const query = ref('')
const statusFilter = ref<'all' | SellerProductStatus>('all')

const statusTabs = [
  { id: 'all' as const, label: 'همه' },
  { id: 'active' as const, label: 'فعال' },
  { id: 'pending' as const, label: 'در انتظار' },
  { id: 'inactive' as const, label: 'غیرفعال' },
  { id: 'out_of_stock' as const, label: 'ناموجود' },
]

function onStatusChange(id: typeof statusFilter.value) {
  statusFilter.value = id
}

function countBy(id: SellerProductStatus) {
  return listings.value.filter(item => item.status === id).length
}

const filtered = computed(() => {
  const q = query.value.trim()
  return listings.value.filter((listing) => {
    if (statusFilter.value !== 'all' && listing.status !== statusFilter.value) {
      return false
    }
    if (!q) return true
    const product = resolveProduct(listing.productId)
    return product.title.includes(q) || product.brand.includes(q) || listing.productId.includes(q)
  })
})

function apiErrorMessage(error: any, fallback: string) {
  const fromFields = error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
  return fromFields || error?.data?.message || error?.message || fallback
}

async function loadProducts() {
  loading.value = true
  try {
    const { ok, error } = await fetchListings({ force: true })
    if (!ok) {
      toast.error(apiErrorMessage(error, t('بارگذاری محصولات ناموفق بود')))
    }
  }
  finally {
    loading.value = false
  }
}

onMounted(() => {
  loadProducts()
})
</script>
