<template>
  <div class="space-y-5">
    <TheSellerForbidden
      v-if="!canView"
      :message="$t('برای مشاهده متن صفحه اصلی مجوز صفحات لازم است')"
    />

    <div
      v-else-if="loading"
      class="space-y-3"
    >
      <USkeleton
        v-for="n in 3"
        :key="n"
        class="h-40 w-full rounded-2xl"
      />
    </div>

    <div
      v-else-if="loadError"
      class="bg-default border border-muted rounded-2xl p-8 text-center space-y-3"
    >
      <p class="text-sm text-error">
        {{ loadError }}
      </p>
      <UButton
        color="primary"
        class="cursor-pointer"
        @click="load"
      >
        {{ $t('تلاش دوباره') }}
      </UButton>
    </div>

    <template v-else>
      <div
        v-for="(block, index) in blocks"
        :key="index"
        class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0 space-y-4"
      >
        <div class="flex items-center justify-between gap-3">
          <h2 class="font-bold text-highlighted text-sm">
            {{ index === 0 ? $t('عنوان اصلی صفحه') : $t('بخش') + ' ' + (index + 1).toLocaleString('fa-IR') }}
          </h2>
          <div class="flex items-center gap-1">
            <UButton
              type="button"
              color="neutral"
              variant="ghost"
              size="sm"
              icon="i-tabler-chevron-up"
              class="cursor-pointer"
              :disabled="index === 0 || !canUpdate"
              :aria-label="$t('بالا')"
              @click="move(index, -1)"
            />
            <UButton
              type="button"
              color="neutral"
              variant="ghost"
              size="sm"
              icon="i-tabler-chevron-down"
              class="cursor-pointer"
              :disabled="index === blocks.length - 1 || !canUpdate"
              :aria-label="$t('پایین')"
              @click="move(index, 1)"
            />
            <UButton
              type="button"
              color="error"
              variant="ghost"
              size="sm"
              icon="i-tabler-trash"
              class="cursor-pointer"
              :disabled="blocks.length === 1 || !canUpdate"
              :aria-label="$t('حذف')"
              @click="removeBlock(index)"
            />
          </div>
        </div>

        <TheFormInput
          v-model="block.title"
          :label="index === 0 ? $t('عنوان اصلی') : $t('عنوان')"
          :disabled="!canUpdate"
          :error="errors[index]?.title"
        />

        <div
          v-for="(_, pIndex) in block.paragraphs"
          :key="pIndex"
          class="space-y-2"
        >
          <div class="flex items-center justify-between gap-2">
            <span class="text-sm text-default">
              {{ $t('متن') }} {{ (pIndex + 1).toLocaleString('fa-IR') }}
            </span>
            <UButton
              v-if="block.paragraphs.length > 1"
              type="button"
              color="neutral"
              variant="ghost"
              size="xs"
              class="cursor-pointer"
              :disabled="!canUpdate"
              @click="block.paragraphs.splice(pIndex, 1)"
            >
              {{ $t('حذف پاراگراف') }}
            </UButton>
          </div>
          <UTextarea
            v-model="block.paragraphs[pIndex]"
            :rows="3"
            autoresize
            class="w-full"
            :disabled="!canUpdate"
          />
        </div>
        <p
          v-if="errors[index]?.paragraphs"
          class="text-sm text-error"
        >
          {{ errors[index]?.paragraphs }}
        </p>
        <UButton
          type="button"
          color="neutral"
          variant="soft"
          size="sm"
          icon="i-tabler-plus"
          class="cursor-pointer"
          :disabled="!canUpdate"
          @click="block.paragraphs.push('')"
        >
          {{ $t('پاراگراف جدید') }}
        </UButton>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <TheFormInput
            v-model="block.linkLabel"
            :label="$t('متن لینک')"
            :disabled="!canUpdate"
          />
          <TheFormInput
            v-model="block.linkTo"
            :label="$t('مسیر لینک')"
            dir="ltr"
            placeholder="/search/category-mobile"
            :disabled="!canUpdate"
            :error="errors[index]?.link"
          />
        </div>
      </div>

      <UButton
        type="button"
        color="neutral"
        variant="soft"
        icon="i-tabler-plus"
        class="cursor-pointer"
        :disabled="!canUpdate"
        @click="addBlock"
      >
        {{ $t('افزودن بخش') }}
      </UButton>

      <TheSellerFormActions v-if="canUpdate">
        <UButton
          color="primary"
          class="cursor-pointer"
          :loading="saving"
          @click="save"
        >
          {{ $t('ذخیره') }}
        </UButton>
      </TheSellerFormActions>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { HomeSeoBlock } from '~/data/home'

type Draft = {
  title: string
  paragraphs: string[]
  linkLabel: string
  linkTo: string
}

type FieldErrors = {
  title?: string
  paragraphs?: string
  link?: string
}

const { can } = useSellerPermissions()
const canView = computed(() => can('pages.view'))
const canUpdate = computed(() => can('pages.update'))
const { fetchHomeSeo, saveHomeSeo } = useSellerHomeSeo()
const toast = useAppToast()
const { t } = useI18n()

const loading = ref(true)
const saving = ref(false)
const loadError = ref('')
const blocks = ref<Draft[]>([])
const errors = ref<FieldErrors[]>([])

function toDraft(block: HomeSeoBlock): Draft {
  return {
    title: block.title,
    paragraphs: block.paragraphs.length ? [...block.paragraphs] : [''],
    linkLabel: block.inlineLink?.label || '',
    linkTo: block.inlineLink?.to || '',
  }
}

function addBlock() {
  blocks.value.push({ title: '', paragraphs: [''], linkLabel: '', linkTo: '' })
}

function removeBlock(index: number) {
  blocks.value.splice(index, 1)
}

function move(index: number, delta: number) {
  const next = index + delta
  if (next < 0 || next >= blocks.value.length) return
  const [item] = blocks.value.splice(index, 1)
  if (item) blocks.value.splice(next, 0, item)
}

function validate() {
  errors.value = blocks.value.map((block) => {
    const field: FieldErrors = {}
    if (block.title.trim().length < 1) field.title = t('عنوان را وارد کنید')
    if (!block.paragraphs.some(item => item.trim())) field.paragraphs = t('حداقل یک متن لازم است')
    const label = block.linkLabel.trim()
    const to = block.linkTo.trim()
    if ((label && !to) || (!label && to)) field.link = t('متن و مسیر لینک را با هم وارد کنید')
    return field
  })
  return errors.value.every(field => !field.title && !field.paragraphs && !field.link)
}

async function load() {
  loading.value = true
  loadError.value = ''
  try {
    const result = await fetchHomeSeo()
    if (!result.ok) {
      loadError.value = result.message
      return
    }
    blocks.value = result.blocks.map(toDraft)
    if (!blocks.value.length) addBlock()
  }
  finally {
    loading.value = false
  }
}

async function save() {
  if (!validate()) return
  saving.value = true
  try {
    const payload: HomeSeoBlock[] = blocks.value.map((block) => {
      const next: HomeSeoBlock = {
        title: block.title.trim(),
        paragraphs: block.paragraphs.map(item => item.trim()).filter(Boolean),
      }
      if (block.linkLabel.trim() && block.linkTo.trim()) {
        next.inlineLink = { label: block.linkLabel.trim(), to: block.linkTo.trim() }
      }
      return next
    })
    const result = await saveHomeSeo(payload)
    if (!result.ok) {
      toast.error(result.message)
      return
    }
    blocks.value = result.blocks.map(toDraft)
    toast.success(t('متن صفحه اصلی ذخیره شد'))
  }
  finally {
    saving.value = false
  }
}

watch(canView, (ok) => {
  if (ok) void load()
  else loading.value = false
}, { immediate: true })
</script>
