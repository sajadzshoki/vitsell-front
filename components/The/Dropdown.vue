<template>
  <div class="flex flex-col gap-1.5 relative w-full">

    <p v-if="header" class="text-(xs ) font-500  leading-6 "
       :class="[headerClass, dropdown ? 'text-primary-600' : '',
       validation&&'text-red',disabled && '!text-gray-600'] ">{{ header }}</p>

    <div ref="dropdownTriggerRef"
         class="flex relative items-center bg-screen h-12 rounded-lg  gap-2 cursor-pointer px-3  "
         v-on-click-outside="()=>dropdown=false"
         :class="[[dropdown ? 'border-(1 solid gray-400)' : 'border-(1 solid gray-300) hover:brightness-98'],
         className,
         validation&&'border-red']"
         @click="disabled ? null : dropdown=!dropdown">
      <TheNuxtIcon v-if="!disabled && prependIcon" :name="prependIcon" icon-type="svg" class="text-xl text-text"/>

      <p class="flex text-(gray-500 xs) font-400 select-none gap-2 grow " :class="{'text-gray-700 font-500':hasValue}">
        <TheNuxtIcon v-if="icon" :name="icon" class="rounded-full text-xl" icon-type="svg" :class="[iconClass]"/>
        {{ displayData }}
      </p>

      <TheNuxtIcon v-if="!disabled && appendIcon" :name="appendIcon" icon-type="svg"
                   class="text-2xl mr-auto transition-transform "
                   :class="dropdown?'rotate-180':''"/>
      <!-----------------------------------------Modal---------------------------------------------------->
      <div
          v-show="dropdown"
          @click.stop="multi ? null : dropdown=false"
          class="flex flex-col absolute  z-4 right-0 w-full bg-white rounded-lg max-h-40vh overflow-auto shadow-lg"
          :class="dropdownPosition === 'top' ? 'bottom-12' : 'top-12'">

        <div class="p-4 flexCol gap-4">
          <TheSearchbar v-if="searchable" :mini="true" v-model="search" @click.prevent.stop="dropdown=true"/>
          <div class="flex flex-col ">
            <div v-for="item in dropdownItems" :key="item[valueKey]"
                 class="flex gap-3 px-1 py-2 rounded-sm border-b-(1 gray-100 solid) last:border-none items-center hover:bg-gray-50 transition-colors"
                 @click="multi ? toggleItem(item) : handleSelect(item)"
            >
              <div
                  v-if="multi"
                  class="flex flexCenter cursor-pointer border-(1 solid) relative"
                  @click.stop="toggleItem(item)"
                  :class="[isItemSelected(item) ? 'border-(1 gray-800 solid)' : 'border-gray-500','h-5 w-5 b-rd-1']"
              >
                <div
                    v-if="isItemSelected(item)"
                    class="bg-primary-600 relative flex flexCenter !w-3.6 !h-3.6 b-rd-0.5"
                >
                  <TheNuxtIcon name="Tick" icon-type="svg"/>
                </div>
              </div>
              <TheNuxtIcon v-if="item.icon" :name="item.icon" icon-type="svg"/>
              <TheNuxtIcon name="close" icon-type="svg"
                           class="text-(xs primary-500) -ml-2"
                           v-if="selectedData == item[valueKey] && removable"
              />
              <p class="text-(sm) font-500 flex "
                 :class="{'text-primary-500':selectedData == item[valueKey]}">
                {{item[label]}}
              </p>
            </div>
            <p v-if="!dropdownItems?.length"
               class="text-(sm gray-600 center) py-2 ">هیچ موردی وجود ندارد</p>
          </div>
        </div>
      </div>
    </div>
    <!--selected multi items-->
    <div class="flex flex-wrap gap-2">
      <p
          v-if="multi"
          v-for="item in selectedItems"
          :key="item[valueKey]"
          @click="removeItem(item[valueKey])"
          class="px-2 leading-6 text-(xs primary-600 nowrap) font-500 rounded-full border-(1 solid primary-600) flex gap-1 items-center"
      >
        {{ item[label] }}
        <TheNuxtIcon name="close" icon-type="svg"/>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import {vOnClickOutside} from '@vueuse/components'

const props = withDefaults(defineProps<{
  data: any[];
  placeholder?: string;
  className?: string;
  appendText?: string;
  icon?: string;
  iconClass?: string;
  label?: string;
  valueKey?: string;
  header?: string;
  disabled?: boolean;
  headerClass?: string;
  appendIcon?: string;
  prependIcon?: string;
  validation?: boolean;
  multi?: boolean;
  searchable?: boolean;
  downHeight?: number;
  removable?: boolean;
}>(), {
  data: () => ([]),
  label: 'title',
  valueKey: 'id',
  appendIcon: 'arrow-down-1',
  downHeight: 220,
  removable: true,

})

type SingleValue = string | number | null
type MultiValue<T = any> = T[]
const selectedData = defineModel<SingleValue | MultiValue>()

const dropdown = ref(false)
const search = ref()

const displayData = computed(() => {
  if (props.multi) {
    const items = (selectedData.value as any[]) || []
    if (!items.length) return props.placeholder || 'انتخاب کنید'
    return `${items.length} مورد انتخاب شده`
  }

  const key = props.valueKey
  const item = props.data.find(i => i[key] === selectedData.value)
  return item ? item[props.label] : props.placeholder || 'انتخاب کنید'
})


const dropdownItems = computed(() => {
  const term = search.value?.toLowerCase()
  if (!term) return props.data

  const labelKey = props.label
  return props.data.filter(i =>
      String(i[labelKey] ?? '')
          .toLowerCase()
          .includes(term)
  )
})

const hasValue = computed(() => {
  if (props.multi) {
    return Array.isArray(selectedData.value) && selectedData.value.length > 0
  }
  return selectedData.value !== null && selectedData.value !== undefined && selectedData.value !== ''
})


const handleSelect = (item) => {
  const key = props.valueKey
  if (props.multi) return
  if (props.removable) {
    if (item[key] == selectedData.value) {
      selectedData.value = ''
    } else selectedData.value = item[key]
  } else selectedData.value = item[key]
}

const removeItem = (id: string | number) => {
  if (!Array.isArray(selectedData.value)) return
  selectedData.value = selectedData.value.filter(i => i !== id)
}


const selectedItems = computed(() => {
  if (!Array.isArray(selectedData.value)) return []
  const key = props.valueKey
  return props.data.filter(item => selectedData.value.includes(item[key]))
})


const isItemSelected = (item: any) => {
  if (!props.multi) return false
  if (!Array.isArray(selectedData.value)) return false
  return selectedData.value.includes(item[props.valueKey])
}

const toggleItem = (item: any) => {
  if (!props.multi) return

  if (!Array.isArray(selectedData.value)) {
    selectedData.value = []
  }

  const id = item[props.valueKey]
  const index = selectedData.value.indexOf(id)

  if (index === -1) {
    selectedData.value.push(id)
  } else {
    selectedData.value.splice(index, 1)
  }
}


// modal open positions ---------------------------------------------------------
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

