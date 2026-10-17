<template>
  <div class="space-y-5">
    <p class="text-xs text-muted leading-6">
      {{ $t('محصولات مرتبط یک‌طرفه هستند؛ فقط هنگام افزودن این محصول به سبد (و در صفحه سبد) نمایش داده می‌شوند. اگر خالی بماند چیزی نشان داده نمی‌شود.') }}
    </p>

    <!-- Selected (order = display order) -->
    <section
      v-if="selectedProducts.length"
      class="space-y-3"
    >
      <div class="flex items-center justify-between gap-2">
        <h3 class="text-sm font-bold text-highlighted">
          {{ $t('انتخاب‌شده‌ها') }}
          <span class="text-muted font-normal num ms-1">
            ({{ selectedProducts.length.toLocaleString('fa-IR') }})
          </span>
        </h3>
        <p class="text-[11px] text-muted">
          {{ $t('ترتیب = ترتیب نمایش در فروشگاه') }}
        </p>
      </div>
      <ul class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-2">
        <li
          v-for="(item, index) in selectedProducts"
          :key="item.id"
          class="relative flex flex-col gap-1.5 rounded-xl border border-primary/30 bg-primary/5 p-2"
        >
          <span class="absolute top-1 start-1 z-10 size-5 rounded-full bg-primary text-inverted text-[10px] font-bold num flex items-center justify-center shadow-sm">
            {{ (index + 1).toLocaleString('fa-IR') }}
          </span>
          <div class="aspect-square w-full rounded-lg overflow-hidden bg-muted">
            <TheIcon
              v-if="item.image"
              :name="item.image"
              icon-type="img"
              class="!w-full !h-full object-cover"
            />
            <TheIcon
              v-else
              name="noImage.png"
              icon-type="img"
              class="!w-full !h-full object-contain p-2 opacity-60"
            />
          </div>
          <p class="text-[11px] font-medium text-highlighted line-clamp-2 leading-4 min-h-8">
            {{ item.title }}
          </p>
          <div class="flex items-center gap-0.5 mt-auto">
            <UButton
              type="button"
              color="neutral"
              variant="soft"
              size="xs"
              square
              icon="i-tabler-arrow-up"
              class="cursor-pointer"
              :disabled="index === 0"
              :aria-label="$t('بالا')"
              @click="moveSelected(index, -1)"
            />
            <UButton
              type="button"
              color="neutral"
              variant="soft"
              size="xs"
              square
              icon="i-tabler-arrow-down"
              class="cursor-pointer"
              :disabled="index >= selectedProducts.length - 1"
              :aria-label="$t('پایین')"
              @click="moveSelected(index, 1)"
            />
            <UButton
              type="button"
              color="error"
              variant="soft"
              size="xs"
              square
              icon="i-tabler-trash"
              class="cursor-pointer ms-auto"
              :aria-label="$t('حذف')"
              @click="toggle(item.id)"
            />
          </div>
        </li>
      </ul>
    </section>

    <!-- Catalog: search-first -->
    <section class="space-y-3">
      <div class="flex flex-col sm:(flex-row items-center) gap-3">
        <h3 class="text-sm font-bold text-highlighted shrink-0">
          {{ $t('جستجو و افزودن') }}
        </h3>
        <UInput
          v-model="query"
          icon="i-tabler-search"
          :placeholder="$t('حداقل ۲ حرف برای جستجو...')"
          class="w-full sm:max-w-md"
          size="md"
          :loading="pending"
        />
        <span
          v-if="hasSearched && !pending"
          class="text-[11px] text-muted num shrink-0 sm:ms-auto"
        >
          {{ total.toLocaleString('fa-IR') }}
          {{ $t('نتیجه') }}
        </span>
      </div>

      <div
        v-if="!hasSearched && !pending"
        class="rounded-2xl border border-dashed border-muted bg-muted/30 px-4 py-10 text-center space-y-1"
      >
        <UIcon
          name="i-tabler-search"
          class="size-8 text-dimmed mx-auto"
        />
        <p class="text-sm text-muted">
          {{ $t('برای دیدن محصولات، نام یا برند را جستجو کنید') }}
        </p>
        <p class="text-[11px] text-dimmed">
          {{ $t('کاتالوگ کامل بارگذاری نمی‌شود تا سرعت پنل حفظ شود') }}
        </p>
      </div>

      <div
        v-else-if="pending && !results.length"
        class="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-2"
      >
        <div
          v-for="n in 16"
          :key="n"
          class="rounded-xl border border-muted bg-muted/40 animate-pulse aspect-[3/4]"
        />
      </div>

      <template v-else-if="results.length">
        <div class="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-2">
          <button
            v-for="item in results"
            :key="item.id"
            type="button"
            class="group relative text-start rounded-xl border p-1.5 transition cursor-pointer flex flex-col gap-1"
            :class="isSelected(item.id)
              ? 'border-primary bg-primary/10 ring-2 ring-primary/25'
              : 'border-muted bg-default hover:(border-primary/40 bg-primary/5)'"
            :aria-pressed="isSelected(item.id)"
            @click="toggle(item.id)"
          >
            <span
              v-if="isSelected(item.id)"
              class="absolute top-1 end-1 z-10 size-5 rounded-full bg-primary text-inverted flex items-center justify-center shadow-sm"
            >
              <UIcon
                name="i-tabler-check"
                class="size-3"
              />
            </span>
            <div class="aspect-square w-full rounded-lg overflow-hidden bg-muted">
              <TheIcon
                v-if="item.image"
                :name="item.image"
                icon-type="img"
                class="!w-full !h-full object-cover transition group-hover:scale-105"
              />
              <TheIcon
                v-else
                name="noImage.png"
                icon-type="img"
                class="!w-full !h-full object-contain p-2 opacity-60"
              />
            </div>
            <p class="text-[10px] font-medium text-highlighted line-clamp-2 leading-4 min-h-7">
              {{ item.title }}
            </p>
            <p class="text-[10px] text-muted num mt-auto truncate">
              {{ formatPrice(item.price) }}
            </p>
          </button>
        </div>

        <div
          v-if="pageCount > 1"
          class="flex justify-center pt-1"
        >
          <UPagination
            :page="page"
            :total="total"
            :items-per-page="pageSize"
            :sibling-count="1"
            show-edges
            size="sm"
            @update:page="onPage"
          />
        </div>
      </template>

      <div
        v-else-if="hasSearched && !pending"
        class="rounded-2xl border border-dashed border-muted bg-muted/30 px-4 py-10 text-center text-sm text-muted"
      >
        {{ $t('محصولی با این جستجو پیدا نشد') }}
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { formatPrice, type Product } from '~/data/products'

const model = defineModel<string[]>({ default: () => [] })

const props = defineProps<{
  excludeProductId?: string
}>()

const { fetchProducts, getCachedProduct } = useProducts()

const PAGE_SIZE = 24
const MIN_QUERY = 2

const query = ref('')
const debouncedQuery = refDebounced(query, 400)
const results = ref<Product[]>([])
const selectedCache = ref<Record<string, Product>>({})
const pending = ref(false)
const page = ref(1)
const total = ref(0)
const hasSearched = ref(false)
const pageSize = PAGE_SIZE

const pageCount = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))

const selectedIds = computed(() =>
  Array.isArray(model.value) ? model.value : [],
)

const selectedSet = computed(() => new Set(selectedIds.value))

const selectedProducts = computed(() =>
  selectedIds.value
    .map(id => selectedCache.value[id] || getCachedProduct(id) || results.value.find(p => p.id === id))
    .filter((p): p is Product => Boolean(p)),
)

function isSelected(id: string) {
  return selectedSet.value.has(id)
}

function cacheLocal(products: Product[]) {
  if (!products.length) return
  const next = { ...selectedCache.value }
  for (const p of products) next[p.id] = p
  selectedCache.value = next
}

function setSelected(ids: string[]) {
  model.value = [...ids]
}

function toggle(id: string) {
  const current = selectedIds.value
  if (selectedSet.value.has(id)) {
    setSelected(current.filter(item => item !== id))
    return
  }
  const fromResults = results.value.find(p => p.id === id)
  if (fromResults) cacheLocal([fromResults])
  setSelected([...current, id])
}

function moveSelected(index: number, delta: number) {
  const next = [...selectedIds.value]
  const target = index + delta
  if (target < 0 || target >= next.length) return
  const [row] = next.splice(index, 1)
  if (!row) return
  next.splice(target, 0, row)
  setSelected(next)
}

async function loadSelected() {
  const ids = selectedIds.value
  const missing = ids.filter(
    id => !selectedCache.value[id] && !getCachedProduct(id),
  )
  if (!missing.length) {
    for (const id of ids) {
      const cached = getCachedProduct(id)
      if (cached) selectedCache.value[id] = cached
    }
    return
  }
  const { result } = await fetchProducts({
    ids: missing,
    pageSize: Math.min(100, missing.length),
  })
  if (result.items.length) cacheLocal(result.items)
}

async function search(term: string, nextPage = 1) {
  const q = term.trim()
  if (q.length < MIN_QUERY) {
    results.value = []
    total.value = 0
    hasSearched.value = false
    return
  }

  pending.value = true
  hasSearched.value = true
  try {
    const { result } = await fetchProducts({
      q,
      page: nextPage,
      pageSize,
      sort: 'newest',
    })
    const selfId = props.excludeProductId || ''
    results.value = (result.items || []).filter(p => p.id !== selfId)
    total.value = result.total || 0
    page.value = result.page || nextPage
  }
  finally {
    pending.value = false
  }
}

function onPage(next: number) {
  if (next === page.value) return
  page.value = next
  void search(debouncedQuery.value, next)
}

watch(debouncedQuery, (value) => {
  page.value = 1
  void search(value, 1)
})

watch(
  () => selectedIds.value.join(','),
  () => { void loadSelected() },
  { immediate: true },
)

defineExpose({
  reload: () => search(debouncedQuery.value, page.value),
})
</script>
