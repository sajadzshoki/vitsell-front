<template>
  <nav class="bg-default border-t border-muted -mx-3 sm:-mx-4 mt-6">
    <template
      v-for="group in visibleGroups"
      :key="group.id"
    >
      <div
        v-if="group.label && group.id !== 'overview'"
        class="px-4 pt-4 pb-1 text-[10px] font-semibold text-dimmed"
      >
        {{ $t(group.label) }}
      </div>
      <template
        v-for="item in group.items"
        :key="item.id"
      >
        <NuxtLink
          v-if="item.to && !item.disabled && !item.comingSoon"
          :to="item.to"
          class="flex items-center gap-3 px-4 py-3.5 text-start border-b border-muted transition-all  hover:bg-muted/50 cursor-pointer"
        >
          <div class="size-9 rounded-xl grid place-items-center shrink-0 bg-primary/10 text-primary">
            <UIcon
              :name="item.icon"
              class="size-5"
            />
          </div>
          <span class="flex-1 text-sm text-default font-medium">{{ $t(item.label) }}</span>
          <UBadge
            v-if="badgeFor(item.id)"
            color="error"
            variant="solid"
            size="xs"
            class="num me-1"
          >
            {{ badgeFor(item.id) }}
          </UBadge>
          <UIcon
            name="i-tabler-chevron-left"
            class="size-4 text-dimmed shrink-0"
          />
        </NuxtLink>
        <div
          v-else
          class="flex items-center gap-3 px-4 py-3.5 text-start border-b border-muted opacity-55 cursor-not-allowed select-none"
        >
          <div class="size-9 rounded-xl grid place-items-center shrink-0 bg-muted text-dimmed">
            <UIcon
              :name="item.icon"
              class="size-5"
            />
          </div>
          <span class="flex-1 text-sm text-muted font-medium">{{ $t(item.label) }}</span>
          <UBadge
            color="neutral"
            variant="subtle"
            size="xs"
          >
            {{ $t('به‌زودی') }}
          </UBadge>
        </div>
      </template>
    </template>
  </nav>
</template>

<script setup lang="ts">
import { sellerNavGroups, type SellerNavGroup, type SellerTabId } from '~/data/seller'
import { sellerNavPermissionMap } from '~/data/seller-permissions'

const { newOrdersCount, unansweredReviews } = useSeller()
const { unansweredCount: unansweredQuestions, ensureLoaded } = useSellerQuestions()
const { can } = useSellerPermissions()

void ensureLoaded()

const visibleGroups = computed(() => {
  return sellerNavGroups
    .map((group): SellerNavGroup => ({
      ...group,
      items: group.items.filter((item) => {
        if (item.id === 'dashboard') return false
        const permission = sellerNavPermissionMap[item.id]
        if (!permission) return true
        return can(permission)
      }),
    }))
    .filter(group => group.items.length > 0)
})

function badgeFor(id: SellerTabId) {
  if (id === 'orders' && newOrdersCount.value > 0) {
    return newOrdersCount.value.toLocaleString('fa-IR')
  }
  if (id === 'reviews' && unansweredReviews.value > 0) {
    return unansweredReviews.value.toLocaleString('fa-IR')
  }
  if (id === 'questions' && unansweredQuestions.value > 0) {
    return unansweredQuestions.value.toLocaleString('fa-IR')
  }
  return undefined
}
</script>
