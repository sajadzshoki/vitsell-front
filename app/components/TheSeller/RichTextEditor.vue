<template>
  <TheTextEditor
    v-model="model"
    variant="full"
    :placeholder="placeholder"
    :error="error"
    :help="help"
  />
</template>

<script setup lang="ts">
/** Seller alias for shared TheTextEditor (full toolbar). Prefer TheTextEditor in new call sites. */
const model = defineModel<string>({ default: '' })

defineProps<{
  placeholder?: string
  error?: string
  help?: string
}>()
</script>

<style>
/* Styles live in TheTextEditor; keep a style block so stale HMR style queries stay valid CSS. */
</style>
