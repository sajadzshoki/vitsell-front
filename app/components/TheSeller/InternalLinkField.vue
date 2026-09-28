<template>
  <div class="space-y-2 min-w-0 flex-1">
    <div
      v-if="label"
      class="text-sm flex items-center gap-2"
    >
      <span>{{ label }}</span>
      <span
        v-if="required"
        class="text-error"
      >*</span>
    </div>

    <div class="flex items-center gap-1 flex-wrap">
      <UButton
        type="button"
        size="xs"
        :color="mode === 'internal' ? 'primary' : 'neutral'"
        :variant="mode === 'internal' ? 'soft' : 'ghost'"
        class="cursor-pointer"
        :disabled="disabled"
        @click="setMode('internal')"
      >
        {{ $t('لینک داخلی') }}
      </UButton>
      <UButton
        type="button"
        size="xs"
        :color="mode === 'external' ? 'primary' : 'neutral'"
        :variant="mode === 'external' ? 'soft' : 'ghost'"
        class="cursor-pointer"
        :disabled="disabled"
        @click="setMode('external')"
      >
        {{ $t('لینک خارجی') }}
      </UButton>
    </div>

    <USelectMenu
      v-if="mode === 'internal'"
      v-model="selectedValue"
      :items="menuItems"
      value-key="value"
      :search-input="{ placeholder: $t('جستجوی مسیر…') }"
      :placeholder="placeholder || $t('انتخاب صفحه یا مسیر')"
      class="w-full"
      :disabled="disabled"
    />
    <TheFormInput
      v-else
      v-model="externalUrl"
      :placeholder="placeholder || 'https://…'"
      dir="ltr"
      size="md"
      :disabled="disabled"
    />
  </div>
</template>

<script setup lang="ts">
type LinkMode = 'internal' | 'external'

type LinkOption = {
  label: string
  value: string
}

const props = withDefaults(defineProps<{
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  /** Keep an empty value instead of falling back to `/`. */
  allowEmpty?: boolean
}>(), {
  label: '',
  placeholder: '',
  required: false,
  disabled: false,
  allowEmpty: false,
})

const model = defineModel<string>({ default: '' })

const { t } = useI18n()
const { pages, ensureLoaded } = useSellerPages()

const mode = ref<LinkMode>('internal')
const selectedValue = ref<string>('/')
const externalUrl = ref('')
const syncing = ref(false)

const SITE_ROUTES: LinkOption[] = [
  { label: t('صفحه اصلی'), value: '/' },
  { label: t('جستجو'), value: '/search' },
  { label: t('درباره ما'), value: '/about' },
  { label: t('وبلاگ'), value: '/blog' },
  { label: t('تماس با ما'), value: '/contact' },
  { label: t('سوالات متداول'), value: '/faq' },
  { label: t('حساب کاربری'), value: '/account' },
  { label: t('سفارش‌های من'), value: '/account/orders' },
  { label: t('علاقه‌مندی‌ها'), value: '/account/wishlist' },
  { label: t('سبد خرید'), value: '/cart' },
  { label: t('مقایسه'), value: '/compare' },
]

const pageOptions = computed<LinkOption[]>(() =>
  pages.value
    .filter(p => p.status !== 'archived' && p.path)
    .map(p => ({
      label: `${p.title || p.path} (${p.path})`,
      value: p.path.startsWith('/') ? p.path : `/${p.path}`,
    })),
)

const menuItems = computed(() => {
  const byValue = new Map<string, LinkOption>()
  for (const opt of [...SITE_ROUTES, ...pageOptions.value]) {
    if (!byValue.has(opt.value)) byValue.set(opt.value, opt)
  }
  const current = String(model.value || '').trim()
  if (current && !byValue.has(current) && !isExternal(current)) {
    byValue.set(current, { label: current, value: current })
  }
  return Array.from(byValue.values())
})

function isExternal(value: string) {
  const v = value.trim()
  return /^https?:\/\//i.test(v) || v.startsWith('mailto:') || v.startsWith('tel:')
}

function applyFromModel(value: string) {
  syncing.value = true
  const v = String(value || '').trim()
  if (isExternal(v)) {
    mode.value = 'external'
    externalUrl.value = v
  }
  else {
    mode.value = 'internal'
    selectedValue.value = v || (props.allowEmpty ? '' : '/')
  }
  nextTick(() => {
    syncing.value = false
  })
}

function setMode(next: LinkMode) {
  if (props.disabled || mode.value === next) return
  mode.value = next
  if (next === 'internal') {
    model.value = selectedValue.value || (props.allowEmpty ? '' : '/')
  }
  else {
    model.value = externalUrl.value.trim()
  }
}

watch(selectedValue, (value) => {
  if (syncing.value || mode.value !== 'internal') return
  model.value = value || (props.allowEmpty ? '' : '/')
})

watch(externalUrl, (value) => {
  if (syncing.value || mode.value !== 'external') return
  model.value = value.trim()
})

watch(model, (value) => {
  if (syncing.value) return
  const current =
    mode.value === 'external'
      ? externalUrl.value.trim()
      : selectedValue.value
  if (String(value || '').trim() === current) return
  applyFromModel(String(value || ''))
}, { immediate: true })

onMounted(() => {
  void ensureLoaded({ force: false })
})
</script>
