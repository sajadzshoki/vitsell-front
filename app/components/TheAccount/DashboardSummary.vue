<template>
  <section class="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
    <!-- Wallet snapshot -->
    <NuxtLink
      to="/account/wallet"
      class="relative overflow-hidden rounded-2xl bg-primary p-4 sm:p-5 text-inverted [--ui-text-inverted:white] transition-all  hover:brightness-105 cursor-pointer"
    >
      <div class="relative z-10 flex flex-col h-full min-h-[140px]">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="flex items-center gap-1.5 text-inverted/80 text-xs">
              <UIcon
                name="i-tabler-wallet"
                class="size-3.5 shrink-0"
              />
              <span>{{ $t('موجودی کیف پول') }}</span>
            </div>
            <div class="mt-2 flex items-baseline gap-1.5 flex-wrap">
              <span class="text-2xl sm:text-3xl font-black num tracking-tight leading-none">
                {{ formatPrice(summary.balance) }}
              </span>
              <span class="text-xs font-medium text-inverted/75">{{ $t('تومان') }}</span>
            </div>
          </div>
          <div class="size-10 rounded-xl bg-default/15 grid place-items-center shrink-0">
            <UIcon
              name="i-tabler-coin"
              class="size-5"
            />
          </div>
        </div>

        <div class="mt-auto pt-4 flex items-center justify-between gap-3 flex-wrap">
          <div class="text-[11px] text-inverted/70">
            <span v-if="summary.pendingWithdraw > 0">
              {{ $t('در انتظار برداشت') }}:
              <span class="num font-bold text-inverted">{{ formatPrice(summary.pendingWithdraw) }}</span>
            </span>
            <span v-else>
              {{ $t('شارژ این ماه') }}:
              <span class="num font-bold text-inverted">{{ formatPrice(summary.monthTopup) }}</span>
            </span>
          </div>
          <span class="inline-flex items-center gap-1 text-xs font-semibold text-inverted/90">
            {{ $t('مدیریت کیف پول') }}
            <UIcon
              name="i-tabler-chevron-left"
              class="size-3.5"
            />
          </span>
        </div>
      </div>

      <UIcon
        name="i-tabler-circles"
        class="absolute -end-8 -bottom-10 size-36 text-inverted/10 pointer-events-none"
      />
    </NuxtLink>

    <!-- Tips / alerts -->
    <div class="rounded-2xl border border-muted bg-default p-4 sm:p-5 flex flex-col min-h-[140px]">
      <div class="flex items-center justify-between gap-3 mb-3">
        <h3 class="font-bold text-highlighted">{{ $t('پیشنهادهای مفید') }}</h3>
        <UBadge
          v-if="tips.length"
          color="primary"
          variant="soft"
          size="xs"
          class="num"
        >
          {{ tips.length.toLocaleString('fa-IR') }}
        </UBadge>
      </div>

      <div
        v-if="tips.length === 0"
        class="flex-1 flex flex-col items-center justify-center text-center py-4"
      >
        <UIcon
          name="i-tabler-circle-check"
          class="size-10 text-success mb-2"
        />
        <p class="text-sm text-muted">{{ $t('حساب شما به‌روز است') }}</p>
      </div>

      <ul
        v-else
        class="space-y-2.5 flex-1"
      >
        <li
          v-for="tip in tips"
          :key="tip.id"
        >
          <NuxtLink
            :to="tip.to"
            class="flex items-start gap-3 rounded-xl border border-muted bg-muted/40 p-3 transition-all  hover:(border-primary/25 bg-primary/5) cursor-pointer"
          >
            <div
              class="size-9 rounded-xl grid place-items-center shrink-0"
              :class="tip.iconWrap"
            >
              <UIcon
                :name="tip.icon"
                class="size-4.5"
              />
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-sm font-medium text-highlighted">
                {{ $t(tip.title) }}
              </div>
              <p class="text-[11px] text-muted mt-0.5 leading-5 line-clamp-2">
                {{ $t(tip.description) }}
              </p>
            </div>
            <span class="text-[11px] text-primary font-medium shrink-0 hidden sm:inline mt-0.5">
              {{ $t(tip.actionLabel) }}
            </span>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import { formatPrice } from '~/data/products'
import { buildAccountDashboardTips } from '~/data/account-dashboard'

const { profile, activeOrdersCount } = useAccount()
const { summary } = useAccountWallet()
const { unansweredQuestions } = useAccountReviews()
const { wishlistCount } = useShop()
const checkoutStore = useCheckoutStore()

const tips = computed(() => buildAccountDashboardTips({
  hasEmail: Boolean(profile.value.email?.trim()),
  hasPassword: Boolean(profile.value.hasPassword),
  addressCount: checkoutStore.addresses.length,
  activeOrdersCount: activeOrdersCount.value,
  unansweredQuestions: unansweredQuestions.value,
  wishlistCount: wishlistCount.value,
}))
</script>
