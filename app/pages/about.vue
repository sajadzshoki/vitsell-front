<template>
  <main class="w-full py-2 md:py-4">
    <TheAboutPage :section-visibility="about.sectionVisibility" />
  </main>
</template>

<script setup lang="ts">
import { organizationJsonLd } from '~/composables/useJsonLd'

const { t } = useI18n()
const { about, ensureLoaded } = useAbout()
const { settings } = useSellerSeoSettings()

await ensureLoaded()

useEntitySeo(() => ({
  entity: about.value.seo,
  fallbackTitle: about.value.title || t('درباره دیجی‌شاپ'),
  fallbackDescription: about.value.subtitle || '',
  fallbackImage: about.value.heroImage || '',
  path: '/about',
}))

useJsonLd(() => organizationJsonLd({
  name: settings.value.siteName || about.value.title || 'Digishop',
  description: about.value.seo?.metaDescription || about.value.subtitle,
  url: settings.value.siteUrl || undefined,
  logo: about.value.heroImage || settings.value.defaultOgImage || undefined,
}))
</script>
