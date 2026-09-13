<template>
  <div class="space-y-5">
    <div
      v-if="bootPending"
      class="bg-default border border-muted rounded-2xl p-5 md:p-6 py-16 grid place-items-center"
    >
      <UIcon
        name="i-tabler-loader-2"
        class="size-7 text-primary animate-spin"
      />
    </div>

    <template v-else-if="!current && !profile.adminId">
      <div class="bg-default border border-muted rounded-2xl p-5 md:p-6">
        <TheSellerEmptyState
          icon="i-tabler-user-off"
          :message="$t('اطلاعات حساب ادمین بارگذاری نشد')"
        />
        <div class="mt-4 flex justify-center">
          <UButton
            color="primary"
            variant="soft"
            class="cursor-pointer"
            :loading="bootPending"
            @click="reload"
          >
            {{ $t('تلاش دوباره') }}
          </UButton>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="bg-default border border-muted rounded-2xl p-5 md:p-6">
        <TheSellerPageHeader
          :title="$t('حساب ادمین')"
          :description="$t('اطلاعات نشست جاری و نقش‌های اختصاص‌یافته')"
        />

        <div class="mb-5 max-w-xs">
          <TheSellerImageUpload
            v-model="avatarModel"
            :label="$t('آواتار')"
            :disabled="avatarSaving || !canEditSelf"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <div class="text-[11px] text-muted">
              {{ $t('نام') }}
            </div>
            <div class="font-medium text-highlighted mt-1">
              {{ displayName }}
            </div>
          </div>
          <div>
            <div class="text-[11px] text-muted">
              {{ $t('تلفن') }}
            </div>
            <div
              class="num mt-1"
              dir="ltr"
            >
              {{ displayPhone || '—' }}
            </div>
          </div>
          <div>
            <div class="text-[11px] text-muted">
              {{ $t('ایمیل') }}
            </div>
            <div
              class="num mt-1"
              dir="ltr"
            >
              {{ displayEmail || '—' }}
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
          <div>
            <div class="text-[11px] text-muted">
              {{ $t('وضعیت') }}
            </div>
            <div class="mt-1">
              <UBadge
                :color="statusColor"
                variant="subtle"
                size="xs"
              >
                {{ $t(statusLabel) }}
              </UBadge>
            </div>
          </div>
          <div>
            <div class="text-[11px] text-muted">
              {{ $t('آخرین ورود') }}
            </div>
            <div class="mt-1 text-toned num text-xs">
              {{ formatDate(current?.lastLoginAt) }}
            </div>
          </div>
        </div>

        <div class="mt-5">
          <h3 class="text-sm font-bold text-highlighted mb-2">
            {{ $t('نقش‌های اختصاص‌یافته') }}
          </h3>
          <div class="flex flex-wrap gap-1.5">
            <UBadge
              v-for="roleId in assignedRoleIds"
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
              v-for="perm in permissions.slice(0, 48)"
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
        <div class="flex flex-wrap gap-2">
          <UButton
            v-if="current?.id"
            :to="`/seller/admins/${current.id}`"
            color="neutral"
            variant="outline"
            icon="i-tabler-user-edit"
            class="cursor-pointer"
          >
            {{ $t('ویرایش پروفایل ادمین') }}
          </UButton>
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
      </div>

      <TheSellerDashboardActivity :items="myLogs" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { sellerSystemRoleMeta } from '~/data/seller-roles'
import { resolveSellerAdminRole } from '~/data/seller-permissions'
import { toAdminForm } from '~/data/seller-admins'

const { t } = useI18n()
const toast = useAppToast()
const { profile } = useAccount()
const { fetchMe } = useAuth()
const { requestLogout } = useAccountLogout()
const {
  permissions,
  adminRole,
  previewRoleId,
  setPreviewRole,
  isSuperAdmin,
} = useSellerPermissions()
const {
  currentAdminUser,
  fetchById,
  updateAdmin,
} = useSellerAdmins()
const { getById, roles, ensureLoaded: ensureRoles } = useSellerRoles()
const { logs, fetchList: fetchAudit } = useSellerAudit()

const bootPending = ref(true)
const avatarSaving = ref(false)

async function reload() {
  bootPending.value = true
  try {
    const { result, error } = await fetchMe()
    if (error || !result) {
      toast.error(t('بارگذاری نشست ادمین ناموفق بود'))
      return
    }
    profile.value = {
      ...profile.value,
      ...result,
    }

    const adminId = String(result.adminId || profile.value.adminId || '')
    await Promise.all([
      ensureRoles({ force: true }),
      adminId
        ? fetchById(adminId, { force: true })
        : Promise.resolve({ ok: false as const }),
      adminId
        ? fetchAudit({ actorId: adminId, page: 1, pageSize: 12, mode: 'activity' })
        : fetchAudit({ page: 1, pageSize: 12, mode: 'activity' }),
    ])
  }
  finally {
    bootPending.value = false
  }
}

await reload()

const current = computed(() => currentAdminUser())
const canEditSelf = computed(() => Boolean(current.value?.id))

const displayName = computed(() => {
  const first = current.value?.firstName || profile.value.firstName || ''
  const last = current.value?.lastName || profile.value.lastName || ''
  return `${first} ${last}`.trim() || '—'
})
const displayPhone = computed(() => current.value?.phone || profile.value.phone || '')
const displayEmail = computed(() => current.value?.email || profile.value.email || '')

const assignedRoleIds = computed(() => {
  if (current.value?.roleIds?.length) return current.value.roleIds
  if (profile.value.roleIds?.length) return profile.value.roleIds
  return ['role-super_admin']
})

const avatarModel = computed({
  get: () => current.value?.avatar || profile.value.avatar || '',
  set: (value: string) => {
    void saveAvatar(value)
  },
})

async function saveAvatar(value: string) {
  const admin = current.value
  if (!admin || avatarSaving.value) return
  avatarSaving.value = true
  try {
    const result = await updateAdmin(admin.id, {
      ...toAdminForm(admin),
      avatar: value.trim() || null,
    })
    if (!result.ok) {
      toast.error(t(result.error || 'ذخیره آواتار ناموفق بود'))
      return
    }
    profile.value = {
      ...profile.value,
      avatar: result.admin?.avatar || '',
    }
    toast.success(t('آواتار به‌روز شد'))
  }
  finally {
    avatarSaving.value = false
  }
}

const statusLabel = computed(() => {
  const status = current.value?.status || profile.value.adminStatus || 'active'
  if (status === 'suspended') return 'معلق'
  if (status === 'inactive') return 'غیرفعال'
  return 'فعال'
})
const statusColor = computed(() => {
  const status = current.value?.status || profile.value.adminStatus || 'active'
  if (status === 'suspended') return 'warning' as const
  if (status === 'inactive') return 'neutral' as const
  return 'success' as const
})

const isReallySuper = computed(() => {
  const admin = current.value
  return Boolean(admin?.roleIds.includes('role-super_admin'))
    || resolveSellerAdminRole(profile.value?.role) === 'SUPER_ADMIN'
    || profile.value.primaryRoleKey === 'SUPER_ADMIN'
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
  const id = current.value?.id || profile.value.adminId
  if (!id) return logs.value.slice(0, 6)
  const mine = logs.value.filter(l => l.actorId === id)
  return (mine.length ? mine : logs.value).slice(0, 6)
})

function roleName(id: string) {
  return getById(id)?.name || id
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleString('fa-IR')
  }
  catch {
    return value
  }
}

void isSuperAdmin
</script>
