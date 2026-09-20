<template>
  <NuxtLink
    to="/"
    class="flex items-center gap-2 shrink-0 <md:flex-col"
  >
    <img
      :src="logoUrl"
      :alt="siteName"
      :class="logoSize"
      class="size-14 rounded-xl object-contain"
    >
    <div
      v-if="showName"
      class="hidden sm:flex flex-col leading-tight text-start"
    >
      <!-- <span
        class="text-xl font-extrabold"
        :class="inverted ? 'text-inverted' : 'text-highlighted'"
      >
        {{ siteName }}
      </span> -->
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { VITSELL_LOGO_SRC } from '~/data/brand'

withDefaults(defineProps<{
  inverted?: boolean
  logoSize?: string
}>(), {
  inverted: false,
})

const { t } = useI18n()
const { site, fetchSite } = useSiteSettings()

await fetchSite()

const siteName = computed(() =>
  site.value.brandName?.trim()
  || site.value.name?.trim()
  || t('ویتسل'),
)
const customLogo = computed(() => site.value.logoUrl?.trim() || '')
const logoUrl = computed(() => customLogo.value || VITSELL_LOGO_SRC)
/** Wordmark is already in the default PNG; only show text beside a custom mark. */
const showName = computed(() => Boolean(customLogo.value))
</script>
