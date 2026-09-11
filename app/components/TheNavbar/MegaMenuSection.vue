<template>
  <div class="min-w-0">
    <div class="mb-2.5">
      <NuxtLink
        v-if="sectionTo"
        :to="sectionTo"
        :external="isExternalMegaHref(sectionTo)"
        :target="isExternalMegaHref(sectionTo) ? '_blank' : undefined"
        rel="noopener"
        class="font-bold text-default text-sm text-start hover:text-primary transition cursor-pointer inline-block"
        @click="$emit('navigate')"
      >
        {{ $t(section.title) }}
      </NuxtLink>
      <h4
        v-else
        class="font-bold text-default text-sm"
      >
        {{ $t(section.title) }}
      </h4>
    </div>

    <ul
      v-if="section.items.length"
      class="space-y-1"
    >
      <li
        v-for="item in section.items"
        :key="item.id"
      >
        <NuxtLink
          v-if="itemTo(item)"
          :to="itemTo(item)!"
          :external="isExternalMegaHref(itemTo(item))"
          :target="isExternalMegaHref(itemTo(item)) ? '_blank' : undefined"
          rel="noopener"
          class="text-[13px] text-toned hover:bg-primary/10 hover:text-primary transition rounded-md px-1.5 py-1 text-start w-full block cursor-pointer"
          @click="$emit('navigate')"
        >
          {{ item.title }}
        </NuxtLink>
        <span
          v-else
          class="text-[13px] text-toned rounded-md px-1.5 py-1 block"
        >
          {{ item.title }}
        </span>
      </li>
    </ul>

    <div
      v-if="section.sections.length"
      class="space-y-4 mt-3"
    >
      <TheNavbarMegaMenuSection
        v-for="child in section.sections"
        :key="child.id"
        :section="child"
        @navigate="$emit('navigate')"
      />
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

const sectionTo = computed(() => megaMenuSectionToRoute(props.section))

function itemTo(item: PublicMegaMenuItem) {
  return megaMenuItemToRoute(item)
}
</script>
