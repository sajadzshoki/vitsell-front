<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0 space-y-6">
    <TheSellerPageHeader
      :title="$t('نوار بالا')"
      :description="$t('نوار باریک بالای هدر دسکتاپ را روشن یا خاموش کنید و متن و لینک‌هایش را ویرایش کنید')"
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
      <section class="bg-muted border border-muted rounded-2xl p-4 flex items-center justify-between gap-3 flex-wrap">
        <div class="min-w-0">
          <p class="font-bold text-highlighted">
            {{ $t('نمایش نوار بالا') }}
          </p>
          <p class="text-xs text-muted mt-1">
            {{ draft.enabled ? $t('نوار در هدر دسکتاپ دیده می‌شود') : $t('نوار در سایت نمایش داده نمی‌شود') }}
          </p>
        </div>
        <USwitch
          v-model="draft.enabled"
          :disabled="!canEdit"
          class="cursor-pointer"
        />
      </section>

      <section class="space-y-3">
        <h3 class="font-bold text-highlighted">
          {{ $t('متن نوار') }}
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <TheFormInput
            v-model="draft.supportLabel"
            :label="$t('برچسب پشتیبانی')"
            :placeholder="$t('پشتیبانی ۲۴ ساعته:')"
            :disabled="!canEdit"
            :maxlength="80"
          />
          <TheFormInput
            v-model="draft.supportPhone"
            :label="$t('شماره پشتیبانی')"
            dir="ltr"
            :placeholder="$t('۰۲۱-۹۱۰۰۰۰۰۰')"
            :disabled="!canEdit"
            :maxlength="40"
          />
        </div>
        <TheFormInput
          v-model="draft.highlight"
          :label="$t('متن برجسته')"
          :placeholder="$t('ارسال رایگان سفارش‌های بالای ۵۰۰ هزار تومان')"
          :disabled="!canEdit"
          :maxlength="160"
        />
      </section>

      <section class="space-y-3">
        <div class="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 class="font-bold text-highlighted">
              {{ $t('لینک‌ها') }}
            </h3>
            <p class="text-xs text-muted mt-1">
              {{ $t('در سمت چپ نوار دسکتاپ نمایش داده می‌شوند.') }}
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
            :disabled="draft.links.length >= maxLinks"
            @click="addLink"
          >
            {{ $t('افزودن لینک') }}
          </UButton>
        </div>

        <TheSellerEmptyState
          v-if="!draft.links.length"
          icon="i-tabler-link"
          :title="$t('لینکی نیست')"
          :message="$t('می‌توانید فقط متن پشتیبانی و پیام برجسته را نشان دهید.')"
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
              @click="addLink"
            >
              {{ $t('افزودن لینک') }}
            </UButton>
          </template>
        </TheSellerEmptyState>

        <div
          v-for="(link, index) in draft.links"
          :key="link.id"
          class="bg-muted border border-muted rounded-2xl p-4 space-y-3"
        >
          <div class="flex items-center justify-end gap-1">
            <UButton
              type="button"
              color="neutral"
              variant="ghost"
              size="xs"
              icon="i-tabler-arrow-up"
              class="cursor-pointer"
              :disabled="!canEdit || index === 0"
              :aria-label="$t('بالا')"
              @click="moveLink(index, -1)"
            />
            <UButton
              type="button"
              color="neutral"
              variant="ghost"
              size="xs"
              icon="i-tabler-arrow-down"
              class="cursor-pointer"
              :disabled="!canEdit || index === draft.links.length - 1"
              :aria-label="$t('پایین')"
              @click="moveLink(index, 1)"
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
              @click="removeLink(index)"
            />
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <TheFormInput
              v-model="link.label"
              :label="$t('عنوان')"
              :disabled="!canEdit"
              :maxlength="80"
            />
            <TheSellerInternalLinkField
              v-model="link.to"
              :label="$t('مسیر')"
              :placeholder="$t('خالی = فقط متن')"
              allow-empty
              :disabled="!canEdit"
            />
          </div>
        </div>
      </section>

      <section class="space-y-3">
        <h3 class="font-bold text-highlighted">
          {{ $t('پیش‌نمایش') }}
        </h3>
        <div
          v-if="previewVisible"
          class="rounded-xl overflow-hidden"
        >
          <TheNavbarTopStrip :preview="draft" />
        </div>
        <p
          v-else
          class="text-sm text-muted bg-muted border border-muted rounded-2xl px-4 py-6 text-center"
        >
          {{ draft.enabled ? $t('محتوایی برای نمایش نیست') : $t('نوار بالا خاموش است و در سایت دیده نمی‌شود') }}
        </p>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import {
  createTopStripLink,
  TOP_STRIP_MAX_LINKS,
  topStripHasContent,
  type TopStripLink,
  type TopStripSettings,
} from '~/composables/useTopStrip'

const { t } = useI18n()
const toast = useAppToast()
const { can } = useSellerPermissions()
const { settings, pending, fetchTopStrip, saveTopStrip } = useTopStrip()

const canEdit = computed(() => can('top_strip.update'))
const saving = ref(false)
const bootPending = ref(true)
const maxLinks = TOP_STRIP_MAX_LINKS

const load = await fetchTopStrip({ force: true, admin: true })
bootPending.value = false
if (!load.ok) {
  toast.error(t(load.error || 'بارگذاری نوار بالا ناموفق بود'))
}

const draft = ref<TopStripSettings>(clone(settings.value))
const snapshot = ref(serialize())

watch(settings, (value) => {
  draft.value = clone(value)
  snapshot.value = serialize()
})

const dirty = computed(() => serialize() !== snapshot.value)
const previewVisible = computed(() => draft.value.enabled && topStripHasContent(draft.value))

useSellerUnsavedGuard(dirty)

function clone(value: TopStripSettings): TopStripSettings {
  return {
    enabled: value.enabled,
    supportLabel: value.supportLabel,
    supportPhone: value.supportPhone,
    highlight: value.highlight,
    links: value.links.map(link => ({ ...link })),
  }
}

function serialize() {
  return JSON.stringify(draft.value)
}

function addLink() {
  if (!canEdit.value || draft.value.links.length >= maxLinks) return
  draft.value.links = [...draft.value.links, createTopStripLink()]
}

function removeLink(index: number) {
  draft.value.links = draft.value.links.filter((_, i) => i !== index)
}

function moveLink(index: number, dir: -1 | 1) {
  const nextIndex = index + dir
  if (nextIndex < 0 || nextIndex >= draft.value.links.length) return
  const next = [...draft.value.links]
  const current = next[index]!
  next[index] = next[nextIndex]!
  next[nextIndex] = current
  draft.value.links = next
}

function validateDraft() {
  const empty = draft.value.links.find(link => !link.label.trim())
  if (empty) return t('عنوان همه لینک‌ها را وارد کنید')
  const badHref = draft.value.links.find((link) => {
    const to = link.to.trim()
    return Boolean(to) && !to.startsWith('/') && !/^https?:\/\//i.test(to)
  })
  if (badHref) return t('مسیر لینک باید با / یا http شروع شود')
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
    const payload: TopStripSettings = {
      enabled: draft.value.enabled,
      supportLabel: draft.value.supportLabel.trim(),
      supportPhone: draft.value.supportPhone.trim(),
      highlight: draft.value.highlight.trim(),
      links: draft.value.links.map((link: TopStripLink) => ({
        id: link.id,
        label: link.label.trim(),
        to: link.to.trim(),
      })),
    }
    const result = await saveTopStrip(payload)
    if (!result.ok) {
      toast.error(t(result.error || 'ذخیره نوار بالا ناموفق بود'))
      return
    }
    draft.value = clone(settings.value)
    snapshot.value = serialize()
    toast.success(t('نوار بالا ذخیره شد'))
  }
  finally {
    saving.value = false
  }
}
</script>
