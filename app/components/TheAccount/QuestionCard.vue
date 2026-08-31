<template>
  <article class="rounded-2xl border border-muted bg-default p-4 md:p-5">
    <div class="flex items-start gap-3 mb-3">
      <NuxtLink
        :to="`/product/${question.productId}`"
        class="shrink-0"
      >
        <img
          v-if="question.productImage"
          :src="question.productImage"
          :alt="question.productTitle"
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
            :to="`/product/${question.productId}`"
            class="text-sm font-medium text-highlighted hover:text-primary transition line-clamp-2 no-underline"
          >
            {{ question.productTitle }}
          </NuxtLink>
          <span class="text-[11px] text-dimmed num shrink-0">{{ question.date }}</span>
        </div>
        <div class="flex items-center gap-2 mt-1.5 flex-wrap">
          <UBadge
            v-if="question.verified"
            color="success"
            variant="soft"
            size="xs"
          >
            {{ $t('خریدار تأیید شده') }}
          </UBadge>
          <UBadge
            v-if="question.answer"
            color="success"
            variant="soft"
            size="xs"
          >
            {{ $t('پاسخ داده شده') }}
          </UBadge>
          <UBadge
            v-else
            color="warning"
            variant="soft"
            size="xs"
          >
            {{ $t('در انتظار پاسخ') }}
          </UBadge>
        </div>
      </div>
    </div>

    <div class="flex items-start gap-2">
      <span class="size-7 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0 mt-0.5">
        <UIcon name="i-tabler-message-question" class="size-4" />
      </span>
      <p class="text-sm font-bold text-highlighted leading-7">
        {{ $t(question.question) }}
      </p>
    </div>

    <div
      v-if="question.answer"
      class="mt-3 rounded-xl border p-3.5 ms-0 sm:ms-9"
      :class="question.answer.role === 'seller'
        ? 'bg-primary/5 border-primary/15'
        : 'bg-success/10 border-success/20'"
    >
      <div class="flex items-center gap-2 mb-1.5 flex-wrap">
        <UIcon
          name="i-tabler-circle-check-filled"
          class="size-4 shrink-0"
          :class="question.answer.role === 'seller' ? 'text-primary' : 'text-success'"
        />
        <span
          class="text-xs font-bold"
          :class="question.answer.role === 'seller' ? 'text-primary' : 'text-success'"
        >
          {{ question.answer.author }}
        </span>
        <UBadge
          :color="question.answer.role === 'seller' ? 'primary' : 'success'"
          variant="soft"
          size="xs"
        >
          {{ question.answer.role === 'seller' ? $t('پاسخ فروشنده') : $t('پشتیبانی') }}
        </UBadge>
        <span class="text-[11px] text-dimmed num ms-auto">{{ question.answer.date }}</span>
      </div>
      <p class="text-sm text-toned leading-7">
        {{ $t(question.answer.text) }}
      </p>
    </div>

    <div
      v-else
      class="mt-3 flex items-center gap-2 text-xs text-muted ms-0 sm:ms-9"
    >
      <UIcon name="i-tabler-clock" class="size-3.5 shrink-0" />
      <span>{{ $t('هنوز پاسخی برای این پرسش ثبت نشده است') }}</span>
    </div>

    <div class="flex justify-end mt-4 pt-3 border-t border-muted">
      <UButton
        :to="`/product/${question.productId}`"
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
import type { AccountMyQuestion } from '~/data/account-reviews'

defineProps<{
  question: AccountMyQuestion
}>()
</script>
