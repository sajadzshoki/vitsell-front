<template>
  <div class="space-y-5 md:space-y-6">
    <div class="rounded-2xl border border-muted bg-muted/30 p-4 md:p-5 flex flex-col sm:(flex-row items-center) gap-4">
      <div class="flex items-start gap-3 flex-1 min-w-0">
        <div class="size-11 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
          <UIcon name="i-tabler-help-circle" class="size-5" />
        </div>
        <div class="min-w-0">
          <h3 class="text-sm font-bold text-highlighted">
            {{ $t('سؤال خود را بپرسید') }}
          </h3>
          <p class="text-xs text-muted leading-6 mt-1">
            <span class="num font-bold text-highlighted">{{ questions.length.toLocaleString('fa-IR') }}</span>
            {{ $t('سؤال درباره این محصول') }}
            — {{ $t('پاسخ کارشناسان را ببینید یا سؤال جدید بپرسید.') }}
          </p>
        </div>
      </div>
      <UButton
        color="primary"
        size="md"
        class="font-bold shrink-0 w-full sm:w-auto"
        trailing-icon="i-tabler-message-question"
        @click="openQuestionForm"
      >
        {{ $t('پرسیدن سؤال جدید') }}
      </UButton>
    </div>

    <TheProductTabsQuestionForm
      v-model:open="questionFormOpen"
      :product="product"
    />

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

        <div
          v-else
          class="rounded-xl bg-muted/40 border border-dashed border-muted p-3 ms-0 md:ms-10"
        >
          <p class="text-xs text-muted">
            {{ $t('در انتظار پاسخ کارشناسان') }}
          </p>
        </div>
      </article>

      <div
        v-if="questions.length === 0"
        class="text-center py-10"
      >
        <UIcon name="i-tabler-help-circle" class="size-12 text-dimmed mx-auto mb-3" />
        <p class="text-sm text-muted">{{ $t('هنوز سؤالی ثبت نشده است') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/data/products'

const props = defineProps<{
  product: Product
}>()

const { questions, requireAuth } = useProductDetail(() => props.product)

const questionFormOpen = ref(false)

function openQuestionForm() {
  if (!requireAuth()) return
  questionFormOpen.value = true
}
</script>
