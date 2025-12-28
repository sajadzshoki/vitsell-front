<template>
  <div class="flex justify-center w-full bg-white  rounded-full px-4 py-2 gap-2  primaryBorder"
  :class="mini?'!h-10 ':' h-12 '">
    <TheNuxtIcon name="icon-Bold-Search" icon-type="svg" class="!svg:(w-5 h-5) text-gray-500"/>
    <input dir="rtl"
           v-model="value"
           :inputmode="inputMode"
           class="flex-grow  placeholder-(gray-400 ) text-sm  " :disabled="disabled"
           :placeholder="!focused ? placeholder : value || placeholder "/>
  </div>
</template>

<script lang="ts" setup>
const value = defineModel()
withDefaults(defineProps<{
  placeholder?: string,
  disabled?: boolean
  inputMode?: string
  mini?:boolean
}>(),{
  placeholder:'جستجو'
})

const focused = ref(false)
</script>