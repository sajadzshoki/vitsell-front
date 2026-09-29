<template>
  <article class="showcase-card group relative w-full overflow-hidden rounded-[1.5rem] bg-inverted">
    <div class="absolute inset-0 bg-muted">
      <TheIcon
        v-if="imageSrc"
        :name="imageSrc"
        icon-type="img"
        class="!size-full object-contain"
      />
      <TheIcon
        v-else
        name="noImage.png"
        icon-type="img"
        class="!size-full object-contain p-8 opacity-60"
      />
    </div>

    <div
      class="showcase-scrim pointer-events-none absolute inset-x-0 bottom-0"
      aria-hidden="true"
    />

    <NuxtLink
      :to="productTo"
      class="absolute inset-0 z-10 cursor-pointer"
      :aria-label="product.title"
    />

    <div class="showcase-body pointer-events-none relative z-20 flex h-full flex-col justify-between">
      <div class="flex items-center justify-between gap-2">
        <div class="showcase-price inline-flex max-w-[calc(100%-2.5rem)] items-baseline gap-1 rounded-full bg-default shadow-sm">
          <span class="truncate text-xs font-bold text-highlighted num">
            {{ showPrice ? formatPrice(product.price) : $t('ناموجود') }}
          </span>
          <span
            v-if="showPrice"
            class="shrink-0 text-[9px] font-medium text-muted"
          >
             {{ currencyLabel }}
          </span>
        </div>

        <button
          type="button"
          class="showcase-heart pointer-events-auto grid shrink-0 cursor-pointer place-items-center rounded-full bg-default shadow-md"
          :class="liked ? 'text-error' : 'text-toned'"
          :aria-label="liked ? $t('حذف از علاقه‌مندی‌ها') : $t('افزودن به علاقه‌مندی‌ها')"
          @click="onToggleWishlist"
        >
          <UIcon
            :name="liked ? 'i-tabler-heart-filled' : 'i-tabler-heart'"
            class="size-5"
          />
        </button>
      </div>

      <div class="showcase-copy flex flex-col">
        <div class="flex items-start justify-between gap-2">
          <h3 class="showcase-title min-w-0 flex-1 text-start font-medium text-inverted line-clamp-2">
            {{ product.title }}
          </h3>
          <div class="flex shrink-0 items-center gap-1 pt-0.5 text-inverted">
            <span class="text-xs  num">
              {{ product.rating.toLocaleString('fa-IR') }}
            </span>
            <UIcon
              name="i-tabler-star-filled"
              class="size-3 text-warning"
            />
          </div>
        </div>

        <div
          v-if="metaLabel"
          class="showcase-meta flex items-center gap-2 text-inverted/80"
        >
          <UIcon
            name="i-tabler-book"
            class="size-4 shrink-0"
          />
          <span class="min-w-0 truncate text-xs sm:text-sm">
            {{ metaLabel }}
          </span>
        </div>

        <div class="showcase-stats grid grid-cols-3 gap-2">
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="flex min-w-0 items-center gap-1.5 text-inverted/90"
          >
            <UIcon
              :name="stat.icon"
              class="size-4 shrink-0"
            />
            <span class="truncate text-[11px] sm:text-xs">
              {{ stat.label }}
            </span>
          </div>
        </div>

        <!-- <NuxtLink
          :to="productTo"
          class="pointer-events-auto flex h-9 w-full cursor-pointer items-center justify-center rounded-full bg-default text-sm font-medium text-highlighted shadow-sm sm:h-8"
        >
          {{ $t('خرید') }}
        </NuxtLink> -->
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { categoryLabels, formatPrice, getCurrencyLabel, type Product } from '~/data/products'

const props = defineProps<{
  product: Product
}>()

const { t } = useI18n()
const { isInWishlist, toggleWishlist } = useShop()
const colorMode = useColorMode()

const liked = computed(() => isInWishlist(props.product.id))
const currencyLabel = computed(() => getCurrencyLabel())
const inStock = computed(() => props.product.inStock !== false)
const showPrice = computed(() => inStock.value)

const productTo = computed(() => ({
  name: 'product-id' as const,
  params: { id: props.product.id },
}))

const categoryLabel = computed(() =>
  props.product.categoryLabel
  || categoryLabels[props.product.category]
  || '',
)

const metaLabel = computed(() => props.product.brand || categoryLabel.value)

const imageSrc = computed(() => {
  const dark = props.product.imageDark?.trim()
  if (colorMode.value === 'dark' && dark) return dark
  return props.product.image?.trim() || ''
})

const stats = computed(() => {
  const items = [
    {
      icon: 'i-tabler-category',
      label: categoryLabel.value ? t(categoryLabel.value) : '',
    },
    {
      icon: 'i-tabler-sparkles',
      label: `${props.product.reviews.toLocaleString('fa-IR')} ${t('نظر')}`,
    },
    props.product.fastDelivery
      ? { icon: 'i-tabler-truck-delivery', label: t('ارسال سریع') }
      : props.product.inStock === false
        ? { icon: 'i-tabler-package-off', label: t('ناموجود') }
        : { icon: 'i-tabler-box', label: t('موجود') },
  ]
  return items.filter(item => item.label)
})

function onToggleWishlist() {
  toggleWishlist(props.product.id)
}
</script>

<style scoped>
.showcase-card {
  --ui-bg: white;
  --ui-text-highlighted: var(--ui-color-neutral-900);
  --ui-text-muted: var(--ui-color-neutral-500);
  --ui-text-toned: var(--ui-color-neutral-600);
  --ui-text: var(--ui-color-neutral-700);
  --ui-text-inverted: white;
  container-type: inline-size;
  aspect-ratio: 3 / 4.5;
}

.showcase-body {
  padding: 0.75rem;
}

.showcase-price {
  padding: 0.375rem 0.75rem;
}

.showcase-heart {
  width: 2rem;
  height: 2rem;
}

.showcase-copy {
  gap: 0.625rem;
}

.showcase-title {
  font-size: 0.875rem;
  line-height: 1.5rem;
}

.showcase-scrim {
  height: 40%;
  background: linear-gradient(
    to top,
    var(--color-brand-950) 0%,
    color-mix(in srgb, var(--color-brand-950) 92%, transparent) 34%,
    color-mix(in srgb, var(--color-brand-950) 62%, transparent) 62%,
    transparent 100%
  );
}

@container (max-width: 210px) {
  .showcase-body {
    padding: 0.5rem;
  }

  .showcase-price {
    padding: 0.25rem 0.5rem;
  }

  .showcase-heart {
    width: 1.75rem;
    height: 1.75rem;
  }

  .showcase-copy {
    gap: 0.375rem;
  }

  .showcase-title {
    font-size: 0.6875rem;
    line-height: 1.15rem;
  }

  .showcase-meta,
  .showcase-stats {
    display: none;
  }

  .showcase-scrim {
    height: 48%;
  }
}

@container (min-width: 280px) {
  .showcase-body {
    padding: 1rem;
  }
}

@container (min-width: 560px) {
  .showcase-card {
    aspect-ratio: 16 / 9;
    max-height: 20rem;
  }

  .showcase-scrim {
    height: 72%;
  }
}
</style>
