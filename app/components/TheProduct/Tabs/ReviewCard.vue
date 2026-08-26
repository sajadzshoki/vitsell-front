<template>
  <article class="rounded-2xl border border-muted bg-default p-4 md:p-5">
    <div class="flex items-start justify-between gap-3 mb-3">
      <div class="flex items-center gap-2.5 min-w-0">
        <UAvatar
          :alt="review.name"
          size="md"
          :ui="{ root: 'bg-primary text-inverted font-bold shrink-0' }"
          :text="review.name[0]"
        />
        <div class="min-w-0">
          <div class="font-medium text-highlighted text-sm truncate">
            {{ review.name }}
          </div>
          <div class="flex items-center gap-2 flex-wrap mt-0.5">
            <UBadge
              v-if="review.verified"
              color="success"
              variant="soft"
              size="xs"
            >
              {{ $t('خریدار تأیید شده') }}
            </UBadge>
            <span class="text-[11px] text-dimmed num">{{ review.date }}</span>
          </div>
        </div>
      </div>
      <div class="flex gap-0.5 shrink-0">
        <UIcon
          v-for="star in 5"
          :key="star"
          name="i-tabler-star-filled"
          class="size-3.5"
          :class="star <= review.rating ? 'text-warning' : 'text-accented'"
        />
      </div>
    </div>

    <p class="text-sm text-toned leading-7">
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

    <div class="flex items-center justify-between mt-4 pt-3 border-t border-muted">
      <div class="flex items-center gap-3">
        <UButton
          variant="ghost"
          color="neutral"
          size="xs"
          class="text-muted"
        >
          <UIcon name="i-tabler-thumb-up" class="size-4" />
          {{ $t('مفید بود') }}
          <span class="num">({{ review.helpfulCount.toLocaleString('fa-IR') }})</span>
        </UButton>
      </div>
      <UBadge
        v-if="review.hasImage"
        color="info"
        variant="soft"
        size="xs"
      >
        {{ $t('دارای تصویر') }}
      </UBadge>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { ProductReview } from '~/data/product-detail'

defineProps<{
  review: ProductReview
}>()
</script>
