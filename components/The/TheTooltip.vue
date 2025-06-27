<template>
  <div class="relative group w-fit">
    <slot /> <!-- The trigger element -->
    <div
        class="absolute z-50 text-xs text-white bg-black px-2 py-1 rounded shadow-sm
             opacity-0 group-hover:opacity-100 transition-all duration-150 whitespace-nowrap"
        :class="positionClass"
    >
      {{ text }}
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  text: String,
  position: {
    type: String,
    default: 'top', // top, bottom, left, right
  }
})

const positionClass = computed(() => {
  switch (props.position) {
    case 'bottom': return 'top-full mt-1 left-1/2 -translate-x-1/2';
    case 'left': return 'right-full mr-2 top-1/2 -translate-y-1/2';
    case 'right': return 'left-full ml-2 top-1/2 -translate-y-1/2';
    default: return 'bottom-full mb-1 left-1/2 -translate-x-1/2'; // top
  }
})
</script>
