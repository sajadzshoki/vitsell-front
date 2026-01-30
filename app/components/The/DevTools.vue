<template>
  <dev-only>
    <div
        ref="panelRef"
        class="flexCol  gap-2 max-w-44.5  z-1000 bg-opacity-70 backdrop-blur-4 group hover:(left-0 bg-opacity-40)
      bg-black fixed -left-44 select-none shadow-xl px-3 py-4 rounded-rb-xl cursor-grab transition-all"
        :style="{ top: `${y}px` }"
        :class="[{ '!left-0 !bg-opacity-40': loading || isOpen },{'cursor-grabbing !bg-opacity-45':dragging}]"
        @pointerdown.self="onPointerDown"
    >
      <p :class="[{'!bg-opacity-45':dragging}]" @click="isOpen=!isOpen"
         class="text-center bg-black cursor-pointer bg-opacity-40 py-1 px-2 !backdrop-blur-4
          rounded-t-lg absolute rotate-45 -right-14.2 top-7.4 text-white">
        Dev Tools
      </p>
      <p class="absolute cursor-pointer right-1 top-1.5  opacity-0 group-hover:opacity-100 transition-all"
         @click.prevent.stop="isOpen = !isOpen" :class="{'opacity-100 -rotate-22 scale-110':isOpen}">📌</p>
      <TheNuxtIcon name="loading" icon-type="svg" class="text-center self-center" v-if="loading"/>
      <p
          v-for="button in Buttons"
          @click="button.func()"
          :class="{'text-green': button.variant === 'success','text-#ff3030ff': button.variant === 'danger', }"
          class="bg-white text-nowrap transition-all  duration-100 hover:( brightness-90)
          text-sm cursor-pointer w-fit rounded-full leading-6 px-3 py-1 "
      >
        {{ button.label }}
      </p>
      <div class="bg-black/50   rounded-xl cursor-auto p-2  flexCol w-full  gap-2 ">
        <p class="text-white text-xs">Phone Number</p>
        <input class="bg-white rounded-full   px-3 py-1 text-xs "
               dir="ltr"
               v-model="phoneNumber"
               placeholder="Add phoneNumber"
               @focus="isOpen=true"/>
      </div>
      <div class="bg-black/50 max-h-100   rounded-xl cursor-auto p-2   -mr-1 flexCol  gap-2 ">
        <div class="flex justify-between w-full items-center ">
          <p class="text-white text-xs">Reminders</p>
          <p @click.prevent="isNotesOpen=!isNotesOpen"
             v-show="myLocalNotes.length"
             class="text-(xs ) hover:brightness-90 cursor-pointer" :class="isNotesOpen?'text-#ff3030ff':'text-green'">
            {{ isNotesOpen ? 'Hide' : ('Show ') }}
          </p>
        </div>
        <input class="bg-white rounded-full  px-3 py-1 text-xs "
               dir="ltr"
               v-model="note"
               placeholder="Type . . . "
               @keydown.enter="addNote"
               @focus="isOpen=true"/>
        <div v-if="isNotesOpen"
             :class="myLocalNotes?.length ?'h-full':'h-0'"
             class="max-h-full overflow-y-auto transition-all  -m-2 mb-1 pr-2  overflow-x-none   flexCol   gap-1" >
          <p  v-for="(note,index) in myLocalNotes "
             class="text-(white sm) b-b-(1 solid white/50) p-2 pb-1 hover:bg-black/50  break-word
             flex justify-between hover:text-#ff3030ff cursor-pointer items-center gap-2"
             @click="myLocalNotes?.splice(index, 1)">{{ index + 1 }} . {{ note }}
            <TheNuxtIcon name="close" icon-type="svg" class="cursor-pointer"/>
          </p>
        </div>
        <p class="text-(white xs) cursor-pointer w-fit bg-#ff3030ff hover:brightness-90 px-2 py-2px rounded-full leading-4.5 flex flexCenter"
           @click="myLocalNotes=[]"
           v-if="myLocalNotes?.length">Clear All</p>
      </div>

    </div>
  </dev-only>
</template>

<script setup lang="ts">
// import { vOnClickOutside } from '@vueuse/components' // (unused in snippet)

// -----------------------------------------------------------------
const userId = useCookie('userId')
const token = useCookie('token')
const phoneNumber = useLocalStorage('phoneNumber', '')
const showTheLog = useLocalStorage('showTheLog', true)
const myLocalNotes = useLocalStorage('myLocalNotes', [])
const toast = useAppToast()
const isOpen = ref(true)
const route = useRoute()
const {locale} = useI18n()

enum UserType {
  USER = 'user',
  PUBLISHER = 'publisher',
}

const userType = useLocalStorage<UserType>('userType', UserType.USER)
const loading = ref(false)
const note = ref()
const isNotesOpen = ref(true)

// -----------------------------------------------------------------
type DevButton = {
  label: string
  func: () => void
  variant?: 'default' | 'success' | 'danger'
}
const Buttons = computed<DevButton[]>(() => [
  {label: `UserType: ${userType.value}`, func: switchUserType},
  {
    label: `${userId.value ? 'logOut' : 'login'}`, func: LogInLogOut,
    variant: !userId.value ? 'success' : 'danger'
  },
  {
    label: `TheLog: ${showTheLog.value ? 'Hide' : 'Show'}`,
    func: () => (showTheLog.value = !showTheLog.value),
    variant: showTheLog.value ? 'danger' : 'success',
  },
  {label: 'Clear: LocalStorage', func: DeleteLocalStorage,},
  {label: 'Navigate: Admin', func: () => handleNav(`https://${APP_CODE}-admin.vistatest.site`)},
  {label: 'Navigate: Gitlab', func: () => handleNav(`https://vistagit.com/${APP_CODE}/web`)},
  {label: 'Navigate: Mizito', func: () => handleNav(`https://office.mizito.ir`)},
])

const switchUserType = () => {
  const userTypes = Object.values(UserType)
  const currentIndex = userTypes.indexOf(userType.value)
  const nextIndex = (currentIndex + 1) % userTypes.length
  userType.value = userTypes[nextIndex]
}

const LogInLogOut = async () => {
  const phone = phoneNumber.value || '989109069118'
  loading.value = true
  if (userId.value) {
    userId.value = null
    loading.value = false
    return
  }
  let didLogin = false
  while (true) {
    const {result} = await useGet(`/user?phoneNumber=${phone}`)
    const id = result?.[0]?.id
    if (id) {
      userId.value = id
      break
    }
    if (didLogin) break
    didLogin = true
    await usePost('/login-by-phone-otp', {
      phoneNumber: phone,
    })
  }
  loading.value = false
}

const DeleteLocalStorage = () => {
  localStorage.clear()
  toast.success('Local Storage Cleared')
}
const handleNav = (url: string) => {
  window.open(
      url,
      '_blank',
      'noopener,noreferrer'
  )
}

const addNote = () => {
  const trimmed = (note.value || '').trim()
  if (!trimmed) return
  myLocalNotes.value.push(trimmed)
  note.value = ''
}

// --------------------------------------------------------------------------------------------
// --- draggable Y offset ---
const DEFAULT_TOP = 20 // ~ top-40 (40 * 4px)
const y = useLocalStorage<number>('devToolsPos', DEFAULT_TOP)
const panelRef = ref<HTMLElement | null>(null)

const dragging = ref(false)
let startClientY = 0
let startTop = 0

const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max)

const onPointerDown = (e: PointerEvent) => {
  // only left click / primary touch
  if (e.pointerType === 'mouse' && e.button !== 0) return

  // don’t start drag when clicking the pin button
  const target = e.target as HTMLElement | null
  if (target?.closest?.('p[aria-pin]')) return

  const el = panelRef.value
  if (!el) return

  dragging.value = true
  startClientY = e.clientY
  startTop = y.value

  // capture pointer so dragging continues outside element
  el.setPointerCapture?.(e.pointerId)

  window.addEventListener('pointermove', onPointerMove, {passive: false})
  window.addEventListener('pointerup', onPointerUp, {passive: true})
  window.addEventListener('pointercancel', onPointerUp, {passive: true})
}

const onPointerMove = (e: PointerEvent) => {
  if (!dragging.value) return
  e.preventDefault()

  const el = panelRef.value
  if (!el) return

  const viewportH = window.innerHeight
  const elH = el.offsetHeight
  const minTop = 8
  const maxTop = Math.max(minTop, viewportH - elH - 8)

  const dy = e.clientY - startClientY
  y.value = clamp(startTop + dy, minTop, maxTop)
}

const onPointerUp = () => {
  dragging.value = false
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('pointercancel', onPointerUp)
}

// ------------------------------------------------------------------
</script>
<!--<style scoped>-->
<!--.text-red-costum{-->
<!--  -->
<!--}-->
<!--</style>-->
