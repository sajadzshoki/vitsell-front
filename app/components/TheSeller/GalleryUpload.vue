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
      class="w-full rounded-2xl border border-dashed border-muted bg-muted/40 px-4 py-5 text-center transition-all cursor-pointer hover:(border-primary/50 bg-primary/5)"
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

    <TransitionGroup
      v-if="model.length"
      name="gallery-reorder"
      tag="div"
      class="mt-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2"
    >
      <div
        v-for="(url, index) in model"
        :key="itemKey(url, index)"
        class="flex flex-col gap-1.5 min-w-0"
      >
      <div
        class="relative aspect-square rounded-xl border overflow-hidden bg-muted group"
        :class="{
          'border-primary ring-2 ring-primary/30': isPrimary(index),
          'border-muted': !isPrimary(index),
          'opacity-40 scale-[0.98]': dragFrom === index,
          'ring-2 ring-primary/40': dragOverIndex === index && dragFrom !== index,
        }"
        draggable="true"
        @dragstart="onReorderDragStart(index, $event)"
        @dragover.prevent="onReorderDragOver(index, $event)"
        @dragleave="onReorderDragLeave(index)"
        @drop.prevent="onReorderDrop(index)"
        @dragend="onReorderDragEnd"
      >
        <img
          :src="previewSrc(url)"
          :alt="`${$t('تصویر')} ${index + 1}`"
          class="size-full object-cover pointer-events-none"
          draggable="false"
          @load="onImgLoad(url, $event)"
          @error="onImgError(url)"
        >

        <div class="absolute top-1 start-1 flex items-center gap-1 z-10">
          <span
            class="size-7 rounded-lg bg-inverted/70 text-inverted grid place-items-center cursor-grab active:cursor-grabbing"
            :title="$t('جابه‌جایی با کشیدن')"
            :aria-label="$t('جابه‌جایی با کشیدن')"
          >
            <UIcon
              name="i-tabler-grip-vertical"
              class="size-3.5 pointer-events-none"
            />
          </span>
        </div>

        <button
          type="button"
          class="absolute top-1 end-1 size-7 rounded-full bg-inverted/70 text-inverted grid place-items-center cursor-pointer opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition z-10"
          :title="$t('حذف')"
          :aria-label="$t('حذف')"
          @click.stop="removeAt(index)"
        >
          <UIcon
            name="i-tabler-x"
            class="size-3.5"
          />
        </button>

        <div class="absolute bottom-1 inset-x-1 flex items-center justify-between gap-1 z-10">
          <span
            v-if="isPrimary(index)"
            class="rounded-md bg-primary text-inverted text-[10px] px-1.5 py-0.5 font-medium"
          >
            {{ $t('اصلی') }}
          </span>
          <button
            v-else
            type="button"
            class="rounded-md bg-inverted/75 text-inverted text-[10px] px-1.5 py-0.5 font-medium cursor-pointer hover:bg-primary hover:text-inverted transition opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
            :title="$t('تنظیم به‌عنوان تصویر اصلی')"
            @click.stop="setAsPrimary(index)"
          >
            {{ $t('اصلی کردن') }}
          </button>

          <div class="ms-auto flex items-center gap-0.5">
            <button
              type="button"
              class="size-6 rounded-md bg-inverted/70 text-inverted grid place-items-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              :disabled="index === 0"
              :aria-label="$t('جابه‌جایی به قبل')"
              @click.stop="moveBy(index, -1)"
            >
              <UIcon
                name="i-tabler-chevron-right"
                class="size-3.5"
              />
            </button>
            <button
              type="button"
              class="size-6 rounded-md bg-inverted/70 text-inverted grid place-items-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              :disabled="index >= model.length - 1"
              :aria-label="$t('جابه‌جایی به بعد')"
              @click.stop="moveBy(index, 1)"
            >
              <UIcon
                name="i-tabler-chevron-left"
                class="size-3.5"
              />
            </button>
          </div>
        </div>
      </div>
        <TheFormInput
          :model-value="alts[url] || ''"
          size="sm"
          :placeholder="$t('متن جایگزین')"
          @update:model-value="setAlt(url, String($event ?? ''))"
          @click.stop
          @pointerdown.stop
        />
      </div>
    </TransitionGroup>

    <p
      v-if="hint"
      class="text-[11px] text-dimmed mt-2 leading-5"
    >
      {{ hint }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { resolveMediaUrl } from '~/composables/fetch'

withDefaults(defineProps<{
  label?: string
  hint?: string
}>(), {
  label: '',
})

const model = defineModel<string[]>({ default: () => [] })
/** Optional sync with product main image (`form.image`). */
const primary = defineModel<string>('primary', { default: '' })
const alts = defineModel<Record<string, string>>('alts', { default: () => ({}) })

const { t } = useI18n()
const toast = useAppToast()
const { uploadFiles: uploadSellerMedia } = useSellerMedia()

const inputRef = ref<HTMLInputElement | null>(null)
const reading = ref(false)
const dragOver = ref(false)
const dragFrom = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

/** remote url → blob: preview (fallback when /uploads is not publicly readable) */
const blobByUrl = ref<Record<string, string>>({})
/** prefer blob until remote loads successfully */
const preferBlob = ref<Record<string, boolean>>({})

const MAX_IMAGE_BYTES = 2 * 1024 * 1024

/** Stable keys so TransitionGroup can animate reorder (FLIP). */
const keyByUrl = ref<Record<string, string>>({})
let keySeq = 0

function itemKey(url: string, index: number) {
  const existing = keyByUrl.value[url]
  if (existing) return existing
  const next = `g-${++keySeq}-${index}`
  keyByUrl.value = { ...keyByUrl.value, [url]: next }
  return next
}

function previewSrc(url: string) {
  const blob = blobByUrl.value[url]
  if (blob && preferBlob.value[url] !== false) return blob
  return resolveMediaUrl(url) || blob || url
}

function revokeBlob(url: string) {
  const blob = blobByUrl.value[url]
  if (blob?.startsWith('blob:')) URL.revokeObjectURL(blob)
  const { [url]: _b, ...restBlobs } = blobByUrl.value
  blobByUrl.value = restBlobs
  const { [url]: _p, ...restPrefer } = preferBlob.value
  preferBlob.value = restPrefer
  const { [url]: _k, ...restKeys } = keyByUrl.value
  keyByUrl.value = restKeys
}

function setAlt(url: string, value: string) {
  alts.value = { ...alts.value, [url]: value }
}

function syncPrimaryFromGallery() {
  const first = model.value[0]?.trim() || ''
  if (!first) {
    if (primary.value) primary.value = ''
    return
  }
  if (!primary.value?.trim()) primary.value = first
}

function isPrimary(index: number) {
  const url = model.value[index]
  if (!url) return false
  const main = primary.value?.trim()
  if (main) return main === url
  return index === 0
}

function openPicker() {
  if (reading.value) return
  inputRef.value?.click()
}

function removeAt(index: number) {
  const url = model.value[index]
  const wasPrimary = Boolean(url && primary.value?.trim() === url)
  if (url) revokeBlob(url)
  model.value = model.value.filter((_, i) => i !== index)
  if (wasPrimary) {
    primary.value = model.value[0]?.trim() || ''
  }
}

function moveBy(index: number, delta: number) {
  const next = index + delta
  if (next < 0 || next >= model.value.length) return
  const list = [...model.value]
  const [item] = list.splice(index, 1)
  if (!item) return
  list.splice(next, 0, item)
  model.value = list
}

function setAsPrimary(index: number) {
  if (index < 0 || index >= model.value.length) return
  const list = [...model.value]
  const [item] = list.splice(index, 1)
  if (!item) return
  list.unshift(item)
  model.value = list
  primary.value = item
}

function onReorderDragStart(index: number, event: DragEvent) {
  dragFrom.value = index
  dragOverIndex.value = index
  event.dataTransfer?.setData('text/plain', String(index))
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
}

function onReorderDragOver(index: number, event: DragEvent) {
  event.dataTransfer && (event.dataTransfer.dropEffect = 'move')
  if (dragFrom.value === null) return
  dragOverIndex.value = index
}

function onReorderDragLeave(index: number) {
  if (dragOverIndex.value === index) dragOverIndex.value = null
}

function onReorderDrop(toIndex: number) {
  const from = dragFrom.value
  if (from === null || from === toIndex) {
    onReorderDragEnd()
    return
  }
  const list = [...model.value]
  const [item] = list.splice(from, 1)
  if (!item) {
    onReorderDragEnd()
    return
  }
  list.splice(toIndex, 0, item)
  model.value = list
  onReorderDragEnd()
}

function onReorderDragEnd() {
  dragFrom.value = null
  dragOverIndex.value = null
}

function onImgLoad(url: string, event: Event) {
  const img = event.target as HTMLImageElement
  const src = img.currentSrc || img.src
  if (!src || src.startsWith('blob:')) return
  const blob = blobByUrl.value[url]
  if (blob?.startsWith('blob:')) URL.revokeObjectURL(blob)
  const { [url]: _b, ...restBlobs } = blobByUrl.value
  blobByUrl.value = restBlobs
  preferBlob.value = { ...preferBlob.value, [url]: false }
}

function onImgError(url: string) {
  if (blobByUrl.value[url]) {
    preferBlob.value = { ...preferBlob.value, [url]: true }
  }
}

async function uploadFiles(files: File[]) {
  if (!files.length) return

  const valid: File[] = []
  for (const file of files) {
    if (!file.type.startsWith('image/')) {
      toast.error(t('فقط فایل تصویری مجاز است'))
      continue
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error(t('حداکثر حجم هر تصویر ۲ مگابایت است'))
      continue
    }
    valid.push(file)
  }
  if (!valid.length) return

  const blobs = valid.map(file => URL.createObjectURL(file))
  reading.value = true
  try {
    const result = await uploadSellerMedia(valid)
    if (!result.ok || !result.items.length) {
      blobs.forEach(b => URL.revokeObjectURL(b))
      toast.error(t(result.error || 'آپلود تصویر ناموفق بود'))
      return
    }

    const urls: string[] = []
    result.items.forEach((item, i) => {
      const url = String(item.url || '').trim()
      const blob = blobs[i]
      if (!url) {
        if (blob) URL.revokeObjectURL(blob)
        return
      }
      if (blob) {
        blobByUrl.value = { ...blobByUrl.value, [url]: blob }
        preferBlob.value = { ...preferBlob.value, [url]: true }
      }
      urls.push(url)
    })
    for (let i = result.items.length; i < blobs.length; i++) {
      const blob = blobs[i]
      if (blob) URL.revokeObjectURL(blob)
    }

    if (urls.length) {
      const wasEmpty = !model.value.length
      model.value = [...model.value, ...urls]
      if (wasEmpty && !primary.value?.trim()) syncPrimaryFromGallery()
    }
    else {
      toast.error(t('آپلود تصویر ناموفق بود'))
    }
    if (result.error) {
      toast.error(t(result.error))
    }
  }
  catch {
    blobs.forEach(b => URL.revokeObjectURL(b))
    toast.error(t('آپلود تصویر ناموفق بود'))
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
  // Ignore reorder drops that bubble from thumbs (no files)
  const files = [...(event.dataTransfer?.files ?? [])].filter(f => f.type.startsWith('image/'))
  if (files.length) void uploadFiles(files)
}

onBeforeUnmount(() => {
  Object.keys(blobByUrl.value).forEach(revokeBlob)
})
</script>

<style scoped>
.gallery-reorder-move {
  transition: transform 0.24s cubic-bezier(0.22, 1, 0.36, 1);
}

.gallery-reorder-enter-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.gallery-reorder-enter-from {
  opacity: 0;
  transform: scale(0.96);
}

.gallery-reorder-leave-active {
  transition: opacity 0.16s ease;
}

.gallery-reorder-leave-to {
  opacity: 0;
}
</style>
