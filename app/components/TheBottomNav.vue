<template>
  <nav
    v-if="items.length"
    class="md:hidden fixed inset-x-0 bottom-0 z-40 bg-default/95 backdrop-blur-md border-t border-muted pb-[env(safe-area-inset-bottom)]"
    :aria-label="$t('ناوبری پایین')"
  >
    <ul
      class="grid h-16 max-w-8xl mx-auto"
      :style="{ gridTemplateColumns: `repeat(${Math.max(items.length, 1)}, minmax(0, 1fr))` }"
    >
      <li
        v-for="item in items"
        :key="item.id"
        class="min-w-0"
      >
        <NuxtLink
          v-if="item.to"
          :to="item.to"
          class="relative size-full flex flex-col items-center justify-center gap-0.5 transition-all  no-underline"
          :class="isActive(item)
            ? 'text-primary font-semibold'
            : 'text-toned hover:text-primary'"
        >
          <span class="relative inline-flex">
            <img
              v-if="isSellerAdminIconImage(iconFor(item))"
              :src="resolveMediaUrl(iconFor(item))"
              alt=""
              class="size-5 object-contain"
              :class="item.badge === 'cart' && cartAnimating ? 'animate-cart-bump' : ''"
            >
            <UIcon
              v-else
              :name="resolveSellerAdminIconName(iconFor(item))"
              class="size-5"
              :class="[
                isActive(item) ? 'text-primary' : '',
                item.badge === 'cart' && cartAnimating ? 'animate-cart-bump' : '',
              ]"
            />
            <span
              v-if="item.badge === 'cart' && cartCount > 0"
              class="absolute -top-1.5 -end-2.5 min-w-4 h-4 px-1 rounded-full bg-primary text-inverted text-[9px] font-bold grid place-items-center num"
              :class="cartAnimating ? 'animate-cart-bump' : ''"
            >
              {{ cartCount }}
            </span>
          </span>
          <span
            class="text-[10px] truncate max-w-full px-1"
            :class="isActive(item) ? 'text-primary font-semibold' : 'font-medium'"
          >
            {{ $t(item.label) }}
          </span>
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import type { BottomNavItem } from '~/data/nav-links'
import {
  isSellerAdminIconImage,
  resolveSellerAdminIconName,
} from '~/data/seller-admin-icons'
import { resolveMediaUrl } from '~/composables/fetch'

const route = useRoute()
const { cartCount, cartBump, isLoggedIn, ensureCartLoaded } = useShop()
const { publicBottomLinks, fetchNavigation } = useSellerNavigation()
await fetchNavigation({ force: false, admin: false })

function isAccountItem(item: BottomNavItem) {
  return item.id === 'account' || item.to === '/account' || item.to === '/login'
}

const items = computed(() =>
  publicBottomLinks.value.map((item) => {
    if (!isAccountItem(item)) return item
    return {
      ...item,
      to: isLoggedIn.value ? '/account' : '/login',
    }
  }),
)

const cartAnimating = ref(false)
let bumpTimer: ReturnType<typeof setTimeout> | undefined

onMounted(() => {
  if (isLoggedIn.value) void ensureCartLoaded()
})

watch(isLoggedIn, (loggedIn) => {
  if (loggedIn) void ensureCartLoaded()
})

watch(cartBump, () => {
  cartAnimating.value = false
  nextTick(() => {
    cartAnimating.value = true
    if (bumpTimer) clearTimeout(bumpTimer)
    bumpTimer = setTimeout(() => {
      cartAnimating.value = false
    }, 450)
  })
})

onBeforeUnmount(() => {
  if (bumpTimer) clearTimeout(bumpTimer)
})

function iconFor(item: BottomNavItem) {
  return isActive(item) ? (item.iconActive || item.icon) : item.icon
}

function isActive(item: BottomNavItem) {
  if (!item.to) return false
  if (item.to === '/') return route.path === '/'
  if (item.id === 'categories' || item.to === '/category') {
    return route.path === '/category' || route.path.startsWith('/category/')
  }
  return route.path === item.to || route.path.startsWith(`${item.to}/`)
}
</script>
