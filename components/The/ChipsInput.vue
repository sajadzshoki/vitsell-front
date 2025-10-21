<template>
  <div class="flexCol gap-2">
    <TheInput v-model="typed"
              @keyup.enter="add"
              :append-icon="icon"
              :class-name="className"
              :prepend-icon="prependIcon"
              :append-icon-class="typed?'text-primary-600 text-sm':'text-gray-400 text-sm'"
              appendIconType="svg"
              @append="add"
              :label="label"
              :placeholder="placeholder"
    />
    <div class="flex flex-wrap gap-2" v-show="selected.length">
      <p v-for="(item,index) in selected"
         class="px-2 leading-6 text-(xs  nowrap) font-400 rounded-full bg-primary-600 flex items-center gap-1 item-center">
        <TheNuxtIcon name="close" icon-type="svg" class="text-xs mb-1px" @click="remove(index)"/>
        {{ item }}
      </p>
    </div>
  </div>

</template>

<script setup lang="ts">
withDefaults(defineProps<{
  icon?: string,
  prependIcon?: string,
  className?: string,
  label?: string,
  placeholder?: string,
}>(),{
  icon:'add'
})
const typed = ref<string>('')
const selected = defineModel<string[]>({ default: () => [] })
const add = () => {
  if (typed.value) {
    selected.value.push(typed.value)
    typed.value = ''
  }
  else{
    return
  }
}
const remove = (index: number) => {
  selected.value.splice(index, 1)
}
</script>