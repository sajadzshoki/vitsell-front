<template>
  <div>
    <div
      v-if="!warehouse"
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
const { t } = useI18n()
const route = useRoute()
const { ensureWarehouses, getWarehouse } = useSellerInventory()

definePageMeta({
  layout: 'seller',
  middleware: ['auth', 'admin'],
})

ensureWarehouses()

const warehouseId = computed(() => String(route.params.id ?? ''))
const warehouse = computed(() => getWarehouse(warehouseId.value) ?? null)

useSeoMeta({
  title: () => warehouse.value
    ? `${t('ویرایش انبار')} · ${warehouse.value.name}`
    : t('ویرایش انبار'),
})
</script>
