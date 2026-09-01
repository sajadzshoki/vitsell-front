<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
    <div class="hidden lg:block">
      <TheSellerPageHeader
        :title="$t('نقش‌ها و دسترسی‌ها')"
        :description="$t('نقش‌های سیستمی و سفارشی — تخصیص مجوز بر اساس ماژول')"
        :count-label="`${roles.length.toLocaleString('fa-IR')} ${$t('نقش')}`"
      >
        <template
          v-if="can('roles.create')"
          #actions
        >
          <UButton
            to="/seller/roles/new"
            color="primary"
            size="sm"
            icon="i-tabler-plus"
            class="cursor-pointer"
          >
            {{ $t('نقش جدید') }}
          </UButton>
        </template>
      </TheSellerPageHeader>
    </div>

    <div
      v-if="can('roles.create')"
      class="lg:hidden mb-4"
    >
      <UButton
        to="/seller/roles/new"
        color="primary"
        block
        icon="i-tabler-plus"
        class="cursor-pointer"
      >
        {{ $t('نقش جدید') }}
      </UButton>
    </div>

    <TheFormInput
      v-model="query"
      icon="i-tabler-search"
      :placeholder="$t('جستجوی نقش')"
      class="mb-4"
    />

    <TheSellerEmptyState
      v-if="!filtered.length"
      icon="i-tabler-lock-access"
      :message="$t('نقشی پیدا نشد')"
    >
      <template
        v-if="can('roles.create')"
        #actions
      >
        <UButton
          to="/seller/roles/new"
          color="primary"
          variant="soft"
          icon="i-tabler-plus"
          class="cursor-pointer"
        >
          {{ $t('نقش جدید') }}
        </UButton>
      </template>
    </TheSellerEmptyState>

    <div
      v-else
      class="space-y-3"
    >
      <div
        v-for="role in filtered"
        :key="role.id"
        class="bg-muted border border-muted rounded-2xl p-4"
      >
        <div class="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div class="font-medium text-highlighted flex items-center gap-2 flex-wrap">
              {{ role.name }}
              <UBadge
                v-if="role.isSystem"
                color="info"
                variant="subtle"
                size="xs"
              >
                {{ $t('سیستمی') }}
              </UBadge>
              <UBadge
                :color="role.status === 'active' ? 'success' : 'neutral'"
                variant="subtle"
                size="xs"
              >
                {{ role.status === 'active' ? $t('فعال') : $t('غیرفعال') }}
              </UBadge>
            </div>
            <p class="text-xs text-muted mt-1 leading-6">
              {{ role.description }}
            </p>
            <div class="text-[11px] text-toned mt-2 num">
              {{ role.permissions.length.toLocaleString('fa-IR') }} {{ $t('مجوز') }}
              ·
              {{ countAdminsForRole(role.id, admins).toLocaleString('fa-IR') }} {{ $t('ادمین') }}
            </div>
          </div>
          <div class="flex items-center gap-2 flex-wrap">
            <UButton
              v-if="can('roles.create')"
              type="button"
              color="neutral"
              variant="soft"
              size="xs"
              icon="i-tabler-copy"
              class="cursor-pointer"
              @click="onClone(role.id)"
            >
              {{ $t('کپی') }}
            </UButton>
            <UButton
              :to="`/seller/roles/${role.id}`"
              color="primary"
              variant="soft"
              size="xs"
              icon="i-tabler-pencil"
              class="cursor-pointer"
            >
              {{ can('roles.update') ? $t('ویرایش') : $t('مشاهده') }}
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { adminFullName } from '~/data/seller-admins'

const { t } = useI18n()
const toast = useAppToast()
const { can } = useSellerPermissions()
const { roles, ensureLoaded, countAdminsForRole, cloneRole } = useSellerRoles()
const { admins, ensureLoaded: ensureAdmins, currentAdminUser } = useSellerAdmins()
const { appendLog } = useSellerAudit()

ensureLoaded()
ensureAdmins()

const query = ref('')
const filtered = computed(() => {
  const q = query.value.trim()
  if (!q) return roles.value
  return roles.value.filter(r => r.name.includes(q) || r.key.includes(q.toUpperCase()))
})

function onClone(id: string) {
  const result = cloneRole(id)
  if (!result.ok) {
    toast.error(t(result.error))
    return
  }
  const actor = currentAdminUser()
  appendLog({
    actorId: actor?.id || 'unknown',
    actorName: actor ? adminFullName(actor) : t('سیستم'),
    action: 'create',
    entity: 'role',
    entityId: result.role.id,
    summary: t('نقش کپی شد'),
    newValue: result.role.key,
  })
  toast.success(t('نقش کپی شد'))
}
</script>
