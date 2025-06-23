<template>
  <div
      class="cursor-pointer z-4 bg-primary-600
      shadow-md w-12 h-12 rounded-full flex flexCenter fixed right-4 bottom-24 hover:bg-primary-600">
    <TheNuxtIcon :name="icon" icon-type="svg" class="text-(white xl)"/>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps <{ icon?: string }>(), {
  icon: 'add'
})
</script>
