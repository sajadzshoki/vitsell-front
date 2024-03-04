<template>
    <div class="bg-white-100 shadow-2xl rounded-t-2xl p-4 pb-8 z-2" @close="emit('close')">
        <div class="flex flex-col gap-2">
            <div v-for="item in items" class="flex gap-2 px-1 py-2 border-(0 b-1 gray-100 solid) items-center" @click="value = item">
<!--                <TheNuxtIcon name="nissan.png" icon-type="img" class="!w-12 !h-8"/>-->
                <p class="c-gray-900 text-sm font-normal">{{typeof item?.label === 'number' ? item.label.toLocaleString() + ' ' + item.key : item.label}}</p>
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
})
const value = defineModel()
const check = ref<Record<string, string[]>>(JSON.parse(route.query.filter as string || "{}") as Record<string, any> || {})
watch(check, () => {
    navigateTo({
        query: {filter: JSON.stringify(check.value)}
    })
})
</script>
