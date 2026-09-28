<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
    <div class="hidden lg:block">
      <TheSellerPageHeader
        :title="$t('پیک‌ها')"
        :description="$t('پیک‌های فعال در انتخاب سفارش دیده می‌شوند')"
      >
        <template
          v-if="canUpdate"
          #actions
        >
          <UButton
            to="/seller/couriers/new"
            color="primary"
            size="sm"
            icon="i-tabler-plus"
            class="cursor-pointer"
          >
            {{ $t('افزودن پیک') }}
          </UButton>
        </template>
      </TheSellerPageHeader>
    </div>

    <div
      v-if="canUpdate"
      class="lg:hidden mb-4"
    >
      <UButton
        to="/seller/couriers/new"
        color="primary"
        block
        icon="i-tabler-plus"
        class="cursor-pointer"
      >
        {{ $t('افزودن پیک') }}
      </UButton>
    </div>

    <TheSellerForbidden
      v-if="!canUpdate"
      :message="$t('برای مدیریت پیک‌ها مجوز به‌روزرسانی سفارش لازم است')"
    />

    <div
      v-else-if="loading"
      class="space-y-3"
    >
      <USkeleton
        v-for="n in 4"
        :key="n"
        class="h-16 w-full rounded-xl"
      />
    </div>

    <TheSellerEmptyState
      v-else-if="!items.length"
      icon="i-tabler-motorbike"
      :title="$t('پیکی ثبت نشده')"
      :message="$t('با افزودن پیک می‌توانید سفارش را به او بسپارید')"
    />

    <div
      v-else
      class="space-y-3"
    >
      <div
        v-for="courier in items"
        :key="courier.id"
        class="bg-muted border border-muted rounded-2xl p-4 flex items-center gap-3"
      >
        <div class="flex-1 min-w-0">
          <div class="font-bold text-highlighted truncate">
            {{ courier.name }}
          </div>
          <div
            class="num text-sm text-muted mt-1"
            dir="ltr"
          >
            {{ courier.phone }}
          </div>
        </div>
        <UBadge
          :color="courier.status === 'active' ? 'success' : 'neutral'"
          variant="subtle"
        >
          {{ courier.status === 'active' ? $t('فعال') : $t('غیرفعال') }}
        </UBadge>
        <UButton
          :to="`/seller/couriers/${courier.id}`"
          color="neutral"
          variant="ghost"
          size="sm"
          icon="i-tabler-pencil"
          class="cursor-pointer"
          :aria-label="$t('ویرایش')"
        />
        <UButton
          color="neutral"
          variant="soft"
          size="sm"
          class="cursor-pointer"
          :loading="pendingId === courier.id"
          @click="toggle(courier)"
        >
          {{ courier.status === 'active' ? $t('غیرفعال کردن') : $t('فعال کردن') }}
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SellerCourier } from '~/composables/useSellerCouriers'

const { can } = useSellerPermissions()
const canUpdate = computed(() => can('orders.update'))
const toast = useAppToast()
const { items, fetchCouriers, setCourierStatus } = useSellerCouriers()
const pendingId = ref<number | null>(null)
const loading = ref(true)

async function load() {
  loading.value = true
  const result = await fetchCouriers()
  loading.value = false
  if (!result.ok) toast.error(result.message)
}

async function toggle(courier: SellerCourier) {
  pendingId.value = courier.id
  try {
    const next = courier.status === 'active' ? 'inactive' : 'active'
    const result = await setCourierStatus(courier.id, next)
    if (!result.ok) toast.error(result.message)
  }
  finally {
    pendingId.value = null
  }
}

watch(canUpdate, (ok) => {
  if (ok) void load()
}, { immediate: true })
</script>
