<template>
  <div class="space-y-5">
    <div
      v-if="bootPending"
      class="py-16 grid place-items-center"
    >
      <UIcon
        name="i-tabler-loader-2"
        class="size-8 text-primary animate-spin"
      />
    </div>

    <div
      v-else-if="loadError && !form.about && !form.columns.length"
      class="py-10 space-y-4 text-center"
    >
      <p class="text-sm text-error">
        {{ loadError }}
      </p>
      <UButton
        type="button"
        color="primary"
        variant="soft"
        class="cursor-pointer"
        :loading="pending"
        @click="onRetry"
      >
        {{ $t('تلاش مجدد') }}
      </UButton>
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
              class="mb-1 cursor-pointer shrink-0"
              icon="i-tabler-trash"
              :aria-label="$t('حذف')"
              @click.stop.prevent="openDeletePhone(index)"
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
            <TheSellerIconPicker
              v-model="item.icon"
              :label="$t('آیکون')"
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
              class="cursor-pointer"
              @click.stop.prevent="openDeleteTrust(index)"
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
              class="mt-7 shrink-0 cursor-pointer"
              icon="i-tabler-trash"
              :aria-label="$t('حذف ستون')"
              @click.stop.prevent="openDeleteColumn(colIndex)"
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
              <TheSellerInternalLinkField
                v-model="link.to"
                class="flex-1"
                :label="linkIndex === 0 ? $t('مسیر') : undefined"
              />
              <UButton
                type="button"
                color="error"
                variant="ghost"
                size="sm"
                class="shrink-0 cursor-pointer"
                :class="linkIndex === 0 ? 'mb-0.5' : ''"
                icon="i-tabler-x"
                :aria-label="$t('حذف لینک')"
                @click.stop.prevent="openDeleteLink(colIndex, linkIndex)"
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
            <TheSellerIconPicker
              v-model="item.icon"
              :label="$t('آیکون')"
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
              class="cursor-pointer"
              @click.stop.prevent="openDeleteSocial(index)"
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
            <TheSellerIconPicker
              v-model="item.icon"
              :label="$t('آیکون')"
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
              class="cursor-pointer"
              @click.stop.prevent="openDeleteAppStore(index)"
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
            <TheSellerIconPicker
              v-model="item.icon"
              :label="$t('آیکون')"
            />
          </div>
          <div class="mt-3 flex justify-end">
            <UButton
              type="button"
              color="error"
              variant="ghost"
              size="sm"
              icon="i-tabler-trash"
              class="cursor-pointer"
              @click.stop.prevent="openDeleteBadge(index)"
            >
              {{ $t('حذف') }}
            </UButton>
          </div>
        </div>
      </div>

      <TheSellerFormActions>
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
      </TheSellerFormActions>
    </template>

    <Teleport to="body">
      <div
        v-if="deleteOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        :aria-label="$t('تأیید حذف')"
      >
        <button
          type="button"
          class="absolute inset-0 bg-elevated/75 cursor-pointer border-0"
          :aria-label="$t('انصراف')"
          @click="cancelDelete"
        />
        <div class="relative w-full max-w-md rounded-lg bg-default shadow-lg ring ring-default divide-y divide-default">
          <div class="p-4 sm:px-6">
            <h3 class="text-highlighted font-semibold">
              {{ $t('تأیید حذف') }}
            </h3>
            <p class="mt-1 text-sm text-muted">
              {{ deleteDescription }}
            </p>
          </div>
          <div
            v-if="deletePreview"
            class="p-4 sm:px-6"
          >
            <div class="rounded-xl border border-muted bg-muted/40 p-4 text-sm font-medium text-highlighted text-end">
              {{ deletePreview }}
            </div>
          </div>
          <div class="p-4 sm:px-6 flex items-center justify-end gap-2">
            <UButton
              type="button"
              color="neutral"
              variant="outline"
              class="cursor-pointer"
              @click="cancelDelete"
            >
              {{ $t('انصراف') }}
            </UButton>
            <UButton
              type="button"
              color="error"
              class="cursor-pointer font-bold"
              icon="i-tabler-trash"
              @click="onConfirmDelete()"
            >
              {{ $t('حذف') }}
            </UButton>
          </div>
        </div>
      </div>
    </Teleport>
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

type DeleteTarget =
  | { kind: 'phone', index: number }
  | { kind: 'trust', index: number }
  | { kind: 'column', index: number }
  | { kind: 'link', colIndex: number, linkIndex: number }
  | { kind: 'social', index: number }
  | { kind: 'appStore', index: number }
  | { kind: 'badge', index: number }

const { t } = useI18n()
const toast = useAppToast()
const { footer, pending, fetchFooter, saveFooter } = useFooter()

const ready = ref(false)
const loadError = ref('')
const saving = ref(false)
const saved = ref(false)
const form = ref<FooterForm>(emptyForm())
const deleteOpen = ref(false)
const pendingDelete = ref<DeleteTarget | null>(null)

const bootPending = computed(() => pending.value && !ready.value)

const deleteDescription = computed(() => {
  switch (pendingDelete.value?.kind) {
    case 'phone':
      return t('این شماره تلفن از فوتر حذف می‌شود.')
    case 'trust':
      return t('این آیتم نوار اعتماد حذف می‌شود.')
    case 'column':
      return t('این ستون لینک و همه لینک‌هایش حذف می‌شوند.')
    case 'link':
      return t('این لینک از ستون حذف می‌شود.')
    case 'social':
      return t('این شبکه اجتماعی حذف می‌شود.')
    case 'appStore':
      return t('این فروشگاه اپلیکیشن حذف می‌شود.')
    case 'badge':
      return t('این نشان حذف می‌شود.')
    default:
      return t('این مورد حذف می‌شود.')
  }
})

const deletePreview = computed(() => {
  const target = pendingDelete.value
  if (!target) return ''
  switch (target.kind) {
    case 'phone':
      return form.value.contact.phones[target.index]?.label || ''
    case 'trust':
      return form.value.trustItems[target.index]?.title || ''
    case 'column':
      return form.value.columns[target.index]?.title || ''
    case 'link': {
      const col = form.value.columns[target.colIndex]
      return col?.links[target.linkIndex]?.label || ''
    }
    case 'social':
      return form.value.socials[target.index]?.label || ''
    case 'appStore':
      return form.value.appStores[target.index]?.label || ''
    case 'badge':
      return form.value.badges[target.index]?.label || ''
    default:
      return ''
  }
})

const load = await fetchFooter({ force: true, admin: true })
if (!load.ok) {
  loadError.value = load.error || t('بارگذاری اطلاعات فوتر ناموفق بود')
  toast.error(loadError.value)
}
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
    trustItems: source.trustItems.map(item => ({ ...item })),
    columns: source.columns.map(column => ({
      ...column,
      links: (column.links || []).map(link => ({ ...link })),
    })),
    socials: source.socials.map(item => ({ ...item })),
    about: source.about,
    copyright: source.copyright,
    contact: source.contact?.phones?.length
      ? {
          phones: source.contact.phones.map(p => ({ ...p })),
          email: { ...(source.contact.email || { label: '', href: '' }) },
        }
      : {
          phones: [{ label: '', href: '' }],
          email: { ...(source.contact?.email ?? { label: '', href: '' }) },
        },
    appStores: (source.appStores ?? []).map(item => ({ ...item })),
    badges: (source.badges ?? []).map(item => ({ ...item })),
  }
}

function openDeletePhone(index: number) {
  openDelete({ kind: 'phone', index })
}
function openDeleteTrust(index: number) {
  openDelete({ kind: 'trust', index })
}
function openDeleteColumn(index: number) {
  openDelete({ kind: 'column', index })
}
function openDeleteLink(colIndex: number, linkIndex: number) {
  openDelete({ kind: 'link', colIndex, linkIndex })
}
function openDeleteSocial(index: number) {
  openDelete({ kind: 'social', index })
}
function openDeleteAppStore(index: number) {
  openDelete({ kind: 'appStore', index })
}
function openDeleteBadge(index: number) {
  openDelete({ kind: 'badge', index })
}

function openDelete(target: DeleteTarget) {
  pendingDelete.value = target
  deleteOpen.value = true
}

function applyRemove(target: DeleteTarget) {
  switch (target.kind) {
    case 'phone': {
      const phones = form.value.contact.phones.filter((_, i) => i !== target.index)
      form.value.contact = {
        ...form.value.contact,
        phones: phones.length ? phones : [{ label: '', href: '' }],
      }
      break
    }
    case 'trust':
      form.value.trustItems = form.value.trustItems.filter((_, i) => i !== target.index)
      break
    case 'column':
      form.value.columns = form.value.columns.filter((_, i) => i !== target.index)
      break
    case 'link':
      form.value.columns = form.value.columns.map((col, i) => {
        if (i !== target.colIndex) return col
        const links = col.links.filter((_, li) => li !== target.linkIndex)
        return {
          ...col,
          links: links.length ? links : [{ label: '', to: '/' }],
        }
      })
      break
    case 'social':
      form.value.socials = form.value.socials.filter((_, i) => i !== target.index)
      break
    case 'appStore':
      form.value.appStores = form.value.appStores.filter((_, i) => i !== target.index)
      break
    case 'badge':
      form.value.badges = form.value.badges.filter((_, i) => i !== target.index)
      break
  }
}

function cancelDelete() {
  deleteOpen.value = false
  pendingDelete.value = null
}

function onConfirmDelete(_close?: () => void) {
  const target = pendingDelete.value
  if (!target) {
    cancelDelete()
    return
  }
  applyRemove(target)
  cancelDelete()
  toast.success(t('حذف شد. برای اعمال روی سایت، ذخیره کنید.'))
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
  const result = await fetchFooter({ force: true, admin: true })
  if (!result.ok) {
    toast.error(result.error || t('بارگذاری اطلاعات فوتر ناموفق بود'))
    return
  }
  loadError.value = ''
  hydrateFromFooter()
  toast.info(t('فرم به آخرین ذخیره بازگردانی شد'))
}

async function onRetry() {
  const result = await fetchFooter({ force: true, admin: true })
  if (!result.ok) {
    loadError.value = result.error || t('بارگذاری اطلاعات فوتر ناموفق بود')
    toast.error(loadError.value)
    return
  }
  loadError.value = ''
  hydrateFromFooter()
}
</script>
