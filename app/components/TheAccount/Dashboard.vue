<template>
  <div class="space-y-5">
    <div
      v-if="isMobile"
      class="flex items-center gap-3 pb-1"
    >
      <div
        class="size-14 rounded-2xl bg-primary text-inverted grid place-items-center text-xl font-bold shrink-0"
      >
        {{ avatarInitial }}
      </div>
      <div class="flex-1 min-w-0">
        <div class="text-base font-bold text-highlighted truncate">
          {{ fullName }}
        </div>
        <div class="text-xs text-muted num" dir="ltr">
          {{ profile.phone }}
        </div>
      </div>
    </div>

    <div
      class="rounded-2xl p-5 sm:p-6 relative overflow-hidden bg-primary"
    >
      <h2 class="text-xl md:text-2xl font-bold mb-2 text-inverted">
        {{ $t('سلام') }} {{ profile.firstName }}، {{ $t('خوش آمدید 👋') }}
      </h2>
      <p class="text-sm leading-7 text-inverted/90 max-w-xl">
        {{ $t('به پیشخوان حساب کاربری خود در دیجی‌شاپ خوش آمدید. از اینجا می‌توانید سفارش‌ها، آدرس‌ها و علاقه‌مندی‌های خود را مدیریت کنید.') }}
      </p>
      <UIcon
        name="i-tabler-star"
        class="absolute -bottom-10 -start-10 size-44 text-inverted/15 pointer-events-none"
      />
    </div>

    <TheAccountStatCards />

    <div class="bg-default border border-muted rounded-2xl p-5">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-bold text-highlighted">
          {{ $t('آخرین سفارش‌های شما') }}
        </h3>
        <NuxtLink
          to="/account/orders"
          class="text-xs text-primary font-medium hover:underline"
        >
          {{ $t('مشاهده همه') }}
          <UIcon name="i-tabler-chevron-left" class="size-3.5 inline-block align-[-2px]" />
        </NuxtLink>
      </div>

      <div
        v-if="orders.length === 0"
        class="text-center py-8 text-sm text-muted"
      >
        {{ $t('هنوز سفارشی ثبت نکرده‌اید') }}
      </div>
      <div
        v-else
        class="space-y-3"
      >
        <TheAccountOrderRow
          v-for="order in recentOrders"
          :key="order.id"
          :order="order"
        />
      </div>
    </div>

    <TheAccountMobileMenu v-if="isMobile" />
  </div>
</template>

<script setup lang="ts">
const { isMobile } = useDevice()
const { profile, orders, fullName, avatarInitial } = useAccount()

const recentOrders = computed(() => orders.value.slice(0, 3))
</script>
