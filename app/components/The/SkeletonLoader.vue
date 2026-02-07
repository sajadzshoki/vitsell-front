<template>
  <div class="relative  h-full">

    <div
        v-if="loading"
        class="absolute inset-0 w-full h-full bg-gray-200  overflow-hidden "
        :class="variantClasses">
      <div class="shimmer w-full h-full"></div>
    </div>

    <div  :class="[{ 'invisible': loading },className]">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  loading: boolean;
  className?:string;
  variant?: 'default' | 'text' | 'card' | 'circle'
}>()
const variantClasses = computed(() => {
  switch (props.variant) {
    case 'text':
      return 'rounded h-4'
    case 'card':
      return 'rounded-2xl '
    case 'circle':
      return 'rounded-full aspect-square'
    default:
      return 'rounded-xl'
  }
})
</script>

<style scoped>
.shimmer {
  position: relative;
  background-color: #e0e0e0; /* Tailwind's gray-200 */
  overflow: hidden;
}

.shimmer::before {
  content: "";
  position: absolute;
  top: 0;
  left: -150%;
  height: 100%;
  width: 150%;
  background: linear-gradient(
      120deg,
      transparent 25%,
      rgba(255, 255, 255, 0.4) 70%,
      transparent 75%
  );
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
</style>
