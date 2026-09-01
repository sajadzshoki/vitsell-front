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
        v-if="!showForm && !loading"
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

    <div v-if="loading">
      <TheSkeleton
        variant="address-card"
        :count="2"
      />
    </div>

    <TheAccountAddressForm
      v-else-if="showForm"
      class="mb-4 sm:mb-5"
      :saving="saving"
      @save="onSave"
      @cancel="closeForm"
    />

    <div
      v-else-if="addresses.length === 0"
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
      v-else
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
const loading = ref(true)
const saving = ref(false)

function apiErrorMessage(error: any, fallback: string) {
  const fromFields = error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
  return fromFields || error?.data?.message || fallback
}

async function loadAddresses() {
  loading.value = true
  try {
    const { error } = await checkoutStore.fetchAddresses()
    if (error) {
      toast.error(apiErrorMessage(error, t('بارگذاری آدرس‌ها ناموفق بود')))
    }
  }
  finally {
    loading.value = false
  }
}

function openForm() {
  checkoutStore.beginAddAddress()
  showForm.value = true
}

function openEdit(id: string) {
  checkoutStore.beginEditAddress(id)
  showForm.value = true
}

function closeForm() {
  if (saving.value) return
  checkoutStore.cancelAddressForm()
  showForm.value = false
}

async function onSave() {
  if (saving.value) return
  const isEdit = !!editingAddressId.value
  saving.value = true
  try {
    const { ok, error } = await checkoutStore.submitAddressForm()
    if (!ok) {
      toast.error(apiErrorMessage(error, t('نام، موبایل و آدرس الزامی است')))
      return
    }
    toast.success(t(isEdit ? 'آدرس به‌روزرسانی شد' : 'آدرس ذخیره شد'))
    showForm.value = false
  }
  finally {
    saving.value = false
  }
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

onMounted(() => {
  loadAddresses()
})

definePageMeta({
  layout: 'account',
  middleware: 'auth',
})

useSeoMeta({
  title: () => t('آدرس‌ها'),
})
</script>
