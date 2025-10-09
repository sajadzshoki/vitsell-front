<template>
  <div class="flex flex-col gap-4 border-b-(1 solid gray-100) py-6">
    <div class="flex flex-nowrap justify-between">
      <p class="font-700  leading-[26px]">
        {{ question }}
      </p>
      <transition name="fade" mode="out-in" :duration="150">
        <div
            v-if="expanded"
            @click="toggleArticle"
            class="flex flex-nowrap justify-center items-center gap-3 px-2 cursor-pointer transition-opacity"
        >
          <p class="text-sm text-primary-800">
            إخفاء الإجابة
          </p>
          <TheNuxtIcon class="text-3.75" name="minus-cirlce" icon-type="svg"/>
        </div>
        <div
            v-show="!haveExpanded"
            v-else
            @click="toggleArticle"
            class="flex flex-nowrap justify-center items-center gap-3 px-2 cursor-pointer transition-opacity"
        >
          <p class="text-sm text-primary-800">
            عرض الإجابة
          </p>
          <TheNuxtIcon class="text-3.75" name="add-circle" icon-type="svg"/>

        </div>
      </transition>
    </div>
    <div class="overflow-hidden text-sm leading-[26px] text-gray-600 transition-all duration-450 relative"
         :style="{height : expanded ? `${expandedHeight}px` : (haveExpanded ? '' : '54px')}">
      <p ref="description">

        {{ answer }}
      </p>
      <transition name="fade">
        <div v-show="!expanded && !haveExpanded" class="bg-gradient-to-t from-screen to-transparent absolute inset-0"/>
      </transition>
    </div>
  </div>
</template>
<script setup lang="ts">
defineProps<{
  answer?: string;
  question?: string;
}>()
const expanded = ref(false);
const description = ref<HTMLParagraphElement | null>(null)
const toggleArticle = () => {
  expanded.value = !expanded.value
}

const expandedHeight = computed(() => description.value?.clientHeight || 0)
console.log(`expanded height =>`, expandedHeight.value);

const haveExpanded = computed(() => expandedHeight.value < 54);

console.log(`have expanded =>`, haveExpanded);
</script>