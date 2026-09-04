<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0 space-y-6">
    <TheSellerPageHeader
      :title="$t('مرکز خروجی')"
      :description="$t('خروجی CSV از موجودیت‌های مجاز')"
    />

    <TheSellerEmptyState
      v-if="!exportActions.length"
      icon="i-tabler-lock"
      :message="$t('دسترسی خروجی ندارید')"
    />

    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 gap-3"
    >
      <button
        v-for="action in exportActions"
        :key="action.id"
        type="button"
        class="bg-muted border border-muted rounded-2xl p-4 text-start hover:border-primary/40 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="running === action.id"
        @click="runExport(action.id)"
      >
        <div class="flex items-center gap-3">
          <div class="size-10 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
            <UIcon
              :name="action.icon"
              class="size-5"
            />
          </div>
          <div class="min-w-0">
            <div class="font-medium text-highlighted">
              {{ $t(action.label) }}
            </div>
            <div class="text-[11px] text-muted mt-0.5">
              {{ $t(action.hint) }}
            </div>
          </div>
          <UIcon
            v-if="running === action.id"
            name="i-tabler-loader-2"
            class="size-4 text-primary animate-spin ms-auto"
          />
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { downloadSellerCsv } from '~/data/seller-export'
import { customerFullName } from '~/data/seller-customers'

const { t } = useI18n()
const toast = useAppToast()
const { can } = useSellerPermissions()
const { fetchListingsExport, fetchOrdersExport, resolveProduct } = useSeller()
const { customers, ensureLoaded: ensureCustomers } = useSellerCustomers()

void ensureCustomers()

type ExportId = 'products' | 'orders' | 'customers'

const running = ref<ExportId | null>(null)

const exportActions = computed(() => {
  const list: { id: ExportId, label: string, hint: string, icon: string }[] = []
  if (can('exports.create') || can('products.view')) {
    list.push({
      id: 'products',
      label: 'محصولات',
      hint: 'لیست آگهی‌های پنل',
      icon: 'i-tabler-package',
    })
  }
  if (can('exports.create') || can('orders.export') || can('orders.view')) {
    list.push({
      id: 'orders',
      label: 'سفارش‌ها',
      hint: 'خروجی Excel (CSV) از سفارش‌ها',
      icon: 'i-tabler-shopping-cart',
    })
  }
  if (can('exports.create') || can('customers.export') || can('customers.view')) {
    list.push({
      id: 'customers',
      label: 'مشتریان',
      hint: 'خروجی پایگاه مشتریان',
      icon: 'i-tabler-users',
    })
  }
  return list
})

async function runExport(id: ExportId) {
  running.value = id
  try {
    if (id === 'products') {
      const { ok, items } = await fetchListingsExport()
      if (!ok) {
        toast.error(t('خروجی محصولات ناموفق بود'))
        return
      }
      downloadSellerCsv(
        `products-${Date.now()}`,
        ['id', 'title', 'brand', 'category', 'price', 'stock', 'sold', 'status'],
        items.map((l) => {
          const p = l.product ?? resolveProduct(l.productId)
          return [
            l.productId,
            p.title,
            p.brand,
            p.categoryLabel || p.category,
            p.price,
            l.stock,
            l.sold,
            l.status,
          ]
        }),
      )
    }
    else if (id === 'orders') {
      const { ok, items } = await fetchOrdersExport()
      if (!ok) {
        toast.error(t('خروجی سفارش‌ها ناموفق بود'))
        return
      }
      downloadSellerCsv(
        `orders-${Date.now()}`,
        [
          'id',
          'customer',
          'phone',
          'city',
          'status',
          'total',
          'paymentMethod',
          'shippingMethod',
          'date',
          'dateKey',
          'itemsCount',
          'note',
        ],
        items.map(o => [
          o.id,
          o.customerName,
          o.customerPhone,
          o.city,
          o.status,
          o.total,
          o.paymentMethod,
          o.shippingMethod,
          o.date,
          o.dateKey,
          o.items.length,
          o.note || '',
        ]),
      )
    }
    else {
      downloadSellerCsv(
        `customers-${Date.now()}`,
        ['id', 'name', 'email', 'phone', 'status', 'orders', 'spent'],
        customers.value.map(c => [
          c.id,
          customerFullName(c),
          c.email,
          c.phone,
          c.status,
          c.orderCount,
          c.totalSpent,
        ]),
      )
    }
    toast.success(t('فایل خروجی آماده شد'))
  }
  finally {
    running.value = null
  }
}
</script>
