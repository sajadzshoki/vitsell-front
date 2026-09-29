<template>
  <footer class="mt-6 md:mt-16">
    <div class="md:hidden bg-default text-start">
      <div class="flex justify-center pt-5 pb-2">
        <UButton
          type="button"
          color="neutral"
          variant="ghost"
          size="sm"
          icon="i-tabler-chevron-up"
          class="h-9 px-4 !rounded-full !bg-muted !text-toned font-medium hover:!bg-accented"
          @click="scrollToTop"
        >
          {{ $t('رفتن به بالا') }}
        </UButton>
      </div>

      <div class="px-4 py-3 flex items-center justify-between gap-3 border-b border-muted">
        <div class="flex items-center gap-3 min-w-0">
          <div class="size-11 rounded-full border border-muted text-toned grid place-items-center shrink-0">
            <UIcon
              name="i-tabler-headset"
              class="size-5"
            />
          </div>
          <div class="min-w-0">
            <div class="text-sm font-bold text-highlighted truncate">
              {{ $t('تماس با پشتیبانی') }}
            </div>
            <div
              v-if="workingHours"
              class="text-xs text-muted mt-0.5 truncate"
            >
              {{ workingHours }}
            </div>
          </div>
        </div>
        <UButton
          :to="callHref"
          color="neutral"
          variant="ghost"
          size="sm"
          class="h-9 px-5 !rounded-full !bg-muted !text-highlighted font-medium shrink-0 hover:!bg-accented"
        >
          {{ $t('تماس') }}
        </UButton>
      </div>

      <div
        v-if="appStores.length"
        class="border-b border-muted"
      >
        <button
          type="button"
          class="w-full px-4 py-3 flex items-center justify-between gap-3 cursor-pointer"
          :aria-expanded="appsOpen"
          @click="appsOpen = !appsOpen"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div class="size-11 rounded-full bg-primary text-inverted grid place-items-center shrink-0">
              <UIcon
                :name="appsOpen ? 'i-tabler-chevron-up' : 'i-tabler-chevron-down'"
                class="size-5"
              />
            </div>
            <div class="min-w-0 text-start">
              <div class="text-sm font-bold text-highlighted truncate">
                {{ $t('اپلیکیشن') }} {{ siteName }}
              </div>
              <div class="text-xs text-muted mt-0.5 truncate">
                {{ $t('تجربه خرید بهتر') }}
              </div>
            </div>
          </div>
          <span class="inline-flex items-center justify-center h-9 px-5 rounded-full bg-muted text-sm font-medium text-highlighted shrink-0">
            {{ $t('دانلود') }}
          </span>
        </button>
        <div
          v-if="appsOpen"
          class="px-4 pb-4 flex flex-wrap items-center gap-2"
        >
          <component
            :is="storeHref(store) ? 'a' : 'div'"
            v-for="store in appStores"
            :key="`m-${store.id}`"
            :href="storeHref(store) || undefined"
            :aria-label="$t(store.label)"
            class="inline-flex items-center gap-2 h-12 rounded-xl"
            :class="storeHref(store) ? 'cursor-pointer hover:opacity-90' : ''"
            :target="storeHref(store) ? '_blank' : undefined"
            :rel="storeHref(store) ? 'noopener noreferrer' : undefined"
          >
            <img
              v-if="isSellerAdminIconImage(store.icon)"
              :src="resolveMediaUrl(store.icon)"
              :alt="$t(store.label)"
              class="h-12 w-auto max-w-36 object-contain"
              loading="lazy"
            >
            <span
              v-else
              class="inline-flex items-center gap-2 h-12 px-3 rounded-xl border border-muted bg-elevated text-sm text-toned"
            >
              <UIcon
                :name="resolveSellerAdminIconName(store.icon)"
                class="size-5 shrink-0"
              />
              {{ $t(store.label) }}
            </span>
          </component>
        </div>
      </div>

      <UAccordion
        v-if="accordionItems.length"
        type="single"
        collapsible
        :items="accordionItems"
        trailing-icon="i-tabler-chevron-down"
        :ui="{
          root: 'px-4',
          item: 'border-b border-muted last:border-b-0',
          trigger: 'py-4 w-full text-sm font-bold text-highlighted cursor-pointer',
          label: 'text-start',
          trailingIcon: 'size-5 text-toned',
          body: 'pt-0 pb-4',
        }"
      >
        <template #default="{ item }">
          {{ $t(item.label) }}
        </template>
        <template #body="{ item }">
          <ul class="flex flex-col gap-2.5">
            <li
              v-for="link in item.links"
              :key="`${item.value}-${link.to}-${link.label}`"
            >
              <NuxtLink
                :to="link.to"
                class="text-sm text-muted hover:text-primary cursor-pointer"
              >
                {{ $t(link.label) }}
              </NuxtLink>
            </li>
          </ul>
        </template>
      </UAccordion>

      <div
        v-if="aboutText"
        class="px-4 py-5 border-t border-muted flex flex-col"
      >
        <h2 class="text-sm font-bold text-highlighted leading-7">
          {{ siteName }}
        </h2>
        <p
          ref="aboutEl"
          class="text-xs text-muted leading-6 mt-2"
          :class="aboutExpanded ? '' : 'line-clamp-3'"
        >
          <template
            v-for="(part, i) in aboutSegments"
            :key="`m-about-${i}`"
          >
            <span :class="part.highlight ? 'text-primary font-medium' : undefined">{{ part.text }}</span>
          </template>
        </p>
        <button
          type="button"
          class="mt-3 self-end inline-flex items-center gap-1 text-sm text-toned cursor-pointer"
          @click="onAboutMore"
        >
          <span>{{ aboutExpanded ? $t('بستن') : $t('مشاهده بیشتر') }}</span>
          <UIcon
            :name="aboutExpanded ? 'i-tabler-chevron-up' : 'i-tabler-chevron-left'"
            class="size-4"
          />
        </button>
      </div>

      <div
        v-if="socials.length"
        class="px-4 pb-4 flex items-center justify-center gap-2"
      >
        <UButton
          v-for="social in socials"
          :key="`m-${social.id}`"
          :href="social.href"
          :aria-label="$t(social.label)"
          color="neutral"
          variant="ghost"
          size="sm"
          square
          :icon="isSellerAdminIconImage(social.icon) ? undefined : resolveSellerAdminIconName(social.icon)"
          target="_blank"
          rel="noopener noreferrer"
          class="size-10 !rounded-full !bg-muted !text-toned hover:!text-primary"
        >
          <img
            v-if="isSellerAdminIconImage(social.icon)"
            :src="resolveMediaUrl(social.icon)"
            alt=""
            class="size-5 object-contain"
          >
        </UButton>
      </div>

      <div class="px-4 pb-4 flex flex-wrap items-center justify-center gap-2">
        <div class="size-16 rounded-xl bg-elevated flex items-center justify-center overflow-hidden p-1">
          <a
            :href="ENAMAD_HREF"
            target="_blank"
            rel="noopener noreferrer"
            referrerpolicy="origin"
            class="size-full flex items-center justify-center cursor-pointer"
          >
            <img
              :src="enamadSrc"
              alt="نماد اعتماد الکترونیکی"
              class="size-full object-contain"
              width="56"
              height="56"
              loading="lazy"
              referrerpolicy="origin"
              code="GJIvNk4R5oCAI3eidsnOUmgFz3hq9ZCT"
              @error="enamadSrc = TRUST_BADGES.enamad"
            >
          </a>
        </div>
        <div
          v-for="badge in displayBadges"
          :key="`m-${badge.id}`"
          class="size-16 rounded-xl bg-elevated flex items-center justify-center overflow-hidden p-1"
          :title="$t(badge.label)"
        >
          <img
            v-if="badgeIconSrc(badge)"
            :src="badgeIconSrc(badge)"
            :alt="$t(badge.label)"
            class="size-full object-contain"
            loading="lazy"
            width="56"
            height="56"
          >
          <UIcon
            v-else
            :name="resolveSellerAdminIconName(badge.icon)"
            class="size-6 text-toned"
          />
        </div>
      </div>

      <p
        v-if="copyright"
        class="px-4 pb-6 text-xs text-muted num text-center"
      >
        {{ $t(copyright) }}
      </p>
    </div>

    <div class="<md:hidden">
    <!-- Trust strip (admin: /seller/footer → نوار اعتماد) -->
    <div
      v-if="trustItems.length"
      class="border-y border-muted bg-muted/60"
    >
      <div class="mx-auto max-w-8xl px-3 py-8 sm:px-4 lg:px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
        <div
          v-for="item in trustItems"
          :key="item.id"
          class="flex items-center gap-3"
        >
          <div class="size-12 rounded-2xl bg-primary/10 text-primary grid place-items-center shrink-0 overflow-hidden">
            <img
              v-if="isSellerAdminIconImage(item.icon)"
              :src="resolveMediaUrl(item.icon)"
              alt=""
              class="size-6 object-contain"
            >
            <UIcon
              v-else
              :name="resolveSellerAdminIconName(item.icon)"
              class="size-6"
            />
          </div>
          <div class="min-w-0 text-start">
            <div class="text-sm font-semibold text-highlighted truncate">
              {{ $t(item.title) }}
            </div>
            <div
              v-if="item.subtitle"
              class="text-xs text-muted mt-0.5 truncate"
            >
              {{ $t(item.subtitle) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="relative overflow-hidden border-t border-muted bg-default">
      <!-- Soft primary glow from top (must sit above bg-default, not on <footer>) -->
      <div
        class="pointer-events-none absolute inset-x-0 top-0 h-48 bg-linear-to-b from-primary/15 via-primary/5 to-transparent"
        aria-hidden="true"
      />

      <div class="relative z-10 mx-auto max-w-8xl px-3 sm:px-4 lg:px-6">
        <!-- Brand + link columns + contact -->
        <div class="py-10 lg:py-12 !pb-4 grid grid-cols-1 xl:grid-cols-12 gap-10 xl:gap-8">
          <!-- Brand block -->
          <div class="xl:col-span-4 flex flex-col gap-5">
            <TheNavbarLogo logoSize="!size-18"/>

            <p
              v-if="aboutSegments.length"
              class="text-sm text-muted leading-7 max-w-sm text-start"
            >
              <template
                v-for="(part, i) in aboutSegments"
                :key="i"
              >
                <span
                  :class="part.highlight ? 'text-primary font-medium' : undefined"
                >{{ part.text }}</span>
              </template>
            </p>

            <div
              v-if="socials.length"
              class="flex items-center gap-2.5 pt-1"
            >
              <UButton
                v-for="social in socials"
                :key="social.id"
                :href="social.href"
                :aria-label="$t(social.label)"
                color="primary"
                variant="outline"
                size="sm"
                square
                :icon="isSellerAdminIconImage(social.icon) ? undefined : resolveSellerAdminIconName(social.icon)"
                target="_blank"
                rel="noopener noreferrer"
                class="size-10 rounded-full !bg-primary/5 !text-primary !border-primary/25 hover:(!bg-primary/10 !border-primary/40)"
              >
                <img
                  v-if="isSellerAdminIconImage(social.icon)"
                  :src="resolveMediaUrl(social.icon)"
                  alt=""
                  class="size-5 object-contain"
                >
              </UButton>
            </div>
          </div>

          <!-- Link columns + contact -->
          <div class="xl:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-6">
            <div
              v-for="column in columns"
              :key="column.id"
            >
              <h4 class="flex items-center gap-2 text-sm font-bold text-highlighted mb-4 text-start">
                <span
                  class="size-1.5 rounded-full bg-primary shrink-0"
                  aria-hidden="true"
                />
                {{ $t(column.title) }}
              </h4>
              <ul class="space-y-2.5">
                <li
                  v-for="link in column.links"
                  :key="`${column.id}-${link.to}-${link.label}`"
                >
                  <NuxtLink
                    :to="link.to"
                    class="text-sm text-muted hover:text-primary transition-all  text-start cursor-pointer"
                  >
                    {{ $t(link.label) }}
                  </NuxtLink>
                </li>
              </ul>
            </div>

            <!-- Contact (footer + site/platform settings) -->
            <div v-if="hasContact">
              <h4 class="flex items-center gap-2 text-sm font-bold text-highlighted mb-4 text-start">
                <span
                  class="size-1.5 rounded-full bg-primary shrink-0"
                  aria-hidden="true"
                />
                {{ $t('ارتباط با ما') }}
              </h4>
              <ul class="space-y-2.5">
                <li
                  v-for="phone in contact.phones"
                  :key="phone.href || phone.label"
                >
                  <a
                    :href="phone.href"
                    class="text-sm text-muted hover:text-primary num cursor-pointer transition"
                    dir="ltr"
                  >
                    {{ phone.label }}
                  </a>
                </li>
                <li v-if="contact.email?.href && contact.email?.label">
                  <a
                    :href="contact.email.href"
                    class="text-sm text-muted hover:text-primary cursor-pointer transition"
                    dir="ltr"
                  >
                    {{ contact.email.label }}
                  </a>
                </li>
                <li
                  v-if="workingHours"
                  class="flex items-start gap-2 text-sm text-muted text-start"
                >
                  <UIcon
                    name="i-tabler-clock"
                    class="size-4 mt-0.5 shrink-0 text-toned"
                  />
                  <span>{{ workingHours }}</span>
                </li>
                <li
                  v-if="address"
                  class="flex items-start gap-2 text-sm text-muted text-start"
                >
                  <UIcon
                    name="i-tabler-map-pin"
                    class="size-4 mt-0.5 shrink-0 text-toned"
                  />
                  <span>{{ address }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Apps + trust badges -->
        <div
          class="py-8 border-t border-muted flex flex-col md:(flex-row items-end justify-between) gap-8"
        >
          <div v-if="appStores.length">
            <h4 class="flex items-center gap-2 text-sm font-bold text-highlighted mb-4 text-start">
              <span
                class="size-1.5 rounded-full bg-primary shrink-0"
                aria-hidden="true"
              />
              {{ $t('دانلود اپلیکیشن ما از') }}
            </h4>
            <div class="flex flex-wrap items-center gap-2.5">
              <component
                :is="storeHref(store) ? 'a' : 'div'"
                v-for="store in appStores"
                :key="store.id"
                :href="storeHref(store) || undefined"
                :aria-label="$t(store.label)"
                class="inline-flex items-center gap-2 h-12 transition-all rounded-xl"
                :class="storeHref(store) ? 'cursor-pointer hover:opacity-90 focus-visible:(outline-none ring-2 ring-primary/40)' : ''"
                :target="storeHref(store) ? '_blank' : undefined"
                :rel="storeHref(store) ? 'noopener noreferrer' : undefined"
              >
                <img
                  v-if="isSellerAdminIconImage(store.icon)"
                  :src="resolveMediaUrl(store.icon)"
                  :alt="$t(store.label)"
                  class="h-12 w-auto max-w-40 object-contain"
                  loading="lazy"
                >
                <span
                  v-else
                  class="inline-flex items-center gap-2 h-12 px-3 rounded-xl border border-muted bg-elevated text-sm text-toned"
                >
                  <UIcon
                    :name="resolveSellerAdminIconName(store.icon)"
                    class="size-5 shrink-0"
                  />
                  {{ $t(store.label) }}
                </span>
              </component>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2 md:justify-end">
            <div
              class="size-25 rounded-xl bg-elevated flex items-center justify-center overflow-hidden p-1.5"
            >
              <a
                :href="ENAMAD_HREF"
                target="_blank"
                rel="noopener noreferrer"
                referrerpolicy="origin"
                class="size-full flex items-center justify-center cursor-pointer"
              >
                <img
                  src="https://trustseal.enamad.ir/logo.aspx?id=7752576&Code=GJIvNk4R5oCAI3eidsnOUmgFz3hq9ZCT"
                  alt="نماد اعتماد الکترونیکی"
                  class="size-full object-contain cursor-pointer"
                  width="56"
                  height="56"
                  loading="lazy"
                  referrerpolicy="origin"
                  code="GJIvNk4R5oCAI3eidsnOUmgFz3hq9ZCT"
                  @error="enamadSrc = TRUST_BADGES.enamad"
                >
              </a>
            </div>
            <div
              v-for="badge in displayBadges"
              :key="badge.id"
              class="size-25 rounded-xl bg-elevated flex items-center justify-center overflow-hidden p-1.5"
              :title="$t(badge.label)"
            >
              <img
                v-if="badgeIconSrc(badge)"
                :src="badgeIconSrc(badge)"
                :alt="$t(badge.label)"
                class="size-full object-contain"
                loading="lazy"
                width="56"
                height="56"
              >
              <UIcon
                v-else
                :name="resolveSellerAdminIconName(badge.icon)"
                class="size-7 text-toned"
              />
            </div>
          </div>
        </div>

        <!-- Copyright -->
        <div class="py-6 flex justify-center">
          <p
            v-if="copyright"
            class="text-xs text-muted num text-center"
          >
            {{ $t(copyright) }}
          </p>
        </div>
      </div>
    </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import {
  isSellerAdminIconImage,
  resolveSellerAdminIconName,
} from '~/data/seller-admin-icons'
import { resolveMediaUrl } from '~/composables/fetch'
import { staticPagePaths } from '~/data/static-pages'

const TRUST_BADGES: Record<string, string> = {
  enamad: '/images/enamad-logo.png',
  samandehi: '/images/samandehi.png',
  ecunion: '/images/enamad-logo.png',
  payment: '/images/samandehi.png',
}

const ENAMAD_HREF = 'https://trustseal.enamad.ir/?id=7752576&Code=GJIvNk4R5oCAI3eidsnOUmgFz3hq9ZCT'
const ENAMAD_REMOTE = 'https://trustseal.enamad.ir/logo.aspx?id=7752576&Code=GJIvNk4R5oCAI3eidsnOUmgFz3hq9ZCT'

/** Remote seal only on real hosts — enamad often fails on localhost (Firefox NS_ERROR_DOM_NETWORK_ERR). */
function useProductionEnamadSeal() {
  if (!import.meta.client) return false
  const host = window.location.hostname.toLowerCase()
  return host === 'vitsell.ir' || host === 'www.vitsell.ir'
}

const enamadSrc = ref(useProductionEnamadSeal() ? ENAMAD_REMOTE : TRUST_BADGES.enamad)

const { t } = useI18n()
const { footer, fetchFooter } = useFooter()
const { site, fetchSite } = useSiteSettings()

await Promise.all([fetchFooter(), fetchSite()])

const trustItems = computed(() =>
  (footer.value.trustItems || []).filter(item => item?.id && item?.title && item?.icon),
)
const socials = computed(() =>
  (footer.value.socials || []).filter(s => s?.id && s?.icon && s?.href),
)
const columns = computed(() =>
  (footer.value.columns || [])
    .map(col => ({
      ...col,
      links: (col.links || []).filter(link => link?.label && link?.to),
    }))
    .filter(col => col.id && col.title && col.links.length > 0),
)
const copyright = computed(() => footer.value.copyright?.trim() || '')
const aboutText = computed(() =>
  footer.value.about?.trim()
  || site.value.brandDescription?.trim()
  || site.value.about?.trim()
  || '',
)
const storeContact = computed(() => resolveStoreContact(footer.value, site.value))
const contact = computed(() => ({
  phones: storeContact.value.phones,
  email: storeContact.value.email,
}))
const appStores = computed(() =>
  (footer.value.appStores || []).filter(s => s?.id && s?.label && s?.icon),
)

function storeHref(store: { href?: string }) {
  const href = store.href?.trim() || ''
  if (!href || href === '#') return ''
  return href
}
const badges = computed(() =>
  (footer.value.badges || []).filter(b => b?.id && b?.label && b?.icon),
)
/** Skip CMS enamad — official trustseal is rendered statically. */
const displayBadges = computed(() =>
  badges.value.filter(b => b.id !== 'enamad'),
)

const address = computed(() => storeContact.value.address)
const workingHours = computed(() => storeContact.value.workingHours)

const hasContact = computed(() =>
  contact.value.phones.length > 0
  || Boolean(contact.value.email?.href && contact.value.email?.label)
  || Boolean(address.value)
  || Boolean(workingHours.value),
)

const siteName = computed(() =>
  site.value.brandName?.trim()
  || site.value.name?.trim()
  || t('ویتسل'),
)

const aboutSegments = computed(() => {
  if (!aboutText.value) return [] as { text: string, highlight: boolean }[]
  const translated = t(aboutText.value)
  const name = siteName.value
  if (!name) return [{ text: translated, highlight: false }]

  const parts = translated.split(name)
  if (parts.length === 1) return [{ text: translated, highlight: false }]

  const segments: { text: string, highlight: boolean }[] = []
  parts.forEach((part, i) => {
    if (part) segments.push({ text: part, highlight: false })
    if (i < parts.length - 1) segments.push({ text: name, highlight: true })
  })
  return segments
})

const appsOpen = ref(false)
const aboutExpanded = ref(false)
const aboutEl = ref<HTMLElement | null>(null)
const aboutOverflows = ref(false)

const callHref = computed(() => {
  const phone = contact.value.phones.find(item => item.href)
  return phone?.href || staticPagePaths.contact
})

const accordionItems = computed(() =>
  columns.value.map(column => ({
    label: column.title,
    value: column.id,
    links: column.links,
  })),
)

function measureAbout() {
  const el = aboutEl.value
  if (!el || aboutExpanded.value) return
  aboutOverflows.value = el.scrollHeight > el.clientHeight + 1
}

function onAboutMore() {
  if (aboutOverflows.value) {
    aboutExpanded.value = !aboutExpanded.value
    if (!aboutExpanded.value) nextTick(measureAbout)
    return
  }
  navigateTo(staticPagePaths.about)
}

function scrollToTop() {
  if (!import.meta.client) return
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  measureAbout()
  window.addEventListener('resize', measureAbout)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', measureAbout)
})

watch(aboutText, () => nextTick(measureAbout))

function badgeIconSrc(badge: { id: string, icon: string }) {
  if (isSellerAdminIconImage(badge.icon)) return resolveMediaUrl(badge.icon)
  return TRUST_BADGES[badge.id] ?? ''
}
</script>
