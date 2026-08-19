
<template>
  <div class="flex flex-row justify-between px-3 ">
    <div class="flexCol items-center cursor-pointer" v-for="(n,index) in 5" @click="handleRate(index)" :class="index<value?' text-primary-600':'text-gray-600'">
      <TheNuxtIcon :name="index<value?'Star':'Star-1'" icon-type="svg" class="!svg:w-7 " />
      <small class="text-(sm ) font-600 leading-6.5 ">{{ n }}</small>
    </div>
  </div>
</template>

<script setup lang="ts">
const value = defineModel()
const handleRate = (index)=>{
  value.value = index+1
}
</script>
