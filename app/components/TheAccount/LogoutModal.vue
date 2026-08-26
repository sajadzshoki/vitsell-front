<template>
  <UModal
    v-model:open="open"
    :title="$t('خروج از حساب')"
    :description="$t('آیا مطمئن هستید که می‌خواهید از حساب کاربری خارج شوید؟')"
  >
    <template #body>
      <p class="text-sm text-toned leading-7">
        {{ $t('با خروج، به سبد خرید و علاقه‌مندی‌های فعلی دسترسی دارید؛ برای سفارش باید دوباره وارد شوید.') }}
      </p>
    </template>
    <template #footer>
      <div class="flex items-center gap-2 w-full justify-end">
        <UButton
          color="neutral"
          variant="outline"
          @click="cancelLogout"
        >
          {{ $t('انصراف') }}
        </UButton>
        <UButton
          color="error"
          class="font-bold"
          @click="confirmLogout"
        >
          {{ $t('خروج از حساب') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const { open, confirmLogout, cancelLogout } = useAccountLogout()
</script>
