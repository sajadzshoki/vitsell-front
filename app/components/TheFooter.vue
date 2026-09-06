<template>
  <footer class="mt-10 md:mt-16 <md:hidden">
    <div class="relative overflow-hidden border-t border-muted bg-default">
      <!-- Soft primary glow from top (must sit above bg-default, not on <footer>) -->
      <div
        class="pointer-events-none absolute inset-x-0 top-0 h-48 bg-linear-to-b from-primary/15 via-primary/5 to-transparent"
        aria-hidden="true"
      />
      <!-- <div
        class="pointer-events-none absolute -top-28 inset-x-0 mx-auto size-[26rem] rounded-full bg-primary/10 blur-3xl"
        aria-hidden="true"
      /> -->

      <div class="relative z-10 mx-auto max-w-8xl px-3 sm:px-4 lg:px-6">
        <!-- Brand + link columns + contact -->
        <div class="py-10 lg:py-12 grid grid-cols-1 xl:grid-cols-12 gap-10 xl:gap-8">
          <!-- Brand block -->
          <div class="xl:col-span-3 flex flex-col gap-5">
            <TheNavbarLogo />

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
                :to="social.href"
                :aria-label="$t(social.label)"
                color="primary"
                variant="outline"
                size="sm"
                square
                :icon="`i-tabler-${social.icon}`"
                class="size-10 rounded-full !bg-primary/5 !text-primary !border-primary/25 hover:(!bg-primary/10 !border-primary/40)"
              />
            </div>
          </div>

          <!-- Link columns + contact -->
          <div class="xl:col-span-9 grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-6">
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
                  :key="link.label"
                >
                  <NuxtLink
                    :to="link.to"
                    class="text-sm text-muted hover:text-primary transition text-start cursor-pointer"
                  >
                    {{ $t(link.label) }}
                  </NuxtLink>
                </li>
              </ul>
            </div>

            <!-- Contact -->
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
                  :key="phone.href"
                >
                  <a
                    :href="phone.href"
                    class="text-sm text-muted hover:text-primary num cursor-pointer transition"
                    dir="ltr"
                  >
                    {{ phone.label }}
                  </a>
                </li>
                <li v-if="contact.email?.href">
                  <a
                    :href="contact.email.href"
                    class="text-sm text-muted hover:text-primary cursor-pointer transition"
                    dir="ltr"
                  >
                    {{ contact.email.label }}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Apps + trust badges -->
        <div class="py-8 border-t border-muted flex flex-col md:(flex-row items-end justify-between) gap-8">
          <div v-if="appStores.length">
            <h4 class="flex items-center gap-2 text-sm font-bold text-highlighted mb-4 text-start">
              <span
                class="size-1.5 rounded-full bg-primary shrink-0"
                aria-hidden="true"
              />
              {{ $t('دانلود اپلیکیشن ما از') }}
            </h4>
            <div class="flex flex-wrap items-center gap-2.5">
              <a
                v-for="store in appStores"
                :key="store.id"
                :href="store.href"
                :aria-label="$t(store.label)"
                class="inline-flex items-center cursor-pointer transition hover:opacity-90 focus-visible:(outline-none ring-2 ring-primary/40) rounded-xl"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  v-if="storeBadgeSrc(store.id)"
                  :src="storeBadgeSrc(store.id)"
                  :alt="$t(store.label)"
                  class="h-10 w-auto rounded-xl"
                  loading="lazy"
                  width="140"
                  height="40"
                >
                <span
                  v-else
                  class="inline-flex items-center gap-2 h-10 px-3.5 rounded-xl border border-default bg-default text-sm font-medium text-highlighted"
                >
                  <UIcon
                    :name="`i-tabler-${store.icon}`"
                    class="size-4"
                  />
                  {{ $t(store.label) }}
                </span>
              </a>
            </div>
          </div>

          <div
            v-if="badges.length"
            class="flex flex-wrap items-center gap-2 md:justify-end"
          >
            <div
              v-for="badge in badges"
              :key="badge.id"
              class="size-16 rounded-xl border border-default bg-muted/50 grid place-items-center"
              :title="$t(badge.label)"
            >
              <UIcon
                :name="`i-tabler-${badge.icon}`"
                class="size-7 text-toned"
              />
            </div>
          </div>
        </div>

        <!-- Copyright -->
        <div class="py-6 border-t border-muted flex justify-center">
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
const STORE_BADGES: Record<string, string> = {
  myket: '/images/myket-download.png',
  bazaar: '/images/bazaar-download.png',
}

const { t } = useI18n()
const { footer, fetchFooter } = useFooter()
const { site, fetchSite } = useSiteSettings()

await Promise.all([fetchFooter(), fetchSite()])

const socials = computed(() => footer.value.socials)
const columns = computed(() => footer.value.columns)
const copyright = computed(() => footer.value.copyright)
const aboutText = computed(() => footer.value.about?.trim() || '')
const contact = computed(() => footer.value.contact ?? {
  phones: [],
  email: { label: '', href: '' },
})
const appStores = computed(() => footer.value.appStores ?? [])
const badges = computed(() => footer.value.badges ?? [])

const hasContact = computed(() =>
  contact.value.phones.length > 0 || Boolean(contact.value.email?.href),
)

const siteName = computed(() => site.value.name?.trim() || t('دیجی‌شاپ'))

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

function storeBadgeSrc(id: string) {
  return STORE_BADGES[id] ?? ''
}
</script>
