<template>
  <div class="bg-default light:bg-inverted text-[12px] ">
    <div class="mx-auto max-w-8xl px-3 sm:px-4 lg:px-6 h-8 flex items-center justify-between gap-3">
      <div class="flex items-center gap-4 min-w-0">
        <span class="hidden sm:inline-flex items-center gap-1.5 shrink-0">
          <UIcon name="i-tabler-phone" class="size-3.5" />
          {{ $t('پشتیبانی ۲۴ ساعته:') }}
          <span class="num " dir="ltr">۰۲۱-۹۱۰۰۰۰۰۰</span>
        </span>
        <span class="text-success truncate">
          {{ $t('ارسال رایگان سفارش‌های بالای ۵۰۰ هزار تومان') }}
        </span>
      </div>
      <div class="hidden md:flex items-center gap-3 shrink-0">
        <button
          type="button"
          class="hover:text-inverted transition"
          @click="navigateTo('/account/orders')"
        >
          {{ $t('پیگیری سفارش') }}
        </button>
        <!-- <span class="text-inverted/30">|</span>
        <NuxtLink
          to="/seller"
          class="hover:text-inverted transition"
        >
          {{ $t('فروشنده شوید') }}
        </NuxtLink>
        <span class="text-inverted/30">|</span> -->
        <button type="button" class="hover:text-inverted transition">
          {{ $t('اپلیکیشن موبایل') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>
