<template>
  <div class="max-w-lg mx-auto text-center px-2">
    <img
      src="/images/empty-basket.png"
      :alt="$t('سبد خرید شما خالی است')"
      class="mx-auto w-full max-w-xs sm:max-w-sm mb-6 rounded-2xl"
      width="600"
      height="600"
      loading="lazy"
    >
    <h1 class="text-2xl font-semibold text-highlighted mb-2">
      {{ $t('سبد خرید شما خالی است') }}
    </h1>
    <p class="text-sm text-muted mb-8 leading-7">
      {{ $t('هنوز محصولی به سبد خرید خود اضافه نکرده‌اید. با مشاهده محصولات، سبد خرید خود را پر کنید.') }}
    </p>
    <UButton
      to="/"
      color="primary"
      size="xl"
      class=" shadow-lg shadow-primary/25 px-8"
    >
      {{ $t('مشاهده محصولات') }}
    </UButton>
  </div>
</template>
