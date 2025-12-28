<template>
    <div class="flex flex-col gap-2">
        <TheNuxtIcon name="Content.png" icon-type="img" class="!w-full !h-auto b-rd-2"/>
        <div class="flex gap-1 self-center">
            <TheNuxtIcon name="Ellipse7" icon-type="svg" class="c-primary-500 w-2"/>
            <TheNuxtIcon name="Ellipse7" icon-type="svg" class="c-gray-200 w-2"/>
            <TheNuxtIcon name="Ellipse7" icon-type="svg" class="c-gray-200 w-2"/>
        </div>
    </div>
</template>

<script setup>
defineProps({
    slider:{
        type: Array,
    }
})
</script>

