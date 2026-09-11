<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
    <div class="hidden lg:block">
      <TheSellerPageHeader
        :title="$t('مگا منو')"
        :description="$t('ساختار ناوبری سایت — مستقل از درخت دسته‌بندی محصولات')"
        :count-label="!pending ? `${menus.length.toLocaleString('fa-IR')} ${$t('منو')}` : undefined"
      >
        <template #actions>
          <UButton
            v-if="can('mega_menu.create')"
            to="/seller/mega-menus/new"
            color="primary"
            size="sm"
            icon="i-tabler-plus"
            class="cursor-pointer font-medium"
          >
            {{ $t('افزودن مگا منو') }}
          </UButton>
        </template>
      </TheSellerPageHeader>
    </div>

    <div class="lg:hidden mb-4">
      <UButton
        v-if="can('mega_menu.create')"
        to="/seller/mega-menus/new"
        color="primary"
        block
        icon="i-tabler-plus"
        class="cursor-pointer font-medium"
      >
        {{ $t('افزودن مگا منو') }}
      </UButton>
    </div>

    <div
      v-if="pending && !menus.length"
      class="py-16 flex justify-center"
    >
      <UIcon
        name="i-tabler-loader-2"
        class="size-8 text-muted animate-spin"
      />
    </div>

    <TheSellerEmptyState
      v-else-if="!menus.length"
      icon="i-tabler-layout-navbar"
      :title="$t('مگا منویی ثبت نشده')"
      :message="$t('اولین منوی ناوبری فروشگاه را بسازید')"
    >
      <template
        v-if="can('mega_menu.create')"
        #actions
      >
        <UButton
          to="/seller/mega-menus/new"
          color="primary"
          icon="i-tabler-plus"
          class="cursor-pointer"
        >
          {{ $t('افزودن مگا منو') }}
        </UButton>
      </template>
    </TheSellerEmptyState>

    <ul
      v-else
      class="divide-y divide-muted border border-muted rounded-2xl overflow-hidden"
    >
      <li
        v-for="(menu, index) in menus"
        :key="menu.id"
        class="flex items-center gap-3 px-4 py-3 bg-default"
      >
        <div class="size-10 rounded-xl bg-muted grid place-items-center shrink-0">
          <UIcon
            :name="resolveSellerAdminIconName(menu.icon || 'layout-navbar')"
            class="size-5 text-toned"
          />
        </div>
        <div class="min-w-0 flex-1">
          <NuxtLink
            :to="`/seller/mega-menus/${encodeURIComponent(menu.id)}`"
            class="font-bold text-highlighted text-sm hover:text-primary transition truncate block"
          >
            {{ menu.title }}
          </NuxtLink>
          <p class="text-xs text-muted mt-0.5 truncate">
            {{ menu.slug }} · {{ menu.sectionCount.toLocaleString('fa-IR') }} {{ $t('بخش') }}
          </p>
        </div>
        <UBadge
          :color="menu.status === 'active' ? 'success' : 'neutral'"
          variant="subtle"
          size="sm"
        >
          {{ menu.status === 'active' ? $t('فعال') : $t('غیرفعال') }}
        </UBadge>
        <div class="flex items-center gap-1 shrink-0">
          <UButton
            v-if="can('mega_menu.update')"
            type="button"
            color="neutral"
            variant="ghost"
            size="sm"
            icon="i-tabler-arrow-up"
            class="cursor-pointer"
            :disabled="index === 0"
            @click="moveMenu(menu.id, -1)"
          />
          <UButton
            v-if="can('mega_menu.update')"
            type="button"
            color="neutral"
            variant="ghost"
            size="sm"
            icon="i-tabler-arrow-down"
            class="cursor-pointer"
            :disabled="index === menus.length - 1"
            @click="moveMenu(menu.id, 1)"
          />
          <UButton
            v-if="can('mega_menu.update')"
            type="button"
            color="neutral"
            variant="ghost"
            size="sm"
            :icon="menu.status === 'active' ? 'i-tabler-eye-off' : 'i-tabler-eye'"
            class="cursor-pointer"
            @click="toggleStatus(menu)"
          />
          <UButton
            :to="`/seller/mega-menus/${encodeURIComponent(menu.id)}`"
            color="neutral"
            variant="ghost"
            size="sm"
            icon="i-tabler-pencil"
            class="cursor-pointer"
          />
          <UButton
            v-if="can('mega_menu.delete')"
            type="button"
            color="error"
            variant="ghost"
            size="sm"
            icon="i-tabler-trash"
            class="cursor-pointer"
            @click="confirmDelete(menu.id)"
          />
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { moveIdInList, type SellerMegaMenuSummary } from '~/data/mega-menu'
import { resolveSellerAdminIconName } from '~/data/seller-admin-icons'

const { t } = useI18n()
const toast = useAppToast()
const { can } = useSellerPermissions()
const { menus, pending, fetchList, reorderMenus, setMenuStatus, destroyMenu } = useSellerMegaMenus()

onMounted(() => {
  void fetchList()
})

async function moveMenu(id: string, dir: -1 | 1) {
  const next = moveIdInList(menus.value.map(m => m.id), id, dir)
  if (!next) return
  const result = await reorderMenus(next)
  if (!result.ok) toast.error(t(result.error))
}

async function toggleStatus(menu: SellerMegaMenuSummary) {
  const result = await setMenuStatus(menu.id, menu.status === 'active' ? 'inactive' : 'active')
  if (!result.ok) toast.error(t(result.error))
}

async function confirmDelete(id: string) {
  if (!import.meta.client) return
  if (!window.confirm(t('این مگا منو و تمام بخش‌ها و آیتم‌هایش حذف می‌شود. ادامه می‌دهید؟'))) return
  const result = await destroyMenu(id)
  if (!result.ok) toast.error(t(result.error))
  else toast.success(t('منو حذف شد'))
}
</script>
