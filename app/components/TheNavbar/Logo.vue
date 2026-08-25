<template>
  <NuxtLink to="/" class="flex items-center gap-2 shrink-0">
    <div class="size-10 rounded-xl bg-primary grid place-items-center text-inverted shadow-lg shadow-primary/20">
      <UIcon name="i-tabler-shopping-bag" class="size-5" />
    </div>
    <div class="hidden sm:flex flex-col leading-tight text-start">
      <span class="text-xl font-extrabold text-highlighted">{{ $t('دیجی‌شاپ') }}</span>
      <span class="text-[10px] text-dimmed -mt-0.5">{{ $t('فروشگاه پرمیوم') }}</span>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
</script>
