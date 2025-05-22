
<template>
  <div class="!z-1 sticky top-0 bg-secondary-500 w-full px-4 py-2 flex items-center justify-between">

    <TheNuxtIcon icon-type="svg" name="nav-right" class="text-xl cursor-pointer"/>
    <div class="flexCol items-center gap-1">
      <p class="font-semibold text-md">{{ user?.name || 'name' }}</p>
      <p class="text-(xs gray-500)">آخرین بازدید در ۱۴:۳۰</p>

    </div>
    <TheNuxtIcon icon-type="img" :name="user?.profile?.avatar || 'noProfile.png'" class="!w-10 !h-10 rounded-full object-cover"/>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  user?: any
}>()
</script>
