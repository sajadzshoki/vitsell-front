<template>
  <header class="sticky top-0 z-10 flex items-center  px-4 py-3 bg-default/70 backdrop-blur-10 border-b border-default">

      <TheIcon name="logo-vista.webp" icon-type="img" class="!size-10" />
      <div class="flex items-center gap-2 mr-auto">
        <div class="relative">
          <UButton
        icon="tabler:shopping-cart"
        color="neutral"
        variant="ghost"
        class=""
        />
          <!-- <TheIcon name="shopping-cart" class="!size-5" /> -->
          <span class="absolute -top-1.5 -left-1.5 bg-error text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">1</span>
        </div>
        <UButton
        :icon="isDark ? 'tabler:moon' : 'tabler:sun'"
        color="neutral"
        variant="ghost"
        aria-label="Switch theme"
        class=""
        @click="isDark = !isDark"
        />
        
      </div>
    
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
