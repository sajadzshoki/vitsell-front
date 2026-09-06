<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0 space-y-4">
    <div>
      <h3 class="font-bold text-highlighted">
        {{ title || $t('سئو و متادیتا') }}
      </h3>
      <p class="text-xs text-muted mt-1 leading-6">
        {{ description || $t('عنوان، توضیح، کنونیکال و Open Graph برای موتورهای جستجو') }}
      </p>
    </div>

    <div
      v-if="warnings.length"
      class="space-y-1.5"
    >
      <div
        v-for="w in warnings"
        :key="w.key"
        class="text-[11px] leading-5 rounded-lg px-3 py-2"
        :class="w.severity === 'warning' ? 'bg-warning/10 text-warning' : 'bg-muted text-muted'"
      >
        {{ $t(w.message) }}
      </div>
    </div>

    <div>
      <h4 class="text-sm font-medium text-toned mb-3">
        {{ $t('پیش‌نمایش نتایج جستجو') }}
      </h4>
      <div class="rounded-xl border border-muted bg-muted/40 p-4 max-w-xl">
        <div class="text-primary text-base font-medium truncate">
          {{ modelValue.metaTitle || previewTitle || $t('عنوان صفحه') }}
        </div>
        <div
          v-if="resolvedPreviewUrl"
          class="text-[11px] text-success mt-0.5 truncate num"
          dir="ltr"
        >
          {{ resolvedPreviewUrl }}
        </div>
        <p class="text-xs text-muted mt-1 line-clamp-2 leading-5">
          {{ plainMetaDescription || previewDescription || $t('توضیح متا اینجا نمایش داده می‌شود') }}
        </p>
      </div>
    </div>

    <div>
      <h4 class="text-sm font-medium text-toned mb-3">
        {{ $t('پیش‌نمایش شبکه‌های اجتماعی') }}
      </h4>
      <div class="rounded-xl border border-muted overflow-hidden max-w-sm bg-muted/30">
        <div class="aspect-video bg-muted flex items-center justify-center overflow-hidden">
          <img
            v-if="socialImage"
            :src="socialImage"
            :alt="modelValue.ogTitle || previewTitle || ''"
            class="w-full h-full object-cover"
          >
          <UIcon
            v-else
            name="i-tabler-photo"
            class="size-10 text-dimmed"
          />
        </div>
        <div class="p-3 space-y-1">
          <div class="text-sm font-medium text-highlighted line-clamp-2">
            {{ modelValue.ogTitle || modelValue.metaTitle || previewTitle || $t('عنوان') }}
          </div>
          <p class="text-[11px] text-muted line-clamp-2 leading-5">
            {{ plainOgDescription || plainMetaDescription || previewDescription || $t('توضیح') }}
          </p>
        </div>
      </div>
    </div>

    <USeparator />

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <TheFormInput
        :model-value="modelValue.metaTitle"
        class="md:col-span-2"
        :label="$t('Meta Title')"
        :placeholder="$t('عنوان صفحه در نتایج جستجو')"
        :help="titleHelp"
        @update:model-value="patch('metaTitle', $event)"
      />
      <UFormField
        class="md:col-span-2"
        :label="$t('Meta Description')"
        :help="descHelp"
      >
        <TheTextEditor
          :model-value="modelValue.metaDescription"
          variant="simple"
          :placeholder="$t('توضیح کوتاه برای نتایج جستجو')"
          @update:model-value="patch('metaDescription', $event)"
        />
      </UFormField>
      <TheFormInput
        :model-value="modelValue.metaKeywords"
        class="md:col-span-2"
        :label="$t('کلمات کلیدی')"
        :placeholder="$t('با ویرگول جدا کنید')"
        @update:model-value="patch('metaKeywords', $event)"
      />
      <TheFormInput
        :model-value="modelValue.canonicalUrl"
        :label="$t('Canonical URL')"
        placeholder="https://…"
        dir="ltr"
        icon="i-tabler-link"
        :help="$t('خالی = ساخت خودکار از آدرس سایت')"
        @update:model-value="patch('canonicalUrl', $event)"
      />
      <UFormField :label="$t('Robots')">
        <USelect
          :model-value="modelValue.robots"
          :items="robotItems"
          value-key="value"
          class="w-full"
          @update:model-value="onRobots($event)"
        />
      </UFormField>
    </div>

    <USeparator />

    <div>
      <h4 class="text-sm font-medium text-toned mb-3">
        {{ $t('Open Graph') }}
      </h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TheFormInput
          :model-value="modelValue.ogTitle"
          :label="$t('OG Title')"
          @update:model-value="patch('ogTitle', $event)"
        />
        <div class="md:col-span-2 max-w-md">
          <TheSellerImageUpload
            :model-value="modelValue.ogImage"
            :label="$t('OG Image')"
            :alt="modelValue.ogTitle || $t('Open Graph')"
            icon="i-tabler-photo"
            @update:model-value="patch('ogImage', $event)"
          />
        </div>
        <UFormField
          class="md:col-span-2"
          :label="$t('OG Description')"
        >
          <TheTextEditor
            :model-value="modelValue.ogDescription"
            variant="simple"
            :placeholder="$t('توضیح برای شبکه‌های اجتماعی')"
            @update:model-value="patch('ogDescription', $event)"
          />
        </UFormField>
      </div>
    </div>

    <USeparator />

    <div>
      <h4 class="text-sm font-medium text-toned mb-3">
        {{ $t('Twitter') }}
      </h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TheFormInput
          :model-value="modelValue.twitterTitle"
          :label="$t('Twitter Title')"
          @update:model-value="patch('twitterTitle', $event)"
        />
        <div class="md:col-span-2 max-w-md">
          <TheSellerImageUpload
            :model-value="modelValue.twitterImage"
            :label="$t('Twitter Image')"
            :alt="modelValue.twitterTitle || $t('Twitter')"
            icon="i-tabler-brand-x"
            @update:model-value="patch('twitterImage', $event)"
          />
        </div>
        <UFormField
          class="md:col-span-2"
          :label="$t('Twitter Description')"
        >
          <TheTextEditor
            :model-value="modelValue.twitterDescription"
            variant="simple"
            :placeholder="$t('توضیح برای توییتر')"
            @update:model-value="patch('twitterDescription', $event)"
          />
        </UFormField>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  collectSeoWarnings,
  htmlToPlainText,
  SEO_DESC_SOFT_MAX,
  SEO_TITLE_SOFT_MAX,
  seoRobotsOptions,
  type SeoMeta,
  type SeoRobots,
} from '~/data/seo'

const props = defineProps<{
  modelValue: SeoMeta
  title?: string
  description?: string
  previewTitle?: string
  previewDescription?: string
  previewUrl?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: SeoMeta]
}>()

const { t } = useI18n()

const robotItems = seoRobotsOptions.map(o => ({
  label: o.label,
  value: o.value,
}))

const previewTitle = computed(() => props.previewTitle || '')
const previewDescription = computed(() => htmlToPlainText(props.previewDescription || ''))
const resolvedPreviewUrl = computed(() => props.previewUrl || props.modelValue.canonicalUrl || '')
const socialImage = computed(() => props.modelValue.ogImage || props.modelValue.twitterImage || '')
const plainMetaDescription = computed(() => htmlToPlainText(props.modelValue.metaDescription))
const plainOgDescription = computed(() => htmlToPlainText(props.modelValue.ogDescription))

const warnings = computed(() =>
  collectSeoWarnings(props.modelValue, {
    previewTitle: props.previewTitle,
    previewDescription: props.previewDescription,
  }),
)

const titleHelp = computed(() => {
  const len = (props.modelValue.metaTitle || previewTitle.value).length
  return t('{n} / {max} کاراکتر', { n: len, max: SEO_TITLE_SOFT_MAX })
})

const descHelp = computed(() => {
  const len = (plainMetaDescription.value || previewDescription.value).length
  return t('{n} / {max} کاراکتر', { n: len, max: SEO_DESC_SOFT_MAX })
})

function patch<K extends keyof SeoMeta>(key: K, value: string | number) {
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: String(value ?? '') as SeoMeta[K],
  })
}

function onRobots(value: unknown) {
  const robots = (typeof value === 'string' ? value : 'index,follow') as SeoRobots
  emit('update:modelValue', {
    ...props.modelValue,
    robots,
  })
}
</script>
