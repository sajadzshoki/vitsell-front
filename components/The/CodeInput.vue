<template>
  <v-otp-input
      id="code-input"
      dir="ltr"
      ref="otpInput"
      input-classes="otp-input"
      separator=""
      :num-inputs="6"
      :should-auto-focus="true"
      :is-input-num="true"
      @on-change="onChange"
      @on-complete="emit('complete')"
  />
</template>

<script setup>
import VOtpInput from 'vue3-otp-input';

const emit = defineEmits(['complete','change'])
const value = defineModel()
const onChange = ($event) => {
  value.value = $event
  emit('change')
}
</script>

<style lang="scss">
#code-input{
  @apply flex justify-evenly
}
.otp-input {
  @apply w-15 h-15 mainBorder b-rd-2 text-center gap-2 <sm:(w-12 h-12)
}

</style>