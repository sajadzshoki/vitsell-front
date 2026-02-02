<template>
  <ClientOnly>
    <div
      ref="panelRef"
      class="fixed z-[9999] transition-all duration-300 ease-out font-sans select-none"
      :style="{
        top: `${y}px`,
        left: isOpen ? '24px' : '-12px',
        transform: isOpen ? 'none' : 'translateX(0)'
      }"
    >
      <!-- Collapsed State (Trigger) -->
      <Transition name="fade" mode="out-in">
        <div
          v-if="!isOpen"
          key="trigger"
          @click="isOpen = true"
          class="group flex items-center gap-2 bg-black/80 backdrop-blur-md border border-white/10 px-4 py-2 rounded-r-full shadow-lg cursor-pointer hover:bg-black/90 hover:border-white/20 transition-all hover:pl-6"
        >
          <div class="relative">
            <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <div class="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20"></div>
          </div>
          <span class="text-xs font-bold text-white tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-0 group-hover:w-auto overflow-hidden whitespace-nowrap">
            DEV TOOLS
          </span>
          <Icon name="i-heroicons-wrench-screwdriver" class="text-white/50 w-4 h-4 group-hover:text-white transition-colors" />
        </div>

        <!-- Expanded State (Panel) -->
        <div
          v-else
          key="panel"
          class="w-80 bg-black/85 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        >
          <!-- Header (Draggable) -->
        <div
          class="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/5 cursor-grab active:cursor-grabbing"
          @pointerdown="onPointerDown"
        >
          <div class="flex items-center gap-2">
            <Icon name="i-heroicons-command-line" class="text-green-400 w-4 h-4" />
            <span class="text-sm font-bold text-white tracking-wide">DevControl</span>
          </div>
          
          <div class="flex items-center gap-2">
             <button
              @click.stop="isPinned = !isPinned"
              @pointerdown.stop
              class="p-1.5 rounded-lg transition-colors"
              :class="isPinned ? 'bg-green-500/20 text-green-400' : 'hover:bg-white/10 text-white/40'"
              title="Pin Open"
            >
              <Icon name="i-heroicons-paper-clip" class="w-3.5 h-3.5 transform" :class="{ '-rotate-45': !isPinned }" />
            </button>
            <button
              @click.stop="isOpen = false"
              @pointerdown.stop
              class="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors"
            >
              <Icon name="i-heroicons-x-mark" class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Scrollable Content -->
        <div class="p-4 flex flex-col gap-5 overflow-y-auto max-h-[80vh] custom-scrollbar">
          
          <!-- User Profile Section -->
          <div class="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
            <img 
              v-if="userAvatar"
              :src="userAvatar" 
              class="w-10 h-10 rounded-full object-cover border border-white/10"
              alt="User Avatar"
            />
            <div 
              v-else
              class="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
              :class="userId ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white' : 'bg-white/10 text-white/30'"
            >
              {{ userId ? 'U' : '?' }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-xs font-medium text-white/50 uppercase tracking-wider">Current User</div>
              <div class="text-sm text-white font-semibold truncate">
                {{ userId ? `ID: ${userId}`.slice(0, 15) + '...' : 'Guest' }}
              </div>
            </div>
            <button 
              @click="LogInLogOut"
              class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              :class="userId ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'"
            >
              {{ userId ? 'Logout' : 'Login' }}
            </button>
          </div>

          <!-- Quick Stats Grid -->
          <div class="grid grid-cols-2 gap-2">
            <div 
              class="px-3 py-1 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-all cursor-pointer group"
              @click="switchUserType"
            >
              <div class="text-[10px] text-white/40 mb-1 group-hover:text-white/60">User Type</div>
              <div class="text-sm font-medium text-white flex items-center gap-1">
                {{ userType }}
                <Icon name="i-heroicons-arrows-right-left" class="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
             <div 
              class="px-3 py-1 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-all cursor-pointer group"
              @click="() => locale == 'en' ? setLocale('fa') : setLocale('en')"
            >
              <div class="text-[10px] text-white/40 mb-1 group-hover:text-white/60">Locale</div>
              <div class="text-sm font-medium text-white flex items-center gap-1">
                {{ locale.toUpperCase() }}
                <Icon name="i-heroicons-language" class="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="space-y-2">
            <div 
              class="flex items-center justify-between cursor-pointer group"
              @click="isQuickActionsOpen = !isQuickActionsOpen"
            >
              <div class="text-[10px] font-bold text-white/30 uppercase tracking-wider px-1 group-hover:text-white/50 transition-colors">Quick Actions</div>
              <Icon 
                name="i-heroicons-chevron-down" 
                class="w-3 h-3 text-white/20 transition-transform duration-200"
                :class="{ '-rotate-90': !isQuickActionsOpen }"
              />
            </div>
            
            <div 
              class="grid grid-cols-2 gap-2 transition-all duration-300 overflow-hidden"
              :class="isQuickActionsOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'"
            >
              <button
                v-for="btn in quickActions"
                :key="btn.label"
                @click="btn.func"
                class="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 transition-all text-left group"
              >
                <div class="w-1.5 h-1.5 rounded-full" :class="getVariantDot(btn.variant)"></div>
                <span class="text-xs text-white/70 group-hover:text-white truncate">{{ btn.label }}</span>
              </button>
            </div>
          </div>

           <!-- Navigation Links -->
          <div class="space-y-2">
            <div class="text-[10px] font-bold text-white/30 uppercase tracking-wider px-1">Navigation</div>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="link in navLinks"
                :key="link.label"
                @click="link.func"
                class="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 transition-all group w-full text-left"
              >
                <span class="text-xs text-white/60 group-hover:text-blue-300 transition-colors truncate">{{ link.label }}</span>
                <Icon name="i-heroicons-arrow-top-right-on-square" class="w-3 h-3 text-white/20 group-hover:text-blue-300 flex-shrink-0" />
              </button>
            </div>
          </div>

          <!-- Tools Input -->
          <div class="space-y-2">
             <div class="text-[10px] font-bold text-white/30 uppercase tracking-wider px-1">Simulation</div>
             <div class="relative">
                <input
                  v-model="phoneNumber"
                  type="text"
                  placeholder="Simulate Phone Number..."
                  class="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-green-500/50 transition-all font-mono"
                  dir="ltr"
                  @focus="isOpen = true"
                />
                <div class="absolute right-2 top-1/2 -translate-y-1/2">
                   <div v-if="loading" class="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                </div>
             </div>
          </div>

          <!-- Notes Component -->
          <div class="border-t border-white/10 pt-4">
             <TheDevToolsNewNotes v-model="isOpen" />
          </div>

        </div>
        
        <!-- Footer Info -->
         <div class="px-4 py-2 bg-white/5 border-t border-white/5 text-[10px] text-white/20 flex justify-between items-center">
            <span>Vista DevTools v2.0</span>
            <span class="font-mono">Ctrl+Shift+D</span>
         </div>
        </div>
      </Transition>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import TheDevToolsNewNotes from './Notes.vue'

// --- Logic & State ---
const userId = useCookie('userId')
const token = useCookie('token')
const phoneNumber = useLocalStorage('phoneNumber', '')
const userAvatar = useLocalStorage('userAvatar', '')
const showTheLog = useLocalStorage('showTheLog', true)
const isPinned = useLocalStorage('devToolsPinned', false)
const isQuickActionsOpen = useLocalStorage('devToolsQuickActionsOpen', true)

const wallet = await useWallets()
const increase_amount = 500000
const toast = useAppToast()
const isOpen = ref(false)
const route = useRoute()
const { locale, setLocale } = useI18n()

enum UserType {
  USER = 'user',
  PUBLISHER = 'publisher',
}

const userType = useLocalStorage<UserType>('userType', UserType.USER)
const loading = ref(false)

// --- Actions & Helpers ---
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
    userAvatar.value = ''
    loading.value = false
    toast.success('Logged Out')
    return
  }
  let didLogin = false
  while (true) {
    const { result }: any = await useGet(`/user?phoneNumber=${phone}`,{params:{'with-profile':true}})
    const id = result?.[0]?.id
    if (id) {
      userId.value = id
      userAvatar.value = result?.[0]?.profile?.avatar || ''
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
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const text = await res.text()
    await navigator.clipboard.writeText(text)
    toast.success('TS schema copied')
  } catch (err) {
    console.error(err)
    toast.error('Failed to copy schema')
  } finally {
    loading.value = false
  }
}

const increaseWalletBalance = async () => {
  loading.value = true
  if (!userId.value) await LogInLogOut()
  const result = await putWallet(wallet.value?.[0]?.id, { balance: { increment: increase_amount } })
  if (result) toast.success(`Wallet +${increase_amount}`)
  loading.value = false
}

const handleNav = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer')
}

// --- Buttons Configuration ---
type DevButton = {
  label: string
  func: () => void
  variant?: 'default' | 'success' | 'danger' | 'black' | 'blue'
}

const getVariantDot = (variant?: DevButton['variant']) => {
  switch (variant) {
    case 'success': return 'bg-green-400'
    case 'danger': return 'bg-red-500'
    case 'blue': return 'bg-blue-400'
    case 'black': return 'bg-white/40'
    default: return 'bg-white/20'
  }
}

// Split buttons into categories for better UI
const quickActions = computed<DevButton[]>(() => [
  {
    label: `Logs: ${showTheLog.value ? 'ON' : 'OFF'}`,
    func: () => (showTheLog.value = !showTheLog.value),
    variant: showTheLog.value ? 'success' : 'black',
  },
  { label: 'Clear Storage', variant: 'danger', func: DeleteLocalStorage },
  { label: '+ Wallet 500k', variant: 'success', func: increaseWalletBalance },
  { label: 'Copy Schema', variant: 'black', func: copyTsSchema },
  { label: 'Gen Models', variant: 'black', func: () => handleNav(`https://${APP_CODE}-back.vistatest.site/generate`) },
  { label: 'Set Models', variant: 'black', func: () => handleNav(`https://${APP_CODE}-back.vistatest.site/set-models`) },
  { label: 'Add Guest', variant: 'black', func: () => handleNav(`https://${APP_CODE}-back.vistatest.site/add-guest?force=true`) },
])

const navLinks = computed<DevButton[]>(() => [
  { label: 'Admin Panel', variant: 'blue', func: () => handleNav(`https://${APP_CODE}-admin.vistatest.site`) },
  { label: 'Gitlab vista', variant: 'blue', func: () => handleNav(`https://vistagit.com/${APP_CODE}/web`) },
  { label: 'Mizito Office', variant: 'blue', func: () => handleNav(`https://office.mizito.ir`) },
  { label: 'Code Server', variant: 'blue', func: () => handleNav(`https://prisma.vistatest.site/?folder=/app-data`) },
])


// --- Draggable Logic ---
const DEFAULT_TOP = 100
const y = useLocalStorage<number>('devToolsPosNew', DEFAULT_TOP)
const panelRef = ref<HTMLElement | null>(null)
const dragging = ref(false)
let startClientY = 0
let startTop = 0

const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max)

const onPointerDown = (e: PointerEvent) => {
  if (e.pointerType === 'mouse' && e.button !== 0) return
  const el = panelRef.value
  if (!el) return
  
  dragging.value = true
  startClientY = e.clientY
  startTop = y.value
  el.setPointerCapture?.(e.pointerId)
  
  window.addEventListener('pointermove', onPointerMove, { passive: false })
  window.addEventListener('pointerup', onPointerUp, { passive: true })
  window.addEventListener('pointercancel', onPointerUp, { passive: true })
}

const onPointerMove = (e: PointerEvent) => {
  if (!dragging.value) return
  e.preventDefault()
  const el = panelRef.value
  if (!el) return
  
  const viewportH = window.innerHeight
  const elH = el.offsetHeight
  const minTop = 10
  const maxTop = viewportH - elH - 10
  
  const dy = e.clientY - startClientY
  y.value = clamp(startTop + dy, minTop, maxTop)
}

const onPointerUp = () => {
  dragging.value = false
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('pointercancel', onPointerUp)
}

// --- Keyboard Shortcuts ---
const onKeydown = (e: KeyboardEvent) => {
  const t = e.target as HTMLElement | null
  const tag = t?.tagName?.toLowerCase()
  if (tag === 'input' || tag === 'textarea' || t?.isContentEditable) return

  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') {
    e.preventDefault()
    isOpen.value = !isOpen.value
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.9) translateX(-20px);
}
</style>
