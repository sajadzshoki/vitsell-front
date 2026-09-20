<template>
  <div>
    <div
      v-if="label"
      class="text-sm mb-2 flex items-center gap-2"
    >
      <UIcon
        name="i-tabler-icons"
        class="size-4 text-dimmed"
      />
      <span>{{ label }}</span>
      <span
        v-if="required"
        class="text-error"
      >*</span>
    </div>

    <div class="flex items-center gap-3 flex-wrap">
      <div class="size-12 rounded-2xl bg-primary/10 text-primary grid place-items-center shrink-0 overflow-hidden">
        <img
          v-if="isImage"
          :src="previewSrc"
          alt=""
          class="size-7 object-contain"
        >
        <UIcon
          v-else
          :name="previewName"
          class="size-6"
        />
      </div>
      <div class="min-w-0 flex-1">
        <div
          class="text-xs text-muted num truncate"
          dir="ltr"
        >
          {{ displayValue || '—' }}
        </div>
        <div class="mt-2 flex items-center gap-2 flex-wrap">
          <UButton
            type="button"
            color="primary"
            variant="soft"
            size="sm"
            icon="i-tabler-icons"
            class="cursor-pointer"
            :disabled="disabled"
            @click="openPicker"
          >
            {{ $t('انتخاب آیکون') }}
          </UButton>
          <UButton
            v-if="model"
            type="button"
            color="neutral"
            variant="ghost"
            size="sm"
            icon="i-tabler-x"
            class="cursor-pointer"
            :disabled="disabled"
            :aria-label="$t('پاک کردن')"
            @click="clear"
          />
        </div>
      </div>
    </div>

    <p
      v-if="error"
      class="text-[11px] text-error mt-2"
    >
      {{ error }}
    </p>
    <p
      v-if="help"
      class="text-[11px] text-dimmed mt-2 leading-5"
    >
      {{ help }}
    </p>

    <UModal
      v-model:open="open"
      :title="$t('انتخاب آیکون')"
      :description="$t('از لیست انتخاب کنید، نام سفارشی وارد کنید یا تصویر آپلود کنید')"
      :ui="{ content: 'sm:max-w-2xl' }"
    >
      <template #body>
        <div class="space-y-4">
          <TheFormInput
            v-model="search"
            :placeholder="$t('جستجوی آیکون…')"
            icon="i-tabler-search"
          />

          <div
            v-if="filteredCustomImages.length"
            class="space-y-2"
          >
            <div class="flex items-center justify-between gap-2">
              <p class="text-xs font-medium text-toned">
                {{ $t('آیکون‌های آپلودشده') }}
              </p>
              <span class="text-[10px] text-dimmed num">
                {{ filteredCustomImages.length.toLocaleString('fa-IR') }}
              </span>
            </div>
            <div class="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-40 overflow-y-auto scrollbar-none pe-1">
              <div
                v-for="url in filteredCustomImages"
                :key="url"
                class="relative aspect-square"
              >
                <button
                  type="button"
                  class="size-full rounded-xl border grid place-items-center transition-all cursor-pointer overflow-hidden p-1.5"
                  :class="model === url
                    ? 'border-primary bg-primary/10'
                    : 'border-muted bg-muted/40 hover:(border-accented bg-elevated)'"
                  :title="url"
                  :aria-label="$t('انتخاب آیکون آپلودشده')"
                  @click="pick(url)"
                >
                  <img
                    :src="resolveMediaUrl(url)"
                    alt=""
                    class="size-full object-contain"
                  >
                </button>
                <button
                  type="button"
                  class="absolute -top-1 -end-1 size-5 rounded-full bg-default border border-muted text-toned hover:text-error grid place-items-center cursor-pointer shadow-sm"
                  :aria-label="$t('حذف از لیست')"
                  @click.stop="removeCustom(url)"
                >
                  <UIcon
                    name="i-tabler-x"
                    class="size-3"
                  />
                </button>
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <p
              v-if="filteredCustomImages.length"
              class="text-xs font-medium text-toned"
            >
              {{ $t('آیکون‌های آماده') }}
            </p>
            <div class="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-72 overflow-y-auto scrollbar-none pe-1">
              <button
                v-for="key in filteredKeys"
                :key="key"
                type="button"
                class="aspect-square rounded-xl border grid place-items-center transition-all cursor-pointer"
                :class="model === key
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-muted bg-muted/40 text-toned hover:(border-accented bg-elevated)'"
                :title="key"
                :aria-label="key"
                @click="pick(key)"
              >
                <UIcon
                  :name="resolveSellerAdminIconName(key)"
                  class="size-5"
                />
              </button>
            </div>
          </div>

          <p
            v-if="!filteredKeys.length && !filteredCustomImages.length"
            class="text-xs text-muted text-center py-4"
          >
            {{ $t('آیکونی پیدا نشد') }}
          </p>

          <div
            v-if="allowCustom || allowUpload"
            class="border-t border-muted pt-4 space-y-3"
          >
            <div
              v-if="allowCustom"
              class="flex items-end gap-2"
            >
              <TheFormInput
                v-model="customKey"
                class="flex-1"
                :label="$t('آیکون سفارشی')"
                :placeholder="$t('مثلاً rocket')"
                dir="ltr"
                :help="$t('نام Tabler بدون پیشوند i-tabler-')"
              />
              <UButton
                type="button"
                color="primary"
                variant="soft"
                size="sm"
                class="mb-1 cursor-pointer shrink-0"
                :disabled="!customKey.trim()"
                @click="addCustomKey"
              >
                {{ $t('افزودن') }}
              </UButton>
            </div>

            <div
              v-if="allowUpload"
              class="flex items-center gap-2 flex-wrap"
            >
              <input
                ref="fileInputRef"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                class="sr-only"
                @change="onFileChange"
              >
              <UButton
                type="button"
                color="neutral"
                variant="outline"
                size="sm"
                icon="i-tabler-upload"
                class="cursor-pointer"
                :loading="uploading"
                @click="openFilePicker"
              >
                {{ $t('آپلود تصویر آیکون') }}
              </UButton>
              <span class="text-[11px] text-dimmed">
                {{ $t('PNG، SVG، WebP — حداکثر ۲ مگابایت') }}
              </span>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end w-full">
          <UButton
            color="neutral"
            variant="outline"
            class="cursor-pointer"
            @click="open = false"
          >
            {{ $t('بستن') }}
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import {
  isSellerAdminIconImage,
  normalizeSellerAdminIconKey,
  resolveSellerAdminIconName,
  sellerAdminIconKeys,
} from '~/data/seller-admin-icons'
import { resolveMediaUrl } from '~/composables/fetch'

withDefaults(defineProps<{
  label?: string
  help?: string
  error?: string
  required?: boolean
  disabled?: boolean
  allowCustom?: boolean
  allowUpload?: boolean
}>(), {
  label: '',
  help: '',
  error: '',
  required: false,
  disabled: false,
  allowCustom: true,
  allowUpload: true,
})

const model = defineModel<string>({ default: '' })
const { t } = useI18n()
const toast = useAppToast()
const { uploadFiles } = useSellerMedia()
const { imageIcons, keyIcons, hydrate, addIcon, removeIcon } = useSellerCustomIcons()

const open = ref(false)
const search = ref('')
const customKey = ref('')
const uploading = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

const allKeys = computed(() => {
  const set = new Set<string>([...sellerAdminIconKeys, ...keyIcons.value])
  const current = normalizeSellerAdminIconKey(model.value)
  if (current && !isSellerAdminIconImage(current)) set.add(current)
  return [...set]
})

const filteredKeys = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return allKeys.value
  return allKeys.value.filter(key => key.toLowerCase().includes(q))
})

const filteredCustomImages = computed(() => {
  const list = [...imageIcons.value]
  const current = String(model.value || '').trim()
  if (current && isSellerAdminIconImage(current) && !list.includes(current)) {
    list.unshift(current)
  }
  const q = search.value.trim().toLowerCase()
  if (!q) return list
  return list.filter(url => url.toLowerCase().includes(q))
})

const isImage = computed(() => isSellerAdminIconImage(model.value))
const previewName = computed(() => resolveSellerAdminIconName(model.value))
const previewSrc = computed(() => (isImage.value ? resolveMediaUrl(model.value) : ''))
const displayValue = computed(() => {
  const raw = String(model.value || '').trim()
  if (!raw) return ''
  if (isSellerAdminIconImage(raw)) return raw
  return normalizeSellerAdminIconKey(raw)
})

function openPicker() {
  hydrate()
  open.value = true
}

function pick(key: string) {
  const next = isSellerAdminIconImage(key)
    ? String(key).trim()
    : normalizeSellerAdminIconKey(key)
  const stored = next ? (addIcon(next) || next) : ''
  model.value = stored
  open.value = false
}

function clear() {
  model.value = ''
}

function openFilePicker() {
  fileInputRef.value?.click()
}

function addCustomKey() {
  const key = normalizeSellerAdminIconKey(customKey.value)
  if (!key || isSellerAdminIconImage(key)) return
  addIcon(key)
  model.value = key
  customKey.value = ''
  open.value = false
}

function removeCustom(url: string) {
  removeIcon(url)
  if (model.value === url) model.value = ''
}

async function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  if (file.size > 2 * 1024 * 1024) {
    toast.error(t('حجم فایل نباید بیشتر از ۲ مگابایت باشد'))
    return
  }

  uploading.value = true
  try {
    const result = await uploadFiles([file])
    if (!result.ok || !result.items[0]?.url) {
      toast.error(t(result.error || 'آپلود آیکون ناموفق بود'))
      return
    }
    const url = result.items[0].url
    const stored = (() => {
      const upload = String(url).match(/\/uploads\/([\w.-]+\.(?:jpe?g|png|webp|gif|svg))/i)
      return upload ? `/uploads/${upload[1]}` : url
    })()
    addIcon(stored)
    model.value = stored
    toast.success(t('آیکون به لیست اضافه شد'))
    open.value = false
  }
  finally {
    uploading.value = false
  }
}

onMounted(() => {
  hydrate()
  const current = String(model.value || '').trim()
  if (current) addIcon(current)
})
</script>
