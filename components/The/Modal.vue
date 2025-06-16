<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 z-30 flex justify-center items-center transition-all duration-300"
       :class="showModal ? 'opacity-100' : 'opacity-0'"
       @click.self="emit('close')">
    <div
        class="w-full   overflow-y-auto flex flex-col   fixed transition-all duration-300 ease-in-out"
        :class="[
            border,
            center ? 'bottom-1/2 translate-y-1/2 rounded-3xl max-h-4/5 max-w-xl !mx-4' : 'rounded-t-3xl bottom-0  max-h-2/3',
            showModal ? 'translate-y-0' : 'translate-y-full'
        ]"
    >
      <div class="flex items-center bg-white justify-between sticky rounded-t-3xl top-0 w-full right-0 p-4 pb-0 z-10">
        <TheNuxtIcon name="close" icon-type="svg" class=" text-(2xl)   rounded-lg cursor-pointer" @click="emit('close')"/>
      </div>
      <div class="p-4 flex flex-col gap-3 bg-white">
        <slot/>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">


const emit = defineEmits(['close'])

const showModal = ref(false)

defineProps({
  title: String,
  border: {
    type: String,
    default: 'rounded-t-3xl'
  },
  center: {
    type: Boolean,
    default: false
  }
})

onMounted(() => {
  document.body.style.overflow = 'hidden'
  // Trigger the animation after the component is mounted
  setTimeout(() => {
    showModal.value = true
  }, 10)
})

onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

