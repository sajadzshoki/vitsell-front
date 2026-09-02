<template>
  <footer class="mt-10 md:mt-16 <md:hidden">
    <!-- Trust strip -->
    <div class="border-y border-muted bg-muted/60">
      <div class="mx-auto max-w-8xl px-3 py-8 sm:px-4 lg:px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
        <div
          v-for="item in trustItems"
          :key="item.id"
          class="flex items-center gap-3"
        >
          <div class="size-12 rounded-2xl bg-primary/10 text-primary grid place-items-center shrink-0">
            <UIcon
              :name="`i-tabler-${item.icon}`"
              class="size-6"
            />
          </div>
          <div class="min-w-0">
            <div class="text-sm font-semibold text-highlighted truncate">
              {{ $t(item.title) }}
            </div>
            <div class="text-xs text-muted mt-0.5 truncate">
              {{ $t(item.subtitle) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main footer: soft surface + primary top glow (light & dark) -->
    <div class="relative overflow-hidden border-t border-muted bg-muted">
      <!-- Soft primary glow from top -->
      <div
        class="pointer-events-none absolute inset-x-0 top-0 h-56 bg-linear-to-b from-primary/20 via-primary/8 to-transparent"
        aria-hidden="true"
      />
      <div
        class="pointer-events-none absolute -top-24 inset-x-0 mx-auto size-[28rem] rounded-full bg-primary/15 blur-3xl"
        aria-hidden="true"
      />

      <div class="relative z-10 mx-auto max-w-8xl px-3 sm:px-4 lg:px-6">
        <!-- Brand + columns -->
        <div class="py-10 lg:py-12 grid grid-cols-1 xl:grid-cols-12 gap-10 xl:gap-12">
          <!-- Brand block -->
          <div class="xl:col-span-3 flex flex-col gap-5">
            <div class="flex items-start justify-between gap-3">
              <TheNavbarLogo />
              <UButton
                type="button"
                color="neutral"
                variant="ghost"
                size="sm"
                icon="i-tabler-chevron-up"
                class="shrink-0 text-toned hover:(text-highlighted bg-elevated)"
                :aria-label="$t('بازگشت به بالا')"
                @click="scrollToTop"
              >
                <span class="hidden sm:inline">{{ $t('بازگشت به بالا') }}</span>
              </UButton>
            </div>

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
                color="neutral"
                variant="ghost"
                size="sm"
                square
                :icon="`i-tabler-${social.icon}`"
                class="size-10 rounded-full !bg-elevated !text-toned border border-default hover:(!bg-primary/10 !text-primary !border-primary/30)"
              />
            </div>
          </div>

          <!-- Link columns -->
          <div class="xl:col-span-9 grid grid-cols-2 md:grid-cols-3 gap-8 lg:gap-10">
            <div
              v-for="column in columns"
              :key="column.id"
            >
              <h4 class="flex items-center gap-2 text-sm font-bold text-highlighted mb-4 text-start">
                <span
                  class="size-1.5 rounded-full bg-primary shadow-sm shadow-primary/40 shrink-0"
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
          </div>
        </div>

        <!-- Contact / apps -->
        <div class="py-8 border-y border-default grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 class="flex items-center gap-2 text-sm font-bold text-highlighted mb-4 text-start">
              <span
                class="size-1.5 rounded-full bg-primary shadow-sm shadow-primary/40 shrink-0"
                aria-hidden="true"
              />
              {{ $t('ارتباط با ما') }}
            </h4>
            <div class="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3">
              <a
                v-for="phone in contact.phones"
                :key="phone.href"
                :href="phone.href"
                class="text-sm text-toned hover:text-primary num cursor-pointer transition"
                dir="ltr"
              >
                {{ phone.label }}
              </a>
            </div>
            <a
              v-if="contact.email?.href"
              :href="contact.email.href"
              class="text-sm text-muted hover:text-primary cursor-pointer transition"
              dir="ltr"
            >
              {{ contact.email.label }}
            </a>
          </div>

          <div>
            <h4 class="flex items-center gap-2 text-sm font-bold text-highlighted mb-4 text-start">
              <span
                class="size-1.5 rounded-full bg-primary shadow-sm shadow-primary/40 shrink-0"
                aria-hidden="true"
              />
              {{ $t('دانلود اپلیکیشن ما از') }}
            </h4>
            <div class="flex flex-wrap items-center gap-2">
              <UButton
                v-for="store in appStores"
                :key="store.id"
                :href="store.href"
                color="neutral"
                variant="solid"
                size="sm"
                :icon="`i-tabler-${store.icon}`"
                class="bg-default text-highlighted border border-default hover:bg-elevated font-medium"
              >
                {{ $t(store.label) }}
              </UButton>
            </div>
          </div>
        </div>

        <!-- Badges -->
        <div
          v-if="badges.length"
          class="pt-8 flex flex-wrap items-center justify-center gap-2"
        >
          <div
            v-for="badge in badges"
            :key="badge.id"
            class="size-14 rounded-xl border border-default bg-default grid place-items-center"
            :title="$t(badge.label)"
          >
            <UIcon
              :name="`i-tabler-${badge.icon}`"
              class="size-6 text-toned"
            />
          </div>
        </div>

        <!-- Copyright pill -->
        <div class="py-8 flex justify-center">
          <p
            v-if="copyright"
            class="px-5 py-2.5 rounded-full border border-default bg-default text-xs text-muted num text-center"
          >
            {{ $t(copyright) }}
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const { t } = useI18n()
const { footer, fetchFooter } = useFooter()
const { site, fetchSite } = useSiteSettings()

await Promise.all([fetchFooter(), fetchSite()])

const trustItems = computed(() => footer.value.trustItems)
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

function scrollToTop() {
  if (!import.meta.client) return
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>
