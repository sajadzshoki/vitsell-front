<template>
  <time dir="ltr" class="text-center font-black text-lg text-primary-500 ">
    {{diff > d ? Math.floor(diff/d) + ':' : ''}}
    {{diff > h ? Math.floor(diff%d/h) + ':' : ''}}
    {{diff > m ? Math.floor(diff%h/m) + ':' : ''}}
    {{Math.floor(diff%m)}}
  </time>
</template>

<script lang="ts" setup>
const props = defineProps({
  time: {
    type: String,
  }
})
const m = 60
const h = 60 * m
const d = 24 * h
const emit = defineEmits(['complete'])
const value = defineModel()
const {timestamp, pause, resume} = useTimestamp({controls: true, interval: 330})
const diff = computed(() => (moment(props.time).valueOf() - timestamp.value)/1000)
const isExpired = computed(() => diff.value <=0 )
value.value = isExpired.value
watch(isExpired, () => {
  value.value = isExpired.value
})
defineExpose({timestamp, pause, resume,diff,isExpired})
</script>
