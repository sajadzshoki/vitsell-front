<template>
  <UModal
    v-model:open="open"
    :title="$t('پرسیدن سؤال جدید')"
    :description="$t('سؤال خود را درباره این محصول بپرسید')"
    :ui="{ content: 'sm:max-w-lg' }"
  >
    <template #body>
      <form
        class="space-y-4"
        @submit.prevent="onSubmit"
      >
        <UFormField
          :label="$t('سؤال شما')"
          required
          :error="errors.question || undefined"
          :ui="{ label: 'text-sm', error: 'text-[11px] text-error mt-1' }"
        >
          <UTextarea
            v-model="form.question"
            :rows="4"
            size="xl"
            :placeholder="$t('مثلاً آیا گارانتی رسمی دارد؟')"
            class="w-full"
            :ui="textareaUi"
            @update:model-value="errors.question = ''"
          />
        </UFormField>

        <p class="text-[11px] text-dimmed leading-6">
          {{ $t('سؤال شما پس از بررسی نمایش داده می‌شود و کارشناسان به آن پاسخ می‌دهند.') }}
        </p>
      </form>
    </template>

    <template #footer>
      <div class="flex items-center gap-2 w-full justify-end">
        <UButton
          color="neutral"
          variant="outline"
          @click="open = false"
        >
          {{ $t('انصراف') }}
        </UButton>
        <UButton
          color="primary"
          class="font-bold"
          :loading="submitting"
          @click="onSubmit"
        >
          {{ $t('ثبت سؤال') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { Product } from '~/data/products'

const props = defineProps<{
  product: Product
}>()

const open = defineModel<boolean>('open', { default: false })

const { t } = useI18n()
const toast = useAppToast()
const { addQuestion } = useProductDetail(() => props.product)

const form = reactive({
  question: '',
})

const errors = reactive({
  question: '',
})

const submitting = ref(false)

const textareaUi = {
  base: 'rounded-xl border border-default bg-default focus:border-primary',
}

watch(open, (value) => {
  if (!value) {
    form.question = ''
    errors.question = ''
  }
})

function validate() {
  errors.question = ''
  if (form.question.trim().length < 10) {
    errors.question = t('سؤال باید حداقل ۱۰ کاراکتر باشد')
    return false
  }
  return true
}

async function onSubmit() {
  if (!validate()) return

  submitting.value = true
  try {
    const ok = await addQuestion({ question: form.question })
    if (!ok) {
      toast.error(t('ثبت سؤال ناموفق بود'))
      return
    }
    toast.success(t('سؤال شما ثبت شد'))
    open.value = false
  }
  finally {
    submitting.value = false
  }
}
</script>
