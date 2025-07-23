<template>
  <div class="flex flex-col gap-1.5 relative w-full">

    <p v-if="header" class="text-(xs ) font-500  leading-6 "
       :class="[header, dropdown ? 'text-primary-600' : '',validation&&'text-red' ] ">{{ header }}</p>

    <div ref="dropdownTriggerRef"
         class="flex relative items-center bg-screen h-12 rounded-lg  gap-2 cursor-pointer px-3 "
         v-on-click-outside="()=>dropdown=false"
         :class="[[dropdown ? 'border-(1 solid gray-400)' : 'border-(1 solid gray-300)'],
         className,
         validation&&'border-red']"
         @click="!disabled && (dropdown = !dropdown) ">
      <TheNuxtIcon v-if="!disabled && prependIcon" :name="prependIcon" icon-type="svg" class="text-xl text-text"/>

      <p v-if="!value" class="flex text-(gray-500 xs) font-400 select-none gap-2 grow ">
        <TheNuxtIcon v-if="icon" :name="icon" class="rounded-full text-xl" icon-type="svg" :class="[iconClass]"/>
        {{ title || $t('انتخاب کنید') }}
      </p>
      <!-----------------------------------------important part for showing the selected data---------------------------------------------------->
      <p v-else class="text-xs font-400 ">
<!--        {{ typeof value?.label === 'number' ? value.label.toLocaleString() + ' ' + value.key : value.label }}-->
        {{selectedData}}
      </p>

      <!------------------------------------------------------arrow icon---------------------------------------------------------------->

      <TheNuxtIcon v-if="!disabled && appendIcon" :name="appendIcon" icon-type="svg" class="text-2xl mr-auto"
                   :class="dropdown?'rotate-180':''"/>
      <!-----------------------------------------Modal---------------------------------------------------->
      <div
          v-show="dropdown"
          class="flex flex-col absolute  z-4 right-0 w-full bg-white rounded-lg max-h-40vh overflow-auto shadow-lg"
          :class="dropdownPosition === 'top' ? 'bottom-12' : 'top-12'">
        <TheDropdownModal :items="data" v-model="value" :object="object" :label="label"/>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {vOnClickOutside} from '@vueuse/components'

const value = defineModel()
const dropdown = ref(false)

const selectedData = computed(() => {
  if (!value.value || (typeof value.value === 'object' && Object.keys(value.value).length === 0)) {
    return props.title || 'انتخاب کنید'
  }
  if (typeof value.value === 'object') {
    return value.value?.label || value.value[props.label] || props.title || 'انتخاب کنید'
  }
  return value.value || props.title || 'انتخاب کنید'
})


const props = withDefaults(defineProps<{
  data: any[];
  title?: string;
  className?: string;
  appendText?: string;
  icon?: string;
  iconClass?: string;
  label?: string;
  header?: string;
  disabled?: boolean;
  headerClass?: string;
  appendIcon?: string;
  prependIcon?: string;
  validation?: boolean;
}>(), {
  data: () => ([]),
  label: 'title',
  appendIcon: 'arrow-down-1'
})

// modal open positions
const dropdownTriggerRef = ref(null);
const dropdownPosition = ref('bottom'); // Default to opening below
const {height: windowHeight} = useWindowSize();

const checkDropdownPosition = () => {
  nextTick(() => {
    if (dropdownTriggerRef.value) {
      const rect = dropdownTriggerRef.value.getBoundingClientRect();
      const spaceBelow = windowHeight.value - rect.bottom;
      dropdownPosition.value = spaceBelow < props.downHeight ? 'top' : 'bottom';
    }
  });
};

const onScrollOrResize = () => {
  checkDropdownPosition();
};
onMounted(() => {
  checkDropdownPosition();
  window.addEventListener('scroll', onScrollOrResize, true); // true to capture scrolling in nested containers too
  window.addEventListener('resize', onScrollOrResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScrollOrResize, true);
  window.removeEventListener('resize', onScrollOrResize);
});

watch(() => windowHeight.value, () => {
  checkDropdownPosition();
});
</script>

