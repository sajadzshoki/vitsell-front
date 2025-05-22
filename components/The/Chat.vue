<template>
  <div class="h-full w-full h-full flexCol">
    <TheChatHeader/>
    <div class="flex  flex-col-reverse gap-7 p-4 bg-gray-900 flex-1 pb-18  ">
      <div class="relative rounded-md p-2 max-w-3/4  flexCol gap-1" v-for="n in 4"
           :class="userId ? 'bg-secondary-400 rounded-tr-none'
           :'bg-primary-500 self-end rounded-tl-none '"
      >
        <div v-if="userId" class="absolute  -right-1.5 -top-0.9 w-0 h-0 rotate-65 border-r-(6 solid transparent)  border-l-(6 solid transparent) border-b-(12 solid secondary-400)"></div>
        <div v-else class="absolute -left-2 -top-0.9 w-0 h-0 -rotate-65 border-r-(6 solid transparent)  border-l-(6 solid transparent) border-b-(12 solid primary-500)"></div>
        <p class="text-sm " :class="userId ? '':'pl-6'">سلام، چطور می تونم کمکتون کنم؟</p>
        <small class="self-end text-xs">۱۱:۴۶</small>
      </div>
    </div>
    <TheChatInput/>
  </div>
</template>

<script setup lang="ts">
definePageMeta({layout: false})
const userId = useCookie('userId')
</script>