<template>
  <button :disabled="disable"
          class="flex flexCenter rounded-full gap-3 cursor-pointer border-none relative hover:brightness-80 transition-brightness duration-100 "
          :class="[
          disable?'bg-primary-800 border-transparent':fill?'bg-primary-700 border-transparent ':'bg-transparent text-primary-200 border-(1 solid primary-200) ',
          disable?'opacity-40 cursor-not-allowed ':'',
          mini?'py-1 px-2 min-w-15':'py-2 px-3 min-w-20',
          cancel? !fill && 'border-red-500 text-red-500':'',
          disable && cancel && '!border-(gray-50 1 solid) !text-gray-100 !bg-transparent']"
          :style="{
          borderColor: !fill && color ? color : '',
          borderWidth: !fill && color ? '0.5px' : '',
          backgroundColor: fill && color && !disable ? color : '',
          cursor: disable ? 'not-allowed' : 'pointer'
    }"
  >
    <LazyTheNuxtIcon
        v-if="icon || loading"
        :name="loading ? 'loading' : icon"
        icon-type="svg"
        class="text-lg flex flexCenter"
        :class="iconClass"
        :style="{ color: fill ? 'white' : color ? color : 'primary-200' }"
    />

    <p v-show="!loading" class="font-normal whitespace-nowrap text-sm leading-6.5"
       :style="{ color: fill ? 'white' : color ? color : 'gray-700' }"
       :class="mini?'text-sm':'text-base'">{{ loading ? '' : label }}
    </p>

    <span
        v-show="badge"
        class="bg-secondary-500 rounded-1/2 absolute w-3 h-3 left-0 top-0 transform -translate-x-1/3 -translate-y-1/3 shadow-2xl"/>
  </button>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  fill?: boolean,
  icon?: string,
  iconClass?:string,
  label: string,
  disable?: boolean,
  mini?: boolean,
  color?: string,
  badge?: number,
  loading?: boolean,
  cancel?: boolean,
}>(), {
  fill: true,
  badge: 0,
})
</script>
