<template>
  <qrcode-vue :value="value" level="H" render-as="svg"/>
</template>
<script setup lang="ts">
import QrcodeVue from 'qrcode.vue'

defineProps<{
  value: string
}>()
// const size = ref(300)
</script>
