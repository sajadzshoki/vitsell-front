<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
    <div class="flex items-center justify-between mb-4 sm:mb-5 gap-3">
      <h2
        v-if="!showForm"
        class="font-bold text-highlighted hidden lg:block"
      >
        {{ $t('آدرس‌های من') }}
      </h2>
      <UButton
        v-if="!showForm"
        color="primary"
        variant="soft"
        size="sm"
        leading-icon="i-tabler-plus"
        class="ms-auto lg:ms-0"
        @click="openForm"
      >
        {{ $t('افزودن آدرس') }}
      </UButton>
    </div>

    <TheAccountAddressForm
      v-if="showForm"
      class="mb-4 sm:mb-5"
      @save="onSave"
      @cancel="closeForm"
    />

    <div
      v-if="!showForm && addresses.length === 0"
      class="text-center py-12"
    >
      <UIcon name="i-tabler-map-pin-off" class="size-14 text-dimmed mx-auto mb-4" />
      <p class="text-sm text-muted mb-4">{{ $t('هیچ آدرسی ثبت نکرده‌اید') }}</p>
      <UButton
        color="primary"
        size="lg"
        class="font-bold"
        @click="openForm"
      >
        {{ $t('افزودن اولین آدرس') }}
      </UButton>
    </div>

    <div
      v-else-if="!showForm"
      class="grid grid-cols-1 md:grid-cols-2 gap-3"
    >
      <TheAccountAddressCard
        v-for="address in addresses"
        :key="address.id"
        :address="address"
        @edit="openEdit"
        @delete="onDelete"
      />
    </div>

    <TheAccountAddressDeleteModal @confirmed="onDeleteConfirmed" />
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const toast = useAppToast()
const checkoutStore = useCheckoutStore()
const { addresses, editingAddressId } = storeToRefs(checkoutStore)
const { requestDelete } = useAddressDelete()

const showForm = ref(false)

function openForm() {
  checkoutStore.beginAddAddress()
  showForm.value = true
}

function openEdit(id: string) {
  checkoutStore.beginEditAddress(id)
  showForm.value = true
}

function closeForm() {
  checkoutStore.cancelAddressForm()
  showForm.value = false
}

function onSave() {
  const isEdit = !!editingAddressId.value
  const ok = checkoutStore.submitAddressForm()
  if (!ok) {
    toast.error(t('نام، موبایل و آدرس الزامی است'))
    return
  }
  toast.success(t(isEdit ? 'آدرس به‌روزرسانی شد' : 'آدرس ذخیره شد'))
  showForm.value = false
}

function onDelete(id: string) {
  requestDelete(id)
}

function onDeleteConfirmed({ wasEditing }: { id: string, wasEditing: boolean }) {
  toast.success(t('آدرس حذف شد'))
  if (wasEditing) {
    showForm.value = false
  }
}

definePageMeta({
  layout: 'account',
  middleware: 'auth',
})

useSeoMeta({
  title: () => t('آدرس‌ها'),
})
</script>
