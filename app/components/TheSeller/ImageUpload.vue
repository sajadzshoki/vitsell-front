<template>
  <div>
    <div class="text-sm mb-2 flex items-center gap-2">
      <UIcon
        v-if="icon"
        :name="icon"
        class="size-4 text-dimmed"
      />
      <span>{{ label }}</span>
      <UBadge
        v-if="badge"
        :color="badgeColor"
        variant="soft"
        size="xs"
      >
        {{ badge }}
      </UBadge>
    </div>

    <input
      ref="inputRef"
      type="file"
      accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
      class="sr-only"
      @change="onFileChange"
    >

    <button
      type="button"
      class="relative w-full min-h-36 rounded-2xl border border-dashed overflow-hidden grid place-items-center text-center transition"
      :class="[
        surfaceClass,
        props.disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
        !props.disabled && dragOver ? 'border-primary bg-primary/10' : 'border-muted',
        !props.disabled && 'hover:(border-primary/50 bg-primary/5)',
      ]"
      :disabled="reading || props.disabled"
      @click="openPicker"
      @dragenter.prevent="onDragEnter"
      @dragover.prevent="onDragEnter"
      @dragleave.prevent="dragOver = false"
      @drop.prevent="onDrop"
    >
      <img
        v-if="previewSrc"
        :src="previewSrc"
        :alt="alt"
        class="absolute inset-0 size-full"
        :class="[
          fit === 'contain' ? 'object-contain p-3' : 'object-cover',
          reading ? 'opacity-40' : '',
        ]"
        @load="onImgLoad"
        @error="onImgError"
      >

      <div
        v-if="reading"
        class="relative z-10 flex flex-col items-center gap-2 p-4"
      >
        <UIcon
          name="i-tabler-loader-2"
          class="size-7 text-primary animate-spin"
        />
        <span class="text-xs text-muted">{{ $t('در حال بارگذاری...') }}</span>
      </div>

      <div
        v-else-if="!previewSrc"
        class="relative z-10 flex flex-col items-center gap-2 p-4"
      >
        <div
          class="size-11 rounded-xl grid place-items-center"
          :class="themePreview === 'dark' ? 'bg-default/15 text-inverted' : 'bg-primary/10 text-primary'"
        >
          <UIcon
            name="i-tabler-photo-plus"
            class="size-5"
          />
        </div>
        <span
          class="text-sm font-medium"
          :class="themePreview === 'dark' ? 'text-inverted' : 'text-highlighted'"
        >
          {{ $t('انتخاب تصویر از دستگاه') }}
        </span>
        <span
          class="text-[11px] leading-5"
          :class="themePreview === 'dark' ? 'text-inverted/70' : 'text-muted'"
        >
          {{ $t('کلیک کنید یا تصویر را اینجا رها کنید') }}
          <br>
          {{ $t('JPG، PNG، WebP یا SVG — حداکثر ۲ مگابایت') }}
        </span>
      </div>

      <div
        v-else-if="previewSrc && !reading"
        class="absolute inset-x-0 bottom-0 z-10 flex items-center justify-center p-2 bg-inverted/55"
      >
        <span class="text-[11px] text-inverted font-medium">
          {{ $t('برای تعویض کلیک کنید') }}
        </span>
      </div>
    </button>

    <div
      v-if="canViewLibrary && !props.disabled"
      class="mt-2 flex justify-center"
    >
      <UButton
        type="button"
        color="neutral"
        variant="outline"
        size="xs"
        icon="i-tabler-photo-search"
        class="cursor-pointer"
        @click="libraryOpen = true"
      >
        {{ $t('از کتابخانه') }}
      </UButton>
    </div>

    <TheSellerMediaPicker
      v-if="canViewLibrary"
      v-model:open="libraryOpen"
      v-model="model"
      kind="image"
      @select="onLibrarySelect"
    />

    <div
      v-if="String(model || '').trim() && !props.disabled"
      class="mt-2 flex justify-end"
    >
      <UButton
        color="error"
        variant="ghost"
        size="xs"
        icon="i-tabler-trash"
        class="cursor-pointer"
        @click="clear"
      >
        {{ $t('حذف تصویر') }}
      </UButton>
    </div>

    <p
      v-if="error"
      class="text-[11px] text-error mt-2"
    >
      {{ $t(error) }}
    </p>

    <p
      v-if="hint"
      class="text-[11px] text-dimmed mt-2 leading-5"
    >
      {{ hint }}
    </p>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  label: string
  alt?: string
  icon?: string
  badge?: string
  badgeColor?: 'primary' | 'neutral' | 'warning' | 'success' | 'info' | 'error' | 'secondary'
  hint?: string
  error?: string
  disabled?: boolean
  /** Preview surface: light box vs dark box */
  themePreview?: 'light' | 'dark'
  /** How the image fills the preview box */
  fit?: 'cover' | 'contain'
}>(), {
  alt: '',
  badgeColor: 'neutral',
  themePreview: 'light',
  disabled: false,
  fit: 'cover',
})

const emit = defineEmits<{
  error: []
}>()

const model = defineModel<string>({ default: '' })

const { t } = useI18n()
const toast = useAppToast()
const { canAny } = useSellerPermissions()
const { uploadFiles } = useSellerMedia()

const inputRef = ref<HTMLInputElement | null>(null)
const reading = ref(false)
const dragOver = ref(false)
const libraryOpen = ref(false)
const localPreview = ref('')
const preferLocal = ref(false)

const canViewLibrary = computed(() => canAny('media.view', 'media.upload', 'media.manage'))

const MAX_IMAGE_BYTES = 2 * 1024 * 1024

const previewSrc = computed(() => {
  if (preferLocal.value && localPreview.value) return localPreview.value
  const remote = String(model.value || '').trim()
  return (remote ? resolveMediaUrl(remote) : '') || localPreview.value
})

const surfaceClass = computed(() =>
  props.themePreview === 'dark'
    ? 'bg-inverted'
    : 'bg-muted/40',
)

function revokeLocalPreview() {
  if (localPreview.value.startsWith('blob:')) {
    URL.revokeObjectURL(localPreview.value)
  }
  localPreview.value = ''
  preferLocal.value = false
}

function openPicker() {
  if (reading.value || props.disabled) return
  inputRef.value?.click()
}

function onDragEnter() {
  if (props.disabled || reading.value) return
  dragOver.value = true
}

function clear() {
  if (props.disabled) return
  revokeLocalPreview()
  model.value = ''
  if (inputRef.value) inputRef.value.value = ''
}

function onLibrarySelect() {
  revokeLocalPreview()
}

function onImgLoad(event: Event) {
  const img = event.target as HTMLImageElement
  const src = img.currentSrc || img.src
  if (!src || src.startsWith('blob:')) return
  if (!localPreview.value) return
  if (localPreview.value.startsWith('blob:')) {
    URL.revokeObjectURL(localPreview.value)
  }
  localPreview.value = ''
  preferLocal.value = false
}

function onImgError() {
  // Keep blob preview if remote URL fails
  if (localPreview.value) {
    preferLocal.value = true
    return
  }
  emit('error')
}

async function uploadFile(file: File) {
  if (props.disabled) return
  if (!file.type.startsWith('image/')) {
    toast.error(t('فقط فایل تصویری مجاز است'))
    return
  }
  if (file.size > MAX_IMAGE_BYTES) {
    toast.error(t('حداکثر حجم تصویر ۲ مگابایت است'))
    return
  }

  revokeLocalPreview()
  localPreview.value = URL.createObjectURL(file)
  preferLocal.value = true
  reading.value = true
  try {
    const result = await uploadFiles([file])
    if (!result.ok || !result.items[0]?.url) {
      toast.error(t(result.error || 'آپلود تصویر ناموفق بود'))
      revokeLocalPreview()
      return
    }
    model.value = result.items[0].url
    // Try remote URL; keep blob as fallback if it fails to load
    preferLocal.value = false
  }
  catch {
    toast.error(t('خواندن تصویر ناموفق بود'))
    revokeLocalPreview()
  }
  finally {
    reading.value = false
    dragOver.value = false
  }
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) void uploadFile(file)
  input.value = ''
}

function onDrop(event: DragEvent) {
  dragOver.value = false
  if (props.disabled) return
  const file = event.dataTransfer?.files?.[0]
  if (file) void uploadFile(file)
}

onBeforeUnmount(() => {
  revokeLocalPreview()
})
</script>
