<template>
  <transition name="fade">
    <div
        v-if="visible"
        class="fixed inset-0 bg-black  backdrop-blur-1.5 z-30 transition-opacity duration-300 flex justify-center items-end"
        :class="showModal ? 'bg-opacity-60' : 'bg-opacity-0'"
        @click.self="handleClose"
    >
      <div
          ref="modalContent"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
          class="bg-white overflow-y-auto flex flex-col transition-all duration-300 max-h-95% min-w-70 absolute"
          :class="[
          className,
          {'h-full max-h-100% rounded-t-8 duration-200':fullPage},
          center
            ? showModal
              ? 'bottom-1/2 translate-y-1/2 right-1/2 translate-x-1/2 rounded-xl max-w-xl'
              : 'bottom-0 translate-y-full right-1/2 translate-x-1/2'
            : showModal
              ? 'bottom-0 right-0 w-full rounded-t-xl'
              : 'translate-y-full bottom-0 right-0 w-full rounded-t-xl'
        ]"
      >
        <!-- Header -->
        <div class="grid grid-cols-3 items-center sticky top-0 bg-white rounded-t-xl p-4 pb-0 z-5">
          <TheNuxtIcon
              v-if="withClose"
              name="close"
              icon-type="svg"
              class="text-2xl cursor-pointer"
              @click="handleClose"
          />
          <p class="font-semibold text-md leading-6.5 justify-self-center">{{ title }}</p>
        </div>

        <!-- Content -->
        <div class="p-4 flex flex-col gap-3">
          <slot />
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
const emit = defineEmits(['close'])

const showModal = ref(false)

const props = withDefaults(defineProps<{
  title?: string
  titleClass?: string
  className?: string
  center?: boolean
  withClose?: boolean
  fullPage?: boolean
  visible?: boolean // external v-if trigger
}>(), {
  withClose: true,
  center: false,
  visible: true,
  fullPage:false
})

const visible = computed(() => props.visible)

onMounted(() => {
  document.body.style.overflow = 'hidden'
  setTimeout(() => {
    showModal.value = true
  }, 10)
})

const handleClose = () => {
  showModal.value = false
  document.body.style.overflow = ''
  setTimeout(() => {
    emit('close')
  }, 300)
}

onUnmounted(() => {
  document.body.style.overflow = ''
})

// dragging
const modalContent = ref<HTMLElement | null>(null);
const startY = ref(0);
const offsetY = ref(0);
const isDragging = ref(false);
const touchStartTime = ref(0); // Added this line to track when touch started
const handleTouchStart = (e: TouchEvent) => {
  if (props.center) return;

  startY.value = e.touches[0].clientY;
  isDragging.value = true;
  touchStartTime.value = Date.now(); // Record when the touch started
};

const handleTouchMove = (e: TouchEvent) => {
  if (props.center || !isDragging.value) return;

  const currentY = e.touches[0].clientY;
  const deltaY = currentY - startY.value;

  // Only allow dragging downward
  if (deltaY > 0) {
    offsetY.value = deltaY;
    e.preventDefault();
  }
};

const handleTouchEnd = () => {
  if (props.center || !isDragging.value) return;
  isDragging.value = false;
  // Calculate swipe velocity (pixels per second)
  // const touchDuration = Date.now() - touchStartTime.value;
  // const velocity = offsetY.value / (touchDuration / 1000);
  // If dragged more than 100px or fast swipe (> 0.5px/ms velocity), close the modal
  if (offsetY.value > 200) {
    handleClose();
  } else {
    // Return to original position with animation
    offsetY.value = 0;
  }
};

</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>