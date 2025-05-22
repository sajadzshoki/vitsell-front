<template>
    <NuxtLink :to="{name:'chat-id' , params :{id:1}} " class="flex items-center gap-2 relative cursor-pointer">
<!--      <TheNuxtIcon-->
<!--          :name="userId == chat?.userOnChats[1]?.user?.id ? chat?.userOnChats[0]?.user?.profile?.avatar : chat?.userOnChats.length > 2 ? chat?.image|| 'noProfile.png' : chat?.userOnChats[1]?.user?.profile?.avatar ||  'noProfile.png' "-->
<!--          icon-type="img"-->
<!--          class="rounded-full object-cover !w-13 !h-13"/>  -->
      <TheNuxtIcon
          name="profile2.png"
          icon-type="img"
          class="rounded-full object-cover !w-13 !h-13"/>

      <div class="flex flex-col gap-2  w-full py-4 ">
<!--        <p class="text-(gray-700 sm) font-semibold">-->
<!--          {{-->
<!--            chat?.title ? chat.title : userId == chat?.userOnChats[1]?.user?.id ? chat?.userOnChats[0]?.user?.profile?.firstName : chat?.userOnChats[1]?.user?.profile?.firstName-->
<!--          }}-->
<!--        </p>-->
        <p class="text-(gray-400 sm) font-semibold">
        علی علوی
        </p>
<!--        <p class="text-(xs gray-500)">{{  truncateText(_last(chat.messages)?.text || "پیام", 40) }}</p>-->
        <p class="text-(xs gray-500)">سلام، چطور می تونم کمکتون کنم؟</p>
      </div>

      <div class="absolute  left-0 top-3 flex items-center gap-2">
        <!--      <TheNuxtIcon name="done_all" icon-type="svg" class="mb-1"/>-->
<!--        <span class="text-(xs gray-700) ">{{  isoToTime(_last(chat.messages)?.createdAt) }}</span>-->
        <span class="text-(xs gray-700) ">۱۱:۲۹ AM</span>
      </div>

  </NuxtLink>
  <!--  <TheLog :data="chat"/>-->
</template>

<script lang="ts" setup>
// import type {Chat} from "~/types/models";
//
// defineProps<{ chat: Chat }>()
// const truncateText = (text: string, maxLength: number) => {
//   return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
// };
//
// const userId = useCookie('userId')
</script>
