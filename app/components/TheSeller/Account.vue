<template>
  <div class="space-y-5">
    <div class="bg-default border border-muted rounded-2xl p-5 md:p-6">
      <h2 class="font-bold text-highlighted mb-1">
        {{ $t('حساب ادمین') }}
      </h2>
      <p class="text-xs text-muted mb-5 leading-6">
        {{ $t('اطلاعات نشست جاری و نقش‌های اختصاص‌یافته') }}
      </p>

      <div
        v-if="current"
        class="mb-5 max-w-xs"
      >
        <TheSellerImageUpload
          v-model="avatarModel"
          :label="$t('آواتار')"
        />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div>
          <div class="text-[11px] text-muted">
            {{ $t('نام') }}
          </div>
          <div class="font-medium text-highlighted mt-1">
            {{ profile.firstName }} {{ profile.lastName }}
          </div>
        </div>
        <div>
          <div class="text-[11px] text-muted">
            {{ $t('تلفن') }}
          </div>
          <div class="num mt-1" dir="ltr">
            {{ profile.phone || '—' }}
          </div>
        </div>
        <div>
          <div class="text-[11px] text-muted">
            {{ $t('ایمیل') }}
          </div>
          <div class="num mt-1" dir="ltr">
            {{ profile.email || current?.email || '—' }}
          </div>
        </div>
        <div>
          <div class="text-[11px] text-muted">
            {{ $t('نقش فعلی') }}
          </div>
          <div class="mt-1 font-medium">
            {{ roleLabel }}
          </div>
        </div>
      </div>

      <div class="mt-5">
        <h3 class="text-sm font-bold text-highlighted mb-2">
          {{ $t('نقش‌های اختصاص‌یافته') }}
        </h3>
        <div class="flex flex-wrap gap-1.5">
          <UBadge
            v-for="roleId in current?.roleIds || ['role-super_admin']"
            :key="roleId"
            color="primary"
            variant="subtle"
          >
            {{ roleName(roleId) }}
          </UBadge>
        </div>
      </div>

      <div class="mt-5">
        <h3 class="text-sm font-bold text-highlighted mb-2">
          {{ $t('خلاصه مجوزها') }}
        </h3>
        <p class="text-xs text-muted mb-2">
          {{ permissions.length.toLocaleString('fa-IR') }} {{ $t('مجوز فعال') }}
        </p>
        <div class="flex flex-wrap gap-1 max-h-36 overflow-y-auto">
          <UBadge
            v-for="perm in permissions.slice(0, 36)"
            :key="perm"
            color="neutral"
            variant="subtle"
            size="xs"
            class="num"
          >
            {{ perm }}
          </UBadge>
        </div>
      </div>
    </div>

    <div
      v-if="isReallySuper"
      class="bg-default border border-muted rounded-2xl p-5 md:p-6"
    >
      <h3 class="font-bold text-highlighted mb-2">
        {{ $t('پیش‌نمایش نقش (دمو)') }}
      </h3>
      <p class="text-xs text-muted mb-4 leading-6">
        {{ $t('برای آزمایش RBAC، موقتاً با نقش دیگری پنل را ببینید. فقط سوپر ادمین.') }}
      </p>
      <div class="flex flex-wrap gap-2">
        <UButton
          type="button"
          size="sm"
          :color="!previewRoleId ? 'primary' : 'neutral'"
          :variant="!previewRoleId ? 'soft' : 'outline'"
          class="cursor-pointer"
          @click="setPreviewRole(null)"
        >
          {{ $t('نقش واقعی من') }}
        </UButton>
        <UButton
          v-for="role in previewRoles"
          :key="role.id"
          type="button"
          size="sm"
          :color="previewRoleId === role.id ? 'primary' : 'neutral'"
          :variant="previewRoleId === role.id ? 'soft' : 'outline'"
          class="cursor-pointer"
          @click="setPreviewRole(role.id)"
        >
          {{ role.name }}
        </UButton>
      </div>
    </div>

    <div class="bg-default border border-muted rounded-2xl p-5 md:p-6">
      <h3 class="font-bold text-highlighted mb-4">
        {{ $t('امنیت') }}
      </h3>
      <p class="text-sm text-muted leading-7 mb-4">
        {{ $t('تغییر رمز از مسیر احراز هویت ادمین پشتیبانی می‌شود. رمزها در پنل نمایش داده نمی‌شوند.') }}
      </p>
      <UButton
        color="neutral"
        variant="soft"
        icon="i-tabler-logout"
        class="cursor-pointer"
        @click="requestLogout"
      >
        {{ $t('خروج از حساب') }}
      </UButton>
    </div>

    <TheSellerDashboardActivity :items="myLogs" />
  </div>
</template>

<script setup lang="ts">
import { sellerSystemRoleMeta } from '~/data/seller-roles'
import { resolveSellerAdminRole } from '~/data/seller-permissions'
import { toAdminForm } from '~/data/seller-admins'

const { profile } = useAccount()
const { requestLogout } = useAccountLogout()
const {
  permissions,
  adminRole,
  previewRoleId,
  setPreviewRole,
  isSuperAdmin,
} = useSellerPermissions()
const { currentAdminUser, ensureLoaded, updateAdmin } = useSellerAdmins()
const { getById, roles, ensureLoaded: ensureRoles } = useSellerRoles()
const { logs, ensureLoaded: ensureAudit } = useSellerAudit()

onMounted(() => {
  void ensureLoaded({ force: true })
  void ensureRoles({ force: true })
  void ensureAudit({ force: true })
})

const current = computed(() => currentAdminUser())

const avatarModel = computed({
  get: () => current.value?.avatar || '',
  set: (value: string) => {
    const admin = current.value
    if (!admin) return
    void updateAdmin(admin.id, {
      ...toAdminForm(admin),
      avatar: value.trim() || null,
    })
  },
})

const isReallySuper = computed(() => {
  const admin = current.value
  return Boolean(admin?.roleIds.includes('role-super_admin'))
    || resolveSellerAdminRole(profile.value?.role) === 'SUPER_ADMIN'
})

const roleLabel = computed(() => {
  const key = adminRole.value
  if (key && key in sellerSystemRoleMeta) {
    return sellerSystemRoleMeta[key as keyof typeof sellerSystemRoleMeta].name
  }
  return key || '—'
})

const previewRoles = computed(() =>
  roles.value.filter(r => r.key !== 'SUPER_ADMIN' && r.status === 'active'),
)

const myLogs = computed(() => {
  const id = current.value?.id
  if (!id) return logs.value.slice(0, 6)
  return logs.value.filter(l => l.actorId === id).slice(0, 6)
})

function roleName(id: string) {
  return getById(id)?.name || id
}

// silence unused if preview uses isSuperAdmin elsewhere
void isSuperAdmin
</script>
