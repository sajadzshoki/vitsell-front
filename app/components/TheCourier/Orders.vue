<template>
  <div class="px-4 py-4 space-y-3">
    <div
      v-if="loading"
      class="space-y-3"
    >
      <USkeleton class="h-11 w-full rounded-full" />
      <USkeleton
        v-for="n in 4"
        :key="n"
        class="h-32 w-full rounded-2xl"
      />
    </div>

    <div
      v-else-if="error"
      class="bg-default border border-muted rounded-2xl p-6 text-center space-y-3"
    >
      <UIcon
        name="i-tabler-wifi-off"
        class="size-10 text-dimmed mx-auto"
      />
      <p class="text-sm text-muted">
        {{ error }}
      </p>
      <UButton
        color="primary"
        class="cursor-pointer min-h-11"
        @click="load"
      >
        {{ $t('تلاش دوباره') }}
      </UButton>
    </div>

    <div
      v-else-if="!orders.length"
      class="bg-default border border-muted rounded-2xl p-8 text-center space-y-2"
    >
      <UIcon
        name="i-tabler-package-off"
        class="size-12 text-dimmed mx-auto"
      />
      <p class="font-bold text-highlighted">
        {{ $t('سفارشی برای شما نیست') }}
      </p>
      <p class="text-sm text-muted">
        {{ $t('وقتی سفارشی به شما سپرده شود اینجا دیده می‌شود') }}
      </p>
    </div>

    <template v-else>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="tab in statusTabs"
          :key="tab.id"
          type="button"
          class="min-h-9 px-3 rounded-full text-xs inline-flex items-center gap-1.5 cursor-pointer border"
          :class="tab.id === activeStatus
            ? 'bg-primary text-inverted border-primary'
            : 'bg-default text-toned border-muted'"
          @click="selectStatus(tab.id)"
        >
          <span>{{ $t(tab.label) }}</span>
          <span class="num text-2xs opacity-80">{{ tab.count.toLocaleString('fa-IR') }}</span>
        </button>
      </div>

      <div
        v-if="!visibleOrders.length"
        class="bg-default border border-muted rounded-2xl p-8 text-center space-y-2"
      >
        <UIcon
          name="i-tabler-filter-off"
          class="size-10 text-dimmed mx-auto"
        />
        <p class="font-bold text-highlighted">
          {{ $t('سفارشی با این وضعیت نیست') }}
        </p>
      </div>

      <NuxtLink
        v-for="order in visibleOrders"
        :key="order.id"
        :to="`/courier/orders/${encodeURIComponent(order.id)}`"
        class="block bg-default border border-muted rounded-2xl p-4 cursor-pointer"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div
              class="num text-xs text-muted"
              dir="ltr"
            >
              {{ order.id }}
            </div>
            <div class="font-bold text-highlighted mt-1 truncate">
              {{ order.receiverName }}
            </div>
          </div>
          <UBadge
            :color="courierStatusMeta(order.status).color"
            variant="subtle"
            size="sm"
            class="shrink-0"
          >
            {{ $t(courierStatusMeta(order.status).label) }}
          </UBadge>
        </div>

        <p class="text-sm text-toned mt-2 truncate">
          {{ placeLine(order) }}
        </p>

        <div class="mt-3 pt-3 border-t border-muted flex items-center gap-3 text-xs text-muted">
          <span
            v-if="order.date"
            class="inline-flex items-center gap-1 shrink-0"
          >
            <UIcon
              name="i-tabler-calendar"
              class="size-3.5"
            />
            <span class="num">{{ order.date }}</span>
          </span>
          <span class="inline-flex items-center gap-1 shrink-0">
            <UIcon
              name="i-tabler-package"
              class="size-3.5"
            />
            {{ courierItemQty(order).toLocaleString('fa-IR') }} {{ $t('کالا') }}
          </span>
          <span class="ms-auto num font-bold text-sm text-highlighted shrink-0">
            {{ formatPrice(order.total) }}
          </span>
        </div>
      </NuxtLink>
    </template>
  </div>
</template>

<script setup lang="ts">
import {
  courierItemQty,
  courierStatusFilters,
  courierStatusMeta,
  type CourierOrder,
} from '~/data/courier'
import { formatPrice } from '~/data/products'
import type { SellerOrderStatus } from '~/data/seller'

const route = useRoute()
const { fetchOrders } = useCourier()
const orders = ref<CourierOrder[]>([])
const loading = ref(true)
const error = ref('')

const activeStatus = computed(() => {
  const raw = String(route.query.status || 'all')
  return courierStatusFilters.some(item => item.id === raw) ? raw : 'all'
})

const statusTabs = computed(() =>
  courierStatusFilters.map(tab => ({
    ...tab,
    count: tab.id === 'all'
      ? orders.value.length
      : orders.value.filter(order => order.status === tab.id).length,
  })),
)

const visibleOrders = computed(() => {
  if (activeStatus.value === 'all') return orders.value
  return orders.value.filter(order => order.status === activeStatus.value)
})

function placeLine(order: CourierOrder) {
  const city = order.city || order.address.city
  const street = order.address.address
  return [city, street].map(part => part.trim()).filter(Boolean).join('، ')
}

function selectStatus(id: 'all' | SellerOrderStatus) {
  void navigateTo({
    path: '/courier',
    query: id === 'all' ? {} : { status: id },
  }, { replace: true })
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const result = await fetchOrders()
    if (!result.ok) {
      error.value = result.message
      orders.value = []
      return
    }
    orders.value = result.items
  }
  finally {
    loading.value = false
  }
}

onMounted(() => {
  void load()
})
</script>
