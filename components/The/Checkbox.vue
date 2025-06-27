<template>
  <div class="flex items-center gap-1 ">
    <div
        class="flex flexCenter  cursor-pointer border-(1 solid) h-4 w-4 b-rd-1  relative"
        @click="toggleCheck"
        :class="isChecked ?'border-(1 gray-800 solid)':'border-gray-500'"
    >
      <div v-if="isChecked" class="!w-2.8 !h-2.8 b-rd-0.5 bg-primary-600"></div>
    </div>
    <p class="text-(sm)" :class="labelClass">{{ label }}</p>
  </div>
</template>

<script setup lang="ts">
const check = defineModel<any>() // support both boolean or array

const props = defineProps<{
  value?: string | number
  multi?: boolean
  label?: string,
  labelClass?: string,
}>()

const isChecked = computed(() => {
  if (props.multi && Array.isArray(check.value)) {
    return check.value.includes(props.value)
  }
  return !!check.value
})

const toggleCheck = () => {
  if (props.multi && Array.isArray(check.value)) {
    const index = check.value.indexOf(props.value)
    if (index === -1) {
      check.value.push(props.value)
    } else {
      check.value.splice(index, 1)
    }
  } else {
    check.value = !check.value
  }
}
</script>
