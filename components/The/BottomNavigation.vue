<template>
  <div class="bg-primary-200 z-2 shadow-[0_0px_5px_rgba(0,0,0,0.1)] fixed bottom-0 w-full  px-4 flex justify-between">
    <div @click="handleSelectItem(item.link)" v-for="item in Buttons" class="cursor-pointer px-2 py-2  flexCol items-center justify-baseline gap-1 "
              :class="selectedItem ===item.label || route.path.includes(item.link) ?'font-semibold border-b-(3 solid gray-600)':''">
      <TheNuxtIcon :name="selectedItem ===item.label || route.path.includes(item.link) ? item.iconFill :item.icon" icon-type="svg" class="text-lg duration-100 hover:(scale-110)" :filled="true"/>
      <p class="text-(xs)">{{ item.label }}</p>
    </div>
  </div>
<!--  <TheLog :data="selectedItem"/>-->
</template>

<script setup lang="ts">
const route = useRoute()
const selectedItem = ref<string>('')
const handleSelectItem = (item:string)=>{
  selectedItem.value = item
  navigateTo({name:item})
}
const Buttons = ref([
  {
    label: 'Home',
    icon: 'home',
    iconFill:'home',
    link: 'index'
  },
  {
    label: 'Search',
    icon: 'search',
    iconFill:'search',
    link: 'index'
  },
  {
    label: 'Social',
    icon: 'instagram',
    iconFill:'instagram',
    link: 'index'
  },
  {
    label: 'Profile',
    icon: 'user',
    iconFill:'user',
    link: 'profile'
  },
])
</script>
