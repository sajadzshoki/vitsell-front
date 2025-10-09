<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 z-20 flexCol justify-center items-center transition-all">
    <TheNuxtIcon name="Loading" icon-type="svg" class="!svg:(h-25 w-25 )"/>
    <p v-if="withText" class="text-(white 2xl) mt-4 font-700">لطفا منتظر بمانید</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  withText?:Boolean
}>()
</script>


