<template>
  <div class="p-6">
    <TheDropdown :data="data" v-model="selectedData" valueKey="value" searchable/>
    <TheDropdown :data="data2" label="name" v-model="selectedData" />
    <TheDropdown :multi="true" :data="data" v-model="selectedDataArray" valueKey="value" searchable/>
  </div>
<TheLog :data="selectedDataArray"/>
</template>

<script lang="ts" setup>

const selectedData=ref()
const selectedDataArray=ref([])

const data = [
  {
    value:'test1',
    title:'تست 1',

  },  {
    value:'test2',
    title:'تست 2',
  },  {
    value:'test3',
    title:'تست 3',
  },  {
    value:'test4',
    title:'تست 4',
  },  {
    value:'test5',
    title:'تست 5',
  },
]
const data2 = [
  {
    id:'11111111111',
    name:'تست 1',
  },  {
    id:'22222222222222',
    name:'تست 2',
  },  {
    id:'3333333333333333',
    name:'تست 3',
  },  {
    id:'444444444444444444',
    name:'تست 4',
  },  {
    id:'55555555555555555',
    name:'تست 5',
  },
]

</script>
