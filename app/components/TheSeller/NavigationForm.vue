<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0 space-y-6">
    <TheSellerPageHeader
      :title="$t('منوی سایت')"
      :description="$t('لینک‌های سریع نوار بالا و ناوبری پایین موبایل')"
    >
      <template
        v-if="can('navigation.update')"
        #actions
      >
        <UButton
          color="primary"
          size="sm"
          class="cursor-pointer font-bold"
          :loading="saving"
          @click="onSave"
        >
          {{ $t('ذخیره') }}
        </UButton>
      </template>
    </TheSellerPageHeader>

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
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <TheFormInput
            v-model="link.label"
            :label="$t('عنوان')"
            :disabled="!canEdit"
          />
          <TheFormInput
            v-model="link.to"
            :label="$t('مسیر')"
            dir="ltr"
            :disabled="!canEdit"
          />
          <TheFormInput
            v-model="link.icon"
            :label="$t('آیکون')"
            dir="ltr"
            :disabled="!canEdit"
            :help="$t('نام بدون پیشوند tabler')"
          />
        </div>
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
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <TheFormInput
            v-model="link.label"
            :label="$t('عنوان')"
            :disabled="!canEdit"
          />
          <TheFormInput
            v-model="link.to"
            :label="$t('مسیر')"
            dir="ltr"
            :disabled="!canEdit"
          />
          <TheFormInput
            v-model="link.icon"
            :label="$t('آیکون')"
            dir="ltr"
            :disabled="!canEdit"
          />
        </div>
      </div>
    </section>

    <div
      v-if="canEdit"
      class="lg:hidden"
    >
      <UButton
        color="primary"
        block
        class="cursor-pointer font-bold"
        :loading="saving"
        @click="onSave"
      >
        {{ $t('ذخیره') }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { adminFullName } from '~/data/seller-admins'
import type { SellerBottomNavForm, SellerNavLinkForm } from '~/composables/useSellerNavigation'

const { t } = useI18n()
const toast = useAppToast()
const { can } = useSellerPermissions()
const { quickLinks, bottomLinks, saveQuickLinks, saveBottomLinks } = useSellerNavigation()
const { currentAdminUser } = useSellerAdmins()

const canEdit = computed(() => can('navigation.update'))
const saving = ref(false)
const draftQuick = ref<SellerNavLinkForm[]>(quickLinks.value.map(l => ({ ...l })))
const draftBottom = ref<SellerBottomNavForm[]>(bottomLinks.value.map(l => ({ ...l })))

watch(quickLinks, (v) => {
  draftQuick.value = v.map(l => ({ ...l }))
})
watch(bottomLinks, (v) => {
  draftBottom.value = v.map(l => ({ ...l }))
})

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

function onSave() {
  if (!canEdit.value) return
  saving.value = true
  try {
    const actor = currentAdminUser()
    const actorPayload = actor
      ? { id: actor.id, name: adminFullName(actor) }
      : undefined
    saveQuickLinks(draftQuick.value, actorPayload)
    saveBottomLinks(draftBottom.value, actorPayload)
    toast.success(t('منوی سایت ذخیره شد'))
  }
  finally {
    saving.value = false
  }
}
</script>
