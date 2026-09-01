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
          {{ isSystemSuper ? $t('سوپر ادمین دسترسی کامل دارد و قابل محدودسازی نیست') : $t('مجوزها را بر اساس ماژول انتخاب کنید') }}
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TheFormInput
          v-model="form.name"
          :label="$t('نام نقش')"
          required
          :disabled="!canEdit"
        />
        <TheFormInput
          v-model="form.key"
          :label="$t('کلید (لاتین)')"
          dir="ltr"
          required
          :disabled="isEdit || !canEdit"
          :help="$t('مثل CONTENT_EDITOR')"
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
          @click="form.permissions = []"
        >
          {{ $t('پاک کردن') }}
        </UButton>
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

ensureAdmins()

const isEdit = computed(() => Boolean(props.initial?.id))
const isSystemSuper = computed(() => props.initial?.key === 'SUPER_ADMIN')
const canEdit = computed(() =>
  isEdit.value ? can('roles.update') : can('roles.create'),
)
const saving = ref(false)
const form = ref(props.initial ? toRoleForm(props.initial) : emptyRoleForm())
const statusItems = [
  { value: 'active', label: t('فعال') },
  { value: 'inactive', label: t('غیرفعال') },
]

watch(() => props.initial, (value) => {
  form.value = value ? toRoleForm(value) : emptyRoleForm()
})

function setPerm(key: SellerPermission, on: boolean) {
  const set = new Set(form.value.permissions)
  if (on) set.add(key)
  else set.delete(key)
  form.value.permissions = [...set]
}

function selectAll() {
  form.value.permissions = [...sellerEditablePermissions]
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

function onSave() {
  if (!form.value.name.trim()) {
    toast.warning(t('نام نقش الزامی است'))
    return
  }
  saving.value = true
  try {
    const result = isEdit.value
      ? updateRole(props.initial!.id, form.value)
      : createRole(form.value)
    if (!result.ok) {
      toast.error(t(result.error))
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
    navigateTo(`/seller/roles/${result.role.id}`)
  }
  finally {
    saving.value = false
  }
}

function onDelete() {
  if (!props.initial) return
  const count = countAdminsForRole(props.initial.id, admins.value)
  const result = deleteRole(props.initial.id, count)
  if (!result.ok) {
    toast.error(t(result.error))
    return
  }
  toast.success(t('نقش حذف شد'))
  navigateTo('/seller/roles')
}
</script>
