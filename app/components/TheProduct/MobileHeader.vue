<template>
  <header class="md:hidden sticky top-0 z-40 bg-default/95 backdrop-blur-md border-b border-muted">
    <div class="flex items-center justify-between gap-2 px-1.5 sm:px-2 min-h-11">
      <UButton
        type="button"
        color="neutral"
        variant="ghost"
        size="lg"
        icon="i-tabler-x"
        :aria-label="$t('بستن')"
        class="shrink-0 size-11"
        @click="goBack"
      />

      <div class="flex items-center gap-0.5 shrink-0">
        <UButton
          type="button"
          color="neutral"
          variant="ghost"
          size="lg"
          icon="i-tabler-search"
          :aria-label="$t('جستجو')"
          class="size-11"
          @click="navigateTo('/search')"
        />

        <button
          type="button"
          class="relative size-11 grid place-items-center rounded-xl text-toned hover:bg-elevated transition cursor-pointer"
          :aria-label="$t('سبد خرید')"
          @click="navigateTo('/cart')"
        >
          <UIcon
            name="i-tabler-shopping-cart"
            class="size-5"
            :class="cartAnimating ? 'animate-cart-bump' : ''"
          />
          <span
            v-if="cartCount > 0"
            class="absolute top-1.5 end-1.5 min-w-4 h-4 px-0.5 rounded-full bg-error text-inverted text-[10px] font-bold grid place-items-center num leading-none"
            :class="cartAnimating ? 'animate-cart-bump' : ''"
          >
            {{ cartCount.toLocaleString('fa-IR') }}
          </span>
        </button>
      </div>
    </div>

    <nav
      v-if="crumbs.length"
      class="flex items-center gap-1 px-3 pb-2 text-xs text-muted overflow-x-auto scrollbar-none"
      :aria-label="$t('مسیر صفحه')"
    >
      <template
        v-for="(crumb, index) in crumbs"
        :key="`${crumb.label}-${index}`"
      >
        <span
          v-if="index > 0"
          class="shrink-0 text-dimmed"
          aria-hidden="true"
        >›</span>
        <NuxtLink
          v-if="crumb.to"
          :to="crumb.to"
          class="shrink-0 hover:text-primary transition-colors cursor-pointer"
        >
          {{ crumb.label }}
        </NuxtLink>
        <span
          v-else
          class="shrink-0 text-toned"
        >
          {{ crumb.label }}
        </span>
      </template>
    </nav>
  </header>
</template>

<script setup lang="ts">
import type { Product } from '~/data/products'
import { toSearchRoute } from '~/data/categories'

const props = defineProps<{
  product?: Product | null
}>()

const { goBack } = useMobileBackward()
const { cartCount, cartBump, ensureCartLoaded } = useShop()

const cartAnimating = ref(false)
let bumpTimer: ReturnType<typeof setTimeout> | undefined

onMounted(() => {
  void ensureCartLoaded()
})

watch(cartBump, () => {
  cartAnimating.value = false
  nextTick(() => {
    cartAnimating.value = true
    if (bumpTimer) clearTimeout(bumpTimer)
    bumpTimer = setTimeout(() => {
      cartAnimating.value = false
    }, 450)
  })
})

onBeforeUnmount(() => {
  if (bumpTimer) clearTimeout(bumpTimer)
})

const crumbs = computed(() => {
  const product = props.product
  if (!product) return []
  const items: { label: string, to?: ReturnType<typeof toSearchRoute> }[] = []
  if (product.categoryLabel) {
    items.push({
      label: product.categoryLabel,
      to: toSearchRoute({ category: product.category }),
    })
  }
  if (product.brand) {
    items.push({
      label: product.brand,
      to: toSearchRoute({ brands: product.brand }),
    })
  }
  return items
})
</script>
