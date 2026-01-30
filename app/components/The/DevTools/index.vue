<template>
  <dev-only>

    <div
        ref="panelRef"
        class="flexCol   gap-2 max-w-50  z-1000 bg-opacity-70 backdrop-blur-1 group hover:(left-0 bg-opacity-40)
      bg-black fixed -left-50.1 select-none shadow-xl px-3 py-4 rounded-rb-xl cursor-grab transition-all"
        :style="{ top: `${y}px`,   backdropFilter: isOpen ? 'blur(8px)' : 'blur(8px)'  }"
        :class="[{ '!left-0 !bg-opacity-40': loading || isOpen },{'cursor-grabbing !bg-opacity-45':dragging}]"
        @pointerdown.self="onPointerDown"
    >

      <p title="Pin" :class="[{'!bg-opacity-45':dragging},
      {'!-rotate-0 !-top-6.6  !backdrop-blur-2 !right-0 !w-full':isOpen}]"
         @click="isOpen=!isOpen"
         class="text-center bg-black cursor-pointer bg-opacity-40 py-1 px-2
          rounded-t-lg absolute rotate-45 -right-100px top-74px text-white ">
        Dev Tools
        <span class="text-2.5">(CTRL + Shift + D)</span>
      </p>
      <p title="Pin" class="absolute cursor-pointer right-1 top-1 mb-1 opacity-0 group-hover:opacity-100 transition-all"
         @click.prevent.stop="isOpen = !isOpen" :class="{'opacity-100 -rotate-22 ':isOpen}">📌</p>
      <TheNuxtIcon name="loading" icon-type="svg" class="text-center self-center" v-if="loading"/>
      <div class="flexCol gap-2 mt-2">


      <p
          v-for="button in Buttons"
          @click="button.func()"
          :class="{'text-green': button.variant === 'success',
          'text-#ff3030ff': button.variant === 'danger',
           'text-black':button.variant==='black',
           'text-blue':button.variant==='blue',
          }"
          class="bg-white text-nowrap transition-all   duration-100 hover:( brightness-90)
          text-sm cursor-pointer  rounded-full leading-6 px-3 py-1 "
      >
        {{ button.label }}
      </p>
      </div>
      <div class="bg-black/50   rounded-xl cursor-auto p-2  flexCol w-full  gap-2 ">
        <p class="text-white text-xs">Phone Number</p>
        <input class="bg-white rounded-full   px-3 py-1 text-xs "
               dir="ltr"
               v-model="phoneNumber"
               placeholder="Add phoneNumber"
               @focus="isOpen=true"/>
      </div>
      <TheDevToolsNotes v-model="isOpen"/>
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

const toast = useAppToast()
const isOpen = ref(false)
const route = useRoute()
const {locale, setLocale} = useI18n()

enum UserType {
  USER = 'user',
  PUBLISHER = 'publisher',
}

const userType = useLocalStorage<UserType>('userType', UserType.USER)
const loading = ref(false)


// -----------------------------------------------------------------
type DevButton = {
  label: string
  func: () => void
  variant?: 'default' | 'success' | 'danger' | 'black' | 'blue'
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
  {label: 'Clear: LocalStorage',variant:'danger', func: DeleteLocalStorage,},
  {
    label: `Change Locale: ${locale.value}`,
    func: () => locale.value == 'en' ? setLocale('fa') : setLocale('en'),
    // variant: showTheLog.value ? 'danger' : 'success',
  },
  {label: 'Copy: ts-schema', func: copyTsSchema,variant: 'black'},
  {label: 'Generate: ts-schema',variant: 'black', func:()=> handleNav(`https://${APP_CODE}-back.vistatest.site/generate`),},
  {label: 'Navigate: Admin',variant:'blue', func: () => handleNav(`https://${APP_CODE}-admin.vistatest.site`)},
  {label: 'Navigate: Gitlab',variant:'blue',  func: () => handleNav(`https://vistagit.com/${APP_CODE}/web`)},
  {label: 'Navigate: Mizito',variant:'blue',  func: () => handleNav(`https://office.mizito.ir`)},
])

const switchUserType = () => {
  const userTypes = Object.values(UserType)
  const currentIndex = userTypes.indexOf(userType.value)
  const nextIndex = (currentIndex + 1) % userTypes.length
  userType.value = userTypes[nextIndex]
}

const LogInLogOut = async () => {
  if (!phoneNumber.value && !userId.value) {
    return toast.error('Enter a phone number first')
  }
  const phone = phoneNumber.value
  loading.value = true
  if (userId.value) {
    userId.value = null
    loading.value = false
    toast.success('Logged Out')
    return
  }
  let didLogin = false
  while (true) {
    const {result}: any = await useGet(`/user?phoneNumber=${phone}`)
    const id = result?.[0]?.id
    if (id) {
      userId.value = id
      toast.success('Logged in')
      break
    }
    if (didLogin) break
    didLogin = true
    await usePost('/login-by-phone-otp', {
      phoneNumber: phone,
    })
    toast.success('Logged in')
  }
  loading.value = false
}

const DeleteLocalStorage = () => {
  localStorage.clear()
  toast.success('Local Storage Cleared')
}
const copyTsSchema = async () => {
  try {
    loading.value = true
    const res = await fetch(
        `https://${APP_CODE}-back.vistatest.site/ts-schema`,
        { credentials: 'omit' } // no cookies needed
    )
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`)
    }
    const text = await res.text()

    await navigator.clipboard.writeText(text)
    toast.success('TS schema copied to clipboard')
  } catch (err) {
    console.error(err)
    toast.error('Failed to copy TS schema')
  } finally {
    loading.value = false
  }
}

const handleNav = (url: string) => {
  window.open(
      url,
      '_blank',
      'noopener,noreferrer'
  )
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
  const minTop = isOpen.value ?26 : 8
  const maxTop = Math.max(minTop, viewportH - elH - (isOpen.value ?26 : 8))

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

// --- keyboard shortcut: Ctrl+Shift+D to toggle devtools panel ---
const onKeydown = (e: KeyboardEvent) => {
  // avoid triggering while typing in inputs/textareas/contenteditable
  const t = e.target as HTMLElement | null
  const tag = t?.tagName?.toLowerCase()
  const isTypingTarget =
      tag === 'input' ||
      tag === 'textarea' ||
      (t as HTMLElement | null)?.isContentEditable

  if (isTypingTarget) return

  const isD = e.key.toLowerCase() === 'd'
  if (e.ctrlKey && e.shiftKey && isD) {
    e.preventDefault()
    isOpen.value = !isOpen.value
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

</script>
<!--<style scoped>-->
<!--.text-red-costum{-->
<!--  -->
<!--}-->
<!--</style>-->
