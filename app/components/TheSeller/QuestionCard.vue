<template>
  <div class="bg-muted border border-muted rounded-2xl p-4">
    <div class="flex items-start gap-3">
      <NuxtLink
        :to="`/product/${question.productId}`"
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
          <div class="flex items-center gap-2 flex-wrap min-w-0">
            <div class="text-sm font-bold text-highlighted">
              {{ question.name }}
            </div>
            <UBadge
              v-if="question.verified"
              color="success"
              variant="soft"
              size="xs"
            >
              {{ $t('خریدار تأیید شده') }}
            </UBadge>
            <UBadge
              v-else
              color="neutral"
              variant="soft"
              size="xs"
            >
              {{ $t('تأیید نشده') }}
            </UBadge>
          </div>
          <div class="text-[11px] text-muted num">
            {{ question.date }}
          </div>
        </div>

        <p class="text-sm font-medium text-highlighted leading-6 mt-2">
          {{ question.question }}
        </p>

        <NuxtLink
          :to="`/product/${question.productId}`"
          class="text-[11px] text-muted hover:text-primary transition line-clamp-1 mt-1"
        >
          {{ product.title }}
        </NuxtLink>

        <div
          v-if="question.answer"
          class="mt-3 p-3 rounded-xl bg-success/10 border border-success/20 text-sm text-toned leading-6"
        >
          <div class="flex items-center justify-between gap-2 flex-wrap mb-1">
            <div class="text-[11px] font-medium text-success">
              {{ question.answer.author }}
            </div>
            <div class="text-[11px] text-muted num">
              {{ question.answer.date }}
            </div>
          </div>
          {{ question.answer.text }}
        </div>

        <div
          v-else
          class="mt-3 flex flex-col gap-2"
        >
          <UFormField :label="$t('پاسخ')">
            <UTextarea
              v-model="draft"
              :rows="2"
              autoresize
              class="w-full"
              :placeholder="$t('پاسخ خود را بنویسید')"
            />
          </UFormField>
          <div class="flex justify-end">
            <UButton
              color="primary"
              size="md"
              class="font-medium"
              :disabled="!draft.trim()"
              :loading="sending"
              @click="onReply"
            >
              {{ $t('ارسال پاسخ') }}
            </UButton>
          </div>
        </div>

        <div class="mt-3 flex items-center gap-2 flex-wrap">
          <UButton
            type="button"
            :color="question.verified ? 'neutral' : 'success'"
            variant="ghost"
            size="xs"
            :icon="question.verified ? 'i-tabler-user-off' : 'i-tabler-user-check'"
            @click="onToggleVerified"
          >
            {{ question.verified ? $t('لغو تأیید خریدار') : $t('تأیید خریدار') }}
          </UButton>
          <UButton
            v-if="question.answer"
            type="button"
            color="warning"
            variant="ghost"
            size="xs"
            icon="i-tabler-pencil"
            @click="onClearAnswer"
          >
            {{ $t('حذف پاسخ') }}
          </UButton>
          <UButton
            type="button"
            color="error"
            variant="ghost"
            size="xs"
            icon="i-tabler-trash"
            @click="emit('delete', question)"
          >
            {{ $t('حذف پرسش') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SellerProductQuestion } from '~/data/seller-questions'

const props = defineProps<{
  question: SellerProductQuestion
}>()

const emit = defineEmits<{
  delete: [question: SellerProductQuestion]
}>()

const { t } = useI18n()
const toast = useAppToast()
const { resolveProduct } = useSeller()
const { replyToQuestion, clearAnswer, setVerified } = useSellerQuestions()

const product = computed(() => resolveProduct(props.question.productId))
const draft = ref('')
const sending = ref(false)

async function onReply() {
  const text = draft.value.trim()
  if (!text) return
  sending.value = true
  try {
    const result = await replyToQuestion(props.question.id, text)
    if (!result.ok) {
      toast.error(t(result.error))
      return
    }
    draft.value = ''
    toast.success(t('پاسخ ثبت شد'))
  }
  finally {
    sending.value = false
  }
}

async function onToggleVerified() {
  const next = !props.question.verified
  const result = await setVerified(props.question.id, next)
  if (!result.ok) {
    toast.error(t(result.error))
    return
  }
  toast.success(next ? t('خریدار تأیید شد') : t('تأیید خریدار برداشته شد'))
}

async function onClearAnswer() {
  const result = await clearAnswer(props.question.id)
  if (!result.ok) {
    toast.error(t(result.error))
    return
  }
  toast.success(t('پاسخ حذف شد'))
}
</script>
