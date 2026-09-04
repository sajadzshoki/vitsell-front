<template>
  <div>
    <div
      v-if="loading"
      class="py-16 grid place-items-center"
    >
      <UIcon
        name="i-tabler-loader-2"
        class="size-8 text-primary animate-spin"
      />
    </div>

    <div
      v-else-if="!warehouse"
      class="bg-default border border-muted rounded-2xl p-8 text-center"
    >
      <UIcon
        name="i-tabler-building-warehouse"
        class="size-14 text-dimmed mx-auto mb-4"
      />
      <p class="text-sm text-muted mb-4">
        {{ $t('انبار پیدا نشد') }}
      </p>
      <UButton
        to="/seller/warehouses"
        color="primary"
        variant="soft"
        class="cursor-pointer"
      >
        {{ $t('بازگشت به انبارها') }}
      </UButton>
    </div>
    <TheSellerWarehouseForm
      v-else
      :initial="warehouse"
    />
  </div>
</template>

<script setup lang="ts">
import type { SellerWarehouse } from '~/data/seller-inventory'

const { t } = useI18n()
const route = useRoute()
const { fetchWarehouse } = useSellerInventory()

definePageMeta({
  layout: 'seller',
  middleware: ['auth', 'admin'],
})

const loading = ref(true)
const warehouse = ref<SellerWarehouse | null>(null)

const warehouseId = computed(() => String(route.params.id ?? ''))

async function load() {
  loading.value = true
  try {
    const result = await fetchWarehouse(warehouseId.value, { force: true })
    warehouse.value = result.warehouse
  }
  finally {
    loading.value = false
  }
}

watch(warehouseId, () => {
  void load()
})

onMounted(() => {
  void load()
})

useSeoMeta({
  title: () => warehouse.value
    ? `${t('ویرایش انبار')} · ${warehouse.value.name}`
    : t('ویرایش انبار'),
})
</script>
