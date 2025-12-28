<template>
  <div class="bg-primary-200 z-2 shadow-[0_0px_5px_rgba(0,0,0,0.1)] fixed bottom-0 w-full  px-4 flex justify-between">
    <div @click="handleSelectItem(item.link)" v-for="item in Buttons" class="cursor-pointer px-2 py-2  flexCol items-center justify-baseline gap-1 "
              :class="active(item) ?'font-semibold border-b-(3 solid gray-600)':''">
      <TheNuxtIcon :name="active(item) ? item.iconFill :item.icon" icon-type="svg" class="text-lg duration-100 hover:(scale-110)" :filled="true"/>
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
const active = (item)=>{
  return selectedItem.value ===item.link || route.path.includes(item.link) || route.name === item.link
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

<!--<template>-->
<!--  <div class="sm:hidden bg-white z-4 shadow-[0_0px_5px_rgba(0,0,0,0.1)] fixed bottom-0 right-0 w-full py-3 flex px-4 justify-around  border-t-(0.5 solid gray-200)">-->
<!--    <div @click="handleSelectItem(item.link)" v-for="item in items" class="cursor-pointer    flexCol items-center justify-baseline  ">-->
<!--      <TheNuxtIcon :name="active(item) ? item.iconFill :item.icon"-->
<!--                   icon-type="svg"-->
<!--                   class="text-2xl  " />-->
<!--      <p class="text-(2.5)  leading-5.5" :class="active(item)?'font-600 text-primary-600':'font-500'" >{{ item.label }}</p>-->
<!--    </div>-->
<!--  </div>-->
<!--  &lt;!&ndash;  <TheLog :data="config.public"/>&ndash;&gt;-->
<!--</template>-->

<!--<script setup lang="ts">-->
<!--const route = useRoute()-->
<!--const selectedItem = ref<string>('')-->
<!--const config = useRuntimeConfig()-->
<!--const handleSelectItem = (item:string)=>{-->
<!--  navigateTo({name:item})-->
<!--  selectedItem.value = item-->
<!--}-->
<!--const active = (item)=>{-->
<!--  return selectedItem.value ===item.link || route.path.includes(item.link) || route.name === item.link-->
<!--}-->
<!--const userId = useCookie('userId');-->
<!--const Buttons = ref([-->
<!--  {-->
<!--    label: 'خانه',-->
<!--    icon: 'home',-->
<!--    iconFill:'home-fill',-->
<!--    link: 'index'-->
<!--  },-->
<!--  {-->
<!--    label: 'دندان پزشکان',-->
<!--    icon: 'bookmark',-->
<!--    iconFill:'bookmark-fill',-->
<!--    link: 'category'-->
<!--  },-->
<!--  {-->
<!--    label: 'نوبت‌ها',-->
<!--    icon: 'calendar-2',-->
<!--    iconFill:'calendar-tick',-->
<!--    link: userId.value?'appointment':'login'-->
<!--  },-->
<!--  {-->
<!--    label: 'پروفایل',-->
<!--    icon: 'profile',-->
<!--    iconFill:'profile-1',-->
<!--    link: userId.value?'profile':'login',-->
<!--    // handler:()=>!userId.value ? navigateTo({name: 'login'}) : navigateTo({name: 'profile'})-->
<!--  },-->
<!--])-->
<!--const ButtonsDentist = ref([-->
<!--  {-->
<!--    label: 'پروفایل',-->
<!--    icon: 'profile',-->
<!--    iconFill:'profile-1',-->
<!--    link: 'dentistPanel-profile'-->
<!--  },-->
<!--  {-->
<!--    label: 'ویزیت',-->
<!--    icon: 'document-like',-->
<!--    iconFill:'document-like-fill',-->
<!--    link: 'dentistPanel-appointment'-->
<!--  },-->
<!--  {-->
<!--    label: 'بیماران من',-->
<!--    icon: 'health',-->
<!--    iconFill:'health-fill',-->
<!--    link: 'dentistPanel-patient'-->
<!--  },-->
<!--])-->
<!--const items = computed(()=>  config.public.isDentist ? ButtonsDentist.value : Buttons.value)-->
<!--</script>-->
