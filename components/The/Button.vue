<template>
  <button
      :disabled="disable"
      class="flex justify-center items-center rounded-lg gap-2 cursor-pointer border-(0.5 solid) relative"
      :class="[disable ? 'bg-gray-300 border-transparent' :
             fill ? 'bg-primary-500 border-transparent' : '  !bg-bg border-secondary-500 text-secondary-500',
             disable ? 'opacity-50 cursor-not-allowed' : '' ,
             mini ? 'px-5 py-1.5' : 'py-3 px-10 ']"
      :style="{
      borderColor: !fill && color ? color : '',
      borderWidth: !fill && color ? '0.5px' : '',
      backgroundColor: fill && color && !disable ? color : '',
      cursor: disable ? 'not-allowed' : 'pointer'
    }"> <!-- Apply dynamic border color and background color -->

    <!-- Display icon or loading spinner if 'icon' or 'loading' is true -->
    <LazyTheNuxtIcon
        v-if="icon || loading"
        :name="loading ? 'loading' : icon"
        icon-type="svg"
        class="text-xl"
        :style="{ color: fill ? 'white' : color ? color : 'black' }" /> <!-- Apply dynamic icon color -->

    <!-- Displays button label text, hides when loading -->
    <p
        class=" text-xs whitespace-nowrap"
        :style="{ color: fill ? 'white' : color ? color : 'gray-700' }"> <!-- Apply dynamic text color -->
      {{ loading ? '' : label }} <!-- Shows label unless loading is true -->
    </p>

    <!-- Displays badge if 'badge' is greater than 0 -->
    <span
        v-show="badge"
        class="bg-secondary-500 rounded-1/2 absolute w-3 h-3 left-0 top-0 transform -translate-x-1/3 -translate-y-1/3 shadow-2xl"/> <!-- Position and style for the badge -->
  </button>
</template>

<script setup>
defineProps({
  fill: {
    type: Boolean,
    default: true
  },  // 'fill' defines if button is filled or outlined
  icon: {
    type: String,
  },  // 'icon' sets the icon name for the button
  label: {
    type: String,
    required: true
  },  // 'label' sets the button text (required)
  disable: {
    type: Boolean,
    default: false
  },  // 'disable' disables button when true
  mini: {
    type: Boolean,
    default: false
  },  // 'mini' controls button size, making it smaller if true
  color: {
    type: String,
  },  // 'color' sets button border and text color
  badge: {
    type: Number,
    default: 0
  },  // 'badge' shows a small indicator on the button if greater than 0
  loading: {
    type: Boolean,
    default: false
  }  // 'loading' adds a loading state with spinner if true
})
</script>
