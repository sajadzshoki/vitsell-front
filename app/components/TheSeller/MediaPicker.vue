<template>
  <UModal
    v-model:open="open"
    :title="$t('انتخاب از کتابخانه')"
    :description="pickerDescription"
    :ui="{ content: 'sm:max-w-3xl' }"
  >
    <template #body>
      <div class="space-y-4">
        <div class="flex flex-col sm:(flex-row items-center) gap-3">
          <TheFormInput
            v-model="localSearch"
            icon="i-tabler-search"
            :placeholder="$t('جستجوی نام فایل')"
            class="flex-1 w-full"
          />
          <UButton
            v-if="canUpload"
            type="button"
            color="primary"
            variant="soft"
            size="sm"
            icon="i-tabler-upload"
            class="shrink-0 cursor-pointer"
            :loading="uploading"
            @click="openFilePicker"
          >
            {{ $t('آپلود جدید') }}
          </UButton>
        </div>

        <input
          ref="fileInputRef"
          type="file"
          :accept="acceptMime"
          :multiple="multiple"
          class="sr-only"
          @change="onFilesSelected"
        >

        <div
          v-if="!kind"
          class="flex items-center gap-2 overflow-x-auto scrollbar-none"
        >
          <UButton
            v-for="tab in kindTabs"
            :key="tab.id"
            type="button"
            :color="kindFilter === tab.id ? 'primary' : 'neutral'"
            :variant="kindFilter === tab.id ? 'soft' : 'ghost'"
            size="xs"
            class="shrink-0 cursor-pointer"
            @click="kindFilter = tab.id"
          >
            {{ tab.label }}
          </UButton>
        </div>

        <TheSellerEmptyState
          v-if="loading"
          icon="i-tabler-loader-2"
          :message="$t('در حال بارگذاری...')"
        />

        <TheSellerEmptyState
          v-else-if="!media.length"
          icon="i-tabler-photo"
          :message="localSearch.trim() ? $t('فایلی پیدا نشد') : $t('کتابخانه خالی است')"
        />

        <div
          v-else
          class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-80 overflow-y-auto pe-1"
        >
          <button
            v-for="item in media"
            :key="item.id"
            type="button"
            class="relative rounded-xl border overflow-hidden text-start cursor-pointer transition"
            :class="isSelected(item.url)
              ? 'border-primary ring-2 ring-primary/30 bg-primary/5'
              : 'border-muted bg-muted hover:(border-primary/40 bg-primary/5)'"
            @click="toggleItem(item.url)"
          >
            <div class="aspect-square bg-default grid place-items-center overflow-hidden">
              <img
                v-if="item.kind === 'image'"
                :src="item.url"
                :alt="item.alt || item.filename"
                class="size-full object-cover"
              >
              <UIcon
                v-else
                :name="kindIcon(item.kind)"
                class="size-8 text-muted"
              />
            </div>
            <div
              v-if="isSelected(item.url)"
              class="absolute top-1.5 start-1.5 size-5 rounded-full bg-primary text-inverted grid place-items-center"
            >
              <UIcon
                name="i-tabler-check"
                class="size-3"
              />
            </div>
            <p class="px-1.5 py-1 text-[10px] text-highlighted truncate">
              {{ item.filename }}
            </p>
          </button>
        </div>

        <p
          v-if="multiple && pickedUrls.length"
          class="text-xs text-muted"
        >
          {{ pickedUrls.length.toLocaleString('fa-IR') }} {{ $t('انتخاب‌شده') }}
        </p>
      </div>
    </template>

    <template #footer>
      <div class="flex items-center gap-2 w-full justify-end">
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
          class="cursor-pointer"
          :disabled="!pickedUrls.length"
          @click="confirmSelection"
        >
          {{ $t('تأیید انتخاب') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { SellerMediaKind } from '~/data/seller-media'

const props = withDefaults(defineProps<{
  multiple?: boolean
  kind?: SellerMediaKind
}>(), {
  multiple: false,
})

const open = defineModel<boolean>('open', { default: false })
const modelValue = defineModel<string | string[]>('modelValue')

const emit = defineEmits<{
  select: [value: string | string[]]
}>()

const { t } = useI18n()
const toast = useAppToast()
const { canAny } = useSellerPermissions()
const { media, fetchList, uploadFiles } = useSellerMedia()

const localSearch = ref('')
const kindFilter = ref('all')
const pickedUrls = ref<string[]>([])
const fileInputRef = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const loading = ref(false)

const canUpload = computed(() => canAny('media.upload', 'media.manage'))

const pickerDescription = computed(() =>
  props.multiple ? t('یک یا چند فایل انتخاب کنید') : t('یک فایل انتخاب کنید'),
)

const acceptMime = computed(() => {
  if (props.kind === 'image') return 'image/jpeg,image/png,image/webp,image/gif'
  if (props.kind === 'video') return 'video/*'
  if (props.kind === 'document') return '.pdf,.doc,.docx,.txt'
  return undefined
})

const kindTabs = computed(() => [
  { id: 'all', label: t('همه') },
  { id: 'image', label: t('تصویر') },
  { id: 'video', label: t('ویدیو') },
  { id: 'document', label: t('سند') },
])

function apiErrorMessage(error: any, fallback: string) {
  return (
    error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
    || error?.data?.message
    || error?.message
    || fallback
  )
}

async function loadPickerList() {
  loading.value = true
  try {
    const activeKind = props.kind || kindFilter.value
    const result = await fetchList({
      q: localSearch.value || undefined,
      kind: activeKind,
      page: 1,
      pageSize: 100,
      all: true,
    })
    if (!result.ok) {
      toast.error(t(apiErrorMessage(result.error, 'بارگذاری کتابخانه ناموفق بود')))
    }
  }
  finally {
    loading.value = false
  }
}

watch(open, (isOpen) => {
  if (!isOpen) return
  localSearch.value = ''
  kindFilter.value = 'all'
  const current = modelValue.value
  if (Array.isArray(current)) pickedUrls.value = [...current]
  else if (typeof current === 'string' && current.trim()) pickedUrls.value = [current]
  else pickedUrls.value = []
  void loadPickerList()
})

watch([localSearch, kindFilter], () => {
  if (!open.value) return
  void loadPickerList()
})

function kindIcon(kind: SellerMediaKind) {
  if (kind === 'video') return 'i-tabler-video'
  if (kind === 'document') return 'i-tabler-file-text'
  return 'i-tabler-photo'
}

function isSelected(url: string) {
  return pickedUrls.value.includes(url)
}

function toggleItem(url: string) {
  if (props.multiple) {
    if (pickedUrls.value.includes(url)) {
      pickedUrls.value = pickedUrls.value.filter(u => u !== url)
    }
    else {
      pickedUrls.value = [...pickedUrls.value, url]
    }
  }
  else {
    pickedUrls.value = [url]
  }
}

function confirmSelection() {
  if (!pickedUrls.value.length) return
  const value = props.multiple ? [...pickedUrls.value] : pickedUrls.value[0]!
  modelValue.value = value
  emit('select', value)
  open.value = false
}

function openFilePicker() {
  fileInputRef.value?.click()
}

async function onFilesSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const files = input.files ? [...input.files] : []
  input.value = ''
  if (!files.length) return

  uploading.value = true
  try {
    const result = await uploadFiles(files)
    if (result.ok && result.items.length) {
      toast.success(t('فایل آپلود شد'))
      const first = result.items[0]!
      if (props.multiple) {
        pickedUrls.value = [...pickedUrls.value, ...result.items.map(i => i.url)]
      }
      else {
        pickedUrls.value = [first.url]
      }
      await loadPickerList()
    }
    else {
      toast.error(t(result.error || 'آپلود ناموفق بود'))
    }
  }
  catch (error) {
    toast.error(t(apiErrorMessage(error, 'آپلود ناموفق بود')))
  }
  finally {
    uploading.value = false
  }
}
</script>
