<template>
  <div
    class="overflow-hidden transition-[max-height,opacity] duration-300 ease-out border-t border-muted"
    :class="collapsed
      ? 'max-h-0 opacity-0 pointer-events-none border-t-0'
      : 'max-h-12 opacity-100'"
  >
    <nav
      class="mx-auto max-w-8xl px-3 sm:px-4 lg:px-6 h-11 flex items-center justify-between gap-4"
      :aria-label="$t('لینک‌های سریع')"
    >
      <ul class="flex items-center gap-1 sm:gap-2 md:gap-4 lg:gap-6 min-w-0 overflow-x-auto scrollbar-none">
        <li
          v-for="link in links"
          :key="link.id"
          class="shrink-0"
        >
          <NuxtLink
            v-if="link.to"
            :to="link.to"
            class="inline-flex items-center gap-1.5 text-xs md:text-sm text-toned hover:text-primary transition whitespace-nowrap py-1"
          >
            <UIcon
              v-if="link.icon"
              :name="`i-tabler-${link.icon}`"
              class="size-4 shrink-0"
            />
            <span>{{ $t(link.label) }}</span>
            <UBadge
              v-if="link.badge"
              color="primary"
              variant="subtle"
              size="sm"
              class="ms-0.5"
            >
              {{ $t(link.badge) }}
            </UBadge>
          </NuxtLink>
        </li>
      </ul>

      <NuxtLink
        v-if="seller.to"
        :to="seller.to"
        class="shrink-0 text-xs md:text-sm font-medium text-primary hover:text-primary/80 transition whitespace-nowrap"
      >
        {{ $t(seller.label) }}
      </NuxtLink>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { navQuickLinks, navSellerLink } from '~/data/nav-links'

const links = navQuickLinks
const seller = navSellerLink

const { y } = useWindowScroll()
const collapsed = computed(() => y.value > 48)
</script>
