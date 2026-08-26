<template>
  <div class="relative min-h-dvh flex flex-col overflow-hidden bg-muted text-default">
    <div
      class="pointer-events-none absolute -top-28 inset-x-0 mx-auto size-[26rem] rounded-full bg-primary/10 blur-3xl"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute -bottom-36 -end-16 size-[20rem] rounded-full bg-primary/5 blur-3xl"
      aria-hidden="true"
    />

    <main class="relative z-10 flex-1 flex items-center justify-center px-4 py-10 sm:(px-6 py-12)">
      <slot />
    </main>

    <footer class="relative z-10 px-4 pb-6 text-center text-xs text-dimmed sm:px-6">
      {{ $t('تمامی حقوق برای دیجی‌شاپ محفوظ است') }}
    </footer>
  </div>
</template>

<script setup lang="ts">
</script>
