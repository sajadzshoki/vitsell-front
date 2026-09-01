<template>
  <ClientOnly>
    <div class="flex flex-col gap-1.5">
      <p
        v-if="header"
        class="text-sm font-medium text-default"
        :class="[validation && 'text-error', headerClass]"
      >
        {{ header }}
      </p>
      <div
        class="flex flex-col relative border rounded-xl h-12 bg-default transition"
        :class="[
          focused || show ? 'border-primary' : 'border-muted',
          validation && 'border-error',
          disabled && 'opacity-60 pointer-events-none',
        ]"
        v-on-click-outside="onClickOutside"
      >
        <div
          class="flex items-center px-3 h-full rounded-xl cursor-pointer"
          @click.stop="click"
        >
          <p
            v-if="!range"
            class="text-sm grow text-default num"
            :class="displayValue ? '' : 'text-dimmed'"
          >
            {{ displayValue || (focused ? '' : '') }}
          </p>
          <p
            v-else
            class="text-sm grow text-default num"
            :class="rangeClass"
          >
            {{ showDate }}
          </p>
          <UIcon
            name="i-tabler-chevron-down"
            class="size-5 text-dimmed shrink-0 transition-transform"
            :class="[focused || show ? 'rotate-180' : '', iconClass]"
          />
        </div>
        <div
          v-if="!displayValue && placeholder && !focused && !show"
          class="absolute inset-y-0 start-0 flex items-center px-3 pointer-events-none"
        >
          <p class="text-sm text-dimmed">{{ placeholder }}</p>
        </div>
        <date-picker
          v-model="value"
          :editable="true"
          :format="type === 'time' ? 'HH.mm' : 'YYYY-MM-DDTHH:mm:ssZ'"
          display-format="jYYYY-jMM-jDD HH:mm"
          :locale="locale"
          :range="range"
          auto-submit
          clearable
          :custom-input="`#${inputId}`"
          :show="show"
          :max="withMax && (max || getMaximum)"
          :min="withMin && (min || getMaximum)"
          color="var(--ui-primary)"
          :type="type"
          compact-time
          @close="show = false"
        />
        <input
          :id="inputId"
          hidden
        >
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { vOnClickOutside } from '@vueuse/components'
import DatePicker from 'vue3-persian-datetime-picker'
import moment from 'jalali-moment'

const props = withDefaults(defineProps<{
  placeholder?: string
  disabled?: boolean
  focusable?: boolean
  locale?: string
  header?: string
  headerClass?: string
  type?: string
  validation?: boolean
  withMax?: boolean
  range?: boolean
  max?: unknown
  withMin?: boolean
  min?: unknown
  iconClass?: string
}>(), {
  placeholder: 'انتخاب کنید',
  focusable: true,
  locale: 'fa',
  type: 'date',
})

const value = defineModel<string | null>()
const show = ref(false)
const focused = ref(false)
const inputId = `ir-date-${useId().replace(/:/g, '')}`

const displayValue = computed(() => {
  if (!value.value || props.range) return ''
  if (props.type === 'time') return String(value.value).replace('.', ':')
  return moment(value.value).locale(props.locale).format('jYYYY/jMM/jDD')
})

const click = () => {
  if (props.disabled) return
  show.value = !show.value
  focused.value = true
}

function onClickOutside(event: PointerEvent) {
  const target = event.target as HTMLElement | null
  // تقویم sibling تریگر است؛ کلیک روی آن نباید ببندد
  if (target?.closest?.('.vpd-wrapper, .vpd-container, .vpd-main, .vpd-addon-list, .vpd-content')) {
    return
  }
  focused.value = false
  show.value = false
}

const showDate = computed(() => {
  if (!props.range || !value.value) return ''
  if (typeof value.value !== 'string' && moment(value.value[0]).isSame(value.value[1], 'day')) {
    return moment(value.value[0]).locale(props.locale).format('jYYYY/jMM/jDD')
  }
  if (typeof value.value !== 'string') {
    return `${moment(value.value[0]).locale(props.locale).format('jYYYY/jMM/jDD')} - ${moment(value.value[1]).locale(props.locale).format('jYYYY/jMM/jDD')}`
  }
  return moment(value.value).locale(props.locale).format('jYYYY/jMM/jDD')
})

const rangeClass = computed(() => (showDate.value ? 'text-default' : 'text-dimmed'))

const getMaximum = computed(() => moment().format('YYYY-MM-DDTHH:mm:ssZ'))
</script>
