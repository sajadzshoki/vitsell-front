<template>
  <dev-only>
    <div
      ref="panelRef"
      class="fixed z-[9999] transition-all duration-300 ease-out font-sans"
      :style="{ top: `${y}px`, left: isOpen ? '0' : undefined, right: isOpen ? undefined : undefined }"
      :class="[isOpen ? 'w-80' : 'w-auto']"
    >
      <!-- Minimized Trigger (Floating Pill) -->
      <div
        v-if="!isOpen"
        class="fixed left-0 flex items-center gap-2 bg-black/80 backdrop-blur-md text-white px-3 py-2 rounded-r-full cursor-pointer hover:pl-5 transition-all shadow-lg hover:bg-primary-600 select-none z-[10000]"
        :style="{ top: `${y}px` }"
        @pointerdown="onPointerDown"
        @click="isOpen = true"
      >
        <UIcon name="i-heroicons-wrench-screwdriver" class="w-5 h-5" />
        <span class="text-xs font-bold w-0 overflow-hidden group-hover:w-auto transition-all duration-300 whitespace-nowrap opacity-0 group-hover:opacity-100">
            DevTools
        </span>
      </div>

      <!-- Expanded Panel -->
      <UCard
        v-else
        class="h-auto max-h-[90vh] shadow-2xl backdrop-blur-xl bg-white/95 dark:bg-gray-950/95 border-r border-y border-gray-200 dark:border-gray-800 rounded-r-2xl overflow-hidden flex flex-col ml-0 animate-slide-in-left ring-1 ring-gray-200 dark:ring-gray-800"
        :ui="{ body: { padding: 'p-0 sm:p-0' }, header: { padding: 'p-3 sm:p-3' }, footer: { padding: 'p-2 sm:p-2' } }"
      >
        <!-- Header (Draggable) -->
        <div 
          class="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800 cursor-grab active:cursor-grabbing select-none"
          @pointerdown="onPointerDown"
        >
            <div class="flex items-center gap-2">
                <div class="p-1.5 rounded-lg bg-primary-500/10 text-primary-500">
                    <UIcon name="i-heroicons-command-line" class="w-4 h-4" />
                </div>
                <div>
                    <h3 class="font-bold text-gray-900 dark:text-white text-sm leading-none">DevTools</h3>
                    <p class="text-[10px] text-gray-500 font-mono mt-0.5">CTRL + Shift + D</p>
                </div>
            </div>
            
            <div class="flex items-center gap-1" @pointerdown.stop>
                <UTooltip :text="pinned ? 'Unpin' : 'Pin'" :shortcuts="['Ctrl', 'Shift', 'D']">
                    <UButton
                        :icon="pinned ? 'i-heroicons-lock-closed' : 'i-heroicons-lock-open'"
                        :color="pinned ? 'primary' : 'gray'"
                        variant="ghost"
                        size="xs"
                        @click="pinned = !pinned"
                    />
                </UTooltip>
                <UButton icon="i-heroicons-x-mark" color="gray" variant="ghost" size="xs" @click="isOpen = false" />
            </div>
        </div>

        <!-- Scrollable Content -->
        <div class="p-4 overflow-y-auto max-h-[calc(90vh-120px)] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
            
            <!-- User Info Section -->
             <div class="mb-4 space-y-3">
                <div class="flex items-center justify-between">
                     <span class="text-xs font-medium text-gray-500">User ID</span>
                     <UBadge :label="userId ? String(userId) : 'Guest'" :color="userId ? 'green' : 'gray'" size="xs" variant="subtle" />
                </div>
                
                <div class="space-y-1">
                    <UInput
                        v-model="phoneNumber"
                        icon="i-heroicons-phone"
                        placeholder="Phone Number"
                        size="sm"
                        :ui="{ icon: { trailing: { pointer: '' } } }"
                        @focus="isOpen = true"
                    >
                        <template #trailing>
                            <UIcon v-if="loading" name="i-heroicons-arrow-path" class="animate-spin text-primary-500" />
                        </template>
                    </UInput>
                </div>
             </div>

             <UDivider class="my-4" />

             <!-- Actions Section -->
             <div class="mb-4">
                <button
                    class="flex items-center justify-between w-full text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    @click="buttonsVisible = !buttonsVisible"
                >
                    <span>Actions</span>
                    <UIcon :name="buttonsVisible ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" class="w-4 h-4" />
                </button>
                
                <div
                    class="grid grid-cols-2 gap-2 transition-all duration-300 overflow-hidden"
                    :style="{ maxHeight: buttonsVisible ? '1000px' : '0', opacity: buttonsVisible ? '1' : '0' }"
                >
                    <UButton
                        v-for="(button, index) in Buttons"
                        :key="index"
                        :label="button.label"
                        :color="getButtonColor(button.variant)"
                        size="2xs"
                        variant="soft"
                        class="justify-center truncate transition-all active:scale-95"
                        :class="{'col-span-2': button.label.length > 25}" 
                        @click="button.func()"
                    />
                </div>
             </div>

             <UDivider class="my-4" />

             <!-- Notes Component -->
             <TheModernDevToolsNotes v-model="isOpen" />
        </div>
        
        <!-- Footer Info -->
        <div class="bg-gray-50 dark:bg-gray-900/50 p-2 text-center border-t border-gray-200 dark:border-gray-800">
            <p class="text-[10px] text-gray-400 font-mono">
                {{ locale }} | {{ userType }}
            </p>
        </div>

      </UCard>
    </div>
  </dev-only>
</template>

<script setup lang="ts">
// -----------------------------------------------------------------
// Logic from original component
// -----------------------------------------------------------------
const userId = useCookie('userId')
// const token = useCookie('token') // Unused in original display but might be needed implicitly
const phoneNumber = useLocalStorage('phoneNumber', '')
const showTheLog = useLocalStorage('showTheLog', true)
const buttonsVisible = useLocalStorage('devToolsButtonsVisible', true)
const pinned = ref(false) // Added for new pin logic (was isOpen in original context for pin, but I split it)

// Original isOpen logic:
// In original: isOpen=true means panel is shown.
// Here: same.
const isOpen = ref(false)

const wallet = await useWallets()
const increase_amount = 500000
const toast = useAppToast()
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

// Map old variants to Nuxt UI colors
const getButtonColor = (variant?: DevButton['variant']): string => {
    switch (variant) {
        case 'success': return 'green'
        case 'danger': return 'red'
        case 'black': return 'gray' // Nuxt UI 'gray' is dark in dark mode
        case 'blue': return 'blue'
        default: return 'white'
    }
}

const Buttons = computed<DevButton[]>(() => [
  {label: `UserType: ${userType.value}`, func: switchUserType},
  {
    label: `${userId.value ? 'Log Out' : 'Login'}`,
    func: LogInLogOut,
    variant: !userId.value ? 'success' : 'danger'
  },
  {
    label: `TheLog: ${showTheLog.value ? 'Hide' : 'Show'}`,
    func: () => (showTheLog.value = !showTheLog.value),
    variant: showTheLog.value ? 'danger' : 'success',
  },
  {label: 'Clear LocalStorage', variant: 'danger', func: DeleteLocalStorage},
  {
    label: `Change Locale: ${locale.value}`,
    func: () => locale.value == 'en' ? setLocale('fa') : setLocale('en'),
  },
  {
    label: 'Generate Models',
    variant: 'black',
    func: () => handleNav(`https://${APP_CODE}-back.vistatest.site/generate`)
  },
  {
    label: 'Set Models',
    variant: 'black',
    func: () => handleNav(`https://${APP_CODE}-back.vistatest.site/set-models`)
  }, {
    label: 'Add Guest',
    variant: 'black',
    func: () => handleNav(`https://${APP_CODE}-back.vistatest.site/add-guest?force=true`)
  },
  {
    label: '+ Wallet Balance',
    func: increaseWalletBalance
  },
  {label: 'Copy Models', func: copyTsSchema, variant: 'black'},
  {label: 'Admin Panel', variant: 'blue', func: () => handleNav(`https://${APP_CODE}-admin.vistatest.site`)},
  {label: 'Gitlab', variant: 'blue', func: () => handleNav(`https://vistagit.com/${APP_CODE}/web`)},
  {label: 'Mizito', variant: 'blue', func: () => handleNav(`https://office.mizito.ir`)},
  {
    label: 'CodeServer',
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
  // Avoid infinite loop if backend fails, limit retries or just use a flag
  // Original had while(true), keeping logic but adding safety is good, but let's stick to original logic
  // to avoid breaking behavior if it depends on it (e.g. waiting for user creation).
  // Actually, I'll keep it as is.
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
      credentials: 'omit'
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
const DEFAULT_TOP = 100 
const y = useLocalStorage<number>('devToolsPos', DEFAULT_TOP)
const panelRef = ref<HTMLElement | null>(null)

const dragging = ref(false)
let startClientY = 0
let startTop = 0

const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max)

const onPointerDown = (e: PointerEvent) => {
  if (e.pointerType === 'mouse' && e.button !== 0) return
  // Don't drag if clicking buttons inside the header? 
  // Added .stop to buttons container in template to prevent this.

  const el = panelRef.value
  if (!el) return

  dragging.value = true
  startClientY = e.clientY
  startTop = y.value

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
// --- keyboard shortcut ---
const onKeydown = (e: KeyboardEvent) => {
  const t = e.target as HTMLElement | null
  const tag = t?.tagName?.toLowerCase()
  const isTypingTarget =
      tag === 'input' || tag === 'textarea' || (t as HTMLElement | null)?.isContentEditable

  if (isTypingTarget) return

  const isD = e.key.toLowerCase() === 'd'
  if (e.ctrlKey && e.shiftKey && isD) {
    e.preventDefault()
    // If pinned, we might not want to close it? Or just toggle.
    // Original toggles isOpen.
    isOpen.value = !isOpen.value
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
@keyframes slide-in-left {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
.animate-slide-in-left {
  animation: slide-in-left 0.2s ease-out;
}
</style>
