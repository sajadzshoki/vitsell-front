<!-- components/GradientBorder.vue -->
<template>
  <div
      class="animated-gradient-border"
      :style="{ padding: `${borderWidth}px` }"
      :class="roundedClass"
  >
    <div :class="[roundedClass, innerClass]">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  borderWidth?: number
  roundedClass?: string
  innerClass?: string
}>()

// Default values
const borderWidth = props.borderWidth ?? 2
const roundedClass = props.roundedClass ?? 'rounded-2xl'
const innerClass = props.innerClass ?? 'bg-screen p-4'
</script>

<style scoped>
.animated-gradient-border {
  background: linear-gradient(
      270deg,
      #FFF7E6,
      #C98F03,
      #FFF7E6
  );
  background-size: 400% 400%;
  animation: gradientFlow 6s ease infinite;
}

@keyframes gradientFlow {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>
