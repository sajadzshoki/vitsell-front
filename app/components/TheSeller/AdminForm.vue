<template>
  <div class="space-y-5">
    <div class="md:hidden">
      <UButton
        to="/seller/admins"
        color="neutral"
        variant="ghost"
        size="sm"
        icon="i-tabler-chevron-right"
        class="cursor-pointer"
      >
        {{ $t('بازگشت') }}
      </UButton>
    </div>

    <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
      <h2 class="font-bold text-highlighted mb-1">
        {{ isEdit ? $t('ویرایش ادمین') : $t('افزودن ادمین') }}
      </h2>
      <p class="text-xs text-muted mb-5 leading-6">
        {{ $t('کاربران ادمین جدا از مشتریان فروشگاه هستند.') }}
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TheFormInput
          v-model="form.firstName"
          :label="$t('نام')"
          required
          :error="errors.firstName"
        />
        <TheFormInput
          v-model="form.lastName"
          :label="$t('نام خانوادگی')"
          required
          :error="errors.lastName"
        />
        <TheFormInput
          v-model="form.email"
          :label="$t('ایمیل')"
          dir="ltr"
          required
          :error="errors.email"
          icon="i-tabler-mail"
        />
        <TheFormInput
          v-model="form.phone"
          :label="$t('تلفن')"
          dir="ltr"
          icon="i-tabler-phone"
          digits-only
          maxlength="11"
        />
        <UFormField :label="$t('وضعیت')">
          <USelect
            v-model="form.status"
            :items="statusItems"
            value-key="value"
            class="w-full"
          />
        </UFormField>
      </div>

      <div class="mt-4 max-w-sm">
        <TheSellerImageUpload
          v-model="avatarModel"
          :label="$t('آواتار')"
        />
      </div>

      <p class="text-xs text-muted mt-4 leading-6">
        {{ $t('مدیریت رمز عبور از طریق حساب ادمین و احراز هویت سرور انجام می‌شود؛ رمز در این فرم ذخیره نمی‌شود.') }}
      </p>

      <UFormField
        class="mt-4"
        :label="$t('نقش‌ها')"
        :error="errors.roleIds"
        required
      >
        <div class="flex flex-wrap gap-2">
          <UButton
            v-for="role in activeRoles"
            :key="role.id"
            type="button"
            size="sm"
            :color="form.roleIds.includes(role.id) ? 'primary' : 'neutral'"
            :variant="form.roleIds.includes(role.id) ? 'soft' : 'outline'"
            class="cursor-pointer"
            @click="toggleRole(role.id)"
          >
            {{ role.name }}
          </UButton>
        </div>
      </UFormField>

      <div class="flex items-center gap-3 flex-wrap mt-6">
        <UButton
          type="button"
          color="primary"
          size="lg"
          class="font-bold cursor-pointer"
          :loading="saving"
          @click="onSave"
        >
          {{ isEdit ? $t('ذخیره تغییرات') : $t('ثبت ادمین') }}
        </UButton>
        <UButton
          to="/seller/admins"
          color="neutral"
          variant="outline"
          size="lg"
          class="cursor-pointer"
        >
          {{ $t('انصراف') }}
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  emptyAdminForm,
  toAdminForm,
  type SellerAdminUser,
} from '~/data/seller-admins'

const props = defineProps<{
  initial?: SellerAdminUser | null
}>()

const { t } = useI18n()
const toast = useAppToast()
const { createAdmin, updateAdmin, currentAdminUser, adminFullName } = useSellerAdmins()
const { roles, ensureLoaded } = useSellerRoles()
const { appendLog } = useSellerAudit()

ensureLoaded()

const isEdit = computed(() => Boolean(props.initial?.id))
const saving = ref(false)
const form = ref(props.initial ? toAdminForm(props.initial) : emptyAdminForm())
const errors = ref<Partial<Record<'firstName' | 'lastName' | 'email' | 'roleIds', string>>>({})

const activeRoles = computed(() => roles.value.filter(r => r.status === 'active'))
const statusItems = [
  { value: 'active', label: t('فعال') },
  { value: 'inactive', label: t('غیرفعال') },
  { value: 'suspended', label: t('معلق') },
]

const avatarModel = computed({
  get: () => form.value.avatar || '',
  set: (value: string) => {
    form.value.avatar = value.trim() || null
  },
})

watch(() => props.initial, (value) => {
  form.value = value ? toAdminForm(value) : emptyAdminForm()
  errors.value = {}
})

function toggleRole(id: string) {
  const set = new Set(form.value.roleIds)
  if (set.has(id)) set.delete(id)
  else set.add(id)
  form.value.roleIds = [...set]
}

function validate() {
  const next: typeof errors.value = {}
  if (!form.value.firstName.trim()) next.firstName = t('نام الزامی است')
  if (!form.value.lastName.trim()) next.lastName = t('نام خانوادگی الزامی است')
  if (!form.value.email.trim()) next.email = t('ایمیل الزامی است')
  if (!form.value.roleIds.length) next.roleIds = t('حداقل یک نقش')
  errors.value = next
  return !Object.keys(next).length
}

async function onSave() {
  if (!validate()) {
    toast.warning(t('لطفاً فیلدهای الزامی را تکمیل کنید'))
    return
  }
  saving.value = true
  try {
    const result = isEdit.value
      ? updateAdmin(props.initial!.id, form.value)
      : createAdmin(form.value)
    if (!result.ok) {
      toast.error(t(result.error))
      return
    }
    const actor = currentAdminUser()
    appendLog({
      actorId: actor?.id || 'unknown',
      actorName: actor ? adminFullName(actor) : t('سیستم'),
      action: isEdit.value ? 'update' : 'create',
      entity: 'admin',
      entityId: result.admin.id,
      summary: isEdit.value
        ? t('اطلاعات ادمین به‌روز شد')
        : t('ادمین جدید ایجاد شد'),
    })
    toast.success(isEdit.value ? t('ادمین به‌روز شد') : t('ادمین اضافه شد'))
    await navigateTo(`/seller/admins/${result.admin.id}`)
  }
  finally {
    saving.value = false
  }
}
</script>
