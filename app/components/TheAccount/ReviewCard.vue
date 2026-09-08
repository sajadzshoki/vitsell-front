<template>
  <article class="rounded-2xl border border-muted bg-default p-4 md:p-5">
    <div class="flex items-start gap-3">
      <NuxtLink
        :to="`/product/${review.productId}`"
        class="shrink-0"
      >
        <img
          v-if="review.productImage"
          :src="review.productImage"
          :alt="review.productTitle"
          class="size-14 rounded-xl object-cover bg-muted"
          loading="lazy"
        >
        <div
          v-else
          class="size-14 rounded-xl bg-muted grid place-items-center"
        >
          <TheIcon
            icon-type="img"
            name="noImage.png"
            class="size-7 opacity-60"
          />
        </div>
      </NuxtLink>

      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-2 flex-wrap">
          <NuxtLink
            :to="`/product/${review.productId}`"
            class="text-sm font-medium text-highlighted hover:text-primary transition-all  line-clamp-2 no-underline"
          >
            {{ review.productTitle }}
          </NuxtLink>
          <span class="text-[11px] text-dimmed num shrink-0">{{ review.date }}</span>
        </div>

        <div class="flex items-center gap-2 mt-1.5 flex-wrap">
          <div class="flex gap-0.5">
            <UIcon
              v-for="star in 5"
              :key="star"
              name="i-tabler-star-filled"
              class="size-3.5"
              :class="star <= review.rating ? 'text-warning' : 'text-accented'"
            />
          </div>
          <UBadge
            v-if="review.verified"
            color="success"
            variant="soft"
            size="xs"
          >
            {{ $t('خریدار تأیید شده') }}
          </UBadge>
        </div>
      </div>
    </div>

    <p class="text-sm text-toned leading-7 mt-3">
      {{ $t(review.text) }}
    </p>

    <div
      v-if="review.pros?.length || review.cons?.length"
      class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2"
    >
      <div
        v-if="review.pros?.length"
        class="rounded-xl bg-success/10 p-3"
      >
        <div class="text-[11px] font-bold text-success mb-1.5">
          {{ $t('نقاط قوت') }}
        </div>
        <ul class="space-y-1">
          <li
            v-for="(item, i) in review.pros"
            :key="i"
            class="text-xs text-toned flex items-start gap-1.5"
          >
            <UIcon name="i-tabler-plus" class="size-3.5 text-success shrink-0 mt-0.5" />
            {{ $t(item) }}
          </li>
        </ul>
      </div>
      <div
        v-if="review.cons?.length"
        class="rounded-xl bg-error/10 p-3"
      >
        <div class="text-[11px] font-bold text-error mb-1.5">
          {{ $t('نقاط ضعف') }}
        </div>
        <ul class="space-y-1">
          <li
            v-for="(item, i) in review.cons"
            :key="i"
            class="text-xs text-toned flex items-start gap-1.5"
          >
            <UIcon name="i-tabler-minus" class="size-3.5 text-error shrink-0 mt-0.5" />
            {{ $t(item) }}
          </li>
        </ul>
      </div>
    </div>

    <div
      v-if="review.replies.length"
      class="mt-4 space-y-2"
    >
      <div
        v-for="reply in review.replies"
        :key="reply.id"
        class="rounded-xl border p-3.5"
        :class="reply.role === 'seller'
          ? 'bg-primary/5 border-primary/15'
          : 'bg-muted/60 border-muted'"
      >
        <div class="flex items-center gap-2 mb-1.5 flex-wrap">
          <UIcon
            :name="reply.role === 'seller' ? 'i-tabler-building-store' : 'i-tabler-headset'"
            class="size-3.5 shrink-0"
            :class="reply.role === 'seller' ? 'text-primary' : 'text-toned'"
          />
          <span
            class="text-xs font-bold"
            :class="reply.role === 'seller' ? 'text-primary' : 'text-highlighted'"
          >
            {{ reply.author }}
          </span>
          <UBadge
            :color="reply.role === 'seller' ? 'primary' : 'neutral'"
            variant="soft"
            size="xs"
          >
            {{ reply.role === 'seller' ? $t('پاسخ فروشنده') : $t('پشتیبانی') }}
          </UBadge>
          <span class="text-[11px] text-dimmed num ms-auto">{{ reply.date }}</span>
        </div>
        <p class="text-sm text-toned leading-7">
          {{ $t(reply.text) }}
        </p>
      </div>
    </div>

    <div
      v-else
      class="mt-4 flex items-center gap-2 text-xs text-muted"
    >
      <UIcon name="i-tabler-clock" class="size-3.5 shrink-0" />
      <span>{{ $t('هنوز پاسخی ثبت نشده است') }}</span>
    </div>

    <div class="flex items-center justify-between mt-4 pt-3 border-t border-muted">
      <span class="text-[11px] text-muted flex items-center gap-1">
        <UIcon name="i-tabler-thumb-up" class="size-3.5" />
        <span class="num">{{ review.helpfulCount.toLocaleString('fa-IR') }}</span>
        {{ $t('نفر این نظر را مفید دانستند') }}
      </span>
      <UButton
        :to="`/product/${review.productId}`"
        variant="ghost"
        color="primary"
        size="xs"
        trailing-icon="i-tabler-chevron-left"
      >
        {{ $t('مشاهده محصول') }}
      </UButton>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { AccountMyReview } from '~/data/account-reviews'

defineProps<{
  review: AccountMyReview
}>()
</script>
