<template>
  <div class="bg-muted border border-muted rounded-2xl p-3 sm:p-4">
    <div class="flex items-start gap-3">
      <NuxtLink
        :to="`/seller/products/${listing.productId}`"
        class="shrink-0 cursor-pointer"
      >
        <img
          v-if="product.image"
          :src="product.image"
          :alt="product.title"
          class="size-16 rounded-xl object-cover bg-default"
        >
        <div
          v-else
          class="size-16 rounded-xl bg-elevated grid place-items-center"
        >
          <TheIcon
            icon-type="img"
            name="noImage.png"
            class="size-7 opacity-60"
          />
        </div>
      </NuxtLink>

      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-2">
          <NuxtLink
            :to="`/seller/products/${listing.productId}`"
            class="text-sm font-medium text-highlighted line-clamp-2 hover:text-primary transition-all  cursor-pointer"
          >
            {{ product.title }}
          </NuxtLink>
          <UBadge
            :color="statusMeta.color"
            variant="subtle"
            size="sm"
            class="shrink-0 font-medium"
          >
            {{ $t(statusMeta.label) }}
          </UBadge>
        </div>

        <div class="mt-2 grid grid-cols-3 gap-2 text-[11px] text-muted">
          <div>
            <div>{{ $t('موجودی') }}</div>
            <div
              class="font-bold num"
              :class="listing.stock <= 5 ? 'text-warning' : 'text-highlighted'"
            >
              {{ listing.stock.toLocaleString('fa-IR') }}
            </div>
          </div>
          <div>
            <div>{{ $t('فروخته‌شده') }}</div>
            <div class="font-bold num text-highlighted">
              {{ listing.sold.toLocaleString('fa-IR') }}
            </div>
          </div>
          <div>
            <div>{{ $t('بازدید') }}</div>
            <div class="font-bold num text-highlighted">
              {{ listing.views.toLocaleString('fa-IR') }}
            </div>
          </div>
        </div>

        <div class="mt-3 flex items-center justify-between gap-2 flex-wrap">
          <div class="text-sm font-bold text-highlighted num">
            {{ formatPrice(product.price) }}
            <span class="text-[11px] font-medium text-muted">{{ $t('تومان') }}</span>
          </div>
          <div class="flex items-center gap-2">
            <UButton
              :to="`/product/${listing.productId}`"
              target="_blank"
              color="neutral"
              variant="soft"
              size="xs"
              icon="i-tabler-external-link"
              class="cursor-pointer"
              :aria-label="$t('مشاهده در فروشگاه')"
            />
            <UButton
              v-if="can('products.update') && listing.status === 'active'"
              color="neutral"
              variant="soft"
              size="xs"
              class="cursor-pointer"
              @click="setListingStatus(listing.productId, 'inactive')"
            >
              {{ $t('غیرفعال کردن') }}
            </UButton>
            <UButton
              v-else-if="can('products.update') && (listing.status === 'inactive' || listing.status === 'out_of_stock')"
              color="primary"
              variant="soft"
              size="xs"
              class="cursor-pointer"
              @click="setListingStatus(listing.productId, 'active')"
            >
              {{ $t('فعال کردن') }}
            </UButton>
            <UButton
              :to="`/seller/products/${listing.productId}`"
              color="primary"
              variant="soft"
              size="xs"
              icon="i-tabler-eye"
              class="cursor-pointer"
              :aria-label="$t('جزئیات محصول')"
            />
            <UButton
              v-if="can('products.delete')"
              type="button"
              color="error"
              variant="ghost"
              size="xs"
              icon="i-tabler-trash"
              class="cursor-pointer"
              :aria-label="$t('حذف')"
              @click="emit('delete', listing)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { normalizeSellerProductStatus, sellerProductStatusMeta, type SellerListing } from '~/data/seller'
import { formatPrice } from '~/data/products'

const props = defineProps<{
  listing: SellerListing
}>()

const emit = defineEmits<{
  delete: [listing: SellerListing]
}>()

const { setListingStatus, resolveProduct } = useSeller()
const { can } = useSellerPermissions()

const product = computed(() => resolveProduct(props.listing.productId))
const statusMeta = computed(() =>
  sellerProductStatusMeta[normalizeSellerProductStatus(props.listing.status)],
)
</script>
