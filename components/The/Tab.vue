<template>
  <div class="flex w-full bg-secondary-800 rounded-xl p-1">
    <label
        v-for="item in items"
        :key="item.value"
        class="flex justify-evenly w-full rounded-xl transition-all duration-300 ease-in-out cursor-pointer"
        :class="[item.value === value ? 'bg-secondary-500' : 'hover:bg-secondary-700',[mini ? '' : '']]"
        @click="addToQuery(item.key, item.value)"
    >
      <input v-model="value" type="radio" :value="item.value" hidden />
      <span class="leading-6.5 text-sm font-500 py-1.5">
        {{ item.label }}
      </span>
    </label>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  items: any[],
  mini?: boolean,
  label?: string,
  routable?: boolean,
}>(), {
  label: 'by'
})

const value = defineModel()
const route = useRoute()

const addToQuery = (key, v) => {
  value.value = v
  if (props.routable) {
    navigateTo({
      query: {
        ...route.query,
        [props.label]: v
      }
    })
  }
}
</script>

<style scoped>
/* Optional: You can add this for even smoother transitions */
label {
  transition-property: background-color, transform;
  transition-duration: 300ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}


</style>