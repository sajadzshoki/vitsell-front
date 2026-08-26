<template>
  <UFormField
    :label="label"
    :name="name"
    :error="error || undefined"
    :required="required"
    :hint="hint"
    :help="help"
    :description="description"
    :size="size"
    :ui="fieldUi"
  >
    <div
      class="group flex items-center gap-2.5 w-full rounded-xl border bg-default transition focus-within:border-primary"
      :class="[
        sizeClass,
        error ? 'border-error focus-within:border-error' : 'border-default',
        disabled && 'opacity-60 pointer-events-none',
      ]"
    >
      <UIcon
        v-if="icon"
        :name="icon"
        class="size-5 shrink-0 text-dimmed transition group-focus-within:text-primary"
      />

      <USelectMenu
        v-model="model"
        :items="items"
        :placeholder="placeholder"
        :disabled="disabled"
        :size="size"
        variant="ghost"
        :search-input="searchInputProps"
        :content="{ side: 'bottom', align: 'start', collisionPadding: 8 }"
        class="flex-1 min-w-0"
        :ui="selectUi"
      />
    </div>
  </UFormField>
</template>

<script setup lang="ts">
import type { InputProps } from '@nuxt/ui'

type FieldSize = NonNullable<InputProps['size']>

const props = withDefaults(defineProps<{
  label?: string
  name?: string
  error?: string
  required?: boolean
  hint?: string
  help?: string
  description?: string
  placeholder?: string
  searchPlaceholder?: string
  icon?: string
  items?: string[]
  disabled?: boolean
  size?: FieldSize
}>(), {
  items: () => [],
  size: 'xl',
  searchPlaceholder: 'جستجو...',
})

const model = defineModel<string>({ default: '' })

const { t } = useI18n()

const fieldUi = {
  label: 'text-sm',
  error: 'text-[11px] text-error mt-1',
}

const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm': return 'h-9 px-3'
    case 'md': return 'h-10 px-3.5'
    case 'lg': return 'h-11 px-4'
    default: return 'h-12 px-4'
  }
})

const searchInputProps = computed(() => ({
  placeholder: t(props.searchPlaceholder),
  variant: 'none' as const,
}))

const selectUi = {
  base: 'w-full min-w-0 border-0 bg-transparent shadow-none ring-0! rounded-none p-0 h-full gap-2',
  value: 'text-sm text-default truncate text-start flex-1 min-w-0',
  placeholder: 'text-sm text-dimmed text-start flex-1 min-w-0',
  trailing: 'shrink-0',
  trailingIcon: 'size-5 text-dimmed shrink-0',
  content: 'bg-default border border-muted rounded-xl shadow-xl',
  input: 'border-b border-muted rounded-none',
}
</script>
