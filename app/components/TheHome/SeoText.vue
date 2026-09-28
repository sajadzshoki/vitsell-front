<template>
  <section v-if="preview" class="text-start">
    <article>
      <h1 class="text-base md:text-lg font-bold text-highlighted mb-2">
        {{ $t(preview.title) }}
      </h1>
      <p
        v-for="(paragraph, pIndex) in preview.paragraphs"
        :key="pIndex"
        class="text-sm text-toned leading-7"
      >
        {{ $t(paragraph) }}
        <NuxtLink
          v-if="preview.inlineLink && pIndex === preview.paragraphs.length - 1"
          :to="preview.inlineLink.to"
          class="text-primary font-medium hover:underline cursor-pointer ms-1"
        >
          {{ $t(preview.inlineLink.label) }}
        </NuxtLink>
      </p>
    </article>

    <div
      v-show="expanded"
      class="flex flex-col gap-6 mt-6"
    >
      <article
        v-for="(block, index) in rest"
        :key="index"
      >
        <h2 class="text-base md:text-lg font-bold text-highlighted mb-2">
          {{ $t(block.title) }}
        </h2>
        <p
          v-for="(paragraph, pIndex) in block.paragraphs"
          :key="pIndex"
          class="text-sm text-toned leading-7"
        >
          {{ $t(paragraph) }}
          <NuxtLink
            v-if="block.inlineLink && pIndex === block.paragraphs.length - 1"
            :to="block.inlineLink.to"
            class="text-primary font-medium hover:underline cursor-pointer ms-1"
          >
            {{ $t(block.inlineLink.label) }}
          </NuxtLink>
        </p>
      </article>
    </div>

    <UButton
      v-if="rest.length"
      type="button"
      color="neutral"
      variant="ghost"
      size="sm"
      :trailing-icon="expanded ? 'i-tabler-chevron-up' : 'i-tabler-chevron-down'"
      class="mt-2 text-toned font-medium cursor-pointer"
      @click="expanded = !expanded"
    >
      {{ expanded ? $t('نمایش کمتر') : $t('نمایش بیشتر') }}
    </UButton>
  </section>
</template>

<script setup lang="ts">
const { seoBlocks: blocks } = useHome()
const expanded = ref(false)

const preview = computed(() => blocks.value[0] ?? null)
const rest = computed(() => blocks.value.slice(1))
</script>
