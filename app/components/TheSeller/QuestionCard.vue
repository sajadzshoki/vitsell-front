<template>
  <div class="bg-muted border border-muted rounded-2xl p-4">
    <div class="flex items-start gap-3">
      <NuxtLink
        :to="`/product/${question.productId}`"
        class="shrink-0 cursor-pointer"
      >
        <img
          v-if="product.image"
          :src="resolveMediaUrl(product.image)"
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

        <div
          v-if="editingQuestion"
          class="mt-2 space-y-2"
        >
          <UTextarea
            v-model="questionDraft"
            :rows="2"
            autoresize
            class="w-full"
          />
          <div class="flex justify-end gap-2">
            <UButton
              color="neutral"
              variant="ghost"
              size="xs"
              class="cursor-pointer"
              @click="editingQuestion = false"
            >
              {{ $t('انصراف') }}
            </UButton>
            <UButton
              color="primary"
              size="xs"
              class="cursor-pointer"
              :loading="savingQuestion"
              @click="saveQuestionText"
            >
              {{ $t('ذخیره') }}
            </UButton>
          </div>
        </div>
        <p
          v-else
          class="text-sm font-medium text-highlighted leading-6 mt-2"
        >
          {{ question.question }}
        </p>

        <NuxtLink
          :to="`/product/${question.productId}`"
          class="text-[11px] text-muted hover:text-primary transition-all  line-clamp-1 mt-1 cursor-pointer"
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
          <div
            v-if="editingAnswer"
            class="space-y-2"
          >
            <UTextarea
              v-model="answerDraft"
              :rows="2"
              autoresize
              class="w-full"
            />
            <div class="flex justify-end gap-2">
              <UButton
                color="neutral"
                variant="ghost"
                size="xs"
                class="cursor-pointer"
                @click="editingAnswer = false"
              >
                {{ $t('انصراف') }}
              </UButton>
              <UButton
                color="primary"
                size="xs"
                class="cursor-pointer"
                :loading="savingAnswer"
                @click="saveAnswerText"
              >
                {{ $t('ذخیره') }}
              </UButton>
            </div>
          </div>
          <template v-else>
            {{ question.answer.text }}
          </template>
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
              class="font-medium cursor-pointer"
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
            color="neutral"
            variant="ghost"
            size="xs"
            icon="i-tabler-edit"
            class="cursor-pointer"
            @click="startEditQuestion"
          >
            {{ $t('ویرایش پرسش') }}
          </UButton>
          <UButton
            v-if="question.answer"
            type="button"
            color="neutral"
            variant="ghost"
            size="xs"
            icon="i-tabler-edit"
            class="cursor-pointer"
            @click="startEditAnswer"
          >
            {{ $t('ویرایش پاسخ') }}
          </UButton>
          <UButton
            type="button"
            :color="question.verified ? 'neutral' : 'success'"
            variant="ghost"
            size="xs"
            :icon="question.verified ? 'i-tabler-user-off' : 'i-tabler-user-check'"
            class="cursor-pointer"
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
            icon="i-tabler-trash"
            class="cursor-pointer"
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
            class="cursor-pointer"
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
const { replyToQuestion, clearAnswer, setVerified, updateQuestion } = useSellerQuestions()

const product = computed(() => resolveProduct(props.question.productId))
const draft = ref('')
const sending = ref(false)

const editingQuestion = ref(false)
const questionDraft = ref('')
const savingQuestion = ref(false)

const editingAnswer = ref(false)
const answerDraft = ref('')
const savingAnswer = ref(false)

function startEditQuestion() {
  questionDraft.value = props.question.question
  editingQuestion.value = true
}

function startEditAnswer() {
  answerDraft.value = props.question.answer?.text || ''
  editingAnswer.value = true
}

async function saveQuestionText() {
  const text = questionDraft.value.trim()
  if (text.length < 10) {
    toast.error(t('متن پرسش باید حداقل ۱۰ کاراکتر باشد'))
    return
  }
  savingQuestion.value = true
  try {
    const result = await updateQuestion(props.question.id, { question: text })
    if (!result.ok) {
      toast.error(t(result.error))
      return
    }
    editingQuestion.value = false
    toast.success(t('پرسش ویرایش شد'))
  }
  finally {
    savingQuestion.value = false
  }
}

async function saveAnswerText() {
  const text = answerDraft.value.trim()
  if (text.length < 2) {
    toast.error(t('متن پاسخ کوتاه است'))
    return
  }
  savingAnswer.value = true
  try {
    const result = await updateQuestion(props.question.id, { answerText: text })
    if (!result.ok) {
      toast.error(t(result.error))
      return
    }
    editingAnswer.value = false
    toast.success(t('پاسخ ویرایش شد'))
  }
  finally {
    savingAnswer.value = false
  }
}

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
