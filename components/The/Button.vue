<template>
  <button :disabled="disable" label=""
          class="flex justify-center items-center rounded-3xl gap-2 cursor-pointer border-(0.5 solid) relative"
          :class="[disable ? 'bg-gray-300 border-transparent' :
           fill ? 'bg-primary-500 border-transparent' : `bg-white border-black`,
          disable ? 'opacity-50 cursor-not-allowed' : '' , mini ? 'px-5 py-1' : 'py-3 px-10 ' , color ? `border-${color}` : '']">
    <LazyTheNuxtIcon v-if="icon || loading" :name="loading ? 'loading' : icon" icon-type="svg" class="text-2xl" :class="[fill ? 'text-white-100' : `text-${color}`]"/>
    <p class="font-semibold text-base whitespace-nowrap" :class="[fill ? 'text-white' :  color ? `text-${color}` : 'text-gray-700']">
      {{ loading ? '' : label }}
    </p>
    <span v-show="badge" class="bg-secondary-500 rounded-1/2 absolute w-3 h-3 left-0 top-0 transform -translate-x-1/3 -translate-y-1/3 shadow-2xl"/>
  </button>
</template>


<script setup>
defineProps({
  fill: {
    type: Boolean,
    default: true
  },
  icon: {
    type: String,
  },
  label: {
    type: String,
    required: true
  },
  disable: {
    type: Boolean,
    default: false
  },
  mini: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
  },
  badge: {
    type: Number,
    default: 0
  },
  loading: {
    type: Boolean,
    default: false
  }
})
</script>
