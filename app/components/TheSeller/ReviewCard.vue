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
          </div>
          {{ review.reply }}
        </div>

        <div
          v-else
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
            class="font-medium shrink-0"
            :disabled="!draft.trim()"
            @click="onReply"
          >
            {{ $t('ارسال پاسخ') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SellerReview } from '~/data/seller'
import { getProductById } from '~/data/products'

const props = defineProps<{
  review: SellerReview
}>()

const { t } = useI18n()
const toast = useAppToast()
const { replyToReview } = useSeller()

const product = computed(() => getProductById(props.review.productId))
const draft = ref('')

function onReply() {
  const text = draft.value.trim()
  if (!text) return
  replyToReview(props.review.id, text)
  draft.value = ''
  toast.success(t('پاسخ ثبت شد'))
}
</script>
