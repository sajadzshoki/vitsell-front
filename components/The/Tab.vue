<template>
  <div
      class="flex items-stretch rounded-full text-text-100 text-sm bg-gray-900 font-bold defaultShadow p-2.5 b-rd-3 h-14">
    <label v-for="item in items"
           :class="[{'bg-gray-600 rounded-full c-white cursor-default' : item?.value === ( value )} , [mini ? 'px-3' : ' px-4']]"
           class="flex justify-center items-center b-rd-2 flex-grow basis-1 cursor-pointer p-3 text-gray-300 text-sm font-500 grow"
           @click="addToQuery(item.key , item.value)">
      <input v-model="value" type="radio" :value="item.value" hidden>
      <span class="whitespace-nowrap leading-7">
        {{ item.label }}
      </span>
    </label>
  </div>
</template>

<script setup>
const props = defineProps({
  items: {
    type: Array,
    required: true
  },
  mini: {
    type: Boolean,
    default: false
  },
  routable: {
    type: Boolean,
    default: true
  },
  label: {
    type: String,
    default: 'by'
  }
})
const value = defineModel()
const route = useRoute()
const addToQuery = (key, v) => {
  value.value = v
  if (props.routable) {
    navigateTo({
      query: {
        ...route.query,
        [props.label]: v
      }
    })
  }
}
</script>

<style>
.gradient {
  background: linear-gradient(140.34deg, #FF7028, #6E3011);
}
</style>

