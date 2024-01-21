<template>
  <div class="flex flex-col children:(p-4)">
    <table class="flex-grow">
      <thead>
      <tr class="border-b-2 border-gray-100 children:(text-center p-4) rounded-lg <md:children:p-1">
        <th v-for="col in cols"
            :class="{'<md:hidden':col.isDesktop,'hidden <md:table-cell':col.isMobile}"
            class="text-xs text-gray-400 font-medium first:text-right last:text-left">
          {{ col.title }}
        </th>
      </tr>
      </thead>
      <tbody >
      <tr v-for="item in items"
          @click="$emit('click:row',item)"
          class="children:p-3 <md:children:p-1 text-center children:(border-b border-gray-100) hover:children:(bg-gray-100)">
        <td v-for="col in cols"
            class="text-gray-400 text-sm first:text-right last:text-left text-center first:rounded-r-lg last:rounded-l-lg"
            :class="[col.class,{'<md:hidden':col.isDesktop,'hidden <md:table-cell':col.isMobile}]" :dir="col.dir">
          <slot :name="col.name" :col="col" :item="item" :items="_at(item,col.key)">
            {{ _at(item, col.key).join(' ') }}
          </slot>
        </td>
      </tr>
      </tbody>
    </table>
    <div v-if="!items.length" class="flex justify-center items-center p-24 font-bold text-sm text-text">
      {{ $t('هیچ موردی برای این جستجو یافت نشد') }}
    </div>

  </div>
</template>
<script setup>
defineProps({
  cols: {
    type: Array,
    default: () => ([])
  },
  items: {
    type: Array,
    default: () => ([])
  },
})
</script>


