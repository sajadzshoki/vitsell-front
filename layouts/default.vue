<template>
  <div>
    <TheLoadingPage v-if="localLoading"/>
    <slot v-else/>
  </div>

</template>

<script setup lang="ts">
const localLoading = useState('localLoading')
</script>
