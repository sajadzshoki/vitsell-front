<template>
  <UModal
    v-model:open="open"
    :title="$t('حذف آدرس')"
    :description="$t('آیا از حذف این آدرس مطمئن هستید؟')"
  >
    <template #body>
      <div
        v-if="pendingAddress"
        class="rounded-xl border border-muted bg-muted/40 p-4 text-sm"
      >
        <p class="font-bold text-highlighted mb-1">{{ pendingAddress.title }}</p>
        <p class="text-toned leading-6">
          {{ pendingAddress.province }}، {{ pendingAddress.city }}، {{ pendingAddress.address }}
        </p>
        <p class="text-muted text-xs mt-2 num">
          {{ pendingAddress.fullName }} · {{ pendingAddress.phone }}
        </p>
      </div>
    </template>
    <template #footer>
      <div class="flex items-center gap-2 w-full justify-end">
        <UButton
          color="neutral"
          variant="outline"
          :disabled="deleting"
          @click="cancelDelete"
        >
          {{ $t('انصراف') }}
        </UButton>
        <UButton
          color="error"
          class="font-bold"
          :loading="deleting"
          @click="onConfirm"
        >
          {{ $t('حذف آدرس') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  confirmed: [payload: { id: string, wasEditing: boolean }]
  failed: [payload: { error: unknown }]
}>()

const { t } = useI18n()
const toast = useAppToast()
const { open, pendingAddress, deleting, cancelDelete, confirmDelete } = useAddressDelete()

function apiErrorMessage(error: any, fallback: string) {
  const fromFields = error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
  return fromFields || error?.data?.message || fallback
}

async function onConfirm() {
  const result = await confirmDelete()
  if (!result) return
  if (!result.ok) {
    toast.error(apiErrorMessage(result.error, t('حذف آدرس ناموفق بود')))
    emit('failed', { error: result.error })
    return
  }
  emit('confirmed', { id: result.id, wasEditing: result.wasEditing })
}
</script>
