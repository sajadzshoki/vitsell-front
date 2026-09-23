<template>
  <img
      v-if="iconType === 'img'"
      class="w-5 h-5"
      :src="imageSrc"
      :alt="name"
      loading="lazy"
  >
  <NuxtIcon
      v-else-if="svgName"
      class="svg:(h-full mb-0)"
      :name="svgName"
      :filled="filled"
  />
  <UIcon
      v-else
      :name="tablerName"
  />
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  name: string
  iconType?: 'tabler' | 'svg' | 'img'
  filled?: boolean
}>(), {
  iconType: 'tabler',
  filled: true,
})

/** Filenames in `app/assets/icons` (nuxt-icons). */
const KNOWN_SVG_ICONS = new Set([
  'close',
  'loading',
  'loading2',
  'myketdownload',
  'store-appstore',
  'store-googleplay',
  'store-microsoft',
  'Store Button',
  'Store Button(1)',
  'Store Button(2)',
])

/** CMS / tabler keys used as store badges → existing SVG files. */
const SVG_ALIASES: Record<string, string> = {
  'shopping-bag': 'Store Button',
  bazaar: 'Store Button',
  'brand-apple': 'store-appstore',
  appstore: 'store-appstore',
  sibapp: 'store-appstore',
  'brand-android': 'myketdownload',
  myket: 'myketdownload',
  'brand-google-play': 'store-googleplay',
  googleplay: 'store-googleplay',
  'brand-windows': 'store-microsoft',
  microsoft: 'store-microsoft',
}

const svgName = computed(() => {
  if (props.iconType !== 'svg') return ''
  const raw = String(props.name || '').trim()
  const aliased = SVG_ALIASES[raw] || raw
  return KNOWN_SVG_ICONS.has(aliased) ? aliased : ''
})

const tablerName = computed(() => {
  if (props.name.startsWith('i-tabler-') || props.name.startsWith('tabler:')) {
    return props.name
  }
  return `i-tabler-${props.name}`
})

const imageSrc = computed(() => {
  if (props.name.startsWith('http') || props.name.startsWith('/')) {
    return resolveMediaUrl(props.name)
  }
  if (props.name.includes('/')) {
    return resolveMediaUrl(`/${props.name}`)
  }
  return `/images/${props.name}`
})
</script>
