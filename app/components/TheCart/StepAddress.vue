<template>
  <div>
    <div class="flex items-center justify-between mb-5">
      <h2 class="font-bold text-highlighted">
        {{ $t('آدرس تحویل سفارش') }}
      </h2>
      <UButton
        v-if="!showAddressForm"
        type="button"
        color="primary"
        variant="link"
        size="sm"
        @click="openAddressForm"
      >
        {{ $t('+ افزودن آدرس') }}
      </UButton>
    </div>

    <TheAccountAddressForm
      v-if="showAddressForm"
      class="mb-4"
      @save="onSaveAddress"
      @cancel="closeAddressForm"
    />

    <div
      v-if="!showAddressForm"
      class="space-y-3"
    >
      <button
        v-for="a in addresses"
        :key="a.id"
        type="button"
        class="w-full flex gap-3 p-4 rounded-2xl border text-start cursor-pointer transition"
        :class="selectedAddressId === a.id
          ? 'border-primary bg-primary/5'
          : 'border-muted hover:border-accented'"
        @click="selectedAddressId = a.id"
      >
        <span
          class="mt-1 size-4 rounded-full border-2 shrink-0 grid place-items-center"
          :class="selectedAddressId === a.id ? 'border-primary' : 'border-accented'"
        >
          <span
            v-if="selectedAddressId === a.id"
            class="size-2 rounded-full bg-primary"
          />
        </span>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <span class="text-sm font-bold text-default">{{ a.title }}</span>
            <UBadge
              v-if="a.isDefault"
              color="success"
              variant="subtle"
              size="sm"
            >
              {{ $t('پیش‌فرض') }}
            </UBadge>
          </div>
          <p class="text-xs text-toned leading-6">
            {{ a.province }}، {{ a.city }}، {{ a.address }}
          </p>
          <div class="text-[11px] text-dimmed mt-2 flex flex-wrap gap-x-4 num">
            <span>{{ $t('گیرنده') }}: {{ a.fullName }}</span>
            <span>{{ $t('تلفن') }}: {{ a.phone }}</span>
            <span>{{ $t('کدپستی') }}: {{ a.postalCode }}</span>
          </div>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const toast = useAppToast()
const store = useCheckoutStore()
const {
  addresses,
  selectedAddressId,
  showAddressForm,
  editingAddressId,
} = storeToRefs(store)

function openAddressForm() {
  store.beginAddAddress()
  showAddressForm.value = true
}

function closeAddressForm() {
  store.cancelAddressForm()
  showAddressForm.value = false
}

function onSaveAddress() {
  const isEdit = !!editingAddressId.value
  const ok = store.submitAddressForm()
  if (!ok) {
    toast.error(t('نام، موبایل و آدرس الزامی است'))
    return
  }
  toast.success(t(isEdit ? 'آدرس به‌روزرسانی شد' : 'آدرس ذخیره شد'))
  showAddressForm.value = false
}
</script>
