<template>
  <div class="space-y-5">
    <div
      v-if="pending && !ready"
      class="py-16 grid place-items-center"
    >
      <UIcon
        name="i-tabler-loader-2"
        class="size-8 text-primary animate-spin"
      />
    </div>

    <template v-else>
      <!-- About + copyright -->
      <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
        <h2 class="font-bold text-highlighted mb-4">
          {{ $t('متن فوتر') }}
        </h2>
        <div class="space-y-4">
          <UFormField :label="$t('درباره فروشگاه')">
            <UTextarea
              v-model="form.about"
              :rows="3"
              autoresize
              class="w-full"
            />
          </UFormField>
          <TheFormInput
            v-model="form.copyright"
            :label="$t('کپی‌رایت')"
          />
        </div>
      </div>

      <!-- Contact -->
      <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0 space-y-4">
        <div class="flex items-center justify-between gap-3 flex-wrap">
          <h2 class="font-bold text-highlighted">
            {{ $t('تماس') }}
          </h2>
          <UButton
            type="button"
            color="primary"
            variant="soft"
            size="sm"
            icon="i-tabler-plus"
            @click="addPhone"
          >
            {{ $t('افزودن تلفن') }}
          </UButton>
        </div>

        <div
          v-for="(phone, index) in form.contact.phones"
          :key="index"
          class="grid grid-cols-1 md:grid-cols-2 gap-3 items-start"
        >
          <TheFormInput
            v-model="phone.label"
            :label="$t('نمایش شماره')"
            dir="ltr"
          />
          <div class="flex items-end gap-2">
            <TheFormInput
              v-model="phone.href"
              class="flex-1"
              :label="$t('لینک')"
              placeholder="tel:..."
              dir="ltr"
            />
            <UButton
              type="button"
              color="error"
              variant="ghost"
              size="sm"
              class="mb-1"
              icon="i-tabler-trash"
              :disabled="form.contact.phones.length <= 1"
              :aria-label="$t('حذف')"
              @click="form.contact.phones.splice(index, 1)"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <TheFormInput
            v-model="form.contact.email.label"
            :label="$t('ایمیل نمایشی')"
            dir="ltr"
          />
          <TheFormInput
            v-model="form.contact.email.href"
            :label="$t('لینک ایمیل')"
            placeholder="mailto:..."
            dir="ltr"
          />
        </div>
      </div>

      <!-- Trust items -->
      <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0 space-y-4">
        <div class="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 class="font-bold text-highlighted">
              {{ $t('نوار اعتماد') }}
            </h2>
            <p class="text-xs text-muted mt-1">
              {{ $t('آیتم‌های بالای فوتر') }}
            </p>
          </div>
          <UButton
            type="button"
            color="primary"
            variant="soft"
            size="sm"
            icon="i-tabler-plus"
            @click="addTrustItem"
          >
            {{ $t('افزودن') }}
          </UButton>
        </div>

        <div
          v-for="(item, index) in form.trustItems"
          :key="index"
          class="rounded-2xl border border-muted bg-muted/30 p-4 space-y-3"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <TheFormInput
              v-model="item.id"
              :label="$t('شناسه')"
              dir="ltr"
            />
            <TheFormInput
              v-model="item.icon"
              :label="$t('آیکون')"
              dir="ltr"
              :help="$t('نام Tabler بدون i-tabler-')"
            />
            <TheFormInput
              v-model="item.title"
              :label="$t('عنوان')"
            />
            <TheFormInput
              v-model="item.subtitle"
              :label="$t('زیرعنوان')"
            />
          </div>
          <div class="flex justify-end">
            <UButton
              type="button"
              color="error"
              variant="ghost"
              size="sm"
              icon="i-tabler-trash"
              @click="form.trustItems.splice(index, 1)"
            >
              {{ $t('حذف') }}
            </UButton>
          </div>
        </div>
      </div>

      <!-- Columns -->
      <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0 space-y-4">
        <div class="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 class="font-bold text-highlighted">
              {{ $t('ستون‌های لینک') }}
            </h2>
            <p class="text-xs text-muted mt-1">
              {{ $t('ستون‌های اصلی فوتر') }}
            </p>
          </div>
          <UButton
            type="button"
            color="primary"
            variant="soft"
            size="sm"
            icon="i-tabler-plus"
            @click="addColumn"
          >
            {{ $t('افزودن ستون') }}
          </UButton>
        </div>

        <div
          v-for="(column, colIndex) in form.columns"
          :key="colIndex"
          class="rounded-2xl border border-muted bg-muted/30 p-4 space-y-4"
        >
          <div class="flex items-start gap-2">
            <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 min-w-0">
              <TheFormInput
                v-model="column.id"
                :label="$t('شناسه ستون')"
                dir="ltr"
              />
              <TheFormInput
                v-model="column.title"
                :label="$t('عنوان ستون')"
              />
            </div>
            <UButton
              type="button"
              color="error"
              variant="ghost"
              size="sm"
              class="mt-7 shrink-0"
              icon="i-tabler-trash"
              :aria-label="$t('حذف ستون')"
              @click="form.columns.splice(colIndex, 1)"
            />
          </div>

          <div class="space-y-2">
            <div class="text-xs font-medium text-toned">
              {{ $t('لینک‌ها') }}
            </div>
            <div
              v-for="(link, linkIndex) in column.links"
              :key="linkIndex"
              class="flex items-end gap-2"
            >
              <TheFormInput
                v-model="link.label"
                class="flex-1"
                :label="linkIndex === 0 ? $t('عنوان') : undefined"
                size="md"
              />
              <TheFormInput
                v-model="link.to"
                class="flex-1"
                :label="linkIndex === 0 ? $t('مسیر') : undefined"
                dir="ltr"
                size="md"
              />
              <UButton
                type="button"
                color="error"
                variant="ghost"
                size="sm"
                class="shrink-0"
                :class="linkIndex === 0 ? 'mb-0.5' : ''"
                icon="i-tabler-x"
                :aria-label="$t('حذف لینک')"
                @click="column.links.splice(linkIndex, 1)"
              />
            </div>
            <UButton
              type="button"
              color="neutral"
              variant="soft"
              size="sm"
              icon="i-tabler-plus"
              @click="column.links.push({ label: '', to: '/' })"
            >
              {{ $t('افزودن لینک') }}
            </UButton>
          </div>
        </div>
      </div>

      <!-- Socials -->
      <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0 space-y-4">
        <div class="flex items-center justify-between gap-3 flex-wrap">
          <h2 class="font-bold text-highlighted">
            {{ $t('شبکه‌های اجتماعی') }}
          </h2>
          <UButton
            type="button"
            color="primary"
            variant="soft"
            size="sm"
            icon="i-tabler-plus"
            @click="addSocial"
          >
            {{ $t('افزودن') }}
          </UButton>
        </div>

        <div
          v-for="(item, index) in form.socials"
          :key="index"
          class="rounded-2xl border border-muted bg-muted/30 p-4"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <TheFormInput
              v-model="item.id"
              :label="$t('شناسه')"
              dir="ltr"
            />
            <TheFormInput
              v-model="item.label"
              :label="$t('عنوان')"
            />
            <TheFormInput
              v-model="item.icon"
              :label="$t('آیکون')"
              dir="ltr"
            />
            <TheFormInput
              v-model="item.href"
              :label="$t('لینک')"
              dir="ltr"
            />
          </div>
          <div class="mt-3 flex justify-end">
            <UButton
              type="button"
              color="error"
              variant="ghost"
              size="sm"
              icon="i-tabler-trash"
              @click="form.socials.splice(index, 1)"
            >
              {{ $t('حذف') }}
            </UButton>
          </div>
        </div>
      </div>

      <!-- App stores -->
      <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0 space-y-4">
        <div class="flex items-center justify-between gap-3 flex-wrap">
          <h2 class="font-bold text-highlighted">
            {{ $t('فروشگاه‌های اپلیکیشن') }}
          </h2>
          <UButton
            type="button"
            color="primary"
            variant="soft"
            size="sm"
            icon="i-tabler-plus"
            @click="addAppStore"
          >
            {{ $t('افزودن') }}
          </UButton>
        </div>

        <div
          v-for="(item, index) in form.appStores"
          :key="index"
          class="rounded-2xl border border-muted bg-muted/30 p-4"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <TheFormInput
              v-model="item.id"
              :label="$t('شناسه')"
              dir="ltr"
            />
            <TheFormInput
              v-model="item.label"
              :label="$t('عنوان')"
            />
            <TheFormInput
              v-model="item.icon"
              :label="$t('آیکون')"
              dir="ltr"
            />
            <TheFormInput
              v-model="item.href"
              :label="$t('لینک')"
              dir="ltr"
            />
          </div>
          <div class="mt-3 flex justify-end">
            <UButton
              type="button"
              color="error"
              variant="ghost"
              size="sm"
              icon="i-tabler-trash"
              @click="form.appStores.splice(index, 1)"
            >
              {{ $t('حذف') }}
            </UButton>
          </div>
        </div>
      </div>

      <!-- Badges -->
      <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0 space-y-4">
        <div class="flex items-center justify-between gap-3 flex-wrap">
          <h2 class="font-bold text-highlighted">
            {{ $t('نشان‌ها و مجوزها') }}
          </h2>
          <UButton
            type="button"
            color="primary"
            variant="soft"
            size="sm"
            icon="i-tabler-plus"
            @click="addBadge"
          >
            {{ $t('افزودن') }}
          </UButton>
        </div>

        <div
          v-for="(item, index) in form.badges"
          :key="index"
          class="rounded-2xl border border-muted bg-muted/30 p-4"
        >
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <TheFormInput
              v-model="item.id"
              :label="$t('شناسه')"
              dir="ltr"
            />
            <TheFormInput
              v-model="item.label"
              :label="$t('عنوان')"
            />
            <TheFormInput
              v-model="item.icon"
              :label="$t('آیکون')"
              dir="ltr"
            />
          </div>
          <div class="mt-3 flex justify-end">
            <UButton
              type="button"
              color="error"
              variant="ghost"
              size="sm"
              icon="i-tabler-trash"
              @click="form.badges.splice(index, 1)"
            >
              {{ $t('حذف') }}
            </UButton>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-3 flex-wrap pb-2">
        <UButton
          type="button"
          color="primary"
          size="lg"
          class="font-bold"
          :loading="saving"
          @click="onSave"
        >
          {{ saved ? $t('ذخیره شد') : $t('ذخیره تغییرات') }}
        </UButton>
        <UButton
          type="button"
          color="neutral"
          variant="outline"
          size="lg"
          @click="onReset"
        >
          {{ $t('بازنشانی') }}
        </UButton>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import {
  cloneFooter,
  type FooterPayload,
} from '~/composables/useFooter'

type FooterForm = {
  trustItems: FooterPayload['trustItems']
  columns: FooterPayload['columns']
  socials: FooterPayload['socials']
  about: string
  copyright: string
  contact: NonNullable<FooterPayload['contact']>
  appStores: NonNullable<FooterPayload['appStores']>
  badges: NonNullable<FooterPayload['badges']>
}

const { t } = useI18n()
const toast = useAppToast()
const { footer, pending, fetchFooter, saveFooter } = useFooter()

const ready = ref(false)
const saving = ref(false)
const saved = ref(false)
const form = ref<FooterForm>(emptyForm())

await fetchFooter({ force: true, admin: true })
hydrateFromFooter()
ready.value = true

function emptyForm(): FooterForm {
  return {
    trustItems: [],
    columns: [],
    socials: [],
    about: '',
    copyright: '',
    contact: {
      phones: [{ label: '', href: '' }],
      email: { label: '', href: '' },
    },
    appStores: [],
    badges: [],
  }
}

function hydrateFromFooter() {
  const source = cloneFooter(footer.value)
  form.value = {
    trustItems: source.trustItems,
    columns: source.columns,
    socials: source.socials,
    about: source.about,
    copyright: source.copyright,
    contact: source.contact?.phones?.length
      ? source.contact
      : {
          phones: [{ label: '', href: '' }],
          email: source.contact?.email ?? { label: '', href: '' },
        },
    appStores: source.appStores ?? [],
    badges: source.badges ?? [],
  }
}

function sanitizeForm(): FooterPayload {
  return {
    about: form.value.about.trim(),
    copyright: form.value.copyright.trim(),
    trustItems: form.value.trustItems
      .map(item => ({
        id: item.id.trim(),
        icon: item.icon.trim(),
        title: item.title.trim(),
        subtitle: item.subtitle.trim(),
      }))
      .filter(item => item.id && item.title),
    columns: form.value.columns
      .map(column => ({
        id: column.id.trim(),
        title: column.title.trim(),
        links: column.links
          .map(link => ({
            label: link.label.trim(),
            to: link.to.trim(),
          }))
          .filter(link => link.label && link.to),
      }))
      .filter(column => column.id && column.title),
    socials: form.value.socials
      .map(item => ({
        id: item.id.trim(),
        label: item.label.trim(),
        icon: item.icon.trim(),
        href: item.href.trim(),
      }))
      .filter(item => item.id && item.label),
    contact: {
      phones: form.value.contact.phones
        .map(phone => ({
          label: phone.label.trim(),
          href: phone.href.trim(),
        }))
        .filter(phone => phone.label && phone.href),
      email: {
        label: form.value.contact.email.label.trim(),
        href: form.value.contact.email.href.trim(),
      },
    },
    appStores: form.value.appStores
      .map(item => ({
        id: item.id.trim(),
        label: item.label.trim(),
        icon: item.icon.trim(),
        href: item.href.trim(),
      }))
      .filter(item => item.id && item.label),
    badges: form.value.badges
      .map(item => ({
        id: item.id.trim(),
        label: item.label.trim(),
        icon: item.icon.trim(),
      }))
      .filter(item => item.id && item.label),
  }
}

function addPhone() {
  form.value.contact.phones.push({ label: '', href: '' })
}

function addTrustItem() {
  form.value.trustItems.push({
    id: '',
    icon: 'shield-check',
    title: '',
    subtitle: '',
  })
}

function addColumn() {
  form.value.columns.push({
    id: '',
    title: '',
    links: [{ label: '', to: '/' }],
  })
}

function addSocial() {
  form.value.socials.push({
    id: '',
    label: '',
    icon: 'brand-instagram',
    href: '#',
  })
}

function addAppStore() {
  form.value.appStores.push({
    id: '',
    label: '',
    icon: 'shopping-bag',
    href: '#',
  })
}

function addBadge() {
  form.value.badges.push({
    id: '',
    label: '',
    icon: 'certificate',
  })
}

async function onSave() {
  saving.value = true
  try {
    const { ok, error } = await saveFooter(sanitizeForm())
    if (!ok) {
      const msg =
        error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
        || t('ذخیره اطلاعات فوتر ناموفق بود')
      toast.error(msg)
      return
    }
    hydrateFromFooter()
    saved.value = true
    toast.success(t('اطلاعات فوتر ذخیره شد'))
    setTimeout(() => {
      saved.value = false
    }, 2000)
  }
  finally {
    saving.value = false
  }
}

async function onReset() {
  await fetchFooter({ force: true, admin: true })
  hydrateFromFooter()
  toast.info(t('فرم به آخرین ذخیره بازگردانی شد'))
}
</script>
