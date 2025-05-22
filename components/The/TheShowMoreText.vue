<template>
  <p class="flex justify-between text-(xs gray-600) leading-6" :class="isExpanded && 'flexCol'">
    {{ isExpanded ? text : truncatedText }}
    <span v-if="maxLength <= text.length" @click="toggleText" :class="isExpanded && 'self-end'" class=" text-nowrap text-(xs primary-500) leading-6 cursor-pointer flex items-center ">{{
        isExpanded ? 'Show Less' : 'Show More'
      }}
    <TheNuxtIcon name="arrow-down2" class="text-sm" :class="isExpanded && 'rotate-180'" icon-type="svg"/>
    </span>
  </p>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue';

interface Props {
  text: string;
  maxLength?: number;
}

const props = defineProps<Props>();
const isExpanded = ref(false);
const maxLength = props.maxLength ?? 100;

const toggleText = () => {
  isExpanded.value = !isExpanded.value;
};

const truncatedText = computed(() =>
    props.text.length > maxLength ? props.text.slice(0, maxLength) + '...' : props.text
);
</script>
