<template>
  <img v-if="iconType === 'img' || name?.split('.')[1]" class="w-5 h-5" :src="name?.includes('http') ? name : ('/images/'+ name)" :alt="name" loading="lazy"/>
  <NuxtIcon v-else-if="iconType === 'svg'" class="!svg:(h-full mb-0) flex" :name="name" :filled="filled"/>
  <Icon v-else class="text-2xl" :name="name"/>
</template>


<script setup>
defineProps({
  name: {
    type: String,
    required: true
  },
  iconType: {
    type: String,
    default: 'icon'
  },
  filled: {
    type: Boolean,
    default: true
  }
})
</script>
