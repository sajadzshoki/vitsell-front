<template>
  <div class="space-y-5 md:space-y-6">
    <div class="flex items-center justify-between gap-3 flex-wrap">
      <p class="text-sm text-muted">
        <span class="num font-bold text-highlighted">{{ questions.length.toLocaleString('fa-IR') }}</span>
        {{ $t('سؤال درباره این محصول') }}
      </p>
      <UButton
        color="neutral"
        variant="solid"
        size="md"
        class="font-medium"
      >
        {{ $t('پرسیدن سؤال جدید') }}
      </UButton>
    </div>

    <div class="space-y-4">
      <article
        v-for="item in questions"
        :key="item.id"
        class="rounded-2xl border border-muted bg-default p-4 md:p-5"
      >
        <div class="flex items-start gap-2.5 mb-3">
          <UAvatar
            :alt="item.name"
            size="sm"
            :ui="{ root: 'bg-elevated text-toned font-bold shrink-0' }"
            :text="item.name[0]"
          />
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-sm font-medium text-highlighted">{{ item.name }}</span>
              <UBadge
                v-if="item.verified"
                color="success"
                variant="soft"
                size="xs"
              >
                {{ $t('خریدار تأیید شده') }}
              </UBadge>
              <span class="text-[11px] text-dimmed num">{{ item.date }}</span>
            </div>
            <p class="text-sm font-bold text-highlighted mt-2 leading-7">
              {{ $t(item.question) }}
            </p>
          </div>
        </div>

        <div
          v-if="item.answer"
          class="rounded-xl bg-success/10 border border-success/20 p-4 ms-0 md:ms-10"
        >
          <div class="flex items-center gap-2 mb-2">
            <UIcon name="i-tabler-circle-check-filled" class="size-4 text-success shrink-0" />
            <span class="text-xs font-bold text-success">{{ item.answer.author }}</span>
            <span class="text-[11px] text-dimmed num">{{ item.answer.date }}</span>
          </div>
          <p class="text-sm text-toned leading-7">
            {{ $t(item.answer.text) }}
          </p>
          <div class="flex items-center gap-3 mt-4 pt-3 border-t border-success/20 flex-wrap">
            <span class="text-[11px] text-muted">{{ $t('آیا این پاسخ مفید بود؟') }}</span>
            <UButton
              variant="ghost"
              color="neutral"
              size="xs"
            >
              {{ $t('مفید بود') }}
              <span class="num">({{ item.answer.helpfulYes.toLocaleString('fa-IR') }})</span>
            </UButton>
            <UButton
              variant="ghost"
              color="neutral"
              size="xs"
            >
              {{ $t('مفید نبود') }}
              <span class="num">({{ item.answer.helpfulNo.toLocaleString('fa-IR') }})</span>
            </UButton>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/data/products'
import { getProductQuestions } from '~/data/product-detail'

const props = defineProps<{
  product: Product
}>()

const questions = computed(() => getProductQuestions(props.product))
</script>
