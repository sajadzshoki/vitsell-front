<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0 space-y-6">
    <TheSellerPageHeader
      :title="$t('منوی سایت')"
      :description="$t('لینک‌های سریع نوار بالا و ناوبری پایین موبایل')"
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
        <h3 class="font-bold text-highlighted">
          {{ $t('لینک‌های سریع') }}
        </h3>
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
                @click="moveDraftQuick(index, 1)"
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
          <TheSellerIconPicker
            v-model="link.icon"
            :label="$t('آیکون')"
            :disabled="!canEdit"
          />
        </div>
      </section>

      <section class="space-y-3">
        <h3 class="font-bold text-highlighted">
          {{ $t('منوی پایین') }}
        </h3>
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
                @click="moveDraftBottom(index, 1)"
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
        </div>
      </section>

      <div
        v-if="canEdit && dirty"
        class="flex gap-2 flex-wrap"
      >
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
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { adminFullName } from '~/data/seller-admins'
import type { SellerBottomNavForm, SellerNavLinkForm } from '~/composables/useSellerNavigation'

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

function serialize() {
  return JSON.stringify({ quick: draftQuick.value, bottom: draftBottom.value })
}

const dirty = computed(() => serialize() !== snapshot.value)

function resetDraft() {
  draftQuick.value = quickLinks.value.map(l => ({ ...l }))
  draftBottom.value = bottomLinks.value.map(l => ({ ...l }))
  snapshot.value = serialize()
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

async function onSave() {
  if (!canEdit.value) return
  saving.value = true
  try {
    const actor = currentAdminUser()
    const actorPayload = actor
      ? { id: actor.id, name: adminFullName(actor) }
      : undefined
    const result = await saveNavigation(
      {
        quickLinks: draftQuick.value,
        bottomLinks: draftBottom.value,
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
