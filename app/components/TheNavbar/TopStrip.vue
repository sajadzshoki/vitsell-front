<template>
  <div
    v-if="visible"
    class="bg-inverted text-inverted/65 text-[12px]"
  >
    <div class="mx-auto max-w-8xl px-3 h-8 flex items-center justify-between gap-3 sm:px-4 lg:px-6">
      <div class="flex items-center gap-4 min-w-0">
        <span
          v-if="supportLabel || supportPhone"
          class="hidden sm:inline-flex items-center gap-1.5 shrink-0"
        >
          <UIcon
            name="i-tabler-phone"
            class="size-3.5"
          />
          <span v-if="supportLabel">{{ supportLabel }}</span>
          <span
            v-if="supportPhone"
            class="num text-inverted"
            dir="ltr"
          >{{ supportPhone }}</span>
        </span>
        <span
          v-if="highlight"
          class="text-success truncate"
        >
          {{ highlight }}
        </span>
      </div>
      <div
        v-if="links.length"
        class="hidden md:flex items-center gap-3 shrink-0"
      >
        <template
          v-for="link in links"
          :key="link.id"
        >
          <NuxtLink
            v-if="isInternal(link.to)"
            :to="link.to"
            class="hover:text-inverted transition cursor-pointer"
          >
            {{ link.label }}
          </NuxtLink>
          <a
            v-else-if="link.to"
            :href="link.to"
            target="_blank"
            rel="noopener noreferrer"
            class="hover:text-inverted transition cursor-pointer"
          >
            {{ link.label }}
          </a>
          <span v-else>
            {{ link.label }}
          </span>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { topStripHasContent, type TopStripSettings } from '~/composables/useTopStrip'

const props = defineProps<{
  preview?: TopStripSettings | null
}>()

const { settings, fetchTopStrip } = useTopStrip()

if (!props.preview) {
  await fetchTopStrip()
}

const view = computed(() => props.preview ?? settings.value)
const visible = computed(() => view.value.enabled && topStripHasContent(view.value))
const supportLabel = computed(() => view.value.supportLabel.trim())
const supportPhone = computed(() => view.value.supportPhone.trim())
const highlight = computed(() => view.value.highlight.trim())
const links = computed(() => view.value.links.filter(link => link.label.trim()))

function isInternal(to: string) {
  return to.startsWith('/') && !to.startsWith('//')
}
</script>
