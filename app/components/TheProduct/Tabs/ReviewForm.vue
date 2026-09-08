<template>
  <UModal
    v-model:open="open"
    :title="$t('ثبت دیدگاه')"
    :description="$t('تجربه خرید خود را با دیگران به اشتراک بگذارید')"
    :ui="{ content: 'sm:max-w-xl' }"
  >
    <template #body>
      <form
        class="space-y-5"
        @submit.prevent="onSubmit"
      >
        <div>
          <p class="text-sm font-medium text-default mb-3">
            {{ $t('امتیاز شما') }}
            <span class="text-error">*</span>
          </p>
          <div class="flex items-center gap-1.5">
            <button
              v-for="star in 5"
              :key="star"
              type="button"
              class="size-10 rounded-xl grid place-items-center transition-all  cursor-pointer hover:bg-warning/10"
              :aria-label="`${star}`"
              @click="form.rating = star"
            >
              <UIcon
                name="i-tabler-star-filled"
                class="size-7 transition"
                :class="star <= form.rating ? 'text-warning' : 'text-accented'"
              />
            </button>
            <span
              v-if="form.rating"
              class="text-xs text-muted ms-2"
            >
              {{ $t(ratingLabels[form.rating - 1]!) }}
            </span>
          </div>
          <p
            v-if="errors.rating"
            class="text-[11px] text-error mt-1.5"
          >
            {{ errors.rating }}
          </p>
        </div>

        <UFormField
          :label="$t('متن دیدگاه')"
          required
          :error="errors.text || undefined"
          :ui="{ label: 'text-sm', error: 'text-[11px] text-error mt-1' }"
        >
          <UTextarea
            v-model="form.text"
            :rows="4"
            size="xl"
            :placeholder="$t('نظر خود را درباره این محصول بنویسید...')"
            class="w-full"
            :ui="textareaUi"
            @update:model-value="errors.text = ''"
          />
        </UFormField>

        <div>
          <div class="flex items-center justify-between gap-2 mb-2">
            <p class="text-sm font-medium text-default">
              {{ $t('تصاویر') }}
              <span class="text-dimmed font-normal text-xs">({{ $t('اختیاری') }})</span>
            </p>
            <span class="text-[11px] text-dimmed num">
              {{ form.images.length.toLocaleString('fa-IR') }}
              /
              {{ MAX_IMAGES.toLocaleString('fa-IR') }}
            </span>
          </div>

          <input
            ref="fileInput"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            class="sr-only"
            @change="onFileChange"
          >

          <div class="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
            <button
              type="button"
              class="size-20 shrink-0 rounded-xl border border-dashed border-muted bg-muted/40 grid place-items-center transition-all  cursor-pointer hover:(border-primary/50 bg-primary/5) disabled:(opacity-50 cursor-not-allowed)"
              :disabled="uploading || form.images.length >= MAX_IMAGES"
              :aria-label="$t('افزودن تصویر')"
              @click="openPicker"
            >
              <UIcon
                :name="uploading ? 'i-tabler-loader-2' : 'i-tabler-camera-plus'"
                class="size-6 text-primary"
                :class="uploading && 'animate-spin'"
              />
            </button>

            <div
              v-for="(src, index) in form.images"
              :key="`${src}-${index}`"
              class="relative size-20 shrink-0 rounded-xl overflow-hidden border border-muted bg-muted"
            >
              <img
                :src="mediaSrc(src)"
                :alt="$t('تصویر دیدگاه')"
                class="size-full object-cover"
                loading="lazy"
                decoding="async"
              >
              <button
                type="button"
                class="absolute top-1 end-1 size-6 rounded-full bg-inverted/70 text-inverted grid place-items-center cursor-pointer"
                :aria-label="$t('حذف تصویر')"
                @click="removeImage(index)"
              >
                <UIcon name="i-tabler-x" class="size-3.5" />
              </button>
            </div>
          </div>

          <p class="text-[11px] text-dimmed mt-2 leading-5">
            {{ $t('JPG، PNG یا WebP — هر فایل حداکثر ۲ مگابایت') }}
          </p>
        </div>

        <div>
          <p class="text-sm font-medium text-default mb-2">
            {{ $t('نقاط قوت') }}
            <span class="text-dimmed font-normal text-xs">({{ $t('اختیاری') }})</span>
          </p>
          <div class="flex items-center gap-2">
            <div class="flex-1 flex items-center gap-2 rounded-xl border border-default bg-default h-11 px-3.5 focus-within:border-primary transition">
              <UIcon name="i-tabler-plus" class="size-4 text-success shrink-0" />
              <input
                v-model="prosDraft"
                type="text"
                class="flex-1 min-w-0 h-full bg-transparent border-0 outline-none text-sm text-default placeholder:text-dimmed"
                :placeholder="$t('مثلاً کیفیت ساخت')"
                @keydown.enter.prevent="addChip('pros')"
              >
            </div>
            <UButton
              type="button"
              color="neutral"
              variant="soft"
              size="md"
              class="shrink-0"
              @click="addChip('pros')"
            >
              {{ $t('افزودن') }}
            </UButton>
          </div>
          <div
            v-if="form.pros.length"
            class="flex flex-wrap gap-1.5 mt-2"
          >
            <UBadge
              v-for="(item, i) in form.pros"
              :key="`pro-${i}`"
              color="success"
              variant="soft"
              size="md"
              class="gap-1 cursor-pointer"
              @click="form.pros.splice(i, 1)"
            >
              {{ item }}
              <UIcon name="i-tabler-x" class="size-3" />
            </UBadge>
          </div>
        </div>

        <div>
          <p class="text-sm font-medium text-default mb-2">
            {{ $t('نقاط ضعف') }}
            <span class="text-dimmed font-normal text-xs">({{ $t('اختیاری') }})</span>
          </p>
          <div class="flex items-center gap-2">
            <div class="flex-1 flex items-center gap-2 rounded-xl border border-default bg-default h-11 px-3.5 focus-within:border-primary transition">
              <UIcon name="i-tabler-minus" class="size-4 text-error shrink-0" />
              <input
                v-model="consDraft"
                type="text"
                class="flex-1 min-w-0 h-full bg-transparent border-0 outline-none text-sm text-default placeholder:text-dimmed"
                :placeholder="$t('مثلاً قیمت بالا')"
                @keydown.enter.prevent="addChip('cons')"
              >
            </div>
            <UButton
              type="button"
              color="neutral"
              variant="soft"
              size="md"
              class="shrink-0"
              @click="addChip('cons')"
            >
              {{ $t('افزودن') }}
            </UButton>
          </div>
          <div
            v-if="form.cons.length"
            class="flex flex-wrap gap-1.5 mt-2"
          >
            <UBadge
              v-for="(item, i) in form.cons"
              :key="`con-${i}`"
              color="error"
              variant="soft"
              size="md"
              class="gap-1 cursor-pointer"
              @click="form.cons.splice(i, 1)"
            >
              {{ item }}
              <UIcon name="i-tabler-x" class="size-3" />
            </UBadge>
          </div>
        </div>

        <div class="flex items-center justify-between gap-3 rounded-xl border border-muted bg-muted/30 px-4 py-3">
          <span class="text-sm text-toned">
            {{ $t('خرید این محصول را پیشنهاد می‌کنم') }}
          </span>
          <USwitch
            v-model="form.recommend"
            color="success"
          />
        </div>
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
          :loading="submitting || uploading"
          :disabled="uploading"
          @click="onSubmit"
        >
          {{ $t('ثبت دیدگاه') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { Product } from '~/data/products'

const MAX_IMAGES = 5
const MAX_IMAGE_BYTES = 2 * 1024 * 1024

const props = defineProps<{
  product: Product
}>()

const open = defineModel<boolean>('open', { default: false })

const { t } = useI18n()
const toast = useAppToast()
const { addReview } = useProductDetail(() => props.product)

const ratingLabels = ['خیلی بد', 'بد', 'متوسط', 'خوب', 'عالی'] as const

const form = reactive({
  rating: 0,
  text: '',
  pros: [] as string[],
  cons: [] as string[],
  images: [] as string[],
  recommend: true,
})

const errors = reactive({
  rating: '',
  text: '',
})

const prosDraft = ref('')
const consDraft = ref('')
const submitting = ref(false)
const uploading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const textareaUi = {
  base: 'rounded-xl border border-default bg-default focus:border-primary',
}

watch(open, (value) => {
  if (!value) resetForm()
})

function resetForm() {
  form.rating = 0
  form.text = ''
  form.pros = []
  form.cons = []
  form.images = []
  form.recommend = true
  prosDraft.value = ''
  consDraft.value = ''
  errors.rating = ''
  errors.text = ''
  uploading.value = false
  if (fileInput.value) fileInput.value.value = ''
}

function mediaSrc(url: string) {
  return resolveMediaUrl(url) || url
}

function openPicker() {
  if (uploading.value || form.images.length >= MAX_IMAGES) return
  fileInput.value?.click()
}

function removeImage(index: number) {
  form.images.splice(index, 1)
}

async function uploadOne(file: File): Promise<string | null> {
  if (!file.type.startsWith('image/')) {
    toast.error(t('فقط فایل تصویری مجاز است'))
    return null
  }
  if (file.size > MAX_IMAGE_BYTES) {
    toast.error(t('حداکثر حجم هر تصویر ۲ مگابایت است'))
    return null
  }

  const body = new FormData()
  body.append('file', file)
  const { result, error } = await usePost<{ url: string }, FormData>(
    '/upload',
    body,
    { headers: { 'no-error': true } },
  )
  if (error || !result?.url) {
    toast.error(t('آپلود تصویر ناموفق بود'))
    return null
  }
  return result.url
}

async function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const files = [...(input.files ?? [])]
  input.value = ''
  if (!files.length) return

  const remaining = MAX_IMAGES - form.images.length
  if (remaining <= 0) {
    toast.error(t('حداکثر ۵ تصویر می‌توانید اضافه کنید'))
    return
  }

  const selected = files.slice(0, remaining)
  if (files.length > remaining) {
    toast.error(t('حداکثر ۵ تصویر می‌توانید اضافه کنید'))
  }

  uploading.value = true
  try {
    for (const file of selected) {
      const url = await uploadOne(file)
      if (url) form.images.push(url)
    }
  }
  finally {
    uploading.value = false
  }
}

function addChip(kind: 'pros' | 'cons') {
  const draft = kind === 'pros' ? prosDraft : consDraft
  const value = draft.value.trim()
  if (!value) return
  if (form[kind].includes(value)) {
    draft.value = ''
    return
  }
  form[kind].push(value)
  draft.value = ''
}

function validate() {
  errors.rating = ''
  errors.text = ''
  let valid = true

  if (form.rating < 1 || form.rating > 5) {
    errors.rating = t('امتیاز را انتخاب کنید')
    valid = false
  }

  if (form.text.trim().length < 10) {
    errors.text = t('دیدگاه باید حداقل ۱۰ کاراکتر باشد')
    valid = false
  }

  return valid
}

async function onSubmit() {
  if (uploading.value) return
  if (!validate()) return

  submitting.value = true
  try {
    const ok = await addReview({
      rating: form.rating,
      text: form.text,
      pros: form.pros,
      cons: form.cons,
      recommend: form.recommend,
      images: form.images.length ? [...form.images] : undefined,
    })

    if (!ok) {
      toast.error(t('ثبت دیدگاه ناموفق بود'))
      return
    }

    toast.success(t('دیدگاه شما با موفقیت ثبت شد'))
    open.value = false
  }
  finally {
    submitting.value = false
  }
}
</script>
