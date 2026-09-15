<template>
  <main class="w-full flex flex-col">
    <!-- Mobile: full-height Digikala-style browser -->
    <div class="md:hidden flex flex-col h-[calc(100dvh-8.5rem)]">
      <TheCategoryBrowser compact />
    </div>

    <!-- Desktop: hero + mega-menu browser -->
    <div class="hidden md:(flex flex-col gap-6)">
      <TheCategoryIndexHeader />
      <TheCategoryBrowserDesktop />
    </div>
  </main>
</template>

<script setup lang="ts">
const { fetchMegaMenu } = useMegaMenu()
await fetchMegaMenu()

useSeoMeta({
  title: () => 'دسته‌بندی کالاها',
  description: () => 'مرور همه دسته‌بندی‌ها و زیردسته‌های ویتسل',
})
</script>
