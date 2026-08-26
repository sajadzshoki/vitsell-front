<template>
  <div class="max-w-md mx-auto bg-default border border-muted rounded-3xl p-10 text-center">
    <div class="flex justify-center mb-6 text-primary">
      <UIcon
        name="i-tabler-shopping-cart"
        class="size-24 opacity-80"
      />
    </div>
    <h1 class="text-2xl font-bold text-highlighted mb-2">
      {{ $t('سبد خرید شما خالی است') }}
    </h1>
    <p class="text-sm text-muted mb-8 leading-7">
      {{ $t('هنوز محصولی به سبد خرید خود اضافه نکرده‌اید. با مشاهده محصولات، سبد خرید خود را پر کنید.') }}
    </p>
    <UButton
      to="/"
      color="primary"
      size="xl"
      class="font-bold shadow-lg shadow-primary/25 px-8"
    >
      {{ $t('مشاهده محصولات') }}
    </UButton>
  </div>
</template>
