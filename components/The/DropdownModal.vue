<template>
    <div class="p-4 z-2" @close="emit('close')">
        <div class="flex flex-col gap-2">
            <div v-for="item in items" class="flex gap-2 px-1 pb-2 border-b-(1 gray-100 solid) last:border-none items-center"
                 @click="object ? value = item : value = item">
                <p class="text-(sm) font-400">{{typeof item?.label === 'number' ? item.label.toLocaleString() + ' ' + item.key : item[label]}}</p>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
const {t} = useI18n()
const route = useRoute()
const emit = defineEmits(['close'])
defineProps({
    items : {
        type : Array,
    },
  label: {
    type: String,
    default: 'title'
  },
  object: {
    type: Boolean,
    default: true
  }
})
const value = defineModel()
const check = ref<Record<string, string[]>>(JSON.parse(route.query.filter as string || "{}") as Record<string, any> || {})
watch(check, () => {
    navigateTo({
        query: {filter: JSON.stringify(check.value)}
    })
})
</script>
