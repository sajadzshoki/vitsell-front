<template>
  <div class="flexCol gap-2">
    <TheInput v-model="typed"
              @keyup.enter="add"
              :append-icon="icon"
              :append-icon-class="typed?'text-primary-600 text-sm':'text-gray-400 text-sm'"
              appendIconType="svg"
              @append="add"/>
    <div class="flex flex-wrap gap-2">
      <p v-for="item in selected"
         class="px-2 leading-6.5 text-(xs primary-600 nowrap) font-500 rounded-full border-(1 solid primary-600)">
        {{ item }}</p>
    </div>
  </div>

</template>

<script setup lang="ts">
withDefaults(defineProps<{
  icon?: string,
}>(),{
  icon:'add'
})
const typed = ref<string>('')
const selected = defineModel()
const add = () => {
  if (typed.value) {
    selected.value.push(typed.value)
    typed.value = ''
  }
  else{
    return
  }
}
</script>