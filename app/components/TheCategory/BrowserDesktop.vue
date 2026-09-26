<template>
  <div
    class="flex min-h-[32rem] w-full overflow-hidden rounded-3xl border border-muted bg-default shadow-xl shadow-primary/5"
  >
    <!-- Layer 1: root menus -->
    <aside
      class="w-[250px] shrink-0 bg-muted/60 border-e border-muted py-2 overflow-y-auto scrollbar-none"
      :aria-label="$t('دسته‌بندی‌های اصلی')"
    >
      <p class="px-5 pb-3 pt-2 text-xs font-bold text-dimmed uppercase tracking-wide">
        {{ $t('دسته‌های اصلی') }}
      </p>

      <div
        v-if="pending && !menus.length"
        class="py-16 grid place-items-center"
      >
        <UIcon
          name="i-tabler-loader-2"
          class="size-7 text-muted animate-spin"
        />
      </div>

      <div
        v-else-if="loadError && !menus.length"
        class="px-4 py-10 text-center"
      >
        <p class="text-sm text-muted mb-3">
          {{ $t(loadError) }}
        </p>
        <UButton
          color="primary"
          variant="soft"
          size="sm"
          class="cursor-pointer"
          @click="fetchMegaMenu({ force: true })"
        >
          {{ $t('تلاش دوباره') }}
        </UButton>
      </div>

      <div
        v-else-if="!menus.length"
        class="px-4 py-10 text-sm text-dimmed text-center"
      >
        {{ $t('منویی برای نمایش وجود ندارد') }}
      </div>

      <ul
        v-else
        class="flex flex-col"
      >
        <li
          v-for="menu in menus"
          :key="menu.id"
        >
          <button
            type="button"
            class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-start transition cursor-pointer"
            :class="menu.id === activeId
              ? 'bg-primary/10 text-primary font-bold'
              : 'text-toned hover:(bg-primary/10 text-primary)'"
            @mouseenter="selectMenu(menu.id)"
            @click="selectMenu(menu.id)"
          >
            <UIcon
              :name="menuIcon(menu)"
              class="size-5 shrink-0"
            />
            <span class="flex-1 truncate">{{ $t(menu.title) }}</span>
          </button>
        </li>
      </ul>
    </aside>

    <!-- Layer 2: top-level sections -->
    <div
      class="w-[250px] shrink-0 bg-default py-2 border-e border-muted overflow-y-auto scrollbar-none"
      :aria-label="$t('زیردسته‌ها')"
    >
      <template v-if="activeMenu?.sections?.length">
        <component
          :is="menuRootTo(activeMenu) ? NuxtLink : 'button'"
          v-bind="menuRootLinkAttrs(activeMenu)"
          class="w-full flex items-center gap-2 px-4 py-3 mb-1 text-sm font-bold text-highlighted text-start cursor-pointer hover:text-primary transition"
        >
          <UIcon
            name="i-tabler-chevron-right"
            class="size-4 text-dimmed shrink-0"
          />
          <span class="truncate">{{ $t(activeMenu.title) }}</span>
        </component>

        <button
          v-for="section in activeMenu.sections"
          :key="section.id"
          type="button"
          class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-start transition cursor-pointer"
          :class="activeSectionId === section.id
            ? 'bg-primary/10 text-primary font-bold'
            : 'text-toned hover:(bg-primary/10 text-primary)'"
          @mouseenter="selectSection(section.id)"
          @click="selectSection(section.id)"
        >
          <span class="flex-1 truncate">{{ $t(section.title) }}</span>
          <UIcon
            v-if="sectionHasPanel(section)"
            name="i-tabler-chevron-left"
            class="size-4 text-dimmed shrink-0"
          />
        </button>
      </template>
      <div
        v-else-if="activeMenu"
        class="px-4 py-10 text-sm text-dimmed"
      >
        {{ $t('زیردسته‌ای یافت نشد.') }}
      </div>
    </div>

    <!-- Layer 3: grouped columns / items -->
    <div class="relative flex-1 min-w-0 overflow-y-auto scrollbar-none">
      <div
        class="absolute top-0 end-0 size-64 bg-gradient-to-bl from-primary/5 to-transparent pointer-events-none"
        aria-hidden="true"
      />

      <div class="relative p-5 lg:p-6">
        <div
          v-if="activeSection"
          class="flex items-center justify-between mb-5 gap-3"
        >
          <component
            :is="activeSectionTo ? NuxtLink : 'h3'"
            v-bind="activeSectionTo
              ? {
                  to: activeSectionTo,
                  external: isExternalMegaHref(activeSectionTo),
                  target: isExternalMegaHref(activeSectionTo) ? '_blank' : undefined,
                  rel: isExternalMegaHref(activeSectionTo) ? 'noopener' : undefined,
                }
              : {}"
            class="font-bold text-highlighted text-base"
            :class="activeSectionTo ? 'hover:text-primary transition cursor-pointer' : ''"
          >
            {{ $t(activeSection.title) }}
          </component>
          <UButton
            v-if="activeSectionCategoryTo"
            :to="activeSectionCategoryTo"
            color="primary"
            variant="link"
            size="xs"
            trailing-icon="i-tabler-arrow-left"
            class="font-bold shrink-0 cursor-pointer"
          >
            {{ $t('صفحه دسته') }}
          </UButton>
        </div>

        <template v-if="activeSection && (layer3Groups.length || activeSection.items.length)">
          <ul
            v-if="activeSection.items.length"
            class="grid grid-cols-2 gap-x-8 gap-y-1"
            :class="layer3Groups.length ? 'mb-6' : ''"
          >
            <li
              v-for="item in activeSection.items"
              :key="item.id"
            >
              <NuxtLink
                v-if="itemTo(item)"
                :to="itemTo(item)!"
                :external="isExternalMegaHref(itemTo(item))"
                :target="isExternalMegaHref(itemTo(item)) ? '_blank' : undefined"
                rel="noopener"
                class="text-sm text-toned hover:(bg-primary/10 text-primary) transition rounded-lg px-2 py-1.5 text-start w-full block cursor-pointer"
              >
                {{ item.title }}
              </NuxtLink>
              <span
                v-else
                class="text-sm text-toned rounded-lg px-2 py-1.5 block"
              >
                {{ item.title }}
              </span>
            </li>
          </ul>

          <div
            v-if="layer3Groups.length"
            class="grid grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-6"
          >
            <TheNavbarMegaMenuSection
              v-for="group in layer3Groups"
              :key="group.id"
              :section="group"
            />
          </div>
        </template>

        <div
          v-else-if="activeSection"
          class="text-sm text-dimmed py-8"
        >
          {{ $t('موردی برای نمایش نیست') }}
        </div>

        <div
          v-else-if="activeMenu"
          class="text-sm text-dimmed py-8"
        >
          {{ $t('یک بخش را انتخاب کنید') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NuxtLink } from '#components'
import {
  isExternalMegaHref,
  megaMenuItemToRoute,
  megaMenuRootToRoute,
  megaMenuSectionToRoute,
  type MegaMenuRoute,
  type PublicMegaMenu,
  type PublicMegaMenuItem,
  type PublicMegaMenuSection,
} from '~/data/mega-menu'
import { resolveSellerAdminIconName } from '~/data/seller-admin-icons'
import { getCategoryIcon, toSearchRoute } from '~/data/categories'

const {
  menus,
  pending,
  loadError,
  fetchMegaMenu,
  activeId,
  activeMenu,
  activeSectionId,
  activeSection,
  selectMenu,
  selectSection,
} = useCategoryBrowser()

const layer3Groups = computed((): PublicMegaMenuSection[] => {
  const section = activeSection.value
  if (!section) return []
  if (section.sections.length) return section.sections
  return []
})

const activeSectionCategoryTo = computed(() => {
  const id = activeSection.value?.category?.id
  return id ? toSearchRoute({ category: id }) : null
})

const activeSectionTo = computed(() => sectionTo(activeSection.value))

function sectionHasPanel(section: PublicMegaMenuSection) {
  return section.sections.length > 0 || section.items.length > 0
}

function menuIcon(menu: PublicMegaMenu) {
  if (menu.icon) return resolveSellerAdminIconName(menu.icon)
  return getCategoryIcon(menu.slug || menu.id)
}

function menuRootTo(menu: PublicMegaMenu | null | undefined): MegaMenuRoute | null {
  if (!menu) return null
  return megaMenuRootToRoute(menu)
}

function sectionTo(section: PublicMegaMenuSection | null | undefined): MegaMenuRoute | null {
  if (!section) return null
  return megaMenuSectionToRoute(section)
}

function itemTo(item: PublicMegaMenuItem): MegaMenuRoute | null {
  return megaMenuItemToRoute(item)
}

function menuRootLinkAttrs(menu: PublicMegaMenu | null | undefined) {
  const to = menuRootTo(menu)
  if (!to) return { type: 'button' as const }
  return {
    to,
    external: isExternalMegaHref(to),
    target: isExternalMegaHref(to) ? '_blank' : undefined,
    rel: isExternalMegaHref(to) ? 'noopener' : undefined,
  }
}
</script>
