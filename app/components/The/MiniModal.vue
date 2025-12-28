<template>
  <div class="b-(1 solid gray-600) rounded-xl flex gap-1 px-2 py-2px relative"
       :class="{' b-(primary-600)':selected }"
       @click="isOpen ? isOpen = false : isOpen=true" v-on-click-outside="()=> isOpen = false">
    <TheNuxtIcon :name="icon" icon-type="svg" :class="{'text-primary-600':selected }"/>
    <p class="text-(xs gray-600) font-600 leading-6 "
       :class="{'text-primary-600':selected }"
    >
      {{ selected ? selectedItemTitle : title }}</p>
    <div class="absolute top-8 right-0 shadow-lg bg-white rounded-xl px-2 min-w-30"
         v-if="isOpen">
      <p v-for="item in items"
         @click="handleSelect(item)"
         :class="{'text-primary-700':selected==item.value }"
         class="text-(sm nowrap) flex gap-2 justify-between items-center  font-500 py-2 leading-6.5 b-b-(1 solid gray-100) last:b-none">
        {{ item.title }}
        <TheNuxtIcon v-if="item.value == selected" name="tick" icon-type="svg" class="text-lg"/>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import {vOnClickOutside} from '@vueuse/components'

const selected = defineModel()
const props = withDefaults(defineProps<{
  title?: string,
  icon?: string,
  items: Record<any, any>[]
}>(), {
  title: 'ترتيب',
  icon: 'sort'
})

const isOpen = ref(false)
const emit = defineEmits(['refresh'])


const handleSelect = (item) => {
  try {

    if (selected.value == item.value) {
      selected.value = ''
    } else {
      selected.value = item.value
    }
  } finally {
    emit('refresh')
  }
}
const selectedItemTitle = computed(() => {
  const current = props.items.find(i => i.value === selected.value)
  return current?.title ?? props.title
})
</script>