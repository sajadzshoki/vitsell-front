<template>
  <div class="px-4 py-2">
    <div class="flex items-center justify-between gap-2 mb-1">
      <NuxtLink
        v-if="sectionTo"
        :to="sectionTo"
        :external="isExternalMegaHref(sectionTo)"
        :target="isExternalMegaHref(sectionTo) ? '_blank' : undefined"
        rel="noopener"
        class="text-xs font-bold text-default hover:text-primary transition cursor-pointer text-start min-w-0 truncate"
        @click="$emit('navigate')"
      >
        {{ $t(section.title) }}
      </NuxtLink>
      <button
        v-else-if="hasChildren"
        type="button"
        class="text-xs font-bold text-default truncate text-start min-w-0 flex-1 cursor-pointer"
        @click="open = !open"
      >
        {{ $t(section.title) }}
      </button>
      <p
        v-else
        class="text-xs font-bold text-default truncate"
      >
        {{ $t(section.title) }}
      </p>
      <button
        v-if="hasChildren"
        type="button"
        class="size-8 grid place-items-center text-dimmed cursor-pointer shrink-0"
        :aria-expanded="open"
        :aria-label="$t('زیردسته‌ها')"
        @click="open = !open"
      >
        <UIcon
          name="i-tabler-chevron-down"
          class="size-3.5 transition-transform duration-300 ease-out"
          :class="{ 'rotate-180': open }"
        />
      </button>
    </div>

    <div
      v-if="hasChildren"
      class="grid transition-[grid-template-rows] duration-300 ease-out"
      :class="open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
    >
      <div class="overflow-hidden">
        <template
          v-for="item in section.items"
          :key="item.id"
        >
          <NuxtLink
            v-if="itemTo(item)"
            :to="itemTo(item)!"
            :external="isExternalMegaHref(itemTo(item))"
            :target="isExternalMegaHref(itemTo(item)) ? '_blank' : undefined"
            rel="noopener"
            class="block w-full text-xs text-muted hover:text-primary py-1.5 ps-3 transition text-start cursor-pointer"
            @click="$emit('navigate')"
          >
            {{ item.title }}
          </NuxtLink>
          <span
            v-else
            class="block w-full text-xs text-muted py-1.5 ps-3 text-start"
          >
            {{ item.title }}
          </span>
        </template>

        <div
          v-if="section.sections.length"
          class="ms-2 border-s border-muted mt-1"
        >
          <TheNavbarMobileMenuSection
            v-for="child in section.sections"
            :key="child.id"
            :section="child"
            @navigate="$emit('navigate')"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  isExternalMegaHref,
  megaMenuItemToRoute,
  megaMenuSectionToRoute,
  type PublicMegaMenuItem,
  type PublicMegaMenuSection,
} from '~/data/mega-menu'

const props = defineProps<{
  section: PublicMegaMenuSection
}>()

defineEmits<{
  navigate: []
}>()

const open = ref(false)

const hasChildren = computed(
  () => props.section.sections.length > 0 || props.section.items.length > 0,
)

const sectionTo = computed(() => megaMenuSectionToRoute(props.section))

function itemTo(item: PublicMegaMenuItem) {
  return megaMenuItemToRoute(item)
}
</script>
