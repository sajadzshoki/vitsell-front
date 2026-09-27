<template>
  <UModal
    v-model:open="open"
    :title="$t('مرجوع کردن سفارش')"
    :description="$t('کالاها را انتخاب کنید، دلیل را بنویسید و در صورت نیاز عکس اضافه کنید.')"
  >
    <template #body>
      <div class="space-y-4">
        <UCheckbox
          :model-value="allSelected"
          :label="$t('کل سفارش')"
          class="cursor-pointer"
          @update:model-value="toggleAll"
        />

        <div class="space-y-2">
          <div
            v-for="line in drafts"
            :key="line.key"
            class="flex items-center gap-3 rounded-xl border border-muted bg-muted/40 p-3"
          >
            <UCheckbox
              v-model="line.selected"
              class="cursor-pointer"
            />
            <img
              v-if="line.image"
              :src="line.image"
              :alt="line.title"
              class="size-12 rounded-lg object-cover bg-muted shrink-0"
            >
            <div
              v-else
              class="size-12 rounded-lg bg-muted grid place-items-center shrink-0"
            >
              <TheIcon
                icon-type="img"
                name="noImage.png"
                class="size-6 opacity-60"
              />
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-sm font-medium text-default line-clamp-2">
                {{ line.title }}
              </div>
              <div
                v-if="line.variantLabel"
                class="text-[11px] text-muted mt-0.5"
              >
                {{ line.variantLabel }}
              </div>
            </div>
            <div
              v-if="line.maxQty > 1"
              class="flex items-center gap-1 shrink-0"
            >
              <UButton
                type="button"
                color="neutral"
                variant="soft"
                size="xs"
                icon="i-tabler-minus"
                class="cursor-pointer"
                :disabled="!line.selected || line.qty <= 1"
                @click="line.qty = Math.max(1, line.qty - 1)"
              />
              <span class="num w-6 text-center text-sm font-medium">{{ line.qty.toLocaleString('fa-IR') }}</span>
              <UButton
                type="button"
                color="neutral"
                variant="soft"
                size="xs"
                icon="i-tabler-plus"
                class="cursor-pointer"
                :disabled="!line.selected || line.qty >= line.maxQty"
                @click="line.qty = Math.min(line.maxQty, line.qty + 1)"
              />
            </div>
            <span
              v-else
              class="text-xs text-muted num shrink-0"
            >
              {{ line.maxQty.toLocaleString('fa-IR') }} {{ $t('عدد') }}
            </span>
          </div>
        </div>

        <UFormField
          :label="$t('دلیل مرجوعی')"
          required
          :error="reasonError"
        >
          <UTextarea
            v-model="reason"
            :rows="3"
            class="w-full"
            :placeholder="$t('چرا می‌خواهید این کالا را مرجوع کنید؟')"
            @update:model-value="reasonError = ''"
          />
        </UFormField>

        <div>
          <div class="flex items-center justify-between gap-2 mb-2">
            <p class="text-sm font-medium text-default">
              {{ $t('تصاویر') }}
              <span class="text-dimmed font-normal text-xs">({{ $t('اختیاری') }})</span>
            </p>
            <span class="text-[11px] text-dimmed num">
              {{ photos.length.toLocaleString('fa-IR') }} / {{ maxImages.toLocaleString('fa-IR') }}
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
          <div class="flex gap-2 overflow-x-auto">
            <button
              type="button"
              class="size-16 shrink-0 rounded-xl border border-dashed border-muted bg-muted/40 grid place-items-center cursor-pointer hover:(border-primary/50 bg-primary/5) disabled:(opacity-50 cursor-not-allowed)"
              :disabled="uploading || photos.length >= maxImages"
              :aria-label="$t('افزودن تصویر')"
              @click="fileInput?.click()"
            >
              <UIcon
                :name="uploading ? 'i-tabler-loader-2' : 'i-tabler-camera-plus'"
                class="size-5 text-primary"
                :class="uploading ? 'animate-spin' : ''"
              />
            </button>
            <div
              v-for="(url, index) in photos"
              :key="url"
              class="relative size-16 shrink-0"
            >
              <img
                :src="mediaSrc(url)"
                alt=""
                class="size-16 rounded-xl object-cover border border-muted"
              >
              <button
                type="button"
                class="absolute -top-1 -end-1 size-5 rounded-full bg-error text-inverted grid place-items-center cursor-pointer"
                :aria-label="$t('حذف تصویر')"
                @click="photos.splice(index, 1)"
              >
                <UIcon name="i-tabler-x" class="size-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex items-center justify-end gap-2 w-full">
        <UButton
          color="neutral"
          variant="outline"
          class="cursor-pointer"
          @click="open = false"
        >
          {{ $t('انصراف') }}
        </UButton>
        <UButton
          color="primary"
          class="font-bold cursor-pointer"
          :loading="saving || uploading"
          @click="submit"
        >
          {{ $t('ثبت درخواست مرجوعی') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  orderId: string
  lines: {
    key: string
    productId: string
    variantId?: string | null
    variantLabel?: string
    title: string
    image?: string
    maxQty: number
  }[]
}>()

const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ submitted: [] }>()

const { t } = useI18n()
const toast = useAppToast()
const { createOrderReturn } = useAccount()

const maxImages = 5
const maxBytes = 2 * 1024 * 1024

const reason = ref('')
const reasonError = ref('')
const photos = ref<string[]>([])
const uploading = ref(false)
const saving = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const drafts = ref<Array<{
  key: string
  productId: string
  variantId?: string | null
  variantLabel?: string
  title: string
  image?: string
  maxQty: number
  qty: number
  selected: boolean
}>>([])

const allSelected = computed(() =>
  drafts.value.length > 0 && drafts.value.every(line => line.selected && line.qty === line.maxQty),
)

function toggleAll(value: boolean | 'indeterminate') {
  const on = value === true
  drafts.value = drafts.value.map(line => ({
    ...line,
    selected: on,
    qty: on ? line.maxQty : line.qty,
  }))
}

watch(open, (value) => {
  if (!value) return
  reason.value = ''
  reasonError.value = ''
  photos.value = []
  drafts.value = props.lines.map(line => ({
    ...line,
    qty: line.maxQty,
    selected: false,
  }))
})

function mediaSrc(url: string) {
  return resolveMediaUrl(url) || url
}

function apiErrorMessage(error: any, fallback: string) {
  const fromFields = error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
  return fromFields || error?.data?.message || fallback
}

async function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const files = [...(input.files ?? [])]
  input.value = ''
  const remaining = maxImages - photos.value.length
  if (remaining <= 0) {
    toast.error(t('حداکثر ۵ تصویر می‌توانید اضافه کنید'))
    return
  }
  uploading.value = true
  try {
    for (const file of files.slice(0, remaining)) {
      if (!file.type.startsWith('image/') || file.size > maxBytes) {
        toast.error(t('فقط تصویر تا ۲ مگابایت مجاز است'))
        continue
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
        continue
      }
      photos.value.push(result.url)
    }
  }
  finally {
    uploading.value = false
  }
}

async function submit() {
  const selected = drafts.value.filter(line => line.selected && line.qty > 0)
  if (!selected.length) {
    toast.error(t('حداقل یک کالا را انتخاب کنید'))
    return
  }
  if (!reason.value.trim()) {
    reasonError.value = t('دلیل مرجوعی را بنویسید')
    return
  }
  saving.value = true
  try {
    const { error } = await createOrderReturn(props.orderId, {
      reason: reason.value.trim(),
      photos: photos.value,
      items: selected.map(line => ({
        productId: line.productId,
        qty: line.qty,
        variantId: line.variantId || null,
      })),
    })
    if (error) {
      toast.error(apiErrorMessage(error, t('ثبت مرجوعی ناموفق بود')))
      return
    }
    toast.success(t('درخواست مرجوعی ثبت شد'))
    open.value = false
    emit('submitted')
  }
  finally {
    saving.value = false
  }
}
</script>
