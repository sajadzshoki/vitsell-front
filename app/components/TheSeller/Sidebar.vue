<template>
  <div class="bg-default border border-muted rounded-2xl p-5">
    <div class="flex items-center gap-3 pb-4 border-b border-muted">
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

    <!-- <ThePanelSwitch class="mt-4" /> -->

    <nav class="mt-3 pt-3  space-y-1">
      <NuxtLink
        v-for="item in sellerNavItems"
        :key="item.id"
        :to="item.to"
        class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition text-start"
        :class="isActive(item.to)
          ? 'bg-primary/10 text-primary font-medium'
          : 'text-toned hover:bg-elevated'"
      >
        <UIcon :name="item.icon" class="size-5 shrink-0" />
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
        <UIcon
          v-if="isActive(item.to)"
          name="i-tabler-chevron-left"
          class="size-4 shrink-0"
        />
      </NuxtLink>

      <button
        type="button"
        class="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-muted hover:(bg-error/10 rounded-xl) transition text-start border-t border-muted mt-3 pt-3"
        @click="onLogout"
      >
        <UIcon name="i-tabler-logout" class="size-5 shrink-0 text-error" />
        <span class="text-error">{{ $t('خروج از حساب') }}</span>
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { sellerNavItems } from '~/data/seller'

const route = useRoute()
const { requestLogout } = useAccountLogout()
const { shop, shopInitial, newOrdersCount } = useSeller()
const { unansweredCount: unansweredQuestions, ensureLoaded } = useSellerQuestions()

void ensureLoaded()

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
