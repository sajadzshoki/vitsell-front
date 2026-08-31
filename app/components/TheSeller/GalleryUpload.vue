<template>
  <div>
    <div class="text-sm mb-2 flex items-center justify-between gap-2 flex-wrap">
      <div class="flex items-center gap-2">
        <UIcon
          name="i-tabler-photo-up"
          class="size-4 text-dimmed"
        />
        <span>{{ label }}</span>
        <UBadge
          v-if="model.length"
          color="primary"
          variant="soft"
          size="xs"
          class="num"
        >
          {{ model.length.toLocaleString('fa-IR') }}
        </UBadge>
      </div>
      <span class="text-[11px] text-dimmed">
        {{ $t('بدون محدودیت تعداد') }}
      </span>
    </div>

    <input
      ref="inputRef"
      type="file"
      accept="image/jpeg,image/png,image/webp,image/gif"
      multiple
      class="sr-only"
      @change="onFileChange"
    >

    <button
      type="button"
      class="w-full rounded-2xl border border-dashed border-muted bg-muted/40 px-4 py-5 text-center transition cursor-pointer hover:(border-primary/50 bg-primary/5)"
      :class="dragOver && 'border-primary bg-primary/10'"
      :disabled="reading"
      @click="openPicker"
      @dragenter.prevent="dragOver = true"
      @dragover.prevent="dragOver = true"
      @dragleave.prevent="dragOver = false"
      @drop.prevent="onDrop"
    >
      <div class="flex flex-col items-center gap-2">
        <div class="size-11 rounded-xl bg-primary/10 text-primary grid place-items-center">
          <UIcon
            :name="reading ? 'i-tabler-loader-2' : 'i-tabler-photos-plus'"
            class="size-5"
            :class="reading && 'animate-spin'"
          />
        </div>
        <span class="text-sm font-medium text-highlighted">
          {{ reading ? $t('در حال بارگذاری...') : $t('افزودن تصاویر از دستگاه') }}
        </span>
        <span class="text-[11px] text-muted leading-5">
          {{ $t('چند فایل را هم‌زمان انتخاب کنید یا اینجا رها کنید') }}
          <br>
          {{ $t('JPG، PNG یا WebP — هر فایل حداکثر ۲ مگابایت') }}
        </span>
      </div>
    </button>

    <div
      v-if="model.length"
      class="mt-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2"
    >
      <div
        v-for="(url, index) in model"
        :key="`${url}-${index}`"
        class="relative aspect-square rounded-xl border border-muted overflow-hidden bg-muted group"
      >
        <img
          :src="url"
          :alt="`${$t('تصویر')} ${index + 1}`"
          class="size-full object-cover"
        >
        <button
          type="button"
          class="absolute top-1 end-1 size-7 rounded-full bg-inverted/70 text-inverted grid place-items-center cursor-pointer opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition"
          :title="$t('حذف')"
          @click.stop="removeAt(index)"
        >
          <UIcon
            name="i-tabler-x"
            class="size-3.5"
          />
        </button>
        <span
          v-if="index === 0"
          class="absolute bottom-1 start-1 rounded-md bg-primary/90 text-inverted text-[10px] px-1.5 py-0.5 font-medium"
        >
          {{ $t('اصلی') }}
        </span>
      </div>
    </div>

    <p
      v-if="hint"
      class="text-[11px] text-dimmed mt-2 leading-5"
    >
      {{ hint }}
    </p>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  label?: string
  hint?: string
}>(), {
  label: '',
})

const model = defineModel<string[]>({ default: () => [] })

const { t } = useI18n()
const toast = useAppToast()

const inputRef = ref<HTMLInputElement | null>(null)
const reading = ref(false)
const dragOver = ref(false)

const MAX_IMAGE_BYTES = 2 * 1024 * 1024

function openPicker() {
  if (reading.value) return
  inputRef.value?.click()
}

function removeAt(index: number) {
  model.value = model.value.filter((_, i) => i !== index)
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

async function uploadFiles(files: File[]) {
  if (!files.length) return
  reading.value = true
  try {
    const urls: string[] = []
    for (const file of files) {
      const url = await uploadOne(file)
      if (url) urls.push(url)
    }
    if (urls.length) {
      model.value = [...model.value, ...urls]
    }
  }
  finally {
    reading.value = false
    dragOver.value = false
  }
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const files = [...(input.files ?? [])]
  if (files.length) void uploadFiles(files)
  input.value = ''
}

function onDrop(event: DragEvent) {
  dragOver.value = false
  const files = [...(event.dataTransfer?.files ?? [])].filter(f => f.type.startsWith('image/'))
  if (files.length) void uploadFiles(files)
}
</script>
