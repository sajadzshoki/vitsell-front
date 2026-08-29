<template>
  <main class="w-full py-2 md:py-4">
    <nav class="text-xs text-muted flex items-center gap-2 mb-4 flex-wrap">
      <NuxtLink to="/" class="hover:text-primary transition">{{ $t('خانه') }}</NuxtLink>
      <span class="text-dimmed">/</span>
      <span class="text-toned">{{ $t('علاقه‌مندی‌ها') }}</span>
    </nav>

    <div class="bg-default border border-muted rounded-2xl p-5 mb-5 flex items-center gap-4">
      <div class="size-12 rounded-2xl bg-primary/10 text-primary grid place-items-center shrink-0">
        <UIcon name="i-tabler-heart" class="size-6" />
      </div>
      <div class="flex-1 min-w-0">
        <h1 class="text-lg font-bold text-highlighted">{{ $t('علاقه‌مندی‌های من') }}</h1>
        <p class="text-xs text-muted mt-1">
          <template v-if="loading">
            {{ $t('در حال بارگذاری…') }}
          </template>
          <template v-else-if="wishlistProducts.length > 0">
            {{ wishlistProducts.length.toLocaleString('fa-IR') }} {{ $t('محصول') }}
          </template>
          <template v-else>
            {{ $t('لیست محصولاتی که می‌خواهید بعداً بخرید') }}
          </template>
        </p>
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
      class="bg-default border border-muted rounded-3xl p-10 md:p-16 text-center"
    >
      <UIcon name="i-tabler-heart-off" class="size-24 text-primary/20 mx-auto mb-6" />
      <h2 class="text-xl font-bold text-highlighted mb-2">{{ $t('لیست علاقه‌مندی‌ها خالی است') }}</h2>
      <p class="text-sm text-muted mb-6 leading-7 max-w-md mx-auto">
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
      class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
    >
      <TheProductCard
        v-for="product in wishlistProducts"
        :key="product.id"
        :product="product"
      />
    </div>
  </main>
</template>

<script setup lang="ts">
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
  middleware: 'auth',
})

useSeoMeta({
  title: () => t('علاقه‌مندی‌ها'),
})
</script>
