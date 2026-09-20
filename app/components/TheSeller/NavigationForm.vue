<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0 space-y-6">
    <TheSellerPageHeader
      :title="$t('منوی سایت')"
      :description="$t('لینک‌های سریع نوار بالا و ناوبری پایین موبایل را اضافه، حذف یا ویرایش کنید')"
    >
      <template
        v-if="canEdit && dirty"
        #actions
      >
        <UButton
          color="primary"
          size="sm"
          class="cursor-pointer font-bold"
          :loading="saving || pending"
          @click="onSave"
        >
          {{ $t('ذخیره') }}
        </UButton>
      </template>
    </TheSellerPageHeader>

    <div
      v-if="bootPending"
      class="py-16 grid place-items-center"
    >
      <UIcon
        name="i-tabler-loader-2"
        class="size-7 text-primary animate-spin"
      />
    </div>

    <template v-else>
      <section class="space-y-3">
        <div class="flex items-center justify-between gap-3 flex-wrap">
          <h3 class="font-bold text-highlighted">
            {{ $t('لینک‌های سریع') }}
          </h3>
          <UButton
            v-if="canEdit"
            type="button"
            color="primary"
            variant="soft"
            size="sm"
            icon="i-tabler-plus"
            class="cursor-pointer"
            :disabled="draftQuick.length >= maxQuick"
            @click="addQuick"
          >
            {{ $t('افزودن لینک') }}
          </UButton>
        </div>

        <TheSellerEmptyState
          v-if="!draftQuick.length"
          icon="i-tabler-link"
          :title="$t('لینکی نیست')"
          :message="$t('یک لینک سریع برای نوار بالا اضافه کنید.')"
        >
          <template
            v-if="canEdit"
            #actions
          >
            <UButton
              type="button"
              color="primary"
              icon="i-tabler-plus"
              class="cursor-pointer"
              @click="addQuick"
            >
              {{ $t('افزودن لینک') }}
            </UButton>
          </template>
        </TheSellerEmptyState>

        <div
          v-for="(link, index) in draftQuick"
          :key="link.id"
          class="bg-muted border border-muted rounded-2xl p-4 space-y-3"
        >
          <div class="flex items-center justify-between gap-2 flex-wrap">
            <UCheckbox
              v-model="link.enabled"
              :label="$t('فعال')"
              :disabled="!canEdit"
            />
            <div class="flex items-center gap-1">
              <UButton
                type="button"
                color="neutral"
                variant="ghost"
                size="xs"
                icon="i-tabler-arrow-up"
                class="cursor-pointer"
                :disabled="!canEdit || index === 0"
                :aria-label="$t('بالا')"
                @click="moveDraftQuick(index, -1)"
              />
              <UButton
                type="button"
                color="neutral"
                variant="ghost"
                size="xs"
                icon="i-tabler-arrow-down"
                class="cursor-pointer"
                :disabled="!canEdit || index === draftQuick.length - 1"
                :aria-label="$t('پایین')"
                @click="moveDraftQuick(index, 1)"
              />
              <UButton
                v-if="canEdit"
                type="button"
                color="error"
                variant="ghost"
                size="xs"
                icon="i-tabler-trash"
                class="cursor-pointer"
                :aria-label="$t('حذف')"
                @click="openDelete('quick', index)"
              />
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <TheFormInput
              v-model="link.label"
              :label="$t('عنوان')"
              :disabled="!canEdit"
            />
            <TheSellerInternalLinkField
              v-model="link.to"
              :label="$t('مسیر')"
              :disabled="!canEdit"
            />
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <TheSellerIconPicker
              v-model="link.icon"
              :label="$t('آیکون')"
              :disabled="!canEdit"
            />
            <TheFormInput
              :model-value="link.badge || ''"
              :label="$t('برچسب')"
              :placeholder="$t('مثلاً جدید')"
              :disabled="!canEdit"
              @update:model-value="link.badge = $event || undefined"
            />
          </div>
        </div>
      </section>

      <section class="space-y-3">
        <div class="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 class="font-bold text-highlighted">
              {{ $t('منوی پایین') }}
            </h3>
            <p class="text-xs text-muted mt-1">
              {{ $t('ناوبری پایین موبایل؛ بهتر است ۳ تا ۵ آیتم باشد.') }}
            </p>
          </div>
          <UButton
            v-if="canEdit"
            type="button"
            color="primary"
            variant="soft"
            size="sm"
            icon="i-tabler-plus"
            class="cursor-pointer"
            :disabled="draftBottom.length >= maxBottom"
            @click="addBottom"
          >
            {{ $t('افزودن آیتم') }}
          </UButton>
        </div>

        <TheSellerEmptyState
          v-if="!draftBottom.length"
          icon="i-tabler-layout-navbar"
          :title="$t('آیتمی نیست')"
          :message="$t('یک آیتم برای منوی پایین موبایل اضافه کنید.')"
        >
          <template
            v-if="canEdit"
            #actions
          >
            <UButton
              type="button"
              color="primary"
              icon="i-tabler-plus"
              class="cursor-pointer"
              @click="addBottom"
            >
              {{ $t('افزودن آیتم') }}
            </UButton>
          </template>
        </TheSellerEmptyState>

        <div
          v-for="(link, index) in draftBottom"
          :key="link.id"
          class="bg-muted border border-muted rounded-2xl p-4 space-y-3"
        >
          <div class="flex items-center justify-between gap-2 flex-wrap">
            <UCheckbox
              v-model="link.enabled"
              :label="$t('فعال')"
              :disabled="!canEdit"
            />
            <div class="flex items-center gap-1">
              <UButton
                type="button"
                color="neutral"
                variant="ghost"
                size="xs"
                icon="i-tabler-arrow-up"
                class="cursor-pointer"
                :disabled="!canEdit || index === 0"
                :aria-label="$t('بالا')"
                @click="moveDraftBottom(index, -1)"
              />
              <UButton
                type="button"
                color="neutral"
                variant="ghost"
                size="xs"
                icon="i-tabler-arrow-down"
                class="cursor-pointer"
                :disabled="!canEdit || index === draftBottom.length - 1"
                :aria-label="$t('پایین')"
                @click="moveDraftBottom(index, 1)"
              />
              <UButton
                v-if="canEdit"
                type="button"
                color="error"
                variant="ghost"
                size="xs"
                icon="i-tabler-trash"
                class="cursor-pointer"
                :aria-label="$t('حذف')"
                @click="openDelete('bottom', index)"
              />
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <TheFormInput
              v-model="link.label"
              :label="$t('عنوان')"
              :disabled="!canEdit"
            />
            <TheSellerInternalLinkField
              v-model="link.to"
              :label="$t('مسیر')"
              :disabled="!canEdit"
            />
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <TheSellerIconPicker
              v-model="link.icon"
              :label="$t('آیکون')"
              :disabled="!canEdit"
            />
            <TheSellerIconPicker
              v-model="link.iconActive"
              :label="$t('آیکون فعال')"
              :disabled="!canEdit"
            />
          </div>
          <UCheckbox
            :model-value="link.badge === 'cart'"
            :label="$t('نمایش تعداد سبد')"
            :disabled="!canEdit"
            @update:model-value="link.badge = $event ? 'cart' : undefined"
          />
        </div>
      </section>

      <TheSellerFormActions v-if="canEdit && dirty">
        <UButton
          color="primary"
          size="lg"
          class="cursor-pointer font-bold"
          :loading="saving || pending"
          @click="onSave"
        >
          {{ $t('ذخیره تغییرات') }}
        </UButton>
        <UButton
          color="neutral"
          variant="outline"
          size="lg"
          class="cursor-pointer"
          @click="resetDraft"
        >
          {{ $t('انصراف') }}
        </UButton>
      </TheSellerFormActions>
    </template>

    <UModal
      v-model:open="deleteOpen"
      :title="$t('حذف آیتم منو')"
      :description="$t('این مورد از پیش‌نویس حذف می‌شود. برای اعمال روی سایت، ذخیره کنید.')"
    >
      <template #body>
        <div
          v-if="pendingDeleteLabel"
          class="rounded-xl border border-muted bg-muted/40 p-4 text-sm font-medium text-highlighted text-end"
        >
          {{ pendingDeleteLabel }}
        </div>
      </template>
      <template #footer>
        <div class="flex items-center gap-2 w-full justify-end">
          <UButton
            color="neutral"
            variant="outline"
            class="cursor-pointer"
            @click="deleteOpen = false"
          >
            {{ $t('انصراف') }}
          </UButton>
          <UButton
            color="error"
            class="font-bold cursor-pointer"
            icon="i-tabler-trash"
            @click="confirmDelete"
          >
            {{ $t('حذف') }}
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { adminFullName } from '~/data/seller-admins'
import {
  createSellerBottomLink,
  createSellerQuickLink,
  SELLER_NAV_MAX_BOTTOM,
  SELLER_NAV_MAX_QUICK,
  type SellerBottomNavForm,
  type SellerNavLinkForm,
} from '~/composables/useSellerNavigation'

type DeleteKind = 'quick' | 'bottom'

const { t } = useI18n()
const toast = useAppToast()
const { can } = useSellerPermissions()
const {
  quickLinks,
  bottomLinks,
  pending,
  fetchNavigation,
  saveNavigation,
} = useSellerNavigation()
const { currentAdminUser } = useSellerAdmins()

const canEdit = computed(() => can('navigation.update'))
const saving = ref(false)
const bootPending = ref(true)
const deleteOpen = ref(false)
const pendingDelete = ref<{ kind: DeleteKind, index: number } | null>(null)
const maxQuick = SELLER_NAV_MAX_QUICK
const maxBottom = SELLER_NAV_MAX_BOTTOM

const load = await fetchNavigation({ force: true, admin: true })
bootPending.value = false
if (!load.ok) {
  toast.error(t(load.error || 'بارگذاری منوی سایت ناموفق بود'))
}

const draftQuick = ref<SellerNavLinkForm[]>(quickLinks.value.map(l => ({ ...l })))
const draftBottom = ref<SellerBottomNavForm[]>(bottomLinks.value.map(l => ({ ...l })))
const snapshot = ref(serialize())

watch(quickLinks, (v) => {
  draftQuick.value = v.map(l => ({ ...l }))
  snapshot.value = serialize()
})
watch(bottomLinks, (v) => {
  draftBottom.value = v.map(l => ({ ...l }))
  snapshot.value = serialize()
})

const pendingDeleteLabel = computed(() => {
  const target = pendingDelete.value
  if (!target) return ''
  const list = target.kind === 'quick' ? draftQuick.value : draftBottom.value
  return list[target.index]?.label || t('بدون عنوان')
})

function serialize() {
  return JSON.stringify({ quick: draftQuick.value, bottom: draftBottom.value })
}

const dirty = computed(() => serialize() !== snapshot.value)

function resetDraft() {
  draftQuick.value = quickLinks.value.map(l => ({ ...l }))
  draftBottom.value = bottomLinks.value.map(l => ({ ...l }))
  snapshot.value = serialize()
}

function addQuick() {
  if (!canEdit.value || draftQuick.value.length >= maxQuick) return
  draftQuick.value = [...draftQuick.value, createSellerQuickLink()]
}

function addBottom() {
  if (!canEdit.value || draftBottom.value.length >= maxBottom) return
  draftBottom.value = [...draftBottom.value, createSellerBottomLink()]
}

function openDelete(kind: DeleteKind, index: number) {
  const list = kind === 'quick' ? draftQuick.value : draftBottom.value
  if (list.length <= 1) {
    toast.error(t('حداقل یک آیتم باید باقی بماند'))
    return
  }
  pendingDelete.value = { kind, index }
  deleteOpen.value = true
}

function confirmDelete() {
  const target = pendingDelete.value
  if (!target) {
    deleteOpen.value = false
    return
  }
  if (target.kind === 'quick') {
    if (draftQuick.value.length <= 1) {
      toast.error(t('حداقل یک آیتم باید باقی بماند'))
    }
    else {
      draftQuick.value = draftQuick.value.filter((_, i) => i !== target.index)
      toast.success(t('حذف شد. برای اعمال روی سایت، ذخیره کنید.'))
    }
  }
  else if (draftBottom.value.length <= 1) {
    toast.error(t('حداقل یک آیتم باید باقی بماند'))
  }
  else {
    draftBottom.value = draftBottom.value.filter((_, i) => i !== target.index)
    toast.success(t('حذف شد. برای اعمال روی سایت، ذخیره کنید.'))
  }
  pendingDelete.value = null
  deleteOpen.value = false
}

function moveDraftQuick(index: number, dir: -1 | 1) {
  const j = index + dir
  if (j < 0 || j >= draftQuick.value.length) return
  const next = [...draftQuick.value]
  const tmp = next[index]!
  next[index] = next[j]!
  next[j] = tmp
  draftQuick.value = next
}

function moveDraftBottom(index: number, dir: -1 | 1) {
  const j = index + dir
  if (j < 0 || j >= draftBottom.value.length) return
  const next = [...draftBottom.value]
  const tmp = next[index]!
  next[index] = next[j]!
  next[j] = tmp
  draftBottom.value = next
}

function validateDraft() {
  const emptyQuick = draftQuick.value.find(l => !l.label?.trim())
  if (emptyQuick) {
    return t('عنوان همه لینک‌های سریع را وارد کنید')
  }
  const emptyBottom = draftBottom.value.find(l => !l.label?.trim() || !l.icon?.trim())
  if (emptyBottom) {
    return t('عنوان و آیکون همه آیتم‌های منوی پایین را وارد کنید')
  }
  if (!draftQuick.value.length || !draftBottom.value.length) {
    return t('هر بخش باید حداقل یک آیتم داشته باشد')
  }
  return ''
}

async function onSave() {
  if (!canEdit.value) return
  const invalid = validateDraft()
  if (invalid) {
    toast.error(invalid)
    return
  }
  saving.value = true
  try {
    const actor = currentAdminUser()
    const actorPayload = actor
      ? { id: actor.id, name: adminFullName(actor) }
      : undefined
    const result = await saveNavigation(
      {
        quickLinks: draftQuick.value.map(l => ({
          ...l,
          label: l.label.trim(),
          badge: l.badge?.trim() || undefined,
        })),
        bottomLinks: draftBottom.value.map(l => ({
          ...l,
          label: l.label.trim(),
          icon: l.icon.trim() || 'circle',
        })),
      },
      actorPayload,
    )
    if (!result.ok) {
      toast.error(t(result.error || 'ذخیره منوی سایت ناموفق بود'))
      return
    }
    draftQuick.value = quickLinks.value.map(l => ({ ...l }))
    draftBottom.value = bottomLinks.value.map(l => ({ ...l }))
    snapshot.value = serialize()
    toast.success(t('منوی سایت ذخیره شد'))
  }
  finally {
    saving.value = false
  }
}

onBeforeRouteLeave(() => {
  if (!dirty.value) return true
  return window.confirm(t('تغییرات ذخیره نشده‌اند. خروج؟'))
})
</script>
