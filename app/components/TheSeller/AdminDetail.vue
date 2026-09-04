<template>
  <div
    v-if="loading"
    class="py-16 grid place-items-center"
  >
    <UIcon
      name="i-tabler-loader-2"
      class="size-8 text-primary animate-spin"
    />
  </div>

  <div
    v-else-if="!admin"
    class="py-16"
  >
    <TheSellerEmptyState
      icon="i-tabler-user-off"
      :message="$t('ادمین پیدا نشد')"
    >
      <template #actions>
        <UButton
          to="/seller/admins"
          color="primary"
          variant="soft"
          class="cursor-pointer"
        >
          {{ $t('بازگشت به لیست') }}
        </UButton>
      </template>
    </TheSellerEmptyState>
  </div>

  <div
    v-else
    class="space-y-5"
  >
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

    <div class="bg-default border border-muted rounded-2xl p-5 md:p-6">
      <div class="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 class="text-lg font-bold text-highlighted">
            {{ adminFullName(admin) }}
          </h2>
          <p class="text-xs text-muted mt-1 num" dir="ltr">
            {{ admin.email }}
          </p>
          <div class="flex gap-1.5 mt-3 flex-wrap">
            <UBadge
              :color="sellerAdminStatusMeta[admin.status].color"
              variant="subtle"
            >
              {{ $t(sellerAdminStatusMeta[admin.status].label) }}
            </UBadge>
            <UBadge
              v-for="roleId in admin.roleIds"
              :key="roleId"
              color="primary"
              variant="subtle"
            >
              {{ roleName(roleId) }}
            </UBadge>
          </div>
        </div>
        <div class="flex gap-2 flex-wrap">
          <UButton
            v-if="can('admins.update')"
            color="primary"
            variant="soft"
            size="sm"
            icon="i-tabler-pencil"
            class="cursor-pointer"
            @click="showEdit = !showEdit"
          >
            {{ $t('ویرایش') }}
          </UButton>
          <UButton
            v-if="can('admins.update') && admin.status === 'active'"
            color="warning"
            variant="soft"
            size="sm"
            class="cursor-pointer"
            @click="onDeactivate"
          >
            {{ $t('غیرفعال‌سازی') }}
          </UButton>
          <UButton
            v-if="can('admins.update') && admin.status === 'active'"
            color="error"
            variant="soft"
            size="sm"
            class="cursor-pointer"
            @click="onSuspend"
          >
            {{ $t('تعلیق') }}
          </UButton>
          <UButton
            v-else-if="can('admins.update') && admin.status !== 'active'"
            color="success"
            variant="soft"
            size="sm"
            class="cursor-pointer"
            @click="onActivate"
          >
            {{ $t('فعال‌سازی') }}
          </UButton>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 text-sm">
        <div>
          <div class="text-[11px] text-muted">
            {{ $t('تلفن') }}
          </div>
          <div class="num mt-1">
            {{ admin.phone || '—' }}
          </div>
        </div>
        <div>
          <div class="text-[11px] text-muted">
            {{ $t('تاریخ ایجاد') }}
          </div>
          <div class="num mt-1" dir="ltr">
            {{ admin.createdAt.slice(0, 10) }}
          </div>
        </div>
        <div>
          <div class="text-[11px] text-muted">
            {{ $t('آخرین ورود') }}
          </div>
          <div class="num mt-1" dir="ltr">
            {{ admin.lastLoginAt?.slice(0, 16) || '—' }}
          </div>
        </div>
      </div>
    </div>

    <div class="bg-default border border-muted rounded-2xl p-5 md:p-6">
      <h3 class="font-bold text-highlighted mb-3">
        {{ $t('خلاصه دسترسی‌ها') }}
      </h3>
      <p class="text-xs text-muted mb-3">
        {{ permissions.length.toLocaleString('fa-IR') }} {{ $t('مجوز') }}
      </p>
      <div class="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
        <UBadge
          v-for="perm in permissions.slice(0, 40)"
          :key="perm"
          color="neutral"
          variant="subtle"
          size="xs"
          class="num"
        >
          {{ perm }}
        </UBadge>
        <span
          v-if="permissions.length > 40"
          class="text-[11px] text-muted"
        >
          +{{ (permissions.length - 40).toLocaleString('fa-IR') }}
        </span>
      </div>
    </div>

    <TheSellerAdminForm
      v-if="showEdit && can('admins.update')"
      :initial="admin"
    />

    <div class="bg-default border border-muted rounded-2xl p-5 md:p-6">
      <h3 class="font-bold text-highlighted mb-4">
        {{ $t('فعالیت اخیر این ادمین') }}
      </h3>
      <ul
        v-if="adminLogs.length"
        class="space-y-3"
      >
        <li
          v-for="item in adminLogs"
          :key="item.id"
          class="text-sm"
        >
          <div class="text-highlighted">
            {{ item.summary }}
          </div>
          <div class="text-[11px] text-muted num mt-0.5" dir="ltr">
            {{ item.createdAt.slice(0, 16).replace('T', ' ') }}
          </div>
        </li>
      </ul>
      <p
        v-else
        class="text-sm text-muted"
      >
        {{ $t('فعالیتی ثبت نشده') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { adminFullName, sellerAdminStatusMeta } from '~/data/seller-admins'

const props = defineProps<{
  adminId: string
}>()

const route = useRoute()
const { t } = useI18n()
const toast = useAppToast()
const { can } = useSellerPermissions()
const {
  getById,
  setAdminStatus,
  fetchById,
  currentAdminUser,
} = useSellerAdmins()
const { getById: getRole, permissionsForRoleIds, ensureLoaded: ensureRoles } = useSellerRoles()
const { logs, ensureLoaded: ensureAudit, appendLog } = useSellerAudit()

const loading = ref(true)
const showEdit = ref(route.query.tab === 'edit')
const admin = computed(() => getById(props.adminId))
const permissions = computed(() =>
  admin.value ? permissionsForRoleIds(admin.value.roleIds) : [],
)
const adminLogs = computed(() =>
  logs.value.filter(l => l.actorId === props.adminId).slice(0, 8),
)

onMounted(async () => {
  loading.value = true
  try {
    await ensureRoles({ force: true })
    void ensureAudit({ force: true })
    await fetchById(props.adminId, { force: true })
  }
  finally {
    loading.value = false
  }
})

function roleName(id: string) {
  return getRole(id)?.name || id
}

async function onDeactivate() {
  const result = await setAdminStatus(props.adminId, 'inactive')
  if (!result.ok) {
    toast.error(t(result.error || 'عملیات ناموفق بود'))
    return
  }
  const actor = currentAdminUser()
  appendLog({
    actorId: actor?.id || 'unknown',
    actorName: actor ? adminFullName(actor) : t('سیستم'),
    action: 'status_change',
    entity: 'admin',
    entityId: props.adminId,
    summary: t('ادمین غیرفعال شد'),
    previousValue: 'active',
    newValue: 'inactive',
  })
  toast.success(t('ادمین غیرفعال شد'))
}

async function onActivate() {
  const result = await setAdminStatus(props.adminId, 'active')
  if (!result.ok) {
    toast.error(t(result.error || 'عملیات ناموفق بود'))
    return
  }
  toast.success(t('ادمین فعال شد'))
}

async function onSuspend() {
  const result = await setAdminStatus(props.adminId, 'suspended')
  if (!result.ok) {
    toast.error(t(result.error || 'عملیات ناموفق بود'))
    return
  }
  const actor = currentAdminUser()
  appendLog({
    actorId: actor?.id || 'unknown',
    actorName: actor ? adminFullName(actor) : t('سیستم'),
    action: 'status_change',
    entity: 'admin',
    entityId: props.adminId,
    summary: t('ادمین معلق شد'),
    previousValue: 'active',
    newValue: 'suspended',
  })
  toast.success(t('ادمین معلق شد'))
}
</script>
