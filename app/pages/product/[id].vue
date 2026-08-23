<template>
  <div v-if="product" class="w-full">
    <UBreadcrumb :items="breadcrumbItems" class="py-4" />

    <!-- Main card -->
    <div class="bg-default rounded-3xl border border-default p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Gallery -->
      <div class="lg:col-span-5 flex gap-3">
        <div class="flex flex-col gap-2 w-16 shrink-0">
          <button
            v-for="(g, i) in gallery"
            :key="i"
            type="button"
            class="w-16 h-16 rounded-xl overflow-hidden border-2 transition"
            :class="active === i ? 'border-primary' : 'border-default hover:border-accented'"
            :aria-label="$t('تصویر محصول')"
            @click="active = i"
          >
            <TheIcon
              :name="g || 'noImage.png'"
              icon-type="img"
              class="!w-full !h-full object-cover"
            />
          </button>
        </div>
        <div class="relative flex-1 rounded-2xl overflow-hidden bg-muted aspect-square <lg:max-h-110">
          <TheIcon
            :name="gallery[active] || 'noImage.png'"
            icon-type="img"
            class="!w-full !h-full  object-cover"
          />
          <UBadge
            v-if="discount > 0"
            color="error"
            size="lg"
            class="absolute top-4 inset-e-4 font-bold"
          >
            {{ discount }}٪ {{ $t('تخفیف') }}
          </UBadge>
          <div class="absolute bottom-4 inset-s-4 flex items-center gap-2">
            <UButton
              icon="i-tabler-heart"
              color="neutral"
              variant="solid"
              size="md"
              square
              :aria-label="$t('علاقه‌مندی')"
            />
            <UButton
              icon="i-tabler-share"
              color="neutral"
              variant="solid"
              size="md"
              square
              :aria-label="$t('اشتراک‌گذاری')"
            />
          </div>
        </div>
      </div>

      <!-- Info -->
      <div class="lg:col-span-4">
        <div class="flex items-center gap-2 mb-2 flex-wrap">
          <UBadge color="neutral" variant="subtle" size="sm">
            {{ product.brand }}
          </UBadge>
          <UBadge v-if="product.badge" color="primary" variant="subtle" size="sm">
            {{ $t(product.badge) }}
          </UBadge>
        </div>

        <h1 class="text-lg md:text-xl font-bold text-highlighted leading-8 mb-2">
          {{ product.title }}
        </h1>
        <div class="text-xs text-dimmed mb-4" dir="ltr">
          {{ product.brand }} • {{ truncateText(product.title, 30) }}
        </div>

        <div class="flex items-center gap-3 pb-4 mb-4 border-b border-default flex-wrap">
          <div class="flex items-center gap-1 bg-warning/10 text-warning rounded-lg px-2 py-1">
            <UIcon name="i-tabler-star-filled" class="size-4" />
            <span class="text-sm font-bold">{{ product.rating.toLocaleString('fa-IR') }}</span>
          </div>
          <span class="text-xs text-muted">
            {{ product.reviews.toLocaleString('fa-IR') }} {{ $t('دیدگاه ثبت شده') }}
          </span>
          <span class="size-1 rounded-full bg-accented" />
          <UButton
            variant="link"
            color="primary"
            size="xs"
            class="p-0"
            @click="activeTab = 'reviews'"
          >
            {{ $t('مشاهده نظرات') }}
          </UButton>
        </div>

        <!-- Colors -->
        <div v-if="product.colors?.length" class="mb-5">
          <div class="text-xs text-muted mb-2">
            {{ $t('رنگ') }}:
            <span class="text-highlighted font-medium">{{ product.colors[color]?.name }}</span>
          </div>
          <div class="flex items-center gap-2">
            <button
              v-for="(c, i) in product.colors"
              :key="c.name"
              type="button"
              class="size-9 rounded-full border-2 grid place-items-center transition"
              :class="color === i ? 'border-primary scale-110' : 'border-default'"
              :aria-label="c.name"
              @click="color = i"
            >
              <span
                class="size-7 rounded-full block border border-default"
                :style="{ backgroundColor: c.hex }"
              />
            </button>
          </div>
        </div>

        <p v-if="product.shortDesc" class="text-sm text-toned leading-7 mb-5">
          {{ product.shortDesc }}
        </p>

        <ul class="space-y-2 mb-5">
          <li
            v-for="f in features"
            :key="f"
            class="flex items-center gap-2 text-xs text-toned"
          >
            <UIcon name="i-tabler-check" class="size-4 text-success shrink-0" />
            {{ $t(f) }}
          </li>
        </ul>
      </div>

      <!-- Buy box -->
      <div class="lg:col-span-3">
        <div class="bg-muted rounded-2xl p-5 sticky top-24">
          <div class="flex items-center gap-2 text-xs text-success mb-3">
            <UIcon name="i-tabler-shield-check" class="size-4 shrink-0" />
            <span>
              {{ $t('فروشنده') }}:
              <b class="text-highlighted">{{ $t('بازار') }}</b>
            </span>
          </div>

          <div class="flex items-center gap-2 text-xs text-toned mb-4">
            <span class="size-2 rounded-full bg-success" />
            {{ $t('موجود در انبار') }}
          </div>

          <div v-if="product.oldPrice" class="flex items-center justify-between mb-1">
            <span class="text-xs text-dimmed line-through">
              {{ formatPrice(product.oldPrice) }}
            </span>
            <UBadge color="error" size="sm" class="font-bold">
              {{ discount }}٪
            </UBadge>
          </div>
          <div class="flex items-baseline gap-1 mb-5">
            <span class="text-2xl font-black text-highlighted">
              {{ formatPrice(product.price) }}
            </span>
            <span class="text-xs text-muted">{{ $t('تومان') }}</span>
          </div>

          <div class="flex items-center justify-between bg-default rounded-xl p-2 mb-3 border border-default">
            <UButton
              color="neutral"
              variant="soft"
              size="sm"
              square
              :aria-label="$t('کاهش تعداد')"
              @click="qty = Math.max(1, qty - 1)"
            >
              −
            </UButton>
            <span class="text-sm font-bold">{{ qty.toLocaleString('fa-IR') }}</span>
            <UButton
              color="primary"
              size="sm"
              square
              :aria-label="$t('افزایش تعداد')"
              @click="qty++"
            >
              +
            </UButton>
          </div>

          <UButton
            color="primary"
            size="xl"
            block
            class="font-bold"
          >
            {{ $t('افزودن به سبد خرید') }}
          </UButton>
          <UButton
            color="neutral"
            variant="solid"
            size="lg"
            block
            class="mt-2"
          >
            {{ $t('خرید فوری') }}
          </UButton>

          <div class="mt-4 pt-4 border-t border-default space-y-2.5">
            <div
              v-for="note in buyNotes"
              :key="note.icon"
              class="flex items-center gap-2 text-[11px] text-toned"
            >
              <UIcon :name="note.icon" class="size-4 shrink-0 text-muted" />
              {{ $t(note.text) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="bg-default rounded-3xl border border-default mt-6 overflow-hidden">
      <UTabs
        v-model="activeTab"
        :items="tabItems"
        variant="link"
        color="primary"
        class="w-full"
        :ui="{
          list: 'border-b border-default px-4 rounded-none',
          trigger: 'px-5 py-4',
          content: 'p-6 md:p-8',
        }"
      >
        <template #specs>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            <div
              v-for="(s, i) in specs"
              :key="i"
              class="flex justify-between gap-4 py-3 border-b border-muted last:border-0"
            >
              <span class="text-xs text-muted">{{ $t(s.key) }}</span>
              <span class="text-xs text-highlighted font-medium text-start">{{ s.value }}</span>
            </div>
          </div>
        </template>

        <template #desc>
          <div class="text-sm text-toned leading-8 space-y-4">
            <p>
              {{ product.shortDesc || $t('این محصول یکی از بهترین گزینه‌های موجود در دسته‌بندی خود است. با کیفیت ساخت بالا و فناوری‌های روز دنیا، تجربه‌ای بی‌نظیر را برای شما رقم می‌زند.') }}
            </p>
            <p>
              {{ $t('در طراحی این محصول، به تمامی جزئیات توجه ویژه‌ای شده است. از انتخاب مواد اولیه با کیفیت گرفته تا فرآیند تولید دقیق و کنترل کیفیت سختگیرانه، همه چیز برای ارائه بهترین تجربه به شما آماده شده است.') }}
            </p>
            <p>
              {{ $t('ما در بازار همیشه به دنبال ارائه بهترین محصولات با قیمت مناسب هستیم. این محصول با گارانتی اصالت کالا و پشتیبانی ۲۴ ساعته به فروش می‌رسد.') }}
            </p>
          </div>
        </template>

        <template #reviews>
          <div class="space-y-5">
            <div
              v-for="(r, i) in mockReviews"
              :key="i"
              class="p-4 rounded-2xl bg-muted"
            >
              <div class="flex items-center justify-between mb-2 gap-2">
                <div class="flex items-center gap-2">
                  <UAvatar
                    :alt="r.name"
                    size="sm"
                    :ui="{ root: 'bg-primary text-inverted' }"
                    :text="r.name[0]"
                  />
                  <div>
                    <div class="text-sm font-medium text-highlighted">{{ r.name }}</div>
                    <div class="text-[10px] text-dimmed">{{ $t('خریدار تأیید شده') }}</div>
                  </div>
                </div>
                <div class="flex gap-0.5">
                  <UIcon
                    v-for="s in 5"
                    :key="s"
                    name="i-tabler-star-filled"
                    class="size-3.5"
                    :class="s <= r.rating ? 'text-warning' : 'text-accented'"
                  />
                </div>
              </div>
              <p class="text-sm text-toned leading-7">{{ $t(r.text) }}</p>
            </div>
          </div>
        </template>
      </UTabs>
    </div>

    <!-- Related -->
    <section v-if="related.length" class="mt-10">
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-lg font-bold text-highlighted">{{ $t('محصولات مشابه') }}</h2>
        <UButton
          variant="link"
          color="primary"
          :to="{ name: 'category-id', params: { id: product.category } }"
          trailing-icon="i-tabler-arrow-left"
        >
          {{ $t('مشاهده همه') }}
        </UButton>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <TheProductCard
          v-for="p in related"
          :key="p.id"
          :product="p"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import {
  formatPrice,
  getProductById,
  getRelatedProducts,
  type Product,
} from '~/data/products'

const { t } = useI18n()
const route = useRoute()

const product = computed<Product>(() => getProductById(String(route.params.id)))

const gallery = computed(() => {
  const p = product.value
  return p.gallery?.length ? p.gallery : [p.image, p.image, p.image, p.image]
})

const discount = computed(() => {
  const p = product.value
  if (!p.oldPrice) return 0
  return Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100)
})

const related = computed(() => getRelatedProducts(product.value))

const active = ref(0)
const color = ref(0)
const qty = ref(1)
const activeTab = ref('specs')

watch(() => route.params.id, () => {
  active.value = 0
  color.value = 0
  qty.value = 1
  activeTab.value = 'specs'
})

const features = [
  'گارانتی ۱۸ ماهه رسمی',
  'ارسال از انبار مرکزی تهران',
  'تحویل ۲۴ ساعته',
  'امکان پرداخت در محل',
]

const buyNotes = [
  { icon: 'i-tabler-truck-delivery', text: 'ارسال رایگان برای سفارش‌های بالای ۵۰۰ هزار تومان' },
  { icon: 'i-tabler-refresh', text: '۷ روز ضمانت بازگشت کالا' },
  { icon: 'i-tabler-shield-check', text: 'تضمین اصالت کالا' },
]

const mockReviews = [
  { name: 'علی رضایی', rating: 5, text: 'کیفیت فوق‌العاده‌ای داره. خیلی راضی هستم از خرید. ارسال هم سریع بود.' },
  { name: 'سارا محمدی', rating: 4, text: 'محصول خوبیه ولی قیمت یکم بالاست. در کل ارزش خرید داره.' },
  { name: 'محمد کریمی', rating: 5, text: 'بهترین خریدی که تا حالا انجام دادم. حتماً پیشنهاد می‌کنم.' },
]

const specs = computed(() => {
  const p = product.value
  return p.specs ?? [
    { key: 'برند', value: p.brand },
    { key: 'دسته‌بندی', value: p.categoryLabel },
    { key: 'امتیاز کاربران', value: `${p.rating.toLocaleString('fa-IR')} از ۵` },
    { key: 'گارانتی', value: '۱۸ ماه گارانتی رسمی' },
  ]
})

const tabItems = computed(() => [
  { label: t('مشخصات فنی'), value: 'specs', slot: 'specs' as const },
  { label: t('معرفی محصول'), value: 'desc', slot: 'desc' as const },
  { label: t('دیدگاه‌ها'), value: 'reviews', slot: 'reviews' as const },
])

const breadcrumbItems = computed(() => [
  { label: t('خانه'), to: '/' },
  {
    label: t(product.value.categoryLabel),
    to: { name: 'category-id', params: { id: product.value.category } },
  },
  { label: product.value.brand },
  { label: product.value.title },
])

useSeoMeta({
  title: () => product.value.title,
  description: () => product.value.shortDesc,
})
</script>
