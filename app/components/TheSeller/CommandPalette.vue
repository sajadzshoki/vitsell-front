<template>
  <UModal
    v-model:open="open"
    :ui="{ content: 'sm:max-w-xl' }"
  >
    <template #content>
      <UCommandPalette
        v-model:search-term="searchTerm"
        :groups="groups"
        :placeholder="$t('جستجو در پنل...')"
        close
        class="h-96"
        @update:model-value="onSelect"
        @update:open="open = $event"
      />
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { CommandPaletteGroup, CommandPaletteItem } from '@nuxt/ui'
import { sellerNavGroups } from '~/data/seller'
import { sellerNavPermissionMap } from '~/data/seller-permissions'

type RecentItem = { label: string, to: string }

const open = useState('seller-command-palette-open', () => false)

const { can } = useSellerPermissions()
const { listings, orders, resolveProduct } = useSeller()
const { customers, ensureLoaded: ensureCustomers } = useSellerCustomers()
const { admins, ensureLoaded: ensureAdmins } = useSellerAdmins()

const searchTerm = ref('')
const recentSearches = useState<RecentItem[]>('seller-command-recent-v2', () => [])

void ensureCustomers()
ensureAdmins()

function pushRecent(label: string, to: string) {
  if (!to) return
  const next = [{ label, to }, ...recentSearches.value.filter(s => s.to !== to)].slice(0, 8)
  recentSearches.value = next
}

const navItems = computed(() => {
  const items: CommandPaletteItem[] = []
  for (const group of sellerNavGroups) {
    for (const item of group.items) {
      if (!item.to || item.comingSoon || item.disabled) continue
      const permission = sellerNavPermissionMap[item.id]
      if (permission && !can(permission)) continue
      items.push({
        id: `nav-${item.id}`,
        label: item.label,
        icon: item.icon,
        to: item.to,
      })
    }
  }
  return items
})

const groups = computed<CommandPaletteGroup[]>(() => {
  const result: CommandPaletteGroup[] = []

  if (recentSearches.value.length) {
    result.push({
      id: 'recent',
      label: 'جستجوهای اخیر',
      items: recentSearches.value.map(item => ({
        id: `recent-${item.to}`,
        label: item.label,
        icon: 'i-tabler-history',
        to: item.to,
      })),
    })
  }

  result.push({
    id: 'nav',
    label: 'ناوبری',
    items: navItems.value,
  })

  if (can('products.view')) {
    result.push({
      id: 'products',
      label: 'محصولات',
      items: listings.value.slice(0, 12).map((l) => {
        const product = resolveProduct(l.productId)
        return {
          id: `product-${l.productId}`,
          label: product?.title || l.productId,
          icon: 'i-tabler-package',
          to: `/seller/products/${l.productId}`,
          suffix: l.status,
        }
      }),
    })
  }

  if (can('orders.view')) {
    result.push({
      id: 'orders',
      label: 'سفارش‌ها',
      items: orders.value.slice(0, 12).map(o => ({
        id: `order-${o.id}`,
        label: o.id,
        icon: 'i-tabler-shopping-cart',
        to: `/seller/orders/${o.id}`,
        suffix: o.customerName,
      })),
    })
  }

  if (can('customers.view')) {
    result.push({
      id: 'customers',
      label: 'مشتریان',
      items: customers.value.slice(0, 12).map(c => ({
        id: `customer-${c.id}`,
        label: `${c.firstName} ${c.lastName}`.trim(),
        icon: 'i-tabler-user',
        to: `/seller/customers/${c.id}`,
        suffix: c.phone,
      })),
    })
  }

  if (can('admins.view')) {
    result.push({
      id: 'admins',
      label: 'ادمین‌ها',
      items: admins.value.slice(0, 12).map(a => ({
        id: `admin-${a.id}`,
        label: `${a.firstName} ${a.lastName}`.trim(),
        icon: 'i-tabler-user-shield',
        to: `/seller/admins/${a.id}`,
        suffix: a.email,
      })),
    })
  }

  return result.filter(g => (g.items?.length ?? 0) > 0)
})

async function onSelect(item: CommandPaletteItem | CommandPaletteItem[] | null | undefined) {
  const selected = Array.isArray(item) ? item[0] : item
  if (!selected) return
  open.value = false
  searchTerm.value = ''
  if (selected.to) {
    pushRecent(String(selected.label || selected.to), String(selected.to))
    await navigateTo(selected.to)
  }
}

function onKeydown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    open.value = !open.value
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>
