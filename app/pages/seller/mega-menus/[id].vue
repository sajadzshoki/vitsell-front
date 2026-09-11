<template>
  <TheSellerMegaMenuEditor :menu-id="menuId" />
</template>

<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()

definePageMeta({
  layout: 'seller',
  middleware: ['auth', 'admin'],
})

const menuId = computed(() => String(route.params.id ?? ''))

useSeoMeta({
  title: () => t('ویرایش مگا منو'),
})
</script>
