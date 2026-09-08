<template>
  <div class="space-y-5">
    <div class="md:hidden">
      <UButton
        to="/seller/notifications"
        color="neutral"
        variant="ghost"
        size="sm"
        icon="i-tabler-chevron-right"
        class="cursor-pointer"
      >
        {{ $t('بازگشت به اعلان‌ها') }}
      </UButton>
    </div>

    <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
      <div class="mb-4">
        <h2 class="font-bold text-highlighted">
          {{ $t('ارسال اعلان') }}
        </h2>
        <p class="text-xs text-muted mt-1 leading-6">
          {{ $t('عنوان، نوع، زمان‌بندی و مخاطب را تنظیم کنید.') }}
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TheFormInput
          v-model="form.title"
          class="md:col-span-2"
          :label="$t('عنوان')"
          :placeholder="$t('مثلاً جشنواره تخفیف شروع شد')"
          :error="errors.title"
          required
        />

        <UFormField
          class="md:col-span-2"
          :label="$t('توضیحات')"
          required
          :error="errors.description"
        >
          <UTextarea
            v-model="form.description"
            :rows="3"
            autoresize
            class="w-full"
            :placeholder="$t('متن اعلان برای کاربر')"
          />
        </UFormField>

        <UFormField
          :label="$t('نوع اعلان')"
          required
        >
          <USelect
            v-model="form.type"
            :items="typeItems"
            value-key="value"
            class="w-full"
          />
        </UFormField>

        <TheFormInput
          v-model="form.scheduledAt"
          type="datetime-local"
          :label="$t('زمان‌بندی ارسال')"
          dir="ltr"
          icon="i-tabler-calendar-time"
          :help="$t('خالی = ارسال فوری')"
          :error="errors.scheduledAt"
        />

        <TheFormInput
          v-model="form.link"
          class="md:col-span-2"
          :label="$t('لینک')"
          :placeholder="$t('مثلاً /search?q=تخفیف')"
          dir="ltr"
          icon="i-tabler-link"
          :help="$t('اختیاری — با کلیک روی اعلان باز می‌شود')"
        />

        <div class="md:col-span-2 max-w-sm">
          <TheSellerImageUpload
            v-model="form.image"
            :label="$t('تصویر')"
            :alt="form.title || $t('تصویر اعلان')"
            :badge="$t('اختیاری')"
          />
        </div>

        <TheFormInput
          v-model="form.relatedEntityType"
          :label="$t('نوع موجودیت مرتبط')"
          :placeholder="$t('مثلاً order یا product')"
          dir="ltr"
          icon="i-tabler-link"
          :help="$t('اختیاری')"
        />

        <TheFormInput
          v-model="form.relatedEntityId"
          :label="$t('شناسه موجودیت مرتبط')"
          :placeholder="$t('اختیاری')"
          dir="ltr"
          icon="i-tabler-id"
        />

        <TheSellerIconPicker
          v-model="form.icon"
          class="md:col-span-2"
          :label="$t('آیکون')"
        />
      </div>
    </div>

    <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0 space-y-4">
      <div>
        <h3 class="font-bold text-highlighted">
          {{ $t('مخاطبان') }}
        </h3>
        <p class="text-xs text-muted mt-1">
          {{ $t('ارسال به همه، یک گروه، یا کاربران انتخابی') }}
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <UButton
          v-for="item in audienceTypeItems"
          :key="item.value"
          type="button"
          :color="form.audienceType === item.value ? 'primary' : 'neutral'"
          :variant="form.audienceType === item.value ? 'soft' : 'outline'"
          size="sm"
          class="cursor-pointer"
          @click="form.audienceType = item.value"
        >
          {{ $t(item.label) }}
        </UButton>
      </div>

      <div
        v-if="form.audienceType === 'group'"
        class="grid grid-cols-1 sm:grid-cols-2 gap-2.5"
      >
        <button
          v-for="(meta, groupId) in sellerNotificationGroupMeta"
          :key="groupId"
          type="button"
          class="rounded-2xl border p-3 text-start transition-all  cursor-pointer"
          :class="form.audienceGroup === groupId
            ? 'border-primary bg-primary/10'
            : 'border-muted hover:(border-accented bg-elevated)'"
          @click="form.audienceGroup = groupId"
        >
          <div class="text-sm font-medium text-highlighted">
            {{ $t(meta.label) }}
          </div>
          <div class="text-[11px] text-muted mt-1 leading-5">
            {{ $t(meta.description) }}
          </div>
        </button>
      </div>

      <div
        v-if="form.audienceType === 'users'"
        class="space-y-3"
      >
        <TheFormInput
          v-model="userQuery"
          icon="i-tabler-search"
          :placeholder="$t('جستجوی نام یا شماره')"
        />
        <p
          v-if="errors.userIds"
          class="text-[11px] text-error"
        >
          {{ errors.userIds }}
        </p>
        <div class="max-h-72 overflow-y-auto space-y-2 pe-1">
          <label
            v-for="user in filteredUsers"
            :key="user.id"
            class="flex items-center gap-3 rounded-xl border border-muted bg-muted/30 px-3 py-2.5 cursor-pointer hover:bg-elevated transition"
          >
            <UCheckbox
              :model-value="form.userIds.includes(user.id)"
              @update:model-value="toggleUser(user.id, $event)"
            />
            <div class="min-w-0 flex-1">
              <div class="text-sm font-medium text-highlighted truncate">
                {{ user.name }}
              </div>
              <div
                class="text-[11px] text-muted num"
                dir="ltr"
              >
                {{ user.phone }}
              </div>
            </div>
          </label>
        </div>
        <div class="text-xs text-muted">
          {{ $t('انتخاب‌شده') }}:
          <span class="font-bold num text-highlighted">
            {{ form.userIds.length.toLocaleString('fa-IR') }}
          </span>
        </div>
      </div>

      <div class="rounded-2xl border border-muted bg-muted/40 px-4 py-3 text-sm flex items-center justify-between gap-3 flex-wrap">
        <span class="text-muted">{{ $t('تعداد گیرندگان') }}</span>
        <span class="font-bold num text-highlighted inline-flex items-center gap-2">
          <UIcon
            v-if="previewPending"
            name="i-tabler-loader-2"
            class="size-4 animate-spin text-primary"
          />
          {{ recipientPreview.toLocaleString('fa-IR') }}
          {{ $t('نفر') }}
        </span>
      </div>
    </div>

    <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
      <h3 class="font-bold text-highlighted mb-3">
        {{ $t('پیش‌نمایش') }}
      </h3>
      <div class="rounded-2xl border border-muted bg-muted/30 p-4 flex items-start gap-3">
        <div class="size-10 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0 overflow-hidden">
          <img
            v-if="form.image"
            :src="form.image"
            :alt="form.title || $t('تصویر اعلان')"
            class="size-full object-cover"
          >
          <UIcon
            v-else
            :name="resolveSellerAdminIconName(form.icon || 'bell')"
            class="size-5"
          />
        </div>
        <div class="min-w-0 flex-1">
          <div class="text-sm font-medium text-highlighted">
            {{ form.title.trim() || $t('عنوان اعلان') }}
          </div>
          <div class="text-xs text-muted mt-1 leading-5">
            {{ form.description.trim() || $t('توضیحات اعلان اینجا نمایش داده می‌شود.') }}
          </div>
          <div class="mt-2 flex flex-wrap gap-2">
            <UBadge
              color="info"
              variant="subtle"
              size="xs"
            >
              {{ $t(sellerNotificationTypeMeta[form.type].label) }}
            </UBadge>
            <UBadge
              v-if="form.scheduledAt"
              color="warning"
              variant="subtle"
              size="xs"
            >
              {{ $t('زمان‌بندی‌شده') }}
            </UBadge>
          </div>
          <div
            v-if="form.link.trim()"
            class="text-[11px] text-primary mt-2 num truncate"
            dir="ltr"
          >
            {{ form.link.trim() }}
          </div>
        </div>
      </div>
    </div>

    <div class="flex items-center gap-3 flex-wrap pb-2">
      <UButton
        type="button"
        color="primary"
        size="lg"
        class="font-bold cursor-pointer"
        :loading="sending"
        :icon="form.scheduledAt ? 'i-tabler-calendar-plus' : 'i-tabler-send'"
        @click="onSend"
      >
        {{ form.scheduledAt ? $t('زمان‌بندی اعلان') : $t('ارسال اعلان') }}
      </UButton>
      <UButton
        type="button"
        color="neutral"
        variant="outline"
        size="lg"
        class="cursor-pointer"
        to="/seller/notifications"
      >
        {{ $t('انصراف') }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  emptyNotificationForm,
  resolveAudienceUsers,
  sellerNotificationAudienceMeta,
  sellerNotificationGroupMeta,
  sellerNotificationTypeMeta,
  type SellerNotificationAudienceType,
  type SellerNotificationFormValues,
  type SellerNotificationType,
} from '~/data/seller-notifications'
import { resolveSellerAdminIconName } from '~/data/seller-admin-icons'

const { t } = useI18n()
const toast = useAppToast()
const {
  sendNotification,
  ensureUsersLoaded,
  previewAudienceCount,
  users,
} = useSellerNotifications()

const form = ref<SellerNotificationFormValues>(emptyNotificationForm())
const sending = ref(false)
const userQuery = ref('')
const errors = ref<Partial<Record<'title' | 'description' | 'userIds' | 'scheduledAt', string>>>({})
const previewCount = ref(0)
const previewPending = ref(false)

const audienceTypeItems = (
  Object.keys(sellerNotificationAudienceMeta) as SellerNotificationAudienceType[]
).map(value => ({
  value,
  label: sellerNotificationAudienceMeta[value].label,
}))

const typeItems = computed(() =>
  (Object.keys(sellerNotificationTypeMeta) as SellerNotificationType[]).map(value => ({
    label: t(sellerNotificationTypeMeta[value].label),
    value,
  })),
)

const filteredUsers = computed(() => {
  const q = userQuery.value.trim().toLowerCase()
  if (!q) return users.value
  return users.value.filter(
    u => u.name.includes(userQuery.value.trim()) || u.phone.includes(q),
  )
})

const recipientPreview = computed(() => {
  if (form.value.audienceType === 'users') {
    return resolveAudienceUsers('users', null, form.value.userIds, users.value).length
  }
  return previewCount.value
})

await ensureUsersLoaded()
await refreshPreviewCount()

watch(
  () => [form.value.audienceType, form.value.audienceGroup, form.value.userIds.join(',')] as const,
  () => {
    void refreshPreviewCount()
  },
)

async function refreshPreviewCount() {
  if (form.value.audienceType === 'users') {
    previewCount.value = form.value.userIds.length
    return
  }
  previewPending.value = true
  try {
    previewCount.value = await previewAudienceCount(form.value)
  }
  finally {
    previewPending.value = false
  }
}

function toggleUser(id: number, checked: boolean | 'indeterminate') {
  const on = checked === true
  if (on) {
    if (!form.value.userIds.includes(id)) {
      form.value.userIds = [...form.value.userIds, id]
    }
    return
  }
  form.value.userIds = form.value.userIds.filter(uid => uid !== id)
}

function validate() {
  const next: typeof errors.value = {}
  if (!form.value.title.trim()) next.title = t('عنوان الزامی است')
  if (!form.value.description.trim()) next.description = t('توضیحات الزامی است')
  if (form.value.audienceType === 'users' && !form.value.userIds.length) {
    next.userIds = t('حداقل یک کاربر انتخاب کنید')
  }
  if (form.value.scheduledAt.trim()) {
    const when = new Date(form.value.scheduledAt).getTime()
    if (Number.isNaN(when) || when <= Date.now()) {
      next.scheduledAt = t('زمان‌بندی باید در آینده باشد')
    }
  }
  errors.value = next
  return !Object.keys(next).length
}

async function onSend() {
  if (!validate()) {
    toast.warning(t('لطفاً فیلدهای الزامی را تکمیل کنید'))
    return
  }

  sending.value = true
  try {
    const result = await sendNotification(form.value)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    const scheduled = Boolean(form.value.scheduledAt.trim())
    toast.success(
      scheduled ? t('اعلان زمان‌بندی شد') : t('اعلان ارسال شد'),
      `${result.recipients.length.toLocaleString('fa-IR')} ${t('گیرنده')}`,
    )
    await navigateTo('/seller/notifications')
  }
  finally {
    sending.value = false
  }
}
</script>
