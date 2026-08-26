<template>
  <UFormField
    :label="label"
    :name="name"
    :error="error || undefined"
    :required="required"
    :hint="hint"
    :help="help"
    :ui="fieldUi"
    :description="description"
    :size="size"
  >
    <!-- flex wrapper: icon must not overlap text in RTL (see Search.vue / ui-parity-qa) -->
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

      <input
        :value="model"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :maxlength="maxlength"
        :autocomplete="autocomplete"
        :inputmode="inputmode as 'text' | 'tel' | 'numeric' | undefined"
        :dir="dir"
        class="flex-1 min-w-0 h-full bg-transparent border-0 outline-none text-default placeholder:text-dimmed"
        :class="[textSizeClass, (digitsOnly || dir === 'ltr') && 'num']"
        @input="onNativeInput"
      >

      <UIcon
        v-if="trailingIcon"
        :name="trailingIcon"
        class="size-5 shrink-0 text-dimmed"
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
  icon?: string
  trailingIcon?: string
  type?: string
  inputmode?: string
  autocomplete?: string
  maxlength?: number | string
  dir?: 'ltr' | 'rtl' | 'auto'
  disabled?: boolean
  size?: FieldSize
  color?: NonNullable<InputProps['color']>
  digitsOnly?: boolean
  ui?: InputProps['ui']
}>(), {
  type: 'text',
  size: 'xl',
  color: 'primary',
})

const model = defineModel<string>({ default: '' })

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

const textSizeClass = computed(() => {
  switch (props.size) {
    case 'sm': return 'text-xs'
    case 'md': return 'text-sm'
    default: return 'text-sm'
  }
})

function onNativeInput(event: Event) {
  const target = event.target as HTMLInputElement
  let next = target.value ?? ''
  if (props.digitsOnly) {
    next = next.replace(/\D/g, '')
  }
  if (props.maxlength != null) {
    next = next.slice(0, Number(props.maxlength))
  }
  model.value = next
  if (target.value !== next) {
    target.value = next
  }
}
</script>
