<template>
  <section class="bg-default border border-muted rounded-3xl p-5 sm:p-6 md:p-8">
    <h2 class="text-base md:text-lg font-bold text-highlighted mb-4">
      {{ $t(seo.heading) }}
    </h2>

    <div class="flex flex-col gap-3 text-sm text-toned leading-7">
      <p
        v-for="(paragraph, index) in visibleParagraphs"
        :key="index"
      >
        {{ $t(paragraph) }}
      </p>
    </div>

    <UButton
      v-if="seo.paragraphs.length > 1"
      color="primary"
      variant="link"
      size="sm"
      class="mt-4 font-medium px-0"
      :trailing-icon="expanded ? 'i-tabler-chevron-up' : 'i-tabler-chevron-down'"
      @click="expanded = !expanded"
    >
      {{ expanded ? $t('نمایش کمتر') : $t('نمایش بیشتر') }}
    </UButton>
  </section>
</template>

<script setup lang="ts">
import type { CategoryPageMeta } from '~/data/category-pages'

const props = defineProps<{
  seo: CategoryPageMeta['seo']
}>()

const expanded = ref(false)

const visibleParagraphs = computed(() =>
  expanded.value ? props.seo.paragraphs : props.seo.paragraphs.slice(0, 1),
)
</script>
