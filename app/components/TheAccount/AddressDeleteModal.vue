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
          @click="cancelDelete"
        >
          {{ $t('انصراف') }}
        </UButton>
        <UButton
          color="error"
          class="font-bold"
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
}>()

const { open, pendingAddress, cancelDelete, confirmDelete } = useAddressDelete()

function onConfirm() {
  const result = confirmDelete()
  if (result) {
    emit('confirmed', result)
  }
}
</script>
