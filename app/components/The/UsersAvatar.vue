
<template>
  <div class="flex items-center">
    <TheNuxtIcon v-for="n in 3" icon-type="img" name="profile.png"
                 class=" shadow-md border-(1 solid gray-800)  rounded-full object-cover"
    :class="mini?'!w-5 !h-5 -mx-0.3':'!w-7 !h-7 sm:(!w-10 !h-10 -mx-0.5)  -mx-1'"/>
    <p class="mr-2 text-(2.5) sm:text-sm <sm:font-700 ">2000+</p>
<!--    <span class="  rounded-full flex flexCenter text-(2.5 center)  bg-secondary-400"-->
<!--    :class="mini?'!w-5 !h-5 -mx-0.3':'!w-8 !h-8 -mx-1'">10+</span>-->
  </div>
</template>


<script setup lang="ts">
defineProps<{
  mini?: boolean;
  items?:any,
}>()
</script>

<!--<template>-->
<!--  <div class="flex items-center">-->
<!--    <TheNuxtIcon v-for="item in items.slice(0,3)" icon-type="img" :name="item.avatar || 'noProfile.png'"-->
<!--                 class=" shadow-md border-(1 solid gray-800)  rounded-full object-cover"-->
<!--                 :class="mini?'!w-5 !h-5 -mx-0.3':'!w-7 !h-7 sm:(!w-10 !h-10 -mx-0.5)  -mx-1'"/>-->
<!--    <p class="mr-2 text-(2.5) sm:text-sm <sm:font-700 " v-if="items.length>3">{{ Math.round(items.length) }}+</p>-->
<!--    &lt;!&ndash;    <span class="  rounded-full flex flexCenter text-(2.5 center)  bg-secondary-400"&ndash;&gt;-->
<!--    &lt;!&ndash;    :class="mini?'!w-5 !h-5 -mx-0.3':'!w-8 !h-8 -mx-1'">10+</span>&ndash;&gt;-->
<!--  </div>-->
<!--</template>-->


<!--<script setup lang="ts">-->
<!--defineProps<{-->
<!--  mini?: boolean;-->
<!--  items?:any,-->
<!--}>()-->
<!--</script>-->
