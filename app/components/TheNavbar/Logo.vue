<template>
  <NuxtLink to="/" class="flex items-center gap-2 shrink-0 <md:flex-col">
    <div
      class="size-10 rounded-xl grid place-items-center shadow-lg shadow-primary/20"
      :class="inverted ? 'bg-default text-highlighted' : 'bg-primary text-inverted'"
    >
      <UIcon name="i-tabler-shopping-bag" class="size-5" />
    </div>
    <div class="hidden sm:flex flex-col leading-tight text-start">
      <span
        class="text-xl font-extrabold"
        :class="inverted ? 'text-inverted' : 'text-highlighted'"
      >
        {{ $t('دیجی‌شاپ') }}
      </span>
      <span
        class="text-[10px] -mt-0.5"
        :class="inverted ? 'text-inverted/60' : 'text-dimmed'"
      >
        {{ $t('فروشگاه پرمیوم') }}
      </span>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  inverted?: boolean
}>(), {
  inverted: false,
})
</script>
