<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
    <div class="hidden lg:flex items-center justify-between mb-5">
      <h2 class="font-bold text-highlighted">{{ $t('علاقه‌مندی‌های من') }}</h2>
      <div
        v-if="!loading"
        class="text-xs text-muted num"
      >
        <template v-if="wishlistProducts.length > 0">
          {{ wishlistProducts.length.toLocaleString('fa-IR') }} {{ $t('محصول') }}
        </template>
        <template v-else>
          {{ $t('لیست محصولاتی که می‌خواهید بعداً بخرید') }}
        </template>
      </div>
    </div>

    <div
      v-if="loading"
      class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
    >
      <USkeleton
        v-for="n in 8"
        :key="n"
        class="aspect-3/4 rounded-2xl"
      />
    </div>

    <div
      v-else-if="wishlistProducts.length === 0"
      class="text-center py-12"
    >
      <UIcon
        name="i-tabler-heart-off"
        class="size-16 text-dimmed mx-auto mb-4"
      />
      <p class="text-sm text-muted mb-2">{{ $t('لیست علاقه‌مندی‌ها خالی است') }}</p>
      <p class="text-xs text-dimmed mb-4 leading-6 max-w-md mx-auto">
        {{ $t('با کلیک روی آیکون قلب روی هر محصول، می‌توانید آن را به لیست علاقه‌مندی‌های خود اضافه کنید.') }}
      </p>
      <UButton
        to="/"
        color="primary"
        size="lg"
        class="font-bold"
      >
        {{ $t('مشاهده محصولات') }}
      </UButton>
    </div>

    <div
      v-else
      :class="showcase
        ? 'grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4'
        : 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4'"
    >
      <TheProductStoreCard
        v-for="product in wishlistProducts"
        :key="product.id"
        :product="product"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const { showcase } = useProductCardStyle()
const { t } = useI18n()
const toast = useAppToast()
const { wishlistProducts, fetchWishlist } = useShop()

const loading = ref(true)

function apiErrorMessage(error: any, fallback: string) {
  const fromFields = error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
  return fromFields || error?.data?.message || fallback
}

async function loadWishlist() {
  loading.value = true
  try {
    const { error } = await fetchWishlist()
    if (error) {
      toast.error(apiErrorMessage(error, t('بارگذاری علاقه‌مندی‌ها ناموفق بود')))
    }
  }
  finally {
    loading.value = false
  }
}

onMounted(() => {
  loadWishlist()
})

definePageMeta({
  layout: 'account',
  middleware: 'auth',
})

useSeoMeta({
  title: () => t('علاقه‌مندی‌ها'),
})
</script>
