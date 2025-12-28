<template>
  <div
      class="flex items-stretch <sm:pt-1 pb-0 sm:(bg-white rounded-2xl) sm:px-2"
      :class="mini ? 'px-0' : 'px-6'">
    <label v-for="item in items"
           :class="[
  {
    'text-primary-600 border-b-(3 solid primary-600) cursor-default': item?.value === value && value !== ''
  },
  mini ? 'px-0' : 'px-4'
]"
           class="flex justify-center items-center flex-grow basis-1 mx-1 cursor-pointer p-3 pb-2 text-gray-500 grow"
           @click="addToQuery(item.key, item.value)">
      <input v-model="value" type="radio" :value="item.value" hidden>
      <span class="whitespace-nowrap leading-6.5"
            :class="[item?.value === value && value !== '' ? 'font-700' : 'font-500']">
      {{ item.label }}
    </span>
    </label>
  </div>
</template>

<script setup lang="ts">

const props = withDefaults(defineProps<{
  items:any[],
  mini?:boolean,
  routable?:boolean,
  label?:string,
  scroll?:boolean,
  toggleable?: boolean // ✅ new prop
}>(),{
  routable:true,
  label:'by',
  toggleable: false // ✅ default: not toggleable

})
const value = defineModel()
const route = useRoute()
const addToQuery = (key, v) => {
  if (props.toggleable && value.value === v) {
    if (props.routable) {
      const newQuery = { ...route.query }
      delete newQuery[props.label]
      navigateTo({ query: newQuery, replace: true }) // 👈 replace to avoid flicker
    }
    value.value = '' // 👈 set value after query update
    return
  }

  value.value = v

  if (props.routable) {
    navigateTo({
      query: {
        ...route.query,
        [props.label]: v
      },
      replace: true // 👈 avoid route reload
    })
  } else if (props.scroll) {
    navigateTo({ hash: `#${v}` })
    const el = document.getElementById(v)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }
}
watch(() => route.query.by, (val) => {
  value.value = val || ''
})
</script>

<style>
.gradient {
  background: linear-gradient(140.34deg, #FF7028, #6E3011);
}
</style>

