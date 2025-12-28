<template>
  <div class="flex flex-col gap-4 bg-white py-4 px-3 rounded-md">
    <div class="flex gap-3 items-center cursor-pointer" @click="isOpen = !isOpen">
      <TheNuxtIcon name="rivet-icons_money" icon-type="svg" class=" " />
      <p class="leading-6.5 font-500">{{ title }}</p>
      <TheNuxtIcon name="arrow-down-1" icon-type="svg" class="text-2xl mr-auto" :class="isOpen && 'rotate-180'" />
    </div>
    <transition name='fade'>
      <div v-show="isOpen"  class="text-(sm )  grid grid-cols-3 pb-2 border-b-(1 solid gray-200)">

            <p v-for="n in 3" >{{description}}</p>

      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
const isOpen = ref(false)
defineProps<{
  title: string
  description: string
}>()
</script>
<style >
/* Add transition styles for fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease-in-out;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>