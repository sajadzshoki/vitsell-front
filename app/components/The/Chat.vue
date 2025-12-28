<template>

  <div class="flexCol  grow-1 sm:bg-screen">
    <div @click="router.back()"
         class="w-full cursor-pointer z-5 sticky top-0 px-4 py-2 bg-white  shadow-headerLayout flex gap-2.5 items-center">
      <TheNuxtIcon name="arrow-left" icon-type="svg" class="!svg:(w-5) rotate-180"/>
      <TheNuxtIcon :name="userProfile ||'noProfile.png'" icon-type="img" class="!w-11 !h-11 rounded-full"/>
      <p class="text-(base) font-500 leading-6.5">{{ userName }}</p>
    </div>
    <div
        class="grow pb-12 pt-10  flexCol justify-end gap-2 overflow-hidden bg-[url(/images/chat-bg.png)] bg-contain bg-fixed   ">
      <div class="w-full flexCol gap-4 overflow-y-auto px-4 pb-4">

        <div
            v-for="msg in chat?.messages"
            class=" w-fit  p-4 rounded-2xl max-w-2/3 relative shadow-tab"
            :class="msg.userId == userId
         ? 'bg-primary-500 text-white   flexCol  gap-1  rounded-tr-none  '
         :'bg-white self-end        rounded-tl-none '"
        >
          <p class="text-xs break-words leading-6 font-300 ">
            {{ msg?.text }}
          </p>
          <!--          <p class="" :class="msg.userId == userId-->
          <!--      ?'text-(2.5) leading-5'-->
          <!--      :'text-(2.5 gray-600) font-300 leading-5'">-->
          <!--            {{ isoToTime(msg.createdAt) }}-->
          <!--          </p>-->
        </div>

      </div>
      <div  v-if=" !chat?.closed && (moment(chat?.UserReserve?.reservableTime?.dateTime).isSame(moment(),'day'))"
            class="z-5  w-full items-center fixed bottom-0 shadow-chat h-14   pr-4 bg-white  flex">

        <TheNuxtIcon :name="loading ?'Loading':'send'"
                     icon-type="svg"
                     class="text-2xl"
                     @click="sendMessage"/>

        <TheInput v-model="message" @keydown.enter="sendMessage"
                  value-class-name=""
                  class="w-full"

                  class-name="!shadow-none !border-none  !rounded-none  "
                  inputClass="!placeholder:text-3.5"
                  placeholder="نوشتن پیام..."
                  :focusable="false"
        />
        <!--    <TheNuxtIcon name="attach-circle" icon-type="svg" class="text-2xl"/>-->
      </div>
      <div ref="chatBottom"/>
    </div>

  </div>
  <TheButton label="بستن گفتگو" class="mx-4 sticky bottom-16"
             @click="navigateTo({name:'counseling-id-result',params:{id:chat?.userReserveId}})"
             v-if="userType==='LAWYER' && !chat?.closed"/>
  <TheLog :data="!chat?.closed && (moment(chat?.UserReserve?.reservableTime?.dateTime).isSame(moment(),'day') )"/>
</template>

<script lang="ts" setup>
import {moment} from "~/composables/global";

const router = useRouter()
import type {SocketData} from "~/types/app";

definePageMeta({layout: false})
const backward = useState('backward')
const chatImage = useState('chatImage')
const socket = useSocketIo()
const route = useRoute()
const userId = useCookie('userId')
const message = ref('')
const file = ref('');
const loading = ref(false)
const messages = ref<Record<string, any>[]>([])

const chatBottom = ref<HTMLElement | null>(null)
const userType = useLocalStorage('userType', '')
const config = useRuntimeConfig()
const {data: chat, refresh} = await useAsyncData('get-chat-id', () => getChat(route.params.id, {
  'with-messages': true,
  'with-fromUser.with-profile': true,
  'with-toUser.with-profile': true,
  'with-UserReserve.with-reservableTime': true,


}))
const userProfile = computed(() => {
  if (userType.value === 'USER') {
    return chat?.value?.fromUser?.profile?.avatar || 'noProfile.png'
  } else {
    return chat?.value?.toUser?.profile?.avatar || 'noProfile.png'
  }
})
chatImage.value = userProfile.value

const userName = computed(() => {
  if (userType.value === 'USER') {
    return chat?.value?.fromUser?.profile?.fullName
  } else {
    return chat?.value?.toUser?.profile?.fullName
  }
})
backward.value = userName.value
const scrollToBottom = () => {
  nextTick(() => {
    chatBottom.value?.scrollIntoView({behavior: 'smooth'})
  })
}

const msg = ref(null)
const isoToTimeChat = (time: string) => {
  return moment(time).format('hh.mm')
}
const sendMessage = async () => {
  if (!message.value && !file.value || loading.value) return
  loading.value = true
  await usePost('/message', {
    userId: userId?.value,
    chatId: route.params.id,
    text: message.value,
  })
  message.value = ''
  file.value = ''
  await refresh()
  loading.value = false
  scrollToBottom()
}
const getMessages = async () => {
  // loading.value = true
  const {result} = await useGet<Record<string, any>[]>('/Message', {
    params: {
      "chatId:eq": route.params.id
    }
  })
  if (result) messages.value = result
  // loading.value = false
}
const handleMessage = ({method, data}: SocketData) => {
  if (method === 'create') {
    messages.value.push(data)
  }
  scrollToBottom()
}
const connect = async () => {
  watchSocket(socket, {
    model: 'message',
    coll: 'chatId',
    value: route.params.id
  }, handleMessage, loading, getMessages)
}
onMounted(() => {
  connect()
  scrollToBottom()
})
// const disableChat = async () => {
//   await usePut(`/Chat/${chatId}`, {
//     status: "BANNED"
//   })
//   refresh()
// }
</script>