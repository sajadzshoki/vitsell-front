<template>
  <div
    v-if="loading"
    class="space-y-5"
  >
    <USkeleton class="h-36 rounded-2xl" />
    <USkeleton class="h-12 rounded-2xl" />
    <USkeleton class="h-64 rounded-2xl" />
  </div>

  <div
    v-else-if="!listing"
    class="bg-default border border-muted rounded-2xl p-8 text-center"
  >
    <UIcon
      name="i-tabler-package-off"
      class="size-14 text-dimmed mx-auto mb-4"
    />
    <p class="text-sm text-muted mb-4">
      {{ $t(loadError || 'محصول پیدا نشد') }}
    </p>
    <UButton
      to="/seller/products"
      color="primary"
      variant="soft"
    >
      {{ $t('بازگشت به محصولات') }}
    </UButton>
  </div>

  <div
    v-else
    class="space-y-5"
  >
    <div class="md:hidden">
      <UButton
        to="/seller/products"
        color="neutral"
        variant="ghost"
        size="sm"
        icon="i-tabler-chevron-right"
      >
        {{ $t('بازگشت به محصولات') }}
      </UButton>
    </div>

    <!-- Header -->
    <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-4 sm:p-5 md:p-6 max-lg:p-0">
      <div class="flex items-start gap-3 sm:gap-4">
        <img
          v-if="product.image"
          :src="product.image"
          :alt="product.title"
          class="size-20 sm:size-24 rounded-2xl object-cover bg-muted shrink-0"
        >
        <div
          v-else
          class="size-20 sm:size-24 rounded-2xl bg-muted grid place-items-center shrink-0"
        >
          <TheIcon
            icon-type="img"
            name="noImage.png"
            class="size-10 opacity-60"
          />
        </div>

        <div class="min-w-0 flex-1">
          <div class="flex items-start justify-between gap-2 flex-wrap">
            <div class="min-w-0">
              <h2 class="font-bold text-highlighted text-sm sm:text-base leading-7 line-clamp-2">
                {{ product.title }}
              </h2>
              <p class="text-xs text-muted mt-1">
                {{ product.brand }}
                <span v-if="product.categoryLabel"> · {{ product.categoryLabel }}</span>
              </p>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <UBadge
                :color="statusMeta.color"
                variant="subtle"
                size="sm"
                class="font-medium"
              >
                {{ $t(statusMeta.label) }}
              </UBadge>
              <UButton
                :to="`/product/${productId}`"
                color="neutral"
                variant="ghost"
                size="xs"
                icon="i-tabler-external-link"
                :aria-label="$t('مشاهده در فروشگاه')"
              />
            </div>
          </div>

          <div class="mt-3 flex items-baseline gap-2 flex-wrap">
            <span class="text-base sm:text-lg font-black text-highlighted num">
              {{ formatPrice(product.price) }}
            </span>
            <span class="text-xs text-muted">{{ $t('تومان') }}</span>
            <span
              v-if="product.oldPrice && product.oldPrice > product.price"
              class="text-xs text-muted line-through num"
            >
              {{ formatPrice(product.oldPrice) }}
            </span>
            <UBadge
              v-if="discountPct > 0"
              color="error"
              variant="subtle"
              size="sm"
              class="font-medium num"
            >
              {{ discountPct.toLocaleString('fa-IR') }}٪
            </UBadge>
          </div>
        </div>
      </div>

      <div class="mt-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
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

    <!-- Tabs -->
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

    <!-- Edit (full form, own cards) -->
    <TheSellerProductForm
      v-if="activeTab === 'edit'"
      mode="edit"
      :product-id="productId"
      @saved="onEditSaved"
      @cancel="setTab('summary')"
    />

    <div
      v-else
      class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-4 sm:p-5 md:p-6 max-lg:p-0"
    >
      <!-- Summary -->
      <div
        v-if="activeTab === 'summary'"
        class="space-y-5"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-muted border border-muted rounded-2xl p-4 space-y-4">
            <h3 class="text-sm font-bold text-highlighted">
              {{ $t('موجودی و وضعیت') }}
            </h3>

            <div>
              <label class="text-xs text-muted mb-1.5 block">{{ $t('موجودی') }}</label>
              <TheFormInput
                v-model="stockInput"
                inputmode="numeric"
                class="num"
                :placeholder="$t('تعداد')"
              />
            </div>

            <div>
              <label class="text-xs text-muted mb-1.5 block">{{ $t('وضعیت') }}</label>
              <USelect
                v-model="statusInput"
                :items="statusItems"
                value-key="value"
                label-key="label"
                class="w-full"
              />
            </div>

            <div>
              <label class="text-xs text-muted mb-1.5 block">{{ $t('برچسب') }}</label>
              <USelect
                v-model="badgeInput"
                :items="badgeItems"
                value-key="value"
                label-key="label"
                class="w-full"
              />
            </div>

            <UCheckbox
              v-model="fastDeliveryInput"
              :label="$t('ارسال سریع')"
            />

            <UButton
              color="primary"
              class="font-medium"
              :loading="savingQuick"
              @click="saveQuick"
            >
              {{ $t('ذخیره') }}
            </UButton>
          </div>

          <div class="bg-muted border border-muted rounded-2xl p-4 space-y-3">
            <h3 class="text-sm font-bold text-highlighted">
              {{ $t('دسترسی سریع') }}
            </h3>
            <UButton
              type="button"
              color="neutral"
              variant="soft"
              block
              class="justify-start cursor-pointer"
              icon="i-tabler-edit"
              @click="onTabClick('edit')"
            >
              {{ $t('ویرایش کامل محصول') }}
            </UButton>
            <UButton
              type="button"
              color="neutral"
              variant="soft"
              block
              class="justify-start cursor-pointer"
              icon="i-tabler-currency-dollar"
              @click="onTabClick('price')"
            >
              {{ $t('قیمت و تخفیف') }}
            </UButton>
            <UButton
              to="/seller/deals/new"
              color="neutral"
              variant="soft"
              block
              class="justify-start"
              icon="i-tabler-bolt"
            >
              {{ $t('افزودن به شگفت‌انگیز') }}
            </UButton>
            <UButton
              to="/seller/promotions?tab=codes"
              color="neutral"
              variant="soft"
              block
              class="justify-start"
              icon="i-tabler-ticket"
            >
              {{ $t('کدهای تخفیف') }}
            </UButton>
          </div>
        </div>

        <div
          v-if="shortDescText"
          class="bg-muted border border-muted rounded-2xl p-4"
        >
          <h3 class="text-sm font-bold text-highlighted mb-2">
            {{ $t('توضیح کوتاه') }}
          </h3>
          <p class="text-sm text-toned leading-7">
            {{ shortDescText }}
          </p>
        </div>
      </div>

      <!-- Price -->
      <div
        v-else-if="activeTab === 'price'"
        class="space-y-5"
      >
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="text-xs text-muted mb-1.5 block">{{ $t('قیمت فعلی') }}</label>
            <TheFormInput
              v-model="priceInput"
              inputmode="numeric"
              class="num"
              @update:model-value="onPriceFieldsChange('price')"
            />
          </div>
          <div>
            <label class="text-xs text-muted mb-1.5 block">{{ $t('قیمت قبلی') }}</label>
            <TheFormInput
              v-model="oldPriceInput"
              inputmode="numeric"
              class="num"
              @update:model-value="onPriceFieldsChange('oldPrice')"
            />
          </div>
          <div>
            <label class="text-xs text-muted mb-1.5 block">{{ $t('درصد تخفیف') }}</label>
            <TheFormInput
              v-model="discountInput"
              inputmode="numeric"
              class="num"
              @update:model-value="onPriceFieldsChange('discount')"
            />
          </div>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <UButton
            color="primary"
            class="font-medium"
            :loading="savingPrice"
            @click="savePrice"
          >
            {{ $t('ذخیره قیمت') }}
          </UButton>
          <UButton
            to="/seller/deals/new"
            color="neutral"
            variant="soft"
            icon="i-tabler-bolt"
          >
            {{ $t('شگفت‌انگیزها') }}
          </UButton>
          <UButton
            to="/seller/promotions?tab=codes"
            color="neutral"
            variant="soft"
            icon="i-tabler-ticket"
          >
            {{ $t('کدهای تخفیف') }}
          </UButton>
        </div>

        <div>
          <h3 class="text-sm font-bold text-highlighted mb-3">
            {{ $t('تاریخچه قیمت') }}
          </h3>
          <div
            v-if="!priceHistory.length"
            class="text-center py-8 text-sm text-muted"
          >
            {{ $t('هنوز تغییری ثبت نشده') }}
          </div>
          <div
            v-else
            class="space-y-2"
          >
            <div
              v-for="entry in priceHistory"
              :key="entry.id"
              class="bg-muted border border-muted rounded-xl px-3 py-2.5 flex items-center justify-between gap-3 flex-wrap"
            >
              <div class="min-w-0">
                <div class="text-sm font-bold text-highlighted num">
                  {{ formatPrice(entry.price) }}
                  <span class="text-[11px] font-medium text-muted">{{ $t('تومان') }}</span>
                </div>
                <div class="text-[11px] text-muted mt-0.5">
                  {{ entry.note }}
                  <span
                    v-if="entry.oldPrice"
                    class="num"
                  >
                    · {{ $t('قبلی') }} {{ formatPrice(entry.oldPrice) }}
                  </span>
                </div>
              </div>
              <div class="text-[11px] text-muted num shrink-0">
                {{ formatHistoryDate(entry.at) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Orders -->
      <div
        v-else-if="activeTab === 'orders'"
        class="space-y-3"
      >
        <div
          v-if="!productOrders.length"
          class="text-center py-12"
        >
          <UIcon
            name="i-tabler-shopping-bag"
            class="size-16 text-dimmed mx-auto mb-4"
          />
          <p class="text-sm text-muted">
            {{ $t('سفارشی برای این محصول نیست') }}
          </p>
        </div>
        <TheSellerOrderRow
          v-for="order in productOrders"
          :key="order.id"
          :order="order"
        />
      </div>

      <!-- Reviews -->
      <div
        v-else-if="activeTab === 'reviews'"
        class="space-y-3"
      >
        <div
          v-if="!productReviews.length"
          class="text-center py-12"
        >
          <UIcon
            name="i-tabler-message-2"
            class="size-16 text-dimmed mx-auto mb-4"
          />
          <p class="text-sm text-muted">
            {{ $t('نظری برای این محصول نیست') }}
          </p>
        </div>
        <TheSellerReviewCard
          v-for="review in productReviews"
          :key="review.id"
          :review="review"
        />
      </div>

      <!-- Questions -->
      <div
        v-else-if="activeTab === 'questions'"
        class="space-y-3"
      >
        <div
          v-if="!productQuestions.length"
          class="text-center py-12"
        >
          <UIcon
            name="i-tabler-message-question"
            class="size-16 text-dimmed mx-auto mb-4"
          />
          <p class="text-sm text-muted">
            {{ $t('پرسشی برای این محصول نیست') }}
          </p>
        </div>
        <TheSellerQuestionCard
          v-for="item in productQuestions"
          :key="item.id"
          :question="item"
          @delete="openDeleteQuestion"
        />
      </div>
    </div>

    <UModal
      v-model:open="deleteQuestionOpen"
      :title="$t('حذف پرسش')"
      :description="$t('آیا از حذف این پرسش مطمئن هستید؟')"
    >
      <template #footer>
        <div class="flex items-center gap-2 w-full justify-end">
          <UButton
            color="neutral"
            variant="outline"
            @click="deleteQuestionOpen = false"
          >
            {{ $t('انصراف') }}
          </UButton>
          <UButton
            color="error"
            class="font-bold"
            @click="confirmDeleteQuestion"
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
  formatPrice,
  type Product,
} from '~/data/products'
import {
  sellerProductStatusMeta,
  type SellerProductStatus,
} from '~/data/seller'
import type { SellerProductQuestion } from '~/data/seller-questions'
import {
  parsePriceInput,
  sellerProductBadges,
  SELLER_BADGE_NONE,
} from '~/data/seller-product-form'
import { htmlToPlainText } from '~/data/seo'

const props = defineProps<{
  productId: string
}>()

const { t } = useI18n()
const toast = useAppToast()
const route = useRoute()

const {
  getListing,
  resolveProduct,
  orders,
  reviews,
  updateListingProduct,
  fetchProductPanel,
} = useSeller()

const {
  questions,
  fetchForProduct: fetchProductQuestions,
  deleteQuestion,
} = useSellerQuestions()

const {
  forProduct,
  ensureSeed,
  pushChange,
} = useSellerProductPriceHistory()

type TabId = 'summary' | 'edit' | 'price' | 'orders' | 'reviews' | 'questions'

const validTabs: TabId[] = ['summary', 'edit', 'price', 'orders', 'reviews', 'questions']

function tabFromQuery(raw: unknown): TabId {
  const value = typeof raw === 'string' ? raw : ''
  return validTabs.includes(value as TabId) ? (value as TabId) : 'summary'
}

const activeTab = ref<TabId>(tabFromQuery(route.query.tab))
const savingQuick = ref(false)
const savingPrice = ref(false)
const deleteQuestionOpen = ref(false)
const pendingQuestionId = ref<string | null>(null)
const loading = ref(true)
const loadError = ref('')

const listing = computed(() => getListing(props.productId))
const product = computed(() => resolveProduct(props.productId))
const shortDescText = computed(() => htmlToPlainText(product.value?.shortDesc))

async function loadPanel() {
  if (!props.productId) {
    loading.value = false
    loadError.value = 'محصول پیدا نشد'
    return
  }
  loading.value = true
  loadError.value = ''
  try {
    const [listingRes] = await Promise.all([
      fetchProductPanel(props.productId),
      fetchProductQuestions(props.productId),
    ])
    if (!listingRes.ok) {
      loadError.value = 'محصول پیدا نشد'
    }
  }
  catch {
    loadError.value = 'بارگذاری محصول ناموفق بود'
  }
  finally {
    loading.value = false
  }
}

watch(
  () => props.productId,
  () => {
    void loadPanel()
  },
  { immediate: true },
)

const statusMeta = computed(() =>
  sellerProductStatusMeta[listing.value?.status ?? 'inactive'],
)

const discountPct = computed(() =>
  calcDiscountPercent(product.value.price, product.value.oldPrice),
)

const productOrders = computed(() =>
  orders.value.filter(order =>
    order.items.some(item => item.productId === props.productId),
  ),
)

const productReviews = computed(() =>
  reviews.value.filter(review => review.productId === props.productId),
)

const productQuestions = computed(() =>
  questions.value.filter(q => q.productId === props.productId),
)

const priceHistory = computed(() => forProduct(props.productId))

const headerStats = computed(() => [
  {
    label: 'فروش',
    value: (listing.value?.sold ?? 0).toLocaleString('fa-IR'),
  },
  {
    label: 'موجودی',
    value: (listing.value?.stock ?? 0).toLocaleString('fa-IR'),
  },
  {
    label: 'بازدید',
    value: (listing.value?.views ?? 0).toLocaleString('fa-IR'),
  },
  {
    label: 'امتیاز',
    value: product.value.rating.toLocaleString('fa-IR', {
      maximumFractionDigits: 1,
    }),
  },
  {
    label: 'نظرات',
    value: (product.value.reviews ?? productReviews.value.length).toLocaleString('fa-IR'),
  },
  {
    label: 'پرسش‌ها',
    value: productQuestions.value.length.toLocaleString('fa-IR'),
  },
  {
    label: 'سفارش‌ها',
    value: productOrders.value.length.toLocaleString('fa-IR'),
  },
])

const tabs = computed(() => [
  { id: 'summary' as const, label: 'خلاصه', count: null as number | null },
  { id: 'edit' as const, label: 'ویرایش', count: null },
  { id: 'price' as const, label: 'قیمت و تخفیف', count: null },
  { id: 'orders' as const, label: 'سفارش‌ها', count: productOrders.value.length },
  { id: 'reviews' as const, label: 'نظرات', count: productReviews.value.length },
  { id: 'questions' as const, label: 'پرسش‌ها', count: productQuestions.value.length },
])

const statusItems = computed(() =>
  (Object.keys(sellerProductStatusMeta) as SellerProductStatus[]).map(value => ({
    value,
    label: t(sellerProductStatusMeta[value].label),
  })),
)

const badgeItems = computed(() =>
  sellerProductBadges.map(value => ({
    value,
    label: value === SELLER_BADGE_NONE ? t('بدون برچسب') : t(value),
  })),
)

const stockInput = ref('')
const statusInput = ref<SellerProductStatus>('inactive')
const badgeInput = ref(SELLER_BADGE_NONE)
const fastDeliveryInput = ref(false)
const priceInput = ref('')
const oldPriceInput = ref('')
const discountInput = ref('')

function hydrateQuickFields() {
  if (!listing.value) return
  stockInput.value = String(listing.value.stock)
  statusInput.value = listing.value.status
  badgeInput.value = product.value.badge || SELLER_BADGE_NONE
  fastDeliveryInput.value = Boolean(product.value.fastDelivery)
}

function hydratePriceFields() {
  priceInput.value = String(product.value.price || '')
  oldPriceInput.value = product.value.oldPrice ? String(product.value.oldPrice) : ''
  discountInput.value = String(
    calcDiscountPercent(product.value.price, product.value.oldPrice) || '',
  )
}

watch(
  () => [props.productId, listing.value?.stock, listing.value?.status, product.value.badge, product.value.fastDelivery] as const,
  () => {
    hydrateQuickFields()
  },
  { immediate: true },
)

watch(
  () => [props.productId, product.value.price, product.value.oldPrice] as const,
  () => {
    hydratePriceFields()
    if (listing.value) {
      ensureSeed(props.productId, product.value.price, product.value.oldPrice ?? null)
    }
  },
  { immediate: true },
)

watch(
  () => route.query.tab,
  (tab) => {
    const next = tabFromQuery(tab)
    if (activeTab.value !== next) {
      activeTab.value = next
    }
  },
)

function onTabClick(tab: TabId) {
  setTab(tab)
}

function setTab(tab: TabId) {
  if (activeTab.value !== tab) {
    activeTab.value = tab
  }
  const query: Record<string, string> = {}
  for (const [key, value] of Object.entries(route.query)) {
    if (key === 'tab') continue
    if (typeof value === 'string' && value) query[key] = value
  }
  if (tab !== 'summary') {
    query.tab = tab
  }
  const sameTabQuery = (route.query.tab ?? undefined) === (query.tab ?? undefined)
  if (sameTabQuery) return

  void navigateTo(
    { path: route.path, query },
    { replace: true },
  )
}

function calcDiscountPercent(price: number, oldPrice?: number | null) {
  if (!oldPrice || oldPrice <= price || price <= 0) return 0
  return Math.round((1 - price / oldPrice) * 100)
}

function onPriceFieldsChange(source: 'price' | 'oldPrice' | 'discount') {
  const price = parsePriceInput(priceInput.value)
  if (source === 'discount') {
    const pct = Math.min(99, Math.max(0, Number.parseInt(discountInput.value.replace(/[^\d]/g, '') || '0', 10)))
    discountInput.value = pct ? String(pct) : ''
    if (price > 0 && pct > 0 && pct < 100) {
      oldPriceInput.value = String(Math.round(price / (1 - pct / 100)))
    }
    else if (pct <= 0) {
      oldPriceInput.value = ''
    }
    return
  }

  const oldPrice = parsePriceInput(oldPriceInput.value)
  const pct = calcDiscountPercent(price, oldPrice || null)
  discountInput.value = pct ? String(pct) : ''
}

function withUpdatedProduct(patch: Partial<Product>): Product {
  return {
    ...product.value,
    ...patch,
    id: props.productId,
  }
}

async function saveQuick() {
  if (!listing.value) return
  savingQuick.value = true
  try {
    const stock = Number.parseInt(stockInput.value.replace(/[^\d]/g, '') || '0', 10)
    const nextProduct = withUpdatedProduct({
      badge: badgeInput.value === SELLER_BADGE_NONE ? undefined : badgeInput.value,
      fastDelivery: fastDeliveryInput.value,
      inStock: stock > 0,
    })
    const ok = await updateListingProduct(
      props.productId,
      nextProduct,
      stock,
      statusInput.value,
    )
    if (!ok) {
      toast.error(t('ذخیره ناموفق بود'))
      return
    }
    toast.success(t('تغییرات ذخیره شد'))
  }
  finally {
    savingQuick.value = false
  }
}

async function savePrice() {
  if (!listing.value) return
  const price = parsePriceInput(priceInput.value)
  if (price <= 0) {
    toast.error(t('قیمت معتبر نیست'))
    return
  }
  const oldPriceRaw = parsePriceInput(oldPriceInput.value)
  const oldPrice = oldPriceRaw > price ? oldPriceRaw : undefined

  savingPrice.value = true
  try {
    const previous = product.value
    const nextProduct = withUpdatedProduct({
      price,
      oldPrice,
    })
    const ok = await updateListingProduct(
      props.productId,
      nextProduct,
      listing.value.stock,
      listing.value.status,
    )
    if (!ok) {
      toast.error(t('ذخیره قیمت ناموفق بود'))
      return
    }
    if (previous.price !== price || (previous.oldPrice ?? null) !== (oldPrice ?? null)) {
      pushChange(
        props.productId,
        price,
        oldPrice ?? null,
        t('تغییر قیمت از پنل'),
      )
    }
    toast.success(t('قیمت ذخیره شد'))
  }
  finally {
    savingPrice.value = false
  }
}

function onEditSaved() {
  hydrateQuickFields()
  hydratePriceFields()
  setTab('summary')
}

function openDeleteQuestion(question: SellerProductQuestion) {
  pendingQuestionId.value = question.id
  deleteQuestionOpen.value = true
}

async function confirmDeleteQuestion() {
  if (!pendingQuestionId.value) return
  const id = pendingQuestionId.value
  const result = await deleteQuestion(id)
  deleteQuestionOpen.value = false
  pendingQuestionId.value = null
  if (!result.ok) {
    toast.error(t(result.error))
    return
  }
  toast.success(t('پرسش حذف شد'))
}

function formatHistoryDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('fa-IR')
  }
  catch {
    return iso
  }
}
</script>
