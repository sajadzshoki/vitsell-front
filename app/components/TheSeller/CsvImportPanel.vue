<template>
  <UModal
    v-model:open="open"
    :title="$t('ورود داده')"
    :description="$t(sellerImportEntityMeta[entity].label)"
  >
    <template #body>
      <div class="space-y-4">
        <div class="flex flex-wrap gap-2">
          <UButton
            type="button"
            color="neutral"
            variant="soft"
            icon="i-tabler-download"
            class="cursor-pointer"
            @click="downloadTemplate(entity)"
          >
            {{ $t('دانلود قالب اکسل (CSV)') }}
          </UButton>
          <UButton
            type="button"
            color="primary"
            variant="soft"
            icon="i-tabler-upload"
            class="cursor-pointer"
            @click="fileInput?.click()"
          >
            {{ $t('انتخاب فایل') }}
          </UButton>
          <input
            ref="fileInput"
            type="file"
            accept=".csv,text/csv,.xlsx,application/vnd.ms-excel"
            class="sr-only"
            @change="onFile"
          >
        </div>

        <div
          v-if="lastPreview && lastPreview.entity === entity"
          class="space-y-3"
        >
          <div class="flex flex-wrap gap-2 text-sm">
            <UBadge
              color="success"
              variant="subtle"
            >
              {{ lastPreview.validCount.toLocaleString('fa-IR') }} {{ $t('معتبر') }}
            </UBadge>
            <UBadge
              color="error"
              variant="subtle"
            >
              {{ lastPreview.invalidCount.toLocaleString('fa-IR') }} {{ $t('نامعتبر') }}
            </UBadge>
            <UBadge
              color="neutral"
              variant="subtle"
            >
              {{ lastPreview.rows.length.toLocaleString('fa-IR') }} {{ $t('ردیف') }}
            </UBadge>
          </div>

          <div
            v-if="lastPreview.errors.length"
            class="bg-muted border border-muted rounded-2xl overflow-hidden"
          >
            <div class="px-4 py-3 border-b border-muted font-medium text-highlighted text-sm">
              {{ $t('خطاها') }}
            </div>
            <div class="max-h-48 overflow-y-auto divide-y divide-muted">
              <div
                v-for="(err, i) in lastPreview.errors"
                :key="`${err.row}-${err.field}-${i}`"
                class="px-4 py-2 text-xs flex gap-3 flex-wrap"
              >
                <span class="num text-muted">
                  {{ err.row === 0 ? $t('هدر') : `${$t('ردیف')} ${err.row}` }}
                </span>
                <span
                  class="num text-toned"
                  dir="ltr"
                >{{ err.field }}</span>
                <span class="text-highlighted">{{ err.message }}</span>
              </div>
            </div>
          </div>

          <UButton
            v-if="canCreate"
            type="button"
            color="primary"
            class="cursor-pointer font-bold"
            :disabled="lastPreview.validCount === 0"
            :loading="confirming"
            @click="onConfirm"
          >
            {{ $t('تأیید ورود') }}
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { adminFullName } from '~/data/seller-admins'
import type { SellerImportEntity } from '~/data/seller-import'

const props = defineProps<{
  entity: SellerImportEntity
  /** Permission key that gates confirm (e.g. products.create) */
  createPermission: string
}>()

const open = defineModel<boolean>('open', { default: false })

const { t } = useI18n()
const toast = useAppToast()
const { can } = useSellerPermissions()
const {
  lastPreview,
  downloadTemplate,
  previewFromText,
  confirmImport,
  sellerImportEntityMeta,
} = useSellerImport()
const { currentAdminUser } = useSellerAdmins()

const fileInput = ref<HTMLInputElement | null>(null)
const confirming = ref(false)

const canCreate = computed(() => can(props.createPermission as any))

async function onFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const text = await file.text()
  previewFromText(props.entity, text)
  input.value = ''
  toast.success(t('پیش‌نمایش آماده شد'))
}

function onConfirm() {
  const actor = currentAdminUser()
  if (!actor) {
    toast.error(t('کاربر ادمین شناسایی نشد'))
    return
  }
  confirming.value = true
  try {
    const result = confirmImport({ id: actor.id, name: adminFullName(actor) })
    if (!result.ok) {
      toast.error(t(result.error))
      return
    }
    toast.success(t('ورود داده ثبت شد'))
    open.value = false
  }
  finally {
    confirming.value = false
  }
}
</script>
