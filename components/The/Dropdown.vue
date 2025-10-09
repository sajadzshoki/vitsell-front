<template>
  <div class="flex flex-col gap-1.5 relative w-full">

    <p v-if="header" class="text-(xs ) font-500  leading-6 "
       :class="[header, dropdown ? 'text-primary-600' : '',
       validation&&'text-red',disabled && '!text-gray-600'] ">{{ header }}</p>

    <div ref="dropdownTriggerRef"
         class="flex relative items-center bg-screen h-12 rounded-lg  gap-2 cursor-pointer px-3 "
         v-on-click-outside="()=>dropdown=false"
         :class="[[dropdown ? 'border-(1 solid gray-400)' : 'border-(1 solid gray-300)'],
         className,
         validation&&'border-red']"
         @click="!disabled && (dropdown = !dropdown) ">
      <TheNuxtIcon v-if="!disabled && prependIcon" :name="prependIcon" icon-type="svg" class="text-xl text-text"/>

      <p class="flex text-(gray-500 xs) font-400 select-none gap-2 grow ">
        <TheNuxtIcon v-if="icon" :name="icon" class="rounded-full text-xl" icon-type="svg" :class="[iconClass]"/>
        {{ value ? selectedData : (placeholder || 'انتخاب کنید') }}
      </p>

      <TheNuxtIcon v-if="!disabled && appendIcon" :name="appendIcon" icon-type="svg" class="text-2xl mr-auto"
                   :class="dropdown?'rotate-180':''"/>
      <!-----------------------------------------Modal---------------------------------------------------->
      <div
          v-show="dropdown"
          class="flex flex-col absolute  z-4 right-0 w-full bg-white rounded-lg max-h-40vh overflow-auto shadow-lg"
          :class="dropdownPosition === 'top' ? 'bottom-12' : 'top-12'">

        <div class="p-4 z-2">
          <div class="flex flex-col gap-2">
            <div v-for="item in data"
                 class="flex gap-2 px-1 pb-2 border-b-(1 gray-100 solid) last:border-none items-center"
                 @click="object ? value = item : value = item">
              <p class="text-(sm) font-400">
                {{ typeof item?.label === 'number' ? item.label.toLocaleString() + ' ' + item.key : item[label] }}</p>
            </div>
            <p v-if="!data?.length"
               class="text-(sm gray-600 center) py-2 ">هیچ موردی وجود ندارد</p>
          </div>
        </div>
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
    return props.placeholder || 'انتخاب کنید'
  }
  if (typeof value.value === 'object') {
    return value.value?.label || value.value[props.label] || props.placeholder || 'انتخاب کنید'
  }
  return value.value || props.placeholder || 'انتخاب کنید'
})
// const selectedData = computed(() => {
//   if (!value.value || (typeof value.value === 'object' && Object.keys(value.value).length === 0)) {
//     return props.data.find(e=> e.value===value.value)[props.label]|| props.placeholder || 'انتخاب کنید'
//   }
//   if (typeof value.value === 'object') {
//     return value.value?.label || value.value[props.label] || props.placeholder || 'انتخاب کنید'
//   }
//   return props.data.find(e=> e.value===value.value)[props.label] || value.value || props.placeholder || 'انتخاب کنید'
// })


const props = withDefaults(defineProps<{
  data: any[];
  placeholder?: string;
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
  object?: boolean;
  downHeight?: number;
}>(), {
  data: () => ([]),
  label: 'title',
  appendIcon: 'arrow-down-1',
  downHeight: 220
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

