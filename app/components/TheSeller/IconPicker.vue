<template>
  <div>
    <div
      v-if="label"
      class="text-sm mb-2 flex items-center gap-2"
    >
      <UIcon
        name="i-tabler-icons"
        class="size-4 text-dimmed"
      />
      <span>{{ label }}</span>
      <span
        v-if="required"
        class="text-error"
      >*</span>
    </div>

    <div class="flex items-center gap-3 flex-wrap">
      <div class="size-12 rounded-2xl bg-primary/10 text-primary grid place-items-center shrink-0">
        <UIcon
          :name="previewName"
          class="size-6"
        />
      </div>
      <div class="min-w-0 flex-1">
        <div
          class="text-xs text-muted num"
          dir="ltr"
        >
          {{ model || '—' }}
        </div>
        <UButton
          type="button"
          color="primary"
          variant="soft"
          size="sm"
          icon="i-tabler-icons"
          class="mt-2 cursor-pointer"
          @click="open = true"
        >
          {{ $t('انتخاب آیکون') }}
        </UButton>
      </div>
    </div>

    <p
      v-if="error"
      class="text-[11px] text-error mt-2"
    >
      {{ error }}
    </p>
    <p
      v-if="help"
      class="text-[11px] text-dimmed mt-2 leading-5"
    >
      {{ help }}
    </p>

    <UModal
      v-model:open="open"
      :title="$t('انتخاب آیکون')"
      :description="$t('آیکون را از لیست پنل مدیریت انتخاب کنید')"
    >
      <template #body>
        <TheFormInput
          v-model="search"
          :placeholder="$t('جستجوی آیکون…')"
          icon="i-tabler-search"
          class="mb-4"
        />
        <div class="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-80 overflow-y-auto scrollbar-none">
          <button
            v-for="opt in filtered"
            :key="opt.key"
            type="button"
            class="flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition cursor-pointer"
            :class="model === opt.key
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-muted bg-muted/40 text-toned hover:(border-accented bg-elevated)'"
            @click="pick(opt.key)"
          >
            <UIcon
              :name="resolveSellerAdminIconName(opt.key)"
              class="size-6"
            />
            <span class="text-[10px] leading-tight">{{ $t(opt.label) }}</span>
          </button>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end w-full">
          <UButton
            color="neutral"
            variant="outline"
            class="cursor-pointer"
            @click="open = false"
          >
            {{ $t('بستن') }}
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import {
  resolveSellerAdminIconName,
  sellerAdminIconOptions,
} from '~/data/seller-admin-icons'

withDefaults(defineProps<{
  label?: string
  help?: string
  error?: string
  required?: boolean
}>(), {
  label: '',
  help: '',
  error: '',
  required: false,
})

const model = defineModel<string>({ default: '' })

const open = ref(false)
const search = ref('')

const previewName = computed(() => resolveSellerAdminIconName(model.value))

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return sellerAdminIconOptions
  return sellerAdminIconOptions.filter(opt =>
    opt.key.includes(q)
    || opt.label.includes(search.value.trim())
    || opt.label.toLowerCase().includes(q),
  )
})

function pick(key: string) {
  model.value = key
  open.value = false
}
</script>
