<template>
  <div class="flex items-stretch cursor-pointer border-(2 solid) h-6 w-6 b-rd-2 p-0.5 relative"
       @click="check = !check" :class="[check ? 'border-primary-500' : 'border-gray-400']">
    <TheNuxtIcon v-if="check" name="check" icon-type="svg" class="c-primary-500 text-2xl absolute -top-0.65 -right-0.5"/>
  </div>
</template>
<script setup>
const props = defineProps({modelValue})
const emit = defineEmits([modelEmit])
const check = useModel(props, emit)
</script>
