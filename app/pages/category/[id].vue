<template>
  <div class="w-full">
    <div class="flex gap-2 flex-wrap">
    <TheProductCard  v-for="n in 5"/>
  </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { t } = useI18n()

</script>
