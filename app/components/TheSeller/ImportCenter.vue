<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0 space-y-6">
    <TheSellerPageHeader
      :title="$t('مرکز ورود داده')"
      :description="$t('آپلود CSV، پیش‌نمایش اعتبارسنجی و ثبت در نشست فعلی')"
    />

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UFormField :label="$t('نوع داده')">
        <USelect
          v-model="entity"
          :items="entityItems"
          value-key="value"
          class="w-full"
        />
      </UFormField>
      <div class="flex items-end gap-2 flex-wrap">
        <UButton
          type="button"
          color="neutral"
          variant="soft"
          icon="i-tabler-download"
          class="cursor-pointer"
          @click="downloadTemplate(entity)"
        >
          {{ $t('دانلود قالب') }}
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
          accept=".csv,text/csv"
          class="sr-only"
          @change="onFile"
        >
      </div>
    </div>

    <div
      v-if="lastPreview"
      class="space-y-4"
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
        <div class="max-h-56 overflow-y-auto divide-y divide-muted">
          <div
            v-for="(err, i) in lastPreview.errors"
            :key="`${err.row}-${err.field}-${i}`"
            class="px-4 py-2 text-xs flex gap-3 flex-wrap"
          >
            <span class="num text-muted">
              {{ err.row === 0 ? $t('هدر') : `${$t('ردیف')} ${err.row}` }}
            </span>
            <span class="num text-toned" dir="ltr">{{ err.field }}</span>
            <span class="text-highlighted">{{ err.message }}</span>
          </div>
        </div>
      </div>

      <UButton
        v-if="can('imports.create')"
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

    <section class="space-y-3">
      <h3 class="font-bold text-highlighted">
        {{ $t('تاریخچه') }}
      </h3>
      <TheSellerEmptyState
        v-if="!history.length"
        icon="i-tabler-history"
        :message="$t('هنوز ورودی ثبت نشده')"
      />
      <div
        v-else
        class="space-y-2"
      >
        <div
          v-for="item in history"
          :key="item.id"
          class="bg-muted border border-muted rounded-2xl p-4 flex items-start justify-between gap-3 flex-wrap"
        >
          <div>
            <div class="text-sm font-medium text-highlighted">
              {{ $t(sellerImportEntityMeta[item.entity].label) }}
            </div>
            <div class="text-[11px] text-muted mt-1">
              {{ item.actorName }}
              ·
              <span class="num">
                {{ item.successRows.toLocaleString('fa-IR') }}/{{ item.totalRows.toLocaleString('fa-IR') }}
              </span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <UBadge
              :color="item.status === 'completed' ? 'success' : item.status === 'failed' ? 'error' : 'warning'"
              variant="subtle"
              size="xs"
            >
              {{ statusLabel(item.status) }}
            </UBadge>
            <span
              class="text-[11px] text-muted num"
              dir="ltr"
            >
              {{ item.createdAt.slice(0, 16).replace('T', ' ') }}
            </span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { adminFullName } from '~/data/seller-admins'
import type { SellerImportEntity } from '~/data/seller-import'

const { t } = useI18n()
const toast = useAppToast()
const { can } = useSellerPermissions()
const {
  history,
  lastPreview,
  downloadTemplate,
  previewFromText,
  confirmImport,
  sellerImportEntityMeta,
} = useSellerImport()
const { currentAdminUser } = useSellerAdmins()

const entity = ref<SellerImportEntity>('products')
const fileInput = ref<HTMLInputElement | null>(null)
const confirming = ref(false)

const entityItems = (Object.keys(sellerImportEntityMeta) as SellerImportEntity[]).map(key => ({
  value: key,
  label: t(sellerImportEntityMeta[key].label),
}))

function statusLabel(status: string) {
  if (status === 'completed') return t('کامل')
  if (status === 'failed') return t('ناموفق')
  return t('جزئی')
}

async function onFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const text = await file.text()
  previewFromText(entity.value, text)
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
  }
  finally {
    confirming.value = false
  }
}
</script>
