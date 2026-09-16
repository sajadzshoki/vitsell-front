<template>
  <div v-if="!can('products.import')" class="rounded-2xl border border-muted bg-default p-6 text-sm text-muted">
    {{ $t('دسترسی ایمپورت محصول را ندارید.') }}
  </div>

  <div v-else class="space-y-5">
    <TheSellerPageHeader
      :title="$t('ایمپورت تکنولایف')"
      :description="$t('آدرس صفحات محصول تکنولایف را وارد کنید؛ ابتدا پیش‌نمایش، سپس ایمپورت به کاتالوگ ویتسل.')"
    >
      <template #actions>
        <UButton
          color="neutral"
          variant="soft"
          class="cursor-pointer"
          :loading="historyLoading"
          @click="loadHistory"
        >
          {{ $t('تاریخچه') }}
        </UButton>
      </template>
    </TheSellerPageHeader>

    <div class="rounded-2xl border border-muted bg-default p-5 md:p-6 space-y-4">
      <label class="block text-sm text-highlighted font-medium" for="tl-urls">
        {{ $t('آدرس‌های محصول (هر خط یک URL)') }}
      </label>
      <textarea
        id="tl-urls"
        v-model="urlsText"
        rows="6"
        class="w-full rounded-xl border border-muted bg-default px-3 py-2 text-sm text-start leading-6"
        :placeholder="'https://www.technolife.ir/product-12345/...'"
        dir="ltr"
      />

      <div class="flex flex-wrap items-center gap-3">
        <label class="inline-flex items-center gap-2 text-sm cursor-pointer">
          <input v-model="modeUpsert" type="checkbox" class="cursor-pointer">
          <span>{{ $t('به‌روزرسانی در صورت تکراری (upsert)') }}</span>
        </label>
        <label class="inline-flex items-center gap-2 text-sm cursor-pointer">
          <input v-model="updatePrice" type="checkbox" class="cursor-pointer">
          <span>{{ $t('به‌روزرسانی قیمت') }}</span>
        </label>
        <label class="inline-flex items-center gap-2 text-sm cursor-pointer">
          <input v-model="downloadImages" type="checkbox" class="cursor-pointer">
          <span>{{ $t('دانلود تصاویر') }}</span>
        </label>
      </div>

      <div class="flex flex-wrap gap-2">
        <UButton
          color="neutral"
          variant="soft"
          class="cursor-pointer"
          :loading="previewLoading"
          :disabled="!parsedUrls.length"
          @click="runPreview"
        >
          {{ $t('پیش‌نمایش') }}
        </UButton>
        <UButton
          color="primary"
          class="cursor-pointer"
          :loading="importLoading"
          :disabled="!parsedUrls.length"
          @click="runImport"
        >
          {{ $t('شروع ایمپورت') }}
        </UButton>
      </div>
    </div>

    <div v-if="previewRows.length" class="rounded-2xl border border-muted bg-default p-5 md:p-6 space-y-3">
      <h3 class="font-bold text-highlighted text-sm">
        {{ $t('نتیجه پیش‌نمایش') }}
      </h3>
      <div
        v-for="(row, idx) in previewRows"
        :key="idx"
        class="rounded-xl border border-muted p-3 space-y-2"
      >
        <div class="flex flex-wrap items-center gap-2">
          <UBadge
            variant="subtle"
            :color="row.error ? 'error' : row.duplicate ? 'warning' : 'success'"
          >
            {{ row.error ? row.error.code : row.duplicate ? 'DUPLICATE' : 'OK' }}
          </UBadge>
          <span class="text-xs text-muted break-all dir-ltr" dir="ltr">{{ row.url }}</span>
        </div>
        <p v-if="row.normalized?.title" class="text-sm text-highlighted">
          {{ row.normalized.title }}
        </p>
        <p class="text-xs text-muted">
          <span v-if="row.brand">{{ $t('برند') }}: {{ row.brand.name }} · </span>
          <span v-if="row.category">{{ $t('دسته') }}: {{ row.category.label }} · </span>
          <span v-if="row.normalized?.priceToman" class="num">
            {{ $t('قیمت') }}: {{ row.normalized.priceToman.toLocaleString('fa-IR') }}
          </span>
        </p>
        <p v-if="row.duplicate" class="text-xs text-warning">
          {{ $t('تکراری') }}: {{ row.duplicate.productId }} ({{ row.duplicate.reason }})
        </p>
        <p v-if="row.error" class="text-xs text-error">
          {{ row.error.message }}
        </p>
        <ul v-if="row.warnings?.length" class="text-xs text-muted list-disc ps-4">
          <li v-for="(w, wi) in row.warnings" :key="wi">
            {{ w }}
          </li>
        </ul>
      </div>
    </div>

    <div v-if="activeBatch" class="rounded-2xl border border-muted bg-default p-5 md:p-6 space-y-3">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h3 class="font-bold text-highlighted text-sm">
          {{ $t('بچ') }} #{{ activeBatch.id }}
        </h3>
        <div class="flex items-center gap-2">
          <UBadge variant="subtle" :color="batchColor(activeBatch.status)">
            {{ activeBatch.status }}
          </UBadge>
          <UButton
            v-if="activeBatch.failedCount > 0"
            size="sm"
            color="neutral"
            variant="soft"
            class="cursor-pointer"
            :loading="retryLoading"
            @click="retryActive"
          >
            {{ $t('تلاش مجدد ناموفق‌ها') }}
          </UButton>
        </div>
      </div>
      <p class="text-xs text-muted num">
        {{ $t('موفق') }} {{ activeBatch.successCount }}
        · {{ $t('تکراری') }} {{ activeBatch.duplicateCount }}
        · {{ $t('ناموفق') }} {{ activeBatch.failedCount }}
        / {{ activeBatch.totalCount }}
      </p>
      <div
        v-for="item in activeBatch.items || []"
        :key="item.id"
        class="rounded-xl border border-muted p-3 text-sm space-y-1"
      >
        <div class="flex flex-wrap items-center gap-2">
          <UBadge variant="subtle" :color="batchColor(item.status)">
            {{ item.status }}
          </UBadge>
          <NuxtLink
            v-if="item.productId"
            :to="`/seller/products/${item.productId}`"
            class="text-primary text-xs cursor-pointer"
          >
            {{ item.productId }}
          </NuxtLink>
        </div>
        <p class="text-xs text-muted break-all" dir="ltr">
          {{ item.sourceUrl }}
        </p>
        <p v-if="item.errorMessage" class="text-xs text-error">
          {{ item.errorMessage }}
        </p>
      </div>
    </div>

    <div v-if="history.length" class="rounded-2xl border border-muted bg-default p-5 md:p-6 space-y-3">
      <h3 class="font-bold text-highlighted text-sm">
        {{ $t('تاریخچه اخیر') }}
      </h3>
      <button
        v-for="b in history"
        :key="b.id"
        type="button"
        class="w-full text-start rounded-xl border border-muted p-3 hover:bg-primary/10 cursor-pointer"
        @click="openBatch(b.id)"
      >
        <div class="flex items-center justify-between gap-2">
          <span class="text-sm">#{{ b.id }} · {{ b.mode }}</span>
          <UBadge variant="subtle" :color="batchColor(b.status)">
            {{ b.status }}
          </UBadge>
        </div>
        <p class="text-xs text-muted mt-1 num">
          {{ b.successCount }}/{{ b.totalCount }} · {{ b.createdAt || '—' }}
        </p>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TechnolifeBatch, TechnolifePreviewRow } from '~/composables/useSellerTechnolifeImport'

const { can } = useSellerPermissions()
const toast = useToast()
const api = useSellerTechnolifeImport()

const urlsText = ref('')
const modeUpsert = ref(false)
const updatePrice = ref(false)
const downloadImages = ref(true)
const previewLoading = ref(false)
const importLoading = ref(false)
const historyLoading = ref(false)
const retryLoading = ref(false)
const previewRows = ref<TechnolifePreviewRow[]>([])
const activeBatch = ref<TechnolifeBatch | null>(null)
const history = ref<TechnolifeBatch[]>([])
let pollTimer: ReturnType<typeof setInterval> | null = null

const parsedUrls = computed(() =>
  urlsText.value
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#')),
)

function batchColor(status: string) {
  if (status === 'success') return 'success'
  if (status === 'failed') return 'error'
  if (status === 'partial' || status === 'duplicate') return 'warning'
  if (status === 'processing') return 'info'
  return 'neutral'
}

function stopPoll() {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

async function runPreview() {
  previewLoading.value = true
  try {
    const { result, error } = await api.preview(parsedUrls.value)
    if (error || !result) {
      toast.add({ title: 'پیش‌نمایش ناموفق', color: 'error' })
      return
    }
    previewRows.value = result.results || []
  }
  finally {
    previewLoading.value = false
  }
}

async function runImport() {
  importLoading.value = true
  try {
    const { result, error } = await api.startImport({
      urls: parsedUrls.value,
      mode: modeUpsert.value ? 'upsert' : 'create_only',
      downloadImages: downloadImages.value,
      fieldPolicy: {
        updatePrice: updatePrice.value,
        updateInventory: false,
        updateDescription: true,
        updateImages: downloadImages.value,
        updateSpecs: true,
      },
    })
    if (error || !result) {
      toast.add({ title: 'شروع ایمپورت ناموفق', color: 'error' })
      return
    }
    activeBatch.value = result
    toast.add({ title: `بچ #${result.id} شروع شد`, color: 'success' })
    startPoll(result.id)
  }
  finally {
    importLoading.value = false
  }
}

function startPoll(id: number) {
  stopPoll()
  pollTimer = setInterval(() => {
    void openBatch(id, true)
  }, 2000)
}

async function openBatch(id: number, quiet = false) {
  const { result, error } = await api.showImport(id)
  if (error || !result) {
    if (!quiet) toast.add({ title: 'بارگذاری بچ ناموفق', color: 'error' })
    return
  }
  activeBatch.value = result
  if (['success', 'failed', 'partial'].includes(result.status)) {
    stopPoll()
    await loadHistory()
  }
}

async function retryActive() {
  if (!activeBatch.value) return
  retryLoading.value = true
  try {
    const id = activeBatch.value.id
    const { error } = await api.retryImport(id)
    if (error) {
      toast.add({ title: 'تلاش مجدد ناموفق', color: 'error' })
      return
    }
    startPoll(id)
  }
  finally {
    retryLoading.value = false
  }
}

async function loadHistory() {
  historyLoading.value = true
  try {
    const { result } = await api.listImports(1)
    history.value = result?.items || []
  }
  finally {
    historyLoading.value = false
  }
}

onMounted(() => {
  void loadHistory()
})

onBeforeUnmount(() => {
  stopPoll()
})
</script>
