<template>
  <dev-only>
    <div
        ref="panelRef"
        class="flexCol   gap-2 max-w-70 z-1000 bg-opacity-70 backdrop-blur-1 group hover:(left-0 bg-opacity-40)
        bg-black fixed -left-70 select-none shadow-xl px-3 py-4 rounded-rb-xl cursor-grab transition-all"
        :style="{ top: `${y}px`, backdropFilter: isOpen ? 'blur(8px)' : 'blur(8px)' }"
        :class="[{ '!left-0 !bg-opacity-40': loading || isOpen }, { 'cursor-grabbing !bg-opacity-45': dragging }]"
        @pointerdown.self="onPointerDown"
    >
      <p
          title="Pin"
          :class="[
          { '!bg-opacity-45': dragging },
          { '!-rotate-0 !-top-6.6 !backdrop-blur-2 !right-0 !w-full': isOpen }
        ]"
          @click="isOpen = !isOpen"
          class="text-center bg-black cursor-pointer bg-opacity-40 py-1 px-2
          rounded-t-lg absolute rotate-45 -right-99px top-73px text-white"
      >
        Dev Tools
        <span class="text-2.5">(CTRL + Shift + D)</span>
      </p>
      <p
          title="Pin"
          class="absolute items-center flex gap-1  cursor-pointer text-(white sm) right-1 top-1 mb-1 opacity-0 group-hover:opacity-100 transition-all"
          @click.prevent.stop="isOpen = !isOpen" :class="{ 'opacity-100 ': isOpen }"
      >
        <span class="text-2" :class="{ 'opacity-100 !-rotate-22': isOpen }">📌</span>{{ !isOpen ? 'Pin' : 'UnPin' }}
      </p>


      <!-- Toggle for buttons visibility -->
      <div
          class="flex items-center justify-between mt-3 bg-white/10 rounded-lg px-3 py-1  cursor-pointer hover:bg-white/15 transition-all"
          @click="buttonsVisible = !buttonsVisible"
      >
        <span class="text-white text-xs font-medium">Buttons</span>
        <span class="text-white text-xs transition-transform duration-200"
              :class="{ 'rotate-90': !buttonsVisible }">
          ▼
        </span>
      </div>

      <!-- Buttons container with slide animation -->
      <div
          class="grid grid-cols-2 gap-2  transition-all duration-300 overflow-y-auto"
          :style="{
          'max-height': buttonsVisible ? '1000px' : '0',
          'opacity': buttonsVisible ? '1' : '0',
          'margin-top': buttonsVisible ? '0.5rem' : '0'
        }"
      >
        <p
            v-for="button in Buttons"
            @click="button.func()"
            :class="getVariantClass(button.variant)"
            class="bg-white text-nowrap transition-all duration-100 hover:( brightness-90)
            text-xs cursor-pointer rounded-full leading-6 px-3 py-1"
        >
          {{ button.label }}
        </p>
      </div>
      <TheNuxtIcon name="loading" icon-type="svg" class="text-(center 8 white) self-center" v-if="loading"/>

      <div class="bg-black/60 rounded-xl cursor-auto p-2 flexCol w-full gap-2">
        <p class="text-white text-xs">Phone Number</p>
        <input
            class="bg-white rounded-full px-3 py-1 text-xs"
            dir="ltr"
            v-model="phoneNumber"
            placeholder="Add phoneNumber"
            @focus="isOpen = true"
        />
      </div>
      <TheDevToolsNotes v-model="isOpen"/>
    </div>
  </dev-only>
  <!--  <TheLog :data="wallet"/>-->
</template>

<script setup lang="ts">
// import { vOnClickOutside } from '@vueuse/components' // (unused in snippet)

// -----------------------------------------------------------------
const userId = useCookie('userId')
const token = useCookie('token')
const phoneNumber = useLocalStorage('phoneNumber', '')
const showTheLog = useLocalStorage('showTheLog', true)
const buttonsVisible = useLocalStorage('devToolsButtonsVisible', true) // Store visibility state

const wallet = await useWallets()
const increase_amount = 500000
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
const variantClassMap: Record<
    NonNullable<DevButton['variant']>,
    string
> = {
  default: '',
  success: 'text-green',
  danger: 'text-[#ff3030ff]',
  black: 'text-black',
  blue: 'text-blue',
}
const getVariantClass = (variant?: DevButton['variant']) =>
    variantClassMap[variant ?? 'default']
const Buttons = computed<DevButton[]>(() => [
  {label: `UserType: ${userType.value}`, func: switchUserType},
  {
    label: `${userId.value ? 'logOut' : 'login'}`,
    func: LogInLogOut,
    variant: !userId.value ? 'success' : 'danger'
  },
  {
    label: `TheLog: ${showTheLog.value ? 'Hide' : 'Show'}`,
    func: () => (showTheLog.value = !showTheLog.value),
    variant: showTheLog.value ? 'danger' : 'success',
  },
  {label: 'Clear: LocalStorage', variant: 'danger', func: DeleteLocalStorage},
  {
    label: `Change Locale: ${locale.value}`,
    func: () => locale.value == 'en' ? setLocale('fa') : setLocale('en'),
  },
  {
    label: 'Generate: Models',
    variant: 'black',
    func: () => handleNav(`https://${APP_CODE}-back.vistatest.site/generate`)
  },
  {
    label: 'set: Models',
    variant: 'black',
    func: () => handleNav(`https://${APP_CODE}-back.vistatest.site/set-models`)
  }, {
    label: 'add-guest: Models',
    variant: 'black',
    func: () => handleNav(`https://${APP_CODE}-back.vistatest.site/add-guest?force=true`)
  },
  {
    label: '+ Wallet Balance',
    func: increaseWalletBalance
  },
  {label: 'Copy: Models', func: copyTsSchema, variant: 'black'},
  {label: 'Navigate: Admin', variant: 'blue', func: () => handleNav(`https://${APP_CODE}-admin.vistatest.site`)},
  {label: 'Navigate: Gitlab', variant: 'blue', func: () => handleNav(`https://vistagit.com/${APP_CODE}/web`)},
  {label: 'Navigate: Mizito', variant: 'blue', func: () => handleNav(`https://office.mizito.ir`)},
  {
    label: 'NavTo: CodeServer',
    variant: 'blue',
    func: () => handleNav(`https://prisma.vistatest.site/?folder=/app-data`)
  },
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
    const res = await fetch(`https://${APP_CODE}-back.vistatest.site/ts-schema`, {
      credentials: 'omit' // no cookies needed
    })
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
const increaseWalletBalance = async () => {
  loading.value = true
  if (!userId.value) {
    await LogInLogOut()
  }
  const result = await putWallet(wallet.value?.[0]?.id, {balance: {increment: increase_amount}})
  if (result) toast.success(`Wallet Balance Increased +${increase_amount}`)
  loading.value = false
}
const handleNav = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer')
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

  // don't start drag when clicking the pin button
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
  const minTop = isOpen.value ? 26 : 8
  const maxTop = Math.max(minTop, viewportH - elH - (isOpen.value ? 26 : 8))

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
      tag === 'input' || tag === 'textarea' || (t as HTMLElement | null)?.isContentEditable

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