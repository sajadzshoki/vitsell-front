<template>
  <nav class="bg-default border-t border-muted -mx-3 sm:-mx-4 mt-6">
    <NuxtLink
      v-for="item in menuItems"
      :key="item.to"
      :to="item.to"
      class="flex items-center gap-3 px-4 py-3.5 text-start border-b border-muted last:border-b-0 transition hover:bg-muted/50"
    >
      <div class="size-9 rounded-xl grid place-items-center shrink-0 bg-primary/10 text-primary">
        <UIcon :name="item.icon" class="size-5" />
      </div>
      <span class="flex-1 text-sm text-default font-medium">{{ $t(item.label) }}</span>
      <UBadge
        v-if="item.badge"
        color="error"
        variant="solid"
        size="xs"
        class="num me-1"
      >
        {{ item.badge }}
      </UBadge>
      <UIcon name="i-tabler-chevron-left" class="size-4 text-dimmed shrink-0" />
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
import { sellerNavItems } from '~/data/seller'

const { newOrdersCount, unansweredReviews } = useSeller()
const { unansweredCount: unansweredQuestions, ensureLoaded } = useSellerQuestions()

void ensureLoaded()

const menuItems = computed(() =>
  sellerNavItems
    .filter(item => item.id !== 'dashboard')
    .map((item) => {
      let badge: string | undefined
      if (item.id === 'orders' && newOrdersCount.value > 0) {
        badge = newOrdersCount.value.toLocaleString('fa-IR')
      }
      if (item.id === 'reviews' && unansweredReviews.value > 0) {
        badge = unansweredReviews.value.toLocaleString('fa-IR')
      }
      if (item.id === 'questions' && unansweredQuestions.value > 0) {
        badge = unansweredQuestions.value.toLocaleString('fa-IR')
      }
      return {
        label: item.label,
        icon: item.icon,
        to: item.to,
        badge,
      }
    }),
)
</script>
