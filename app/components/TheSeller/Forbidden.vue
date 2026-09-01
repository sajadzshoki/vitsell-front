<template>
  <div class="min-h-[50vh] flex items-center justify-center p-6">
    <div class="max-w-md w-full text-center bg-default border border-muted rounded-2xl p-8 space-y-4">
      <div class="size-16 rounded-2xl bg-error/10 text-error grid place-items-center mx-auto">
        <UIcon
          name="i-tabler-lock"
          class="size-8"
        />
      </div>
      <h1 class="text-xl font-bold text-highlighted">
        {{ $t('دسترسی مجاز نیست') }}
      </h1>
      <p class="text-sm text-muted leading-7">
        {{ message || $t('برای مشاهده این بخش مجوز کافی ندارید. در صورت نیاز با سوپر ادمین تماس بگیرید.') }}
      </p>
      <div class="flex items-center justify-center gap-2 flex-wrap pt-2">
        <UButton
          to="/seller"
          color="primary"
          class="cursor-pointer"
        >
          {{ $t('بازگشت به پیشخوان') }}
        </UButton>
        <UButton
          to="/seller/account"
          color="neutral"
          variant="soft"
          class="cursor-pointer"
        >
          {{ $t('حساب ادمین') }}
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  message?: string
}>()
</script>
