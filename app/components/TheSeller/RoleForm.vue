<template>
  <div class="space-y-5">
    <div class="md:hidden">
      <UButton
        to="/seller/roles"
        color="neutral"
        variant="ghost"
        size="sm"
        icon="i-tabler-chevron-right"
        class="cursor-pointer"
      >
        {{ $t('بازگشت') }}
      </UButton>
    </div>

    <div class="bg-default border border-muted rounded-2xl p-5 md:p-6 space-y-5">
      <div>
        <h2 class="font-bold text-highlighted">
          {{ isEdit ? $t('ویرایش نقش') : $t('نقش جدید') }}
        </h2>
        <p class="text-xs text-muted mt-1 leading-6">
          {{ isSystemSuper
            ? $t('سوپر ادمین دسترسی کامل دارد و قابل محدودسازی نیست')
            : $t('کلید لاتین و مجوزها را مشخص کنید؛ نقش در سرور ذخیره می‌شود') }}
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TheFormInput
          v-model="form.name"
          :label="$t('نام نقش')"
          required
          :disabled="!canEdit"
          :error="errors.name"
          @update:model-value="onNameInput"
        />
        <TheFormInput
          v-model="form.key"
          :label="$t('کلید (لاتین)')"
          dir="ltr"
          required
          :disabled="isEdit || !canEdit"
          :error="errors.key"
          :help="$t('مثل CONTENT_EDITOR — فقط حروف بزرگ و _')"
          @update:model-value="onKeyInput"
        />
        <UFormField
          class="md:col-span-2"
          :label="$t('توضیحات')"
        >
          <UTextarea
            v-model="form.description"
            :rows="2"
            class="w-full"
            :disabled="!canEdit"
          />
        </UFormField>
        <UFormField
          v-if="!isSystemSuper"
          :label="$t('وضعیت')"
        >
          <USelect
            v-model="form.status"
            :items="statusItems"
            value-key="value"
            class="w-full"
            :disabled="!canEdit"
          />
        </UFormField>
      </div>

      <div
        v-if="canEdit && !isSystemSuper"
        class="flex items-center gap-2 flex-wrap"
      >
        <UButton
          type="button"
          size="sm"
          color="primary"
          variant="soft"
          class="cursor-pointer"
          @click="selectAll"
        >
          {{ $t('انتخاب همه') }}
        </UButton>
        <UButton
          type="button"
          size="sm"
          color="neutral"
          variant="soft"
          class="cursor-pointer"
          @click="clearPermissions"
        >
          {{ $t('پاک کردن') }}
        </UButton>
        <span
          v-if="errors.permissions"
          class="text-xs text-error"
        >
          {{ errors.permissions }}
        </span>
        <span
          v-else
          class="text-xs text-muted num"
        >
          {{ form.permissions.length.toLocaleString('fa-IR') }} {{ $t('مجوز انتخاب‌شده') }}
        </span>
      </div>

      <div class="space-y-4">
        <div
          v-for="group in sellerPermissionGroups"
          :key="group.id"
          class="border border-muted rounded-2xl p-4"
        >
          <div class="flex items-center justify-between gap-2 mb-3 flex-wrap">
            <h3 class="text-sm font-bold text-highlighted">
              {{ $t(group.label) }}
            </h3>
            <UButton
              v-if="canEdit && !isSystemSuper"
              type="button"
              size="xs"
              color="neutral"
              variant="ghost"
              class="cursor-pointer"
              @click="toggleGroup(group.id)"
            >
              {{ $t('انتخاب ماژول') }}
            </UButton>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <UCheckbox
              v-for="perm in permissionsInGroup(group.id)"
              :key="perm.key"
              :model-value="form.permissions.includes(perm.key)"
              :label="`${$t(perm.label)} (${perm.key})`"
              :disabled="!canEdit || isSystemSuper"
              class="cursor-pointer"
              @update:model-value="(v: boolean | 'indeterminate') => setPerm(perm.key, v === true)"
            />
          </div>
        </div>
      </div>

      <div class="flex items-center gap-3 flex-wrap">
        <UButton
          v-if="canEdit && !isSystemSuper"
          type="button"
          color="primary"
          size="lg"
          class="font-bold cursor-pointer"
          :loading="saving"
          @click="onSave"
        >
          {{ isEdit ? $t('ذخیره نقش') : $t('ایجاد نقش') }}
        </UButton>
        <UButton
          to="/seller/roles"
          color="neutral"
          variant="outline"
          size="lg"
          class="cursor-pointer"
        >
          {{ $t('بازگشت') }}
        </UButton>
        <UButton
          v-if="isEdit && can('roles.delete') && initial && !initial.isSystem"
          type="button"
          color="error"
          variant="soft"
          size="lg"
          class="cursor-pointer"
          :loading="deleting"
          @click="onDelete"
        >
          {{ $t('حذف نقش') }}
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  permissionsInGroup,
  sellerEditablePermissions,
  sellerPermissionGroups,
  type SellerPermission,
  type SellerPermissionGroupId,
} from '~/data/seller-permissions'
import {
  emptyRoleForm,
  roleKeyPattern,
  suggestRoleKey,
  toRoleForm,
  type SellerRole,
} from '~/data/seller-roles'
import { adminFullName } from '~/data/seller-admins'

const props = defineProps<{
  initial?: SellerRole | null
}>()

const { t } = useI18n()
const toast = useAppToast()
const { can } = useSellerPermissions()
const { createRole, updateRole, deleteRole, countAdminsForRole } = useSellerRoles()
const { admins, ensureLoaded: ensureAdmins, currentAdminUser } = useSellerAdmins()
const { appendLog } = useSellerAudit()

onMounted(() => {
  void ensureAdmins({ force: false })
})

const isEdit = computed(() => Boolean(props.initial?.id))
const isSystemSuper = computed(() => props.initial?.key === 'SUPER_ADMIN')
const canEdit = computed(() =>
  isEdit.value ? can('roles.update') : can('roles.create'),
)
const saving = ref(false)
const deleting = ref(false)
const keyTouched = ref(false)
const form = ref(props.initial ? toRoleForm(props.initial) : emptyRoleForm())
const errors = ref<Partial<Record<'name' | 'key' | 'permissions', string>>>({})
const statusItems = [
  { value: 'active', label: t('فعال') },
  { value: 'inactive', label: t('غیرفعال') },
]

watch(() => props.initial, (value) => {
  form.value = value ? toRoleForm(value) : emptyRoleForm()
  errors.value = {}
  keyTouched.value = Boolean(value)
})

function onNameInput(value: string) {
  form.value.name = value
  if (!isEdit.value && !keyTouched.value) {
    const suggested = suggestRoleKey(value)
    if (suggested) form.value.key = suggested
  }
}

function onKeyInput(value: string) {
  keyTouched.value = true
  form.value.key = String(value || '').toUpperCase().replace(/[^A-Z0-9_]/g, '')
}

function setPerm(key: SellerPermission, on: boolean) {
  const set = new Set(form.value.permissions)
  if (on) set.add(key)
  else set.delete(key)
  form.value.permissions = [...set]
  if (errors.value.permissions && form.value.permissions.length) {
    errors.value = { ...errors.value, permissions: undefined }
  }
}

function selectAll() {
  form.value.permissions = [...sellerEditablePermissions]
  errors.value = { ...errors.value, permissions: undefined }
}

function clearPermissions() {
  form.value.permissions = []
}

function toggleGroup(groupId: SellerPermissionGroupId) {
  const keys = permissionsInGroup(groupId).map(p => p.key)
  const allOn = keys.every(k => form.value.permissions.includes(k))
  const set = new Set(form.value.permissions)
  for (const key of keys) {
    if (allOn) set.delete(key)
    else set.add(key)
  }
  form.value.permissions = [...set]
}

function validate() {
  const next: typeof errors.value = {}
  if (!form.value.name.trim()) next.name = t('نام نقش الزامی است')
  const key = form.value.key.trim().toUpperCase()
  form.value.key = key
  if (!roleKeyPattern.test(key)) next.key = t('کلید باید با حرف لاتین شروع شود (A-Z و _)')
  if (!isSystemSuper.value && !form.value.permissions.length) {
    next.permissions = t('حداقل یک مجوز انتخاب کنید')
  }
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
      ? await updateRole(props.initial!.id, form.value)
      : await createRole(form.value)
    if (!result.ok || !result.role) {
      toast.error(t(result.error || 'ذخیره ناموفق بود'))
      return
    }
    const actor = currentAdminUser()
    appendLog({
      actorId: actor?.id || 'unknown',
      actorName: actor ? adminFullName(actor) : t('سیستم'),
      action: isEdit.value ? 'permission_change' : 'create',
      entity: 'role',
      entityId: result.role.id,
      summary: isEdit.value ? t('نقش به‌روز شد') : t('نقش جدید ایجاد شد'),
    })
    toast.success(isEdit.value ? t('نقش ذخیره شد') : t('نقش ایجاد شد'))
    await navigateTo(`/seller/roles/${encodeURIComponent(result.role.id)}`)
  }
  finally {
    saving.value = false
  }
}

async function onDelete() {
  if (!props.initial) return
  if (!window.confirm(t('این نقش حذف شود؟'))) return
  deleting.value = true
  try {
    const count = props.initial.adminCount
      ?? countAdminsForRole(props.initial.id, admins.value)
    const result = await deleteRole(props.initial.id, count)
    if (!result.ok) {
      toast.error(t(result.error || 'حذف ناموفق بود'))
      return
    }
    toast.success(t('نقش حذف شد'))
    await navigateTo('/seller/roles')
  }
  finally {
    deleting.value = false
  }
}
</script>
