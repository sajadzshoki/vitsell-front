<template>
  <UCard
      class="group h-full cursor-pointer transition duration-200 hover:-translate-y-0.5 hover:ring-2 hover:ring-primary/25"
      :ui="{ root: 'overflow-hidden', body: 'p-0 flex flex-col h-full' }"
  >
    <div class="relative aspect-square overflow-hidden bg-muted">
      <TheIcon
          name="noImage.png"
          icon-type="img"
          class="!size-full object-contain p-8 opacity-80 transition-transform duration-300 group-hover:scale-105"
      />

      <UBadge
          v-if="discountPercent"
          color="error"
          variant="solid"
          size="sm"
          class="absolute top-2 inset-s-2"
          :label="`${discountPercent.toLocaleString('fa-IR')}٪`"
      />

      <UButton
          class="absolute top-2 inset-e-2"
          size="sm"
          :color="liked ? 'error' : 'neutral'"
          variant="soft"
          :icon="liked ? 'i-tabler-heart-filled' : 'i-tabler-heart'"
          :aria-label="$t('علاقه‌مندی')"
          @click.stop="liked = !liked"
      />

      <UBadge
          v-if="inStock"
          color="success"
          variant="subtle"
          size="sm"
          class="absolute bottom-2 inset-s-2"
          :label="$t('موجود')"
      />
    </div>

    <div class="flex flex-1 flex-col gap-2 p-3">
      <h3 class="line-clamp-2 min-h-10 text-sm font-600 leading-6 text-highlighted">
        {{ $t(productName) }} {{ $t('مدل') }} {{ n.toLocaleString('fa-IR') }}
      </h3>

      <div class="flex items-center gap-1.5">
        <div class="flex items-center gap-0.5 text-warning">
          <UIcon
              v-for="star in 5"
              :key="star"
              :name="star <= Math.round(rating) ? 'i-tabler-star-filled' : 'i-tabler-star'"
              class="size-3.5"
          />
        </div>
        <span class="text-xs text-muted">
          ({{ rating.toLocaleString('fa-IR') }})
        </span>
      </div>

      <div class="mt-auto flex items-end justify-between gap-2">
        <div class="flex flex-col gap-0.5">
          <span class="text-xs text-dimmed line-through">
            {{ formatPrice(originalPrice) }}
          </span>
          <p class="text-base font-700 text-primary leading-6">
            {{ formatPrice(discountedPrice) }}
            <span class="text-xs font-normal text-muted">{{ $t('تومان') }}</span>
          </p>
        </div>
      </div>

      <UButton
          class="mt-1"
          block
          size="sm"
          icon="i-tabler-shopping-cart-plus"
          :label="$t('افزودن به سبد')"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
const props = defineProps<{
  n: number
}>()

const liked = ref(false)

const productNames = [
  'گوشی موبایل سامسونگ گلکسی',
  'لپ‌تاپ ایسوس Vivobook',
  'هدفون بی‌سیم Sony WH',
  'ساعت هوشمند شیائومی',
  'تبلت اپل iPad Air',
  'کیبورد مکانیکی Logitech',
  'ماوس گیمینگ Razer',
  'اسپیکر JBL Charge',
  'دوربین Canon EOS',
  'پاوربانک Anker 20000',
]

const productName = computed(() => productNames[(props.n - 1) % productNames.length] || 'محصول')

const rating = computed(() => Number((3.5 + (props.n % 15) / 10).toFixed(1)))

const originalPrice = computed(() => 890_000 + props.n * 47_000)
const discountedPrice = computed(() => Math.round(originalPrice.value * (0.72 + (props.n % 5) * 0.03)))

const discountPercent = computed(() => {
  const percent = Math.round((1 - discountedPrice.value / originalPrice.value) * 100)
  return percent > 0 ? percent : 0
})

const inStock = computed(() => props.n % 4 !== 0)

function formatPrice(value: number) {
  return value.toLocaleString('fa-IR')
}
</script>
