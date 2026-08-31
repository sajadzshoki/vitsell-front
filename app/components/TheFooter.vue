<template>
  <footer class="mt-10 md:mt-16 <md:hidden">
    <!-- Trust strip -->
    <div class="bg-muted border-y border-muted">
      <div class="mx-auto max-w-8xl px-3 sm:px-4 lg:px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
        <div
          v-for="item in trustItems"
          :key="item.id"
          class="flex items-center gap-3"
        >
          <div class="size-12 rounded-2xl bg-primary/10 text-primary grid place-items-center shrink-0">
            <UIcon :name="`i-tabler-${item.icon}`" class="size-6" />
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

    <!-- Main dark footer — pin inverted text to white (token flips in .dark) -->
    <div class="bg-linear-to-tl from-primary-900 to-primary-600 text-inverted m-4 rounded-4xl [--ui-text-inverted:white]">
      <div class="mx-auto max-w-8xl px-3 sm:px-4 lg:px-6">
        <!-- Logo + back to top -->
        <div class="flex items-center justify-between gap-4 py-6 border-b border-default/15">
          <TheNavbarLogo inverted />
          <UButton
            type="button"
            color="neutral"
            variant="solid"
            size="sm"
            icon="i-tabler-chevron-up"
            class="bg-default !text-highlighted hover:bg-elevated shrink-0"
            @click="scrollToTop"
          >
            {{ $t('بازگشت به بالا') }}
          </UButton>
        </div>

        <!-- Link columns -->
        <div class="py-10 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-8">
          <div
            v-for="column in columns"
            :key="column.id"
          >
            <h4 class="text-sm font-bold text-inverted mb-4">
              {{ $t(column.title) }}
            </h4>
            <ul class="space-y-2.5">
              <li
                v-for="link in column.links"
                :key="link.label"
              >
                <NuxtLink
                  :to="link.to"
                  class="text-sm text-inverted/65 hover:text-inverted transition text-start cursor-pointer"
                >
                  {{ $t(link.label) }}
                </NuxtLink>
              </li>
            </ul>
          </div>
        </div>

        <!-- Contact / social / apps -->
        <div class="py-8 border-y border-default/15 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h4 class="text-sm font-bold text-inverted mb-4">
              {{ $t('ارتباط با ما') }}
            </h4>
            <div class="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3">
              <a
                v-for="phone in contact.phones"
                :key="phone.href"
                :href="phone.href"
                class="text-sm text-inverted/80 hover:text-inverted num cursor-pointer transition"
                dir="ltr"
              >
                {{ phone.label }}
              </a>
            </div>
            <a
              :href="contact.email.href"
              class="text-sm text-inverted/65 hover:text-inverted cursor-pointer transition"
              dir="ltr"
            >
              {{ contact.email.label }}
            </a>
          </div>

          <div>
            <h4 class="text-sm font-bold text-inverted mb-4">
              {{ $t('شبکه‌های اجتماعی') }}
            </h4>
            <div class="flex items-center gap-2">
              <UButton
                v-for="social in socials"
                :key="social.id"
                :to="social.href"
                :aria-label="$t(social.label)"
                color="neutral"
                variant="outline"
                size="sm"
                square
                :icon="`i-tabler-${social.icon}`"
                class="rounded-full !border-default/30 !text-inverted hover:(!bg-default/10 !border-default/50)"
              />
            </div>
          </div>

          <div>
            <h4 class="text-sm font-bold text-inverted mb-4">
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
                class="bg-default !text-highlighted hover:bg-elevated font-medium"
              >
                {{ $t(store.label) }}
              </UButton>
            </div>
          </div>
        </div>

        <!-- Badges + copyright -->
        <div class="py-6 flex flex-col lg:(flex-row items-center justify-between) gap-6">
          <div class="flex flex-wrap items-center gap-2">
            <div
              v-for="badge in badges"
              :key="badge.id"
              class="size-14 rounded-lg border border-default/20 bg-default/5 grid place-items-center"
              :title="$t(badge.label)"
            >
              <UIcon
                :name="`i-tabler-${badge.icon}`"
                class="size-6 text-inverted/70"
              />
            </div>
          </div>

          <p class="text-xs text-inverted/50 num text-center lg:text-end">
            {{ $t(copyright) }}
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const { footer, fetchFooter } = useFooter()
await fetchFooter()

const trustItems = computed(() => footer.value.trustItems)
const socials = computed(() => footer.value.socials)
const columns = computed(() => footer.value.columns)
const copyright = computed(() => footer.value.copyright)
const contact = computed(() => footer.value.contact!)
const appStores = computed(() => footer.value.appStores ?? [])
const badges = computed(() => footer.value.badges ?? [])

function scrollToTop() {
  if (!import.meta.client) return
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>
