<template>
  <img
      v-if="iconType === 'img'"
      class="w-5 h-5"
      :src="imageSrc"
      :alt="name"
      loading="lazy"
  >
  <NuxtIcon
      v-else-if="iconType === 'svg'"
      class="svg:(h-full mb-0)"
      :name="name"
      :filled="filled"
  />
  <UIcon
      v-else
      :name="tablerName"
  />
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  name: string
  iconType?: 'tabler' | 'svg' | 'img'
  filled?: boolean
}>(), {
  iconType: 'tabler',
  filled: true,
})

const tablerName = computed(() => {
  if (props.name.startsWith('i-tabler-') || props.name.startsWith('tabler:')) {
    return props.name
  }
  return `i-tabler-${props.name}`
})

const imageSrc = computed(() => {
  if (props.name.startsWith('http') || props.name.startsWith('/')) {
    return props.name
  }
  if (props.name.includes('/')) {
    return `/${props.name}`
  }
  return `/images/${props.name}`
})
</script>
