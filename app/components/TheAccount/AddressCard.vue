<template>
  <div class="border border-muted rounded-2xl p-4">
    <div class="flex items-center justify-between mb-2 gap-2">
      <div class="flex items-center gap-2 min-w-0">
        <span class="text-sm font-bold text-default truncate">{{ address.title }}</span>
        <UBadge
          v-if="address.isDefault"
          color="success"
          variant="subtle"
          size="xs"
        >
          {{ $t('پیش‌فرض') }}
        </UBadge>
      </div>
      <div class="flex items-center gap-0.5 shrink-0">
        <UButton
          type="button"
          color="neutral"
          variant="ghost"
          size="sm"
          icon="i-tabler-pencil"
          :aria-label="$t('ویرایش')"
          @click="$emit('edit', address.id)"
        />
        <UButton
          type="button"
          color="error"
          variant="ghost"
          size="sm"
          icon="i-tabler-trash"
          :aria-label="$t('حذف')"
          @click="$emit('delete', address.id)"
        />
      </div>
    </div>
    <p class="text-xs text-toned leading-6">
      {{ address.province }}، {{ address.city }}، {{ address.address }}
    </p>
    <div class="text-[11px] text-muted mt-2 flex flex-wrap gap-x-4 num">
      <span>{{ address.fullName }}</span>
      <span dir="ltr">{{ address.phone }}</span>
      <span>{{ $t('کدپستی') }}: {{ address.postalCode }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CheckoutAddress } from '~/data/checkout'

defineProps<{
  address: CheckoutAddress
}>()

defineEmits<{
  edit: [id: string]
  delete: [id: string]
}>()
</script>
