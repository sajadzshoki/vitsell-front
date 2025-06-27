<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 z-30 flex justify-center items-center transition-all duration-300"
       :class="showModal ? 'opacity-100' : 'opacity-0'"
       @click.self="handleClose">
    <div
        class="overflow-y-auto flex flex-col  fixed transition-all duration-300 ease-in-out max-h-95% sm:(bottom-1/2 translate-y-1/2 rounded-xl  max-w-xl !mx-4 min-w-100)"
        :class="[
            className,
            center ? 'bottom-1/2 translate-y-1/2 rounded-xl  max-w-xl !mx-4 min-w-100' : 'w-full rounded-t-xl bottom-0   ',
            showModal ? 'translate-y-0' : 'translate-y-full'
        ]"
    >
      <div v-if="withClose" class="grid grid-cols-3 items-center bg-white  sticky rounded-t-xl top-0 w-full right-0 p-4 pb-0 z-5">
        <TheNuxtIcon name="close" icon-type="svg" class=" text-(2xl) cursor-pointer" @click="handleClose"/>
        <p class="font-600 text-md leading-6.5 justify-self-center">{{title}}</p>
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
  className:String,
  center: {
    type: Boolean,
    default: false
  } ,
  withClose: {
    type: Boolean,
    default: true
  }
})

onMounted(() => {
  document.body.style.overflow = 'hidden'
  // Trigger the animation after the component is mounted
  setTimeout(() => {
    showModal.value = true
  }, 100)
})
const handleClose = () => {
  showModal.value = false;
  document.body.style.overflow = '';
  setTimeout(() => {
    emit('close');
  }, 100);
}
onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

