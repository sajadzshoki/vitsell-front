<template>
  <div class="bg-muted border border-muted rounded-2xl p-4">
    <div class="flex items-start gap-3">
      <NuxtLink
        :to="`/product/${review.productId}`"
        class="shrink-0"
      >
        <img
          v-if="product.image"
          :src="product.image"
          :alt="product.title"
          class="size-12 rounded-xl object-cover bg-default"
        >
        <div
          v-else
          class="size-12 rounded-xl bg-elevated grid place-items-center"
        >
          <TheIcon
            icon-type="img"
            name="noImage.png"
            class="size-6 opacity-60"
          />
        </div>
      </NuxtLink>

      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-2 flex-wrap">
          <div class="text-sm font-bold text-highlighted">{{ review.name }}</div>
          <div class="text-[11px] text-muted num">{{ review.date }}</div>
        </div>
        <div class="flex items-center gap-0.5 mt-1">
          <UIcon
            v-for="star in 5"
            :key="star"
            name="i-tabler-star-filled"
            class="size-3.5"
            :class="star <= review.rating ? 'text-warning' : 'text-dimmed'"
          />
        </div>
        <p class="text-sm text-toned leading-6 mt-2">
          {{ review.text }}
        </p>
        <NuxtLink
          :to="`/product/${review.productId}`"
          class="text-[11px] text-muted hover:text-primary transition line-clamp-1 mt-1"
        >
          {{ product.title }}
        </NuxtLink>

        <div
          v-if="review.reply"
          class="mt-3 p-3 rounded-xl bg-default border border-muted text-sm text-toned leading-6"
        >
          <div class="text-[11px] font-medium text-primary mb-1">
            {{ $t('پاسخ فروشنده') }}
            <span class="text-muted font-normal"> · {{ $t('قابل‌نمایش برای مشتری') }}</span>
          </div>
          {{ review.reply }}
        </div>

        <div
          v-else-if="can('reviews.moderate')"
          class="mt-3 flex flex-col sm:(flex-row items-end) gap-2"
        >
          <TheFormInput
            v-model="draft"
            :placeholder="$t('پاسخ خود را بنویسید')"
            class="flex-1 w-full"
          />
          <UButton
            color="primary"
            size="md"
            class="font-medium shrink-0 cursor-pointer"
            :disabled="!draft.trim()"
            :loading="sending"
            @click="onReply"
          >
            {{ $t('ارسال پاسخ') }}
          </UButton>
        </div>

        <div
          v-if="can('reviews.moderate') || can('reviews.delete')"
          class="mt-3 flex items-center gap-2 flex-wrap"
        >
          <UBadge
            v-if="moderation"
            :color="moderation === 'approved' ? 'success' : moderation === 'rejected' ? 'error' : 'warning'"
            variant="subtle"
            size="xs"
          >
            {{ moderationLabel }}
          </UBadge>
          <UButton
            v-if="can('reviews.moderate')"
            type="button"
            color="success"
            variant="ghost"
            size="xs"
            class="cursor-pointer"
            @click="emit('moderate', { id: review.id, status: 'approved' })"
          >
            {{ $t('تأیید') }}
          </UButton>
          <UButton
            v-if="can('reviews.moderate')"
            type="button"
            color="error"
            variant="ghost"
            size="xs"
            class="cursor-pointer"
            @click="emit('moderate', { id: review.id, status: 'rejected' })"
          >
            {{ $t('رد') }}
          </UButton>
          <UButton
            v-if="can('reviews.moderate')"
            type="button"
            color="neutral"
            variant="ghost"
            size="xs"
            class="cursor-pointer"
            @click="emit('moderate', { id: review.id, status: 'hidden' })"
          >
            {{ $t('مخفی') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SellerReview } from '~/data/seller'

const props = defineProps<{
  review: SellerReview
  moderation?: 'pending' | 'approved' | 'rejected' | 'hidden'
}>()

const emit = defineEmits<{
  moderate: [{ id: string, status: 'pending' | 'approved' | 'rejected' | 'hidden' }]
  replied: []
}>()

const { t } = useI18n()
const toast = useAppToast()
const { resolveProduct } = useSeller()
const { reply } = useSellerReviews()
const { can } = useSellerPermissions()

const product = computed(() => resolveProduct(props.review.productId))
const draft = ref('')
const sending = ref(false)

const moderationLabel = computed(() => {
  if (props.moderation === 'pending') return t('در انتظار')
  if (props.moderation === 'rejected') return t('ردشده')
  if (props.moderation === 'hidden') return t('مخفی')
  return t('تأییدشده')
})

async function onReply() {
  const text = draft.value.trim()
  if (!text) return
  sending.value = true
  try {
    const result = await reply(props.review.id, text)
    if (!result.ok) {
      toast.error(t(result.error))
      return
    }
    draft.value = ''
    toast.success(t('پاسخ ثبت شد'))
    emit('replied')
  }
  finally {
    sending.value = false
  }
}
</script>
