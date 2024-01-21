<template>
    <div class="flex items-stretch text-text-100 text-sm font-bold bg-gray-100 p-1 b-rd-3 h-13">
        <label v-for="item in items"
               :class="[{'bg-primary-500 c-white cursor-default border-b border-primary-500' : item?.value === ( value )} , [mini ? 'px-3' : ' px-4']]"
               class="flex justify-center items-center b-rd-2 flex-grow basis-1 cursor-pointer p-3 c-text text-xs font-extrabold"
               @click="addToQuery(item.key , item.value)">
            <input v-model="value" type="radio" :value="item.value" hidden>
            <span class="whitespace-nowrap">
        {{ item.label }}
      </span>
        </label>
    </div>
</template>

<script setup>
const props = defineProps({
    items: {
        type: Array,
        required: true
    },
    mini : {
        type : Boolean ,
        default :false
    },
    routable :{
        type : Boolean ,
        default : true
    },
    modelValue
})
const emit = defineEmits([modelEmit])
const value = useModel(props,emit)
const route = useRoute()
const addToQuery = (key, v) => {
    value.value = v
    if(props.routable) {
        navigateTo({
            query: {
                ...route.query,
                [props.label]: v
            }
        })
    }
}
</script>

