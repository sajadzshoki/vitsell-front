<template>
  <div class="bg-default border border-muted rounded-2xl p-4 pl-0 ">
    <div class="flex items-center gap-3 pb-4 border-b border-muted pl-4">
      <div
        class="size-14 rounded-2xl account-avatar-gradient text-inverted grid place-items-center text-xl font-bold shrink-0"
      >
        {{ shopInitial }}
      </div>
      <div class="flex-1 min-w-0">
        <div class="text-sm font-bold text-highlighted truncate">
          {{ shop.name }}
        </div>
        <div class="text-[11px] text-muted truncate">
          {{ $t(shop.city || '') }} · {{ $t('امتیاز') }}
          <span class="num">{{ shop.rating.toLocaleString('fa-IR') }}</span>
        </div>
      </div>
    </div>

    <nav class="mt-3 pt-3 space-y-4 max-h-[calc(100dvh-12rem)] overflow-y-auto scrollbar-thin pe-1 pl-4 ">
      <div
        v-for="group in visibleGroups"
        :key="group.id"
      >
        <div
          v-if="group.label && group.id !== 'overview'"
          class="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-dimmed"
        >
          {{ $t(group.label) }}
        </div>
        <div class="space-y-1">
          <template
            v-for="item in group.items"
            :key="item.id"
          >
            <NuxtLink
              v-if="item.to && !item.disabled && !item.comingSoon"
              :to="item.to"
              class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all  text-start cursor-pointer"
              :class="isActive(item.to)
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-toned hover:bg-elevated'"
            >
              <UIcon
                :name="item.icon"
                class="size-5 shrink-0"
              />
              <span class="flex-1">{{ $t(item.label) }}</span>
              <UBadge
                v-if="item.id === 'orders' && newOrdersCount > 0"
                color="error"
                variant="solid"
                size="xs"
                class="num"
              >
                {{ newOrdersCount.toLocaleString('fa-IR') }}
              </UBadge>
              <UBadge
                v-else-if="item.id === 'questions' && unansweredQuestions > 0"
                color="error"
                variant="solid"
                size="xs"
                class="num"
              >
                {{ unansweredQuestions.toLocaleString('fa-IR') }}
              </UBadge>
              <UBadge
                v-else-if="item.id === 'reviews' && unansweredReviews > 0"
                color="error"
                variant="solid"
                size="xs"
                class="num"
              >
                {{ unansweredReviews.toLocaleString('fa-IR') }}
              </UBadge>
              <UIcon
                v-if="isActive(item.to)"
                name="i-tabler-chevron-left"
                class="size-4 shrink-0"
              />
            </NuxtLink>
            <div
              v-else
              class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-start opacity-55 cursor-not-allowed select-none"
              :title="$t('به‌زودی')"
            >
              <UIcon
                :name="item.icon"
                class="size-5 shrink-0 text-dimmed"
              />
              <span class="flex-1 text-muted">{{ $t(item.label) }}</span>
              <UBadge
                color="neutral"
                variant="subtle"
                size="xs"
              >
                {{ $t('به‌زودی') }}
              </UBadge>
            </div>
          </template>
        </div>
      </div>

      <button
        type="button"
        class="w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-all  text-start border-t border-muted mt-3 pt-3 cursor-pointer rounded-xl hover:bg-elevated"
        :aria-label="isDark ? $t('تغییر به حالت روشن') : $t('تغییر به حالت تاریک')"
        @click="toggleColorMode"
      >
        <UIcon
          :name="isDark ? 'i-tabler-moon-stars' : 'i-tabler-sun'"
          class="size-5 shrink-0 text-toned"
        />
        <span class="flex-1 text-toned">{{ isDark ? $t('حالت تاریک') : $t('حالت روشن') }}</span>
        <USwitch
          :model-value="isDark"
          color="primary"
          size="sm"
          class="shrink-0 pointer-events-none"
          checked-icon="i-tabler-moon"
          unchecked-icon="i-tabler-sun"
          tabindex="-1"
        />
      </button>

      <button
        type="button"
        class="!w-full flex items-center gap-3 px-3 py-2.5 text-sm text-muted hover:(bg-error/10 rounded-xl) transition-all  text-start border-t border-muted mt-1 pt-3 cursor-pointer"
        @click="onLogout"
      >
        <UIcon
          name="i-tabler-logout"
          class="size-5 shrink-0 text-error"
        />
        <span class="text-error text-nowrap">{{ $t('خروج از حساب') }}</span>
      </button>

      <div
        class="px-3 pt-2 pb-1 text-xs text-toned text-center tracking-wide select-none"
        :title="versionTitle"
      >
        {{ combinedVersion }}
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { sellerNavGroups, type SellerNavGroup } from '~/data/seller'
import { sellerNavPermissionMap } from '~/data/seller-permissions'

const route = useRoute()
const { requestLogout } = useAccountLogout()
const { shop, shopInitial, newOrdersCount, unansweredReviews } = useSeller()
const { unansweredCount: unansweredQuestions, ensureLoaded } = useSellerQuestions()
const { can } = useSellerPermissions()
const { isDark, toggle: toggleColorMode } = useColorModeTransition()
const { frontVersion, backVersion, combinedVersion, fetchBackVersion } = useAppVersion()

void ensureLoaded()
onMounted(() => {
  void fetchBackVersion()
})

const versionTitle = computed(() => {
  const front = frontVersion.value
  const back = backVersion.value || '…'
  return `front: ${front} · back: ${back}`
})

const visibleGroups = computed(() => {
  return sellerNavGroups
    .map((group): SellerNavGroup => ({
      ...group,
      items: group.items.filter((item) => {
        const permission = sellerNavPermissionMap[item.id]
        if (!permission) return true
        return can(permission)
      }),
    }))
    .filter(group => group.items.length > 0)
})

function isActive(to: string) {
  if (to === '/seller') {
    return route.path === '/seller' || route.path === '/seller/'
  }
  return route.path === to || route.path.startsWith(`${to}/`)
}

function onLogout() {
  requestLogout()
}
</script>
