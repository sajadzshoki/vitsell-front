<template>
  <TheModal :center="true" :with-close="false" @close="emit('close')" class-name="!min-w-70 !rounded-28px ">
    <div class="flexCol gap-4 p-2 !rounded-3xl">

    <p class="text-xl leading-7 font-600">خروج از حساب</p>
    <p class="text-(sm gray-600) leading-6.5 font-400 mb-2">آیا مطمئن هستید که میخواهید خارج شوید؟</p>
    <div class="flex gap-4">
      <p class="text-(sm red) leading-6.5 font-600 cursor-pointer" @click="handleExit">خروج</p>
      <p class="text-(sm ) leading-6.5 font-500 cursor-pointer" @click="emit('close')">لغو</p>
    </div>
    </div>
  </TheModal>
</template>

<script setup lang="ts">
const userId = useCookie('userId')
const token = useCookie('token')
const phoneNumber = useCookie('phoneNumber')
const idCode = useCookie('idCode')
const doctorCode = useCookie('doctorCode')
const config = useRuntimeConfig()
const emit = defineEmits(['close'])
const {$toast} = useNuxtApp()
const handleExit = () => {
  $toast.success('خارج شدید')
  if (config.public.isDentist) {
    navigateTo({name: 'login'})
  } else {
    navigateTo({name: 'index'})
  }
  userId.value = null
  token.value = null
  idCode.value = null
  phoneNumber.value = null
  doctorCode.value = null
  emit('close')
}
</script>
