<template>
  <img
      v-if="iconType === 'img' || name?.split('.')[1]"
      class="w-5 h-5"
      :src="name?.includes('http') ? name : ('/images/'+ name)"
      :alt="name"
      loading="lazy"
  >
  <NuxtIcon
      v-else-if="iconType === 'svg'"
      class="svg:(h-full mb-0)"
      :class="className"
      :name="name"
      :filled="filled"
  />
  <UIcon
      v-else-if="iconType === 'icon'"
      :name="`i-custom-${name}`"
      :filled="filled"
      :class="className"
  />
  <Icon v-else class="text-2xl" :name="name" />
</template>

<script setup>
// import NuxtIcon from 'nuxt-icon'

defineProps({
  name: {
    type: String,
    required: true
  },
  iconType: {
    type: String,
    default: 'svg'
  },
  filled: {
    type: Boolean,
    default: true
  },
  className: {
    type: String,
    default: 'text-alias-text-primary'
  }
})
</script>
