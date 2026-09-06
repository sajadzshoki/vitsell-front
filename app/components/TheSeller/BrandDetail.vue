<template>
  <div
    v-if="loading && !brand"
    class="py-16 grid place-items-center"
  >
    <UIcon
      name="i-tabler-loader-2"
      class="size-8 text-primary animate-spin"
    />
  </div>

  <div
    v-else-if="!brand"
    class="bg-default border border-muted rounded-2xl p-8 text-center"
  >
    <UIcon
      name="i-tabler-trademark"
      class="size-14 text-dimmed mx-auto mb-4"
    />
    <p class="text-sm text-muted mb-4">
      {{ $t('برند پیدا نشد') }}
    </p>
    <UButton
      to="/seller/brands"
      color="primary"
      variant="soft"
      class="cursor-pointer"
    >
      {{ $t('بازگشت به برندها') }}
    </UButton>
  </div>

  <div
    v-else
    class="space-y-5"
  >
    <div class="md:hidden">
      <UButton
        to="/seller/brands"
        color="neutral"
        variant="ghost"
        size="sm"
        icon="i-tabler-chevron-right"
        class="cursor-pointer"
      >
        {{ $t('بازگشت به برندها') }}
      </UButton>
    </div>

    <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-4 sm:p-5 md:p-6 max-lg:p-0">
      <div class="flex items-start gap-3 sm:gap-4">
        <div class="size-20 sm:size-24 rounded-2xl bg-muted border border-muted overflow-hidden shrink-0 grid place-items-center">
          <img
            v-if="brand.logo"
            :src="brand.logo"
            :alt="brand.name"
            class="size-full object-contain p-2"
          >
          <TheIcon
            v-else
            icon-type="img"
            name="noImage.png"
            class="size-10 opacity-60"
          />
        </div>

        <div class="min-w-0 flex-1">
          <div class="flex items-start justify-between gap-2 flex-wrap">
            <div class="min-w-0">
              <h2 class="font-bold text-highlighted text-sm sm:text-base leading-7">
                {{ brand.name }}
              </h2>
              <p
                class="text-xs text-muted mt-1 num"
                dir="ltr"
              >
                {{ brand.slug }}
              </p>
            </div>
            <UBadge
              :color="brand.status === 'active' ? 'success' : 'neutral'"
              variant="subtle"
              size="sm"
              class="font-medium shrink-0"
            >
              {{ brand.status === 'active' ? $t('فعال') : $t('غیرفعال') }}
            </UBadge>
          </div>

          <div class="mt-3 flex items-center gap-2 flex-wrap">
            <UButton
              type="button"
              color="primary"
              variant="soft"
              size="sm"
              icon="i-tabler-external-link"
              class="cursor-pointer"
              @click="openStorefront"
            >
              {{ $t('نمایش') }}
            </UButton>
            <UButton
              v-if="can('brands.update')"
              type="button"
              color="neutral"
              variant="soft"
              size="sm"
              icon="i-tabler-pencil"
              class="cursor-pointer"
              @click="onTabClick('edit')"
            >
              {{ $t('ویرایش') }}
            </UButton>
          </div>

          <p
            v-if="brand.description"
            class="text-xs text-muted mt-3 leading-6 line-clamp-3"
          >
            {{ brand.description }}
          </p>
        </div>
      </div>

      <div class="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div
          v-for="stat in headerStats"
          :key="stat.label"
          class="bg-muted rounded-xl px-3 py-2.5 text-center"
        >
          <div class="text-sm font-bold text-highlighted num leading-none">
            {{ stat.value }}
          </div>
          <div class="text-[10px] text-muted mt-1.5 leading-tight">
            {{ $t(stat.label) }}
          </div>
        </div>
      </div>
    </div>

    <div class="flex items-center gap-2 overflow-x-auto scrollbar-none">
      <UButton
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        :color="activeTab === tab.id ? 'primary' : 'neutral'"
        :variant="activeTab === tab.id ? 'soft' : 'ghost'"
        size="sm"
        class="shrink-0 cursor-pointer"
        @click="onTabClick(tab.id)"
      >
        {{ $t(tab.label) }}
        <span
          v-if="tab.count != null"
          class="num ms-1"
        >
          {{ tab.count.toLocaleString('fa-IR') }}
        </span>
      </UButton>
    </div>

    <TheSellerBrandForm
      v-if="activeTab === 'edit'"
      :initial="brand"
    />

    <div
      v-else
      class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-4 sm:p-5 md:p-6 max-lg:p-0"
    >
      <div
        v-if="activeTab === 'summary'"
        class="space-y-5"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-muted border border-muted rounded-2xl p-4 space-y-3">
            <h3 class="text-sm font-bold text-highlighted">
              {{ $t('اطلاعات پایه') }}
            </h3>
            <dl class="space-y-2 text-sm">
              <div class="flex items-center justify-between gap-3">
                <dt class="text-muted">
                  {{ $t('نام') }}
                </dt>
                <dd class="font-medium text-highlighted">
                  {{ brand.name }}
                </dd>
              </div>
              <div class="flex items-center justify-between gap-3">
                <dt class="text-muted">
                  {{ $t('اسلاگ') }}
                </dt>
                <dd
                  class="font-medium text-highlighted num"
                  dir="ltr"
                >
                  {{ brand.slug }}
                </dd>
              </div>
              <div class="flex items-center justify-between gap-3">
                <dt class="text-muted">
                  {{ $t('ترتیب نمایش') }}
                </dt>
                <dd class="font-medium text-highlighted num">
                  {{ brand.sortOrder.toLocaleString('fa-IR') }}
                </dd>
              </div>
            </dl>
          </div>

          <div class="bg-muted border border-muted rounded-2xl p-4 space-y-3">
            <h3 class="text-sm font-bold text-highlighted">
              {{ $t('زمان‌بندی') }}
            </h3>
            <dl class="space-y-2 text-sm">
              <div class="flex items-center justify-between gap-3">
                <dt class="text-muted">
                  {{ $t('ایجاد') }}
                </dt>
                <dd
                  class="font-medium text-highlighted num"
                  dir="ltr"
                >
                  {{ formatDate(brand.createdAt) }}
                </dd>
              </div>
              <div class="flex items-center justify-between gap-3">
                <dt class="text-muted">
                  {{ $t('آخرین به‌روزرسانی') }}
                </dt>
                <dd
                  class="font-medium text-highlighted num"
                  dir="ltr"
                >
                  {{ formatDate(brand.updatedAt) }}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div
          v-if="can('brands.update')"
          class="flex justify-end"
        >
          <UButton
            type="button"
            color="primary"
            variant="soft"
            size="sm"
            icon="i-tabler-pencil"
            class="cursor-pointer"
            @click="onTabClick('edit')"
          >
            {{ $t('ویرایش برند') }}
          </UButton>
        </div>
      </div>

      <div
        v-else-if="activeTab === 'products'"
        class="space-y-3"
      >
        <TheSellerEmptyState
          v-if="!brandListings.length"
          icon="i-tabler-package-off"
          :message="$t('محصولی برای این برند ثبت نشده است')"
        />
        <TheSellerProductRow
          v-for="listing in brandListings"
          :key="listing.productId"
          :listing="listing"
        />
      </div>

      <div
        v-else-if="activeTab === 'seo'"
        class="space-y-4"
      >
        <div class="rounded-xl border border-muted bg-muted/40 p-4 max-w-xl">
          <div class="text-primary text-base font-medium truncate">
            {{ brand.seo.metaTitle || brand.name }}
          </div>
          <div
            class="text-[11px] text-success mt-0.5 truncate num"
            dir="ltr"
          >
            {{ brand.seo.canonicalUrl || `/brand/${brand.slug}` }}
          </div>
          <p class="text-xs text-muted mt-1 line-clamp-2 leading-5">
            {{ brand.seo.metaDescription || brand.description || $t('توضیح متا تنظیم نشده') }}
          </p>
        </div>

        <dl class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div
            v-for="field in seoFields"
            :key="field.key"
            class="bg-muted border border-muted rounded-xl p-3"
          >
            <dt class="text-xs text-muted mb-1">
              {{ field.label }}
            </dt>
            <dd
              class="text-highlighted break-words"
              :class="field.ltr ? 'num' : ''"
              :dir="field.ltr ? 'ltr' : undefined"
            >
              {{ field.value || '—' }}
            </dd>
          </div>
        </dl>

        <div
          v-if="can('brands.update')"
          class="flex justify-end"
        >
          <UButton
            type="button"
            color="primary"
            variant="soft"
            size="sm"
            icon="i-tabler-pencil"
            class="cursor-pointer"
            @click="onTabClick('edit')"
          >
            {{ $t('ویرایش سئو') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { brandStorefrontHref } from '~/data/categories'

const props = defineProps<{
  brandId: string
}>()

const { t } = useI18n()
const route = useRoute()
const { can } = useSellerPermissions()
const { storeUrl } = useAppMode()
const { getById, fetchBrand } = useSellerBrands()
const { listings, resolveProduct, fetchListings } = useSeller()

type TabId = 'summary' | 'products' | 'seo' | 'edit'
const validTabs: TabId[] = ['summary', 'products', 'seo', 'edit']

function tabFromQuery(raw: unknown): TabId {
  const value = typeof raw === 'string' ? raw : ''
  return validTabs.includes(value as TabId) ? (value as TabId) : 'summary'
}

const loading = ref(true)
const activeTab = ref<TabId>(tabFromQuery(route.query.tab))
const brand = computed(() => getById(props.brandId))

function openStorefront() {
  const name = brand.value?.name?.trim()
  if (!name) return
  const href = brandStorefrontHref(storeUrl, name)
  if (import.meta.client) window.open(href, '_blank', 'noopener,noreferrer')
}

onMounted(async () => {
  loading.value = true
  try {
    await fetchBrand(props.brandId, { force: true })
    void fetchListings({ force: true, query: { all: true, pageSize: 200 } })
  }
  finally {
    loading.value = false
  }
})

watch(
  () => props.brandId,
  (id) => {
    if (id) void fetchBrand(id, { force: true })
  },
)

const brandListings = computed(() => {
  const name = brand.value?.name
  if (!name) return []
  return listings.value.filter(l => resolveProduct(l.productId).brand === name)
})

const headerStats = computed(() => [
  {
    label: 'محصول',
    value: (brand.value?.productCount ?? brandListings.value.length).toLocaleString('fa-IR'),
  },
  { label: 'ترتیب', value: (brand.value?.sortOrder ?? 0).toLocaleString('fa-IR') },
  {
    label: 'وضعیت',
    value: brand.value?.status === 'active' ? t('فعال') : t('غیرفعال'),
  },
  {
    label: 'Robots',
    value: brand.value?.seo.robots ?? 'index,follow',
  },
])

const tabs = computed(() => [
  { id: 'summary' as const, label: 'خلاصه' },
  {
    id: 'products' as const,
    label: 'محصولات',
    count: brand.value?.productCount ?? brandListings.value.length,
  },
  { id: 'seo' as const, label: 'سئو' },
  ...(can('brands.update') ? [{ id: 'edit' as const, label: 'ویرایش' }] : []),
])

const seoFields = computed(() => {
  const seo = brand.value?.seo
  if (!seo) return []
  return [
    { key: 'metaTitle', label: 'Meta Title', value: seo.metaTitle, ltr: false },
    { key: 'metaDescription', label: 'Meta Description', value: seo.metaDescription, ltr: false },
    { key: 'metaKeywords', label: t('کلمات کلیدی'), value: seo.metaKeywords, ltr: false },
    { key: 'canonicalUrl', label: 'Canonical URL', value: seo.canonicalUrl, ltr: true },
    { key: 'robots', label: 'Robots', value: seo.robots, ltr: true },
    { key: 'ogTitle', label: 'OG Title', value: seo.ogTitle, ltr: false },
    { key: 'ogDescription', label: 'OG Description', value: seo.ogDescription, ltr: false },
    { key: 'ogImage', label: 'OG Image', value: seo.ogImage, ltr: true },
  ]
})

watch(
  () => route.query.tab,
  (tab) => {
    const next = tabFromQuery(tab)
    if (activeTab.value !== next) activeTab.value = next
  },
)

function onTabClick(tab: TabId) {
  setTab(tab)
}

function setTab(tab: TabId) {
  if (activeTab.value !== tab) activeTab.value = tab
  const query: Record<string, string> = {}
  for (const [key, value] of Object.entries(route.query)) {
    if (key === 'tab') continue
    if (typeof value === 'string' && value) query[key] = value
  }
  if (tab !== 'summary') query.tab = tab
  const sameTabQuery = (route.query.tab ?? undefined) === (query.tab ?? undefined)
  if (sameTabQuery) return
  void navigateTo({ path: route.path, query }, { replace: true })
}

function formatDate(iso: string) {
  return iso.slice(0, 10)
}
</script>
