<template>
  <div class="flex items-center gap-1.5 "
       :class="[value === item.id ? activeClass : className]"
       @click="value = item.id">
    <TheNuxtIcon v-if="item.icon" :name="item.icon" icon-type="svg" class="!text-sm" />
    <p >{{ item.name }}</p>
  </div>
</template>

<script lang="ts" setup>
defineProps({
  item: {
    type: Object,

  },
  className: {
    type: String,
    default: 'text-(gray-500 xs) font-medium rounded-full border-(1 solid gray-300) w-fit py-1 px-2 cursor-pointer '
  },
  activeClass: {
    type: String,
    default: 'text-(white xs) font-medium rounded-full w-fit py-1 px-2 cursor-pointer bg-orange-500'
  }
});

const value = defineModel();
</script>
