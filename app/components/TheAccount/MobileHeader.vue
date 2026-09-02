<template>
  <header class="lg:hidden flex items-center gap-2 mb-4 py-1 sticky top-[var(--account-nav-offset,0px)] z-20 bg-muted/95 backdrop-blur-sm -mx-1">
    <UButton
      type="button"
      color="neutral"
      variant="ghost"
      size="lg"
      icon="i-tabler-menu-2"
      :aria-label="$t('منوی حساب')"
      :aria-expanded="mobileNavOpen"
      class="shrink-0 cursor-pointer"
      @click="mobileNavOpen = true"
    />
    <h1 class="text-base font-bold text-highlighted truncate flex-1 min-w-0">
      {{ $t(title) }}
    </h1>
    <UButton
      v-if="!isDashboard"
      type="button"
      color="neutral"
      variant="ghost"
      size="lg"
      icon="i-tabler-home"
      :aria-label="$t('پیشخوان')"
      class="shrink-0 cursor-pointer"
      @click="navigateTo('/account')"
    />
  </header>
</template>

<script setup lang="ts">
defineProps<{
  title: string
}>()

const { isDashboard } = useAccountLayout()
const mobileNavOpen = useState('account-mobile-nav-open', () => false)
</script>
