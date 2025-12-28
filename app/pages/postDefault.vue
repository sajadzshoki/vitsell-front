<template>

</template>

<script setup lang="ts">
const {$toast} = useNuxtApp()
const validation = ref(false)
const loading = ref(false)
const userId = useCookie('userId');
const route = useRoute()
const testForm = ref({})
const submit = async () => {
  if (loading.value) return
  loading.value = true
  if (!testForm.value) {
    $toast.error('اطلاعات را کامل وارد کنید')
    validation.value = true
    loading.value = false
    return
  }
  try {
    const result = await samplePost()
    if (result) {
      $toast.success('موفق')
      setTimeout(() =>
          navigateTo({name: 'index'}), 1000
      )
    }
  } catch (error) {
    console.log('login error', error)
    $toast.error('بروز خطای غیرمنتظره ، لطفا دوباره تلاش کنید')
    loading.value = false
    validation.value = false
  }


  loading.value = false
}
</script>