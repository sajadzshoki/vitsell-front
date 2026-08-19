<template>
  <header class="sticky top-0 z-10 flex items-center justify-end px-4 py-3 bg-default border-b border-default">
    <ClientOnly>
      <UButton
          :icon="isDark ? 'i-tabler-moon' : 'i-tabler-sun'"
          color="neutral"
          variant="ghost"
          aria-label="Switch theme"
          @click="isDark = !isDark"
      />
      <template #fallback>
        <div class="size-8"/>
      </template>
    </ClientOnly>
  </header>
</template>

<script setup lang="ts">
const colorMode = useColorMode()

const isDark = computed({
  get: () => colorMode.value === 'dark',
  set: (value: boolean) => {
    colorMode.preference = value ? 'dark' : 'light'
  },
})
</script>
