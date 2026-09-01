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
      accept="image/jpeg,image/png,image/webp,image/gif"
      class="sr-only"
      @change="onFileChange"
    >

    <button
      type="button"
      class="relative w-full min-h-36 rounded-2xl border border-dashed overflow-hidden grid place-items-center text-center transition cursor-pointer"
      :class="[
        surfaceClass,
        dragOver ? 'border-primary bg-primary/10' : 'border-muted hover:(border-primary/50 bg-primary/5)',
      ]"
      :disabled="reading"
      @click="openPicker"
      @dragenter.prevent="dragOver = true"
      @dragover.prevent="dragOver = true"
      @dragleave.prevent="dragOver = false"
      @drop.prevent="onDrop"
    >
      <img
        v-if="model.trim() && !reading"
        :src="model"
        :alt="alt"
        class="absolute inset-0 size-full object-cover"
        @error="emit('error')"
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
        v-else-if="!model.trim()"
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
          {{ $t('JPG، PNG یا WebP — حداکثر ۲ مگابایت') }}
        </span>
      </div>

      <div
        v-else
        class="absolute inset-x-0 bottom-0 z-10 flex items-center justify-center p-2 bg-inverted/55"
      >
        <span class="text-[11px] text-inverted font-medium">
          {{ $t('برای تعویض کلیک کنید') }}
        </span>
      </div>
    </button>

    <div
      v-if="canViewLibrary"
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
    />

    <div
      v-if="model.trim()"
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
  /** Preview surface: light box vs dark box */
  themePreview?: 'light' | 'dark'
}>(), {
  alt: '',
  badgeColor: 'neutral',
  themePreview: 'light',
})

const emit = defineEmits<{
  error: []
}>()

const model = defineModel<string>({ default: '' })

const { t } = useI18n()
const toast = useAppToast()
const { can } = useSellerPermissions()

const inputRef = ref<HTMLInputElement | null>(null)
const reading = ref(false)
const dragOver = ref(false)
const libraryOpen = ref(false)

const canViewLibrary = computed(() => can('media.view'))

const MAX_IMAGE_BYTES = 2 * 1024 * 1024

const surfaceClass = computed(() =>
  props.themePreview === 'dark'
    ? 'bg-inverted'
    : 'bg-muted/40',
)

function openPicker() {
  if (reading.value) return
  inputRef.value?.click()
}

function clear() {
  model.value = ''
  if (inputRef.value) inputRef.value.value = ''
}

async function uploadFile(file: File) {
  if (!file.type.startsWith('image/')) {
    toast.error(t('فقط فایل تصویری مجاز است'))
    return
  }
  if (file.size > MAX_IMAGE_BYTES) {
    toast.error(t('حداکثر حجم تصویر ۲ مگابایت است'))
    return
  }

  reading.value = true
  try {
    const body = new FormData()
    body.append('file', file)
    const { result, error } = await usePost<{ url: string }, FormData>(
      '/upload',
      body,
      { headers: { 'no-error': true } },
    )
    if (error || !result?.url) {
      toast.error(t('آپلود تصویر ناموفق بود'))
      return
    }
    model.value = result.url
  }
  catch {
    toast.error(t('خواندن تصویر ناموفق بود'))
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
  const file = event.dataTransfer?.files?.[0]
  if (file) void uploadFile(file)
}
</script>
