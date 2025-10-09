<template>
    <div class="flex gap-1 items-center">
        <TheNuxtIcon :name="icon" icon-type="svg"  :class="iconClass"/>
        <p class="text-sm" :class="textClass" >{{text}}</p>
    </div>
</template>

<script setup lang="ts">
defineProps<{
  text: String | number,
  textClass?: String,
  icon:String
  iconClass:String
}>()
</script>