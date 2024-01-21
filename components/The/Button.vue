<template>
    <button :disabled="disable"
            class="flex justify-center items-center rounded-lg gap-2 py-3 px-6 cursor-pointer border-(0.4 solid primary-500)"
            :class="[fill ? 'bg-primary-500' : 'bg-gray-100', disable ? 'opacity-50 cursor-not-allowed' : '']">
        <TheNuxtIcon v-if="icon" :name="icon" icon-type="svg" class="text-(2xl primary-500)"/>
        <p class="font-black text-base" :class="[fill ? 'text-white' : 'text-primary-500']">
            {{ label }}
        </p>
    </button>
</template>


<script setup>
defineProps({
    fill: {
        type: Boolean,
        default: true
    },
    icon: {
        type: String,
        default: 'empty'
    },
    label: {
        type: String,
        required: true
    },
    disable: {
        type: Boolean,
        default: false
    }
})
</script>
