<template>
  <div class="flex items-center justify-between my-3">
    <p class="text-sm font-semibold leading-6.5" :class="titleClass">{{title}}</p>
    <NuxtLink :to="{name:link}" class="flex gap-1 items-center text-primary-300">
      <p class="text-(xs) ">{{linkTitle}}</p>
      <TheNuxtIcon :name="icon" icon-type="svg"/>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title: string,
  titleClass?:string
  icon?:string,
  link?: string,
  linkClass?:string
  linkTitle?: string,
}>(),{
  icon:'nav-left',
  linkTitle:'مشاهده همه'
})


</script>
