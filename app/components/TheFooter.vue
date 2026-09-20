<template>
  <footer class="mt-10 md:mt-16 <md:hidden">
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
          <div v-if="downloadStores.length">
            <h4 class="flex items-center gap-2 text-sm font-bold text-highlighted mb-4 text-start">
              <span
                class="size-1.5 rounded-full bg-primary shrink-0"
                aria-hidden="true"
              />
              {{ $t('دانلود اپلیکیشن ما از') }}
            </h4>
            <div class="flex flex-wrap items-center gap-2.5">
              <a
                v-for="store in downloadStores"
                :key="store.id"
                :href="store.href"
                :aria-label="$t(store.label)"
                class="inline-flex items-center cursor-pointer transition-all hover:opacity-90 focus-visible:(outline-none ring-2 ring-primary/40) rounded-xl"
                target="_blank"
                rel="noopener noreferrer"
              >
                <TheIcon
                  :name="store.icon"
                  icon-type="svg"
                  class="footer-store-badge !h-12 !w-auto !text-[2.5rem] leading-none [&_.nuxt-icon]:(!h-full !w-full) [&_svg]:(!h-full !w-auto !mb-0 !max-w-none)"
                />
              </a>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2 md:justify-end">
            <!-- <a
              referrerpolicy="origin"
              target="_blank"
              rel="noopener noreferrer"
              href="https://trustseal.enamad.ir/?id=7752576&Code=GJIvNk4R5oCAI3eidsnOUmgFz3hq9ZCT"
              class="size-25 rounded-xl bg-elevated flex items-center justify-center overflow-hidden p-1.5 cursor-pointer"
              :aria-label="$t('نماد اعتماد')"
              :title="$t('نماد اعتماد')"
            >
              <img
                referrerpolicy="origin"
                src="https://trustseal.enamad.ir/logo.aspx?id=7752576&Code=GJIvNk4R5oCAI3eidsnOUmgFz3hq9ZCT"
                alt=""
                class="size-full object-contain cursor-pointer"
                loading="lazy"
                width="56"
                height="56"
              >
            </a> -->
            <a referrerpolicy='origin' target='_blank' href='https://trustseal.enamad.ir/?id=7752576&Code=GJIvNk4R5oCAI3eidsnOUmgFz3hq9ZCT'><img referrerpolicy='origin' src='https://trustseal.enamad.ir/logo.aspx?id=7752576&Code=GJIvNk4R5oCAI3eidsnOUmgFz3hq9ZCT' alt='' style='cursor:pointer' code='GJIvNk4R5oCAI3eidsnOUmgFz3hq9ZCT'/></a>
            <div
              v-for="badge in displayBadges"
              :key="badge.id"
              class="size-25 rounded-xl bg-elevated flex items-center justify-center overflow-hidden p-1.5"
              :title="$t(badge.label)"
            >
              <img
                v-if="badgeImageSrc(badge.id)"
                :src="badgeImageSrc(badge.id)"
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
  </footer>
</template>

<script setup lang="ts">
import {
  isSellerAdminIconImage,
  resolveSellerAdminIconName,
} from '~/data/seller-admin-icons'
import { resolveMediaUrl } from '~/composables/fetch'

const TRUST_BADGES: Record<string, string> = {
  enamad: '/images/enamad-logo.png',
  samandehi: '/images/samandehi.png',
  ecunion: '/images/enamad-logo.png',
  payment: '/images/samandehi.png',
}

/** Temporary store badges — App Store / Google Play / Microsoft */
const FALLBACK_DOWNLOAD_STORES = [
  { id: 'appstore', label: 'App Store', icon: 'store-appstore', href: '#' },
  { id: 'googleplay', label: 'Google Play', icon: 'store-googleplay', href: '#' },
  { id: 'microsoft', label: 'Microsoft', icon: 'store-microsoft', href: '#' },
] as const

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
const contact = computed(() => {
  const fromFooter = footer.value.contact
  const phones = (fromFooter?.phones || [])
    .filter(p => p?.label && p?.href)
  const emailLabel = fromFooter?.email?.label?.trim()
    || site.value.supportEmail?.trim()
    || site.value.email?.trim()
    || ''
  const emailHref = fromFooter?.email?.href?.trim()
    || (emailLabel ? `mailto:${emailLabel}` : '')

  // If footer phones empty, fall back to site/platform contact phones
  const fallbackPhones: { label: string, href: string }[] = []
  if (!phones.length) {
    const support = site.value.supportPhone?.trim() || site.value.phone?.trim()
    const sales = site.value.salesPhone?.trim()
    if (support) fallbackPhones.push({ label: support, href: `tel:${support.replace(/\D/g, '') || support}` })
    if (sales) fallbackPhones.push({ label: sales, href: `tel:${sales.replace(/\D/g, '') || sales}` })
  }

  return {
    phones: phones.length ? phones : fallbackPhones,
    email: { label: emailLabel, href: emailHref },
  }
})
const appStores = computed(() =>
  (footer.value.appStores || []).filter(s => s?.id && s?.label && s?.icon && s?.href),
)
/** Prefer CMS app stores; fall back to temporary store badge icons. */
const downloadStores = computed(() =>
  appStores.value.length ? appStores.value : [...FALLBACK_DOWNLOAD_STORES],
)
const badges = computed(() =>
  (footer.value.badges || []).filter(b => b?.id && b?.label && b?.icon),
)
/** Skip CMS enamad — official trustseal is rendered statically. */
const displayBadges = computed(() =>
  badges.value.filter(b => b.id !== 'enamad'),
)

const address = computed(() => site.value.address?.trim() || '')
const workingHours = computed(() => site.value.workingHours?.trim() || '')

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

function badgeImageSrc(id: string) {
  return TRUST_BADGES[id] ?? ''
}
</script>
