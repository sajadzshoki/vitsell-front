<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
    <div class="hidden lg:block">
      <TheSellerPageHeader
        :title="$t('کتابخانه رسانه')"
        :description="$t('مدیریت تصاویر، ویدیوها و فایل‌های آپلودشده — جستجو، ویرایش متادیتا و حذف')"
        :count-label="!loading ? `${listMeta.total.toLocaleString('fa-IR')} ${$t('فایل')}` : undefined"
      >
        <template
          v-if="canUpload"
          #actions
        >
          <UButton
            type="button"
            color="primary"
            size="sm"
            icon="i-tabler-upload"
            class="cursor-pointer"
            :loading="uploading"
            @click="openFilePicker"
          >
            {{ $t('آپلود فایل') }}
          </UButton>
        </template>
      </TheSellerPageHeader>
    </div>

    <div
      v-if="canUpload"
      class="lg:hidden mb-4"
    >
      <UButton
        type="button"
        color="primary"
        block
        icon="i-tabler-upload"
        class="cursor-pointer"
        :loading="uploading"
        @click="openFilePicker"
      >
        {{ $t('آپلود فایل') }}
      </UButton>
    </div>

    <input
      ref="fileInputRef"
      type="file"
      multiple
      class="sr-only"
      @change="onFilesSelected"
    >

    <TheSellerListToolbar
      v-model:search="search"
      :status="kindFilter"
      :tabs="kindTabs"
      :search-placeholder="$t('جستجوی نام فایل')"
      :has-active="hasActiveFilters"
      @update:status="kindFilter = $event"
      @clear="clearFilters"
    >
      <template #extra>
        <div class="flex items-center gap-1 rounded-lg border border-muted p-0.5">
          <UButton
            type="button"
            :color="viewMode === 'grid' ? 'primary' : 'neutral'"
            :variant="viewMode === 'grid' ? 'soft' : 'ghost'"
            size="xs"
            icon="i-tabler-layout-grid"
            class="cursor-pointer"
            :aria-label="$t('نمای شبکه‌ای')"
            @click="viewMode = 'grid'"
          />
          <UButton
            type="button"
            :color="viewMode === 'list' ? 'primary' : 'neutral'"
            :variant="viewMode === 'list' ? 'soft' : 'ghost'"
            size="xs"
            icon="i-tabler-list"
            class="cursor-pointer"
            :aria-label="$t('نمای فهرست')"
            @click="viewMode = 'list'"
          />
        </div>
      </template>
    </TheSellerListToolbar>

    <div
      v-if="canDelete && media.length"
      class="mb-4 flex items-center gap-2 flex-wrap"
    >
      <UCheckbox
        :model-value="allPageSelected"
        :indeterminate="somePageSelected && !allPageSelected"
        :label="$t('انتخاب همهٔ صفحه')"
        @update:model-value="toggleSelectPage(!!$event)"
      />
    </div>

    <div
      v-if="selectedIds.length"
      class="mb-4 flex items-center gap-2 flex-wrap rounded-xl border border-primary/30 bg-primary/5 p-3"
    >
      <span class="text-xs text-toned num">
        {{ selectedIds.length.toLocaleString('fa-IR') }} {{ $t('انتخاب‌شده') }}
      </span>
      <UButton
        v-if="canDelete"
        type="button"
        color="error"
        variant="soft"
        size="xs"
        icon="i-tabler-trash"
        class="cursor-pointer"
        @click="bulkDeleteOpen = true"
      >
        {{ $t('حذف گروهی') }}
      </UButton>
      <UButton
        type="button"
        color="neutral"
        variant="ghost"
        size="xs"
        class="cursor-pointer"
        @click="selectedIds = []"
      >
        {{ $t('لغو انتخاب') }}
      </UButton>
    </div>

    <TheSellerEmptyState
      v-if="loading"
      icon="i-tabler-loader-2"
      :message="$t('در حال بارگذاری...')"
    />

    <TheSellerEmptyState
      v-else-if="!media.length"
      icon="i-tabler-photo-cog"
      :message="hasActiveFilters ? $t('فایلی با این فیلتر پیدا نشد') : $t('هنوز فایلی در کتابخانه نیست')"
    >
      <template
        v-if="!hasActiveFilters && canUpload"
        #actions
      >
        <UButton
          type="button"
          color="primary"
          variant="soft"
          icon="i-tabler-upload"
          class="cursor-pointer"
          :loading="uploading"
          @click="openFilePicker"
        >
          {{ $t('آپلود اولین فایل') }}
        </UButton>
      </template>
    </TheSellerEmptyState>

    <div
      v-else-if="viewMode === 'grid'"
      class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3"
    >
      <article
        v-for="item in media"
        :key="item.id"
        class="group relative rounded-2xl border border-muted bg-muted overflow-hidden cursor-pointer transition hover:(border-primary/40 ring-1 ring-primary/20)"
        @click="openDetail(item)"
      >
        <div
          v-if="canDelete"
          class="absolute top-2 start-2 z-10"
          @click.stop
        >
          <UCheckbox
            :model-value="selectedIds.includes(item.id)"
            @update:model-value="toggleSelect(item.id, !!$event)"
          />
        </div>

        <div class="aspect-square bg-default grid place-items-center overflow-hidden">
          <img
            v-if="item.kind === 'image'"
            :src="item.url"
            :alt="item.alt || item.filename"
            class="size-full object-cover"
          >
          <div
            v-else
            class="flex flex-col items-center gap-2 p-4 text-muted"
          >
            <UIcon
              :name="kindIcon(item.kind)"
              class="size-10"
            />
            <span class="text-[10px] uppercase tracking-wide">{{ item.kind }}</span>
          </div>
        </div>

        <div class="p-2.5 space-y-1">
          <p class="text-xs font-medium text-highlighted truncate" :title="item.filename">
            {{ item.filename }}
          </p>
          <div class="flex items-center justify-between gap-2 text-[10px] text-muted">
            <span class="num">{{ formatBytes(item.sizeBytes) }}</span>
            <span class="num shrink-0">{{ formatDateTime(item.createdAt) }}</span>
          </div>
        </div>
      </article>
    </div>

    <div
      v-else
      class="space-y-2"
    >
      <article
        v-for="item in media"
        :key="item.id"
        class="flex items-center gap-3 rounded-2xl border border-muted bg-muted p-3 cursor-pointer transition hover:(border-primary/40 bg-primary/5)"
        @click="openDetail(item)"
      >
        <div
          v-if="canDelete"
          @click.stop
        >
          <UCheckbox
            :model-value="selectedIds.includes(item.id)"
            @update:model-value="toggleSelect(item.id, !!$event)"
          />
        </div>

        <div class="size-14 rounded-xl bg-default border border-muted overflow-hidden shrink-0 grid place-items-center">
          <img
            v-if="item.kind === 'image'"
            :src="item.url"
            :alt="item.alt || item.filename"
            class="size-full object-cover"
          >
          <UIcon
            v-else
            :name="kindIcon(item.kind)"
            class="size-7 text-muted"
          />
        </div>

        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-highlighted truncate">
            {{ item.filename }}
          </p>
          <div class="flex items-center gap-3 flex-wrap text-[11px] text-muted mt-0.5">
            <span>{{ kindLabel(item.kind) }}</span>
            <span class="num">{{ formatBytes(item.sizeBytes) }}</span>
            <span
              v-if="item.width && item.height"
              class="num"
              dir="ltr"
            >
              {{ item.width }}×{{ item.height }}
            </span>
            <span class="num">{{ formatDateTime(item.createdAt) }}</span>
          </div>
        </div>

        <UIcon
          name="i-tabler-chevron-left"
          class="size-4 text-dimmed shrink-0"
        />
      </article>
    </div>

    <div
      v-if="pageCount > 1"
      class="mt-5 flex justify-center"
    >
      <UPagination
        v-model:page="page"
        :total="listMeta.total"
        :items-per-page="listMeta.pageSize || pageSize"
      />
    </div>

    <UModal
      v-model:open="detailOpen"
      :title="$t('جزئیات رسانه')"
      :description="activeItem?.filename"
      :ui="{ content: 'sm:max-w-lg' }"
    >
      <template
        v-if="activeItem"
        #body
      >
        <div class="space-y-4">
          <div class="rounded-xl border border-muted bg-muted overflow-hidden">
            <div class="aspect-video bg-default grid place-items-center">
              <img
                v-if="activeItem.kind === 'image'"
                :src="activeItem.url"
                :alt="activeItem.alt || activeItem.filename"
                class="max-h-full max-w-full object-contain"
              >
              <video
                v-else-if="activeItem.kind === 'video'"
                :src="activeItem.url"
                controls
                class="max-h-full max-w-full"
              />
              <div
                v-else
                class="flex flex-col items-center gap-2 p-6 text-muted"
              >
                <UIcon
                  :name="kindIcon(activeItem.kind)"
                  class="size-12"
                />
                <span class="text-sm">{{ activeItem.filename }}</span>
              </div>
            </div>
          </div>

          <div
            v-if="activeItem.usageHints.length"
            class="rounded-xl border border-muted bg-muted/40 p-3 space-y-2"
          >
            <p class="text-xs font-medium text-toned">
              {{ $t('استفاده شناخته‌شده') }}
            </p>
            <ul class="space-y-1">
              <li
                v-for="(hint, idx) in activeItem.usageHints"
                :key="idx"
                class="text-xs text-muted flex items-center gap-2"
              >
                <UIcon
                  name="i-tabler-link"
                  class="size-3.5 shrink-0"
                />
                {{ hint }}
              </li>
            </ul>
          </div>

          <div class="grid grid-cols-2 gap-3 text-xs">
            <div class="rounded-lg border border-muted p-2.5">
              <span class="text-muted block mb-1">{{ $t('نوع') }}</span>
              <span class="text-highlighted">{{ kindLabel(activeItem.kind) }}</span>
            </div>
            <div class="rounded-lg border border-muted p-2.5">
              <span class="text-muted block mb-1">{{ $t('حجم') }}</span>
              <span class="text-highlighted num">{{ formatBytes(activeItem.sizeBytes) }}</span>
            </div>
            <div
              v-if="activeItem.width && activeItem.height"
              class="rounded-lg border border-muted p-2.5"
            >
              <span class="text-muted block mb-1">{{ $t('ابعاد') }}</span>
              <span
                class="text-highlighted num"
                dir="ltr"
              >{{ activeItem.width }}×{{ activeItem.height }}</span>
            </div>
            <div class="rounded-lg border border-muted p-2.5">
              <span class="text-muted block mb-1">{{ $t('تاریخ') }}</span>
              <span class="text-highlighted num">{{ formatDateTime(activeItem.createdAt) }}</span>
            </div>
          </div>

          <TheFormInput
            :model-value="activeItem.url"
            :label="$t('آدرس')"
            disabled
            dir="ltr"
            class="opacity-80"
          />

          <template v-if="canUpdate">
            <TheFormInput
              v-model="editForm.title"
              :label="$t('عنوان')"
            />
            <TheFormInput
              v-model="editForm.alt"
              :label="$t('متن جایگزین (alt)')"
            />
            <div>
              <label class="text-sm mb-2 block">{{ $t('توضیحات') }}</label>
              <UTextarea
                v-model="editForm.description"
                :rows="3"
                class="w-full"
              />
            </div>
          </template>
          <template v-else>
            <div class="space-y-2 text-sm">
              <div>
                <span class="text-muted text-xs">{{ $t('عنوان') }}</span>
                <p class="text-highlighted">{{ activeItem.title || '—' }}</p>
              </div>
              <div>
                <span class="text-muted text-xs">{{ $t('متن جایگزین (alt)') }}</span>
                <p class="text-highlighted">{{ activeItem.alt || '—' }}</p>
              </div>
              <div v-if="activeItem.description">
                <span class="text-muted text-xs">{{ $t('توضیحات') }}</span>
                <p class="text-highlighted">{{ activeItem.description }}</p>
              </div>
            </div>
          </template>
        </div>
      </template>
      <template #footer>
        <div class="flex items-center gap-2 w-full justify-between flex-wrap">
          <UButton
            v-if="canDelete && activeItem"
            type="button"
            color="error"
            variant="ghost"
            icon="i-tabler-trash"
            class="cursor-pointer"
            @click="openSingleDelete(activeItem)"
          >
            {{ $t('حذف') }}
          </UButton>
          <div class="flex items-center gap-2 ms-auto">
            <UButton
              color="neutral"
              variant="outline"
              class="cursor-pointer"
              @click="detailOpen = false"
            >
              {{ $t('بستن') }}
            </UButton>
            <UButton
              v-if="canUpdate"
              color="primary"
              class="cursor-pointer"
              :loading="saving"
              @click="saveDetail"
            >
              {{ $t('ذخیره') }}
            </UButton>
          </div>
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="bulkDeleteOpen"
      :title="$t('حذف گروهی')"
      :description="$t('فایل‌های انتخاب‌شده از کتابخانه حذف می‌شوند.')"
    >
      <template #body>
        <p class="text-sm text-muted">
          {{ $t('تعداد') }}:
          <span class="font-medium text-highlighted num">{{ selectedIds.length.toLocaleString('fa-IR') }}</span>
        </p>
      </template>
      <template #footer>
        <div class="flex items-center gap-2 w-full justify-end">
          <UButton
            color="neutral"
            variant="outline"
            class="cursor-pointer"
            @click="bulkDeleteOpen = false"
          >
            {{ $t('انصراف') }}
          </UButton>
          <UButton
            color="error"
            class="font-bold cursor-pointer"
            @click="confirmBulkDelete"
          >
            {{ $t('حذف') }}
          </UButton>
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="singleDeleteOpen"
      :title="$t('حذف رسانه')"
      :description="$t('این فایل از کتابخانه حذف می‌شود.')"
    >
      <template #body>
        <div
          v-if="pendingDelete"
          class="rounded-xl border border-muted bg-muted/40 p-4 text-sm"
        >
          <span class="font-medium text-highlighted">{{ pendingDelete.filename }}</span>
        </div>
      </template>
      <template #footer>
        <div class="flex items-center gap-2 w-full justify-end">
          <UButton
            color="neutral"
            variant="outline"
            class="cursor-pointer"
            @click="singleDeleteOpen = false"
          >
            {{ $t('انصراف') }}
          </UButton>
          <UButton
            color="error"
            class="font-bold cursor-pointer"
            @click="confirmSingleDelete"
          >
            {{ $t('حذف') }}
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import {
  formatBytes,
  type SellerMediaItem,
  type SellerMediaKind,
} from '~/data/seller-media'

const { t } = useI18n()
const toast = useAppToast()
const { canAny } = useSellerPermissions()
const {
  media,
  listMeta,
  fetchList,
  uploadFiles,
  updateMedia,
  deleteMedia,
} = useSellerMedia()
const { search, status: kindFilter, page, hasActiveFilters, clearFilters } = useSellerListQuery({
  defaultStatus: 'all',
  statusKey: 'kind',
})

const pageSize = 24
const loading = ref(false)
const viewMode = ref<'grid' | 'list'>('grid')
const fileInputRef = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const selectedIds = ref<string[]>([])
const detailOpen = ref(false)
const activeItem = ref<SellerMediaItem | null>(null)
const editForm = reactive({ title: '', alt: '', description: '' })
const saving = ref(false)
const bulkDeleteOpen = ref(false)
const singleDeleteOpen = ref(false)
const pendingDelete = ref<SellerMediaItem | null>(null)
const deleting = ref(false)

const canUpload = computed(() => canAny('media.upload', 'media.manage'))
const canUpdate = computed(() => canAny('media.update', 'media.manage'))
const canDelete = computed(() => canAny('media.delete', 'media.manage'))

const kindTabs = computed(() => {
  const c = listMeta.value.statusCounts
  return [
    { id: 'all', label: t('همه'), count: Number(c.all) || 0 },
    { id: 'image', label: t('تصویر'), count: Number(c.image) || 0 },
    { id: 'video', label: t('ویدیو'), count: Number(c.video) || 0 },
    { id: 'document', label: t('سند'), count: Number(c.document) || 0 },
  ]
})

const pageCount = computed(() =>
  Math.max(1, Math.ceil((listMeta.value.total || 0) / (listMeta.value.pageSize || pageSize))),
)

const pageIds = computed(() => media.value.map(m => m.id))

const allPageSelected = computed(() =>
  pageIds.value.length > 0 && pageIds.value.every(id => selectedIds.value.includes(id)),
)

const somePageSelected = computed(() =>
  pageIds.value.some(id => selectedIds.value.includes(id)),
)

function apiErrorMessage(error: any, fallback: string) {
  return (
    error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
    || error?.data?.message
    || error?.message
    || fallback
  )
}

async function loadList() {
  loading.value = true
  try {
    const { ok, error } = await fetchList({
      q: search.value || undefined,
      kind: kindFilter.value,
      page: page.value,
      pageSize,
    })
    if (!ok) {
      toast.error(t(apiErrorMessage(error, 'بارگذاری رسانه ناموفق بود')))
    }
  }
  finally {
    loading.value = false
  }
}

function kindIcon(kind: SellerMediaKind) {
  if (kind === 'video') return 'i-tabler-video'
  if (kind === 'document') return 'i-tabler-file-text'
  if (kind === 'image') return 'i-tabler-photo'
  return 'i-tabler-file'
}

function kindLabel(kind: SellerMediaKind) {
  if (kind === 'video') return t('ویدیو')
  if (kind === 'document') return t('سند')
  if (kind === 'image') return t('تصویر')
  return t('سایر')
}

function formatDateTime(iso: string) {
  return iso.slice(0, 16).replace('T', ' ')
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
    if (result.ok) {
      toast.success(`${result.items.length.toLocaleString('fa-IR')} ${t('فایل آپلود شد')}`)
      if (result.error) toast.error(t(result.error))
      await loadList()
    }
    else {
      toast.error(t(result.error || 'آپلود ناموفق بود'))
    }
  }
  catch {
    toast.error(t('آپلود ناموفق بود'))
  }
  finally {
    uploading.value = false
  }
}

function toggleSelect(id: string, checked: boolean) {
  if (checked) {
    if (!selectedIds.value.includes(id)) selectedIds.value = [...selectedIds.value, id]
  }
  else {
    selectedIds.value = selectedIds.value.filter(x => x !== id)
  }
}

function toggleSelectPage(checked: boolean) {
  if (checked) {
    const merged = new Set([...selectedIds.value, ...pageIds.value])
    selectedIds.value = [...merged]
  }
  else {
    const pageSet = new Set(pageIds.value)
    selectedIds.value = selectedIds.value.filter(id => !pageSet.has(id))
  }
}

function openDetail(item: SellerMediaItem) {
  activeItem.value = item
  editForm.title = item.title
  editForm.alt = item.alt
  editForm.description = item.description
  detailOpen.value = true
}

async function saveDetail() {
  if (!activeItem.value) return
  saving.value = true
  try {
    const result = await updateMedia(activeItem.value.id, {
      title: editForm.title.trim(),
      alt: editForm.alt.trim(),
      description: editForm.description.trim(),
    })
    if (!result.ok || !result.item) {
      toast.error(t(result.error || 'به‌روزرسانی رسانه ناموفق بود'))
      return
    }
    activeItem.value = result.item
    toast.success(t('رسانه به‌روزرسانی شد'))
  }
  finally {
    saving.value = false
  }
}

function openSingleDelete(item: SellerMediaItem) {
  pendingDelete.value = item
  singleDeleteOpen.value = true
}

async function confirmSingleDelete() {
  if (!pendingDelete.value) return
  deleting.value = true
  try {
    const result = await deleteMedia([pendingDelete.value.id])
    if (!result.ok) {
      toast.error(t(result.error || 'حذف ناموفق بود'))
      return
    }
    selectedIds.value = selectedIds.value.filter(id => id !== pendingDelete.value!.id)
    if (activeItem.value?.id === pendingDelete.value.id) {
      detailOpen.value = false
      activeItem.value = null
    }
    singleDeleteOpen.value = false
    pendingDelete.value = null
    toast.success(t('رسانه حذف شد'))
    await loadList()
  }
  finally {
    deleting.value = false
  }
}

async function confirmBulkDelete() {
  deleting.value = true
  try {
    const result = await deleteMedia(selectedIds.value)
    if (!result.ok) {
      toast.error(t(result.error || 'حذف گروهی ناموفق بود'))
      return
    }
    if (activeItem.value && selectedIds.value.includes(activeItem.value.id)) {
      detailOpen.value = false
      activeItem.value = null
    }
    const count = selectedIds.value.length
    selectedIds.value = []
    bulkDeleteOpen.value = false
    toast.success(`${count.toLocaleString('fa-IR')} ${t('فایل حذف شد')}`)
    await loadList()
  }
  finally {
    deleting.value = false
  }
}

watch(
  [search, kindFilter, page],
  () => {
    void loadList()
  },
)

onMounted(() => {
  void loadList()
})
</script>
