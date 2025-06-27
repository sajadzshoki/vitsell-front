<template>
  <div class="flex justify-between items-center">
    <p class="text-sm leading-7 font-500">{{label}}</p>
    <label data-name="the-checkbox"
           :class="[(value && !icons?.[value]) ? 'bg-border bg-primary-400' : 'bg-primary-200',mini ? 'h-5 w-10' : 'h-8 w-14']"
           class="rounded-full relative transition-bg duration-400 cursor-pointer">
      <input type="checkbox" id="test" v-model="value" hidden/>
      <LazyTheNuxtIcon v-if="icons[false]"
                       :name="icons[false].icon"
                       class="absolute left-1 top-1/2 transform -translate-y-1/2 text-textSubtle !text-lg"/>
      <LazyTheNuxtIcon v-if="icons[true]"
                       :name="icons[true].icon"
                       class="absolute right-1 top-1/2 transform -translate-y-1/2 text-textSubtle !text-lg"/>
      <span
          class="rounded-1/2 top-1/2 transform -translate-y-1/2 bg-white absolute transition-left duration-400 ease-in-out flex justify-center items-center"
          :class="[value ? mini ? 'left-5 ' : 'left-6.5' : 'left-1',mini ? 'h-4 w-4' : 'w-6.5 h-6.5']">
      <LazyTheNuxtIcon v-if="icons[value]" :name="icons[value].icon" class="text-secondary !text-lg"
                       :key="value+'icon'"/>
    </span>
    </label>

  </div>
</template>

<script setup>
defineProps({
  mini: {
    type: Boolean,
    default: false
  },
  icons: {
    type: Object,
    default: () => ({})
  },
  label: String
})
const value = defineModel()
</script>
