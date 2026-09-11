<template>
  <div
    ref="megaRef"
    class="relative"
    @mouseenter="megaOpen = true"
    @mouseleave="megaOpen = false"
  >
    <button
      type="button"
      class="inline-flex items-center gap-1.5 text-xs md:text-sm text-toned hover:text-primary transition-all whitespace-nowrap py-1 cursor-pointer"
      @click="megaOpen = !megaOpen"
    >
      <UIcon
        name="i-tabler-menu-2"
        class="size-4 shrink-0"
      />
      <span>{{ $t('دسته بندی محصولات') }}</span>
      <UIcon
        name="i-tabler-chevron-down"
        class="size-3.5 text-dimmed transition-transform"
        :class="{ 'rotate-180': megaOpen }"
      />
    </button>

    <div
      v-if="megaOpen"
      class="absolute top-full start-0 w-[min(1020px,96vw)] bg-default border border-muted rounded-2xl shadow-2xl overflow-hidden flex z-50 min-h-105"
    >
      <div
        v-if="pending && !menus.length"
        class="flex-1 grid place-items-center p-10"
      >
        <UIcon
          name="i-tabler-loader-2"
          class="size-8 text-muted animate-spin"
        />
      </div>

      <div
        v-else-if="loadError && !menus.length"
        class="flex-1 grid place-items-center p-8 text-center"
      >
        <p class="text-sm text-muted mb-3">
          {{ $t(loadError) }}
        </p>
        <UButton
          color="primary"
          variant="soft"
          size="sm"
          class="cursor-pointer"
          @click="retry"
        >
          {{ $t('تلاش دوباره') }}
        </UButton>
      </div>

      <div
        v-else-if="!menus.length"
        class="flex-1 grid place-items-center p-10 text-sm text-dimmed"
      >
        {{ $t('منویی برای نمایش وجود ندارد') }}
      </div>

      <template v-else>
        <!-- Layer 1: root menus -->
        <div class="w-[250px] shrink-0 bg-muted/60 py-2 border-e border-muted overflow-y-auto max-h-[72vh]">
          <component
            :is="menuRootTo(menu) ? NuxtLink : 'button'"
            v-for="menu in menus"
            :key="menu.id"
            v-bind="menuRootLinkAttrs(menu)"
            class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-start transition cursor-pointer"
            :class="activeMenuId === menu.id
              ? 'bg-primary/10 text-primary font-bold'
              : 'text-toned hover:bg-primary/10 hover:text-primary'"
            @mouseenter="selectMenu(menu.id)"
            @click="onRootActivate(menu)"
          >
            <UIcon
              :name="menuIcon(menu)"
              class="size-5 shrink-0"
            />
            <span class="flex-1 truncate">{{ $t(menu.title) }}</span>
          </component>
        </div>

        <!-- Layer 2: top-level sections -->
        <div class="w-[250px] shrink-0 bg-default py-2 border-e border-muted overflow-y-auto max-h-[72vh]">
          <template v-if="activeMenu?.sections?.length">
            <component
              :is="menuRootTo(activeMenu) ? NuxtLink : 'button'"
              v-bind="menuRootLinkAttrs(activeMenu)"
              class="w-full flex items-center gap-2 px-4 py-3 mb-1 text-sm font-bold text-highlighted text-start cursor-pointer hover:text-primary transition"
              @click="onRootActivate(activeMenu)"
            >
              <UIcon
                name="i-tabler-chevron-right"
                class="size-4 text-dimmed shrink-0"
              />
              <span class="truncate">{{ $t(activeMenu.title) }}</span>
            </component>

            <component
              :is="sectionTo(section) ? NuxtLink : 'button'"
              v-for="section in activeMenu.sections"
              :key="section.id"
              v-bind="sectionLinkAttrs(section)"
              class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-start transition cursor-pointer"
              :class="activeSectionId === section.id
                ? 'bg-primary/10 text-primary font-bold'
                : 'text-toned hover:bg-primary/10 hover:text-primary'"
              @mouseenter="activeSectionId = section.id"
              @click="onSectionActivate(section)"
            >
              <span class="flex-1 truncate">{{ $t(section.title) }}</span>
              <UIcon
                v-if="sectionHasPanel(section)"
                name="i-tabler-chevron-left"
                class="size-4 text-dimmed shrink-0"
              />
            </component>
          </template>
          <div
            v-else
            class="px-4 py-10 text-sm text-dimmed"
          >
            {{ $t('زیردسته‌ای یافت نشد.') }}
          </div>
        </div>

        <!-- Layer 3: grouped columns -->
        <div class="flex-1 min-w-0 p-5 bg-default overflow-y-auto max-h-[72vh]">
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
              @click="activeSectionTo ? close() : undefined"
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
              @click="close"
            >
              {{ $t('صفحه دسته') }}
            </UButton>
          </div>

          <div
            v-if="activeSection && layer3Groups.length"
            class="grid grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-6"
          >
            <TheNavbarMegaMenuSection
              v-for="group in layer3Groups"
              :key="group.id"
              :section="group"
              @navigate="close"
            />
          </div>

          <ul
            v-else-if="activeSection?.items.length"
            class="grid grid-cols-2 gap-x-8 gap-y-1"
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
                class="text-sm text-toned hover:bg-primary/10 hover:text-primary transition rounded-lg px-2 py-1.5 text-start w-full block cursor-pointer"
                @click="close"
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
            v-else-if="activeSection"
            class="text-sm text-dimmed py-8"
          >
            {{ $t('موردی برای نمایش نیست') }}
          </div>

          <div
            v-else
            class="text-sm text-dimmed py-8"
          >
            {{ $t('یک بخش را انتخاب کنید') }}
          </div>
        </div>
      </template>
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

const { menus, pending, loadError, fetchMegaMenu } = useMegaMenu()
await fetchMegaMenu()

const megaOpen = ref(false)
const megaRef = ref<HTMLElement | null>(null)
const activeMenuId = ref('')
const activeSectionId = ref('')

function selectMenu(id: string) {
  if (activeMenuId.value === id) return
  activeMenuId.value = id
  const menu = menus.value.find(m => m.id === id)
  activeSectionId.value = menu?.sections[0]?.id || ''
}

watch(
  menus,
  (list) => {
    if (!list.length) {
      activeMenuId.value = ''
      activeSectionId.value = ''
      return
    }
    if (!activeMenuId.value || !list.some(m => m.id === activeMenuId.value)) {
      selectMenu(list[0]!.id)
      return
    }
    const menu = list.find(m => m.id === activeMenuId.value)
    if (!activeSectionId.value || !menu?.sections.some(s => s.id === activeSectionId.value)) {
      activeSectionId.value = menu?.sections[0]?.id || ''
    }
  },
  { immediate: true },
)

const activeMenu = computed(() => menus.value.find(m => m.id === activeMenuId.value))

const activeSection = computed(() =>
  activeMenu.value?.sections.find(s => s.id === activeSectionId.value) || null,
)

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

function close() {
  megaOpen.value = false
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

function sectionLinkAttrs(section: PublicMegaMenuSection) {
  const to = sectionTo(section)
  if (!to) return { type: 'button' as const }
  return {
    to,
    external: isExternalMegaHref(to),
    target: isExternalMegaHref(to) ? '_blank' : undefined,
    rel: isExternalMegaHref(to) ? 'noopener' : undefined,
  }
}

function onRootActivate(menu: PublicMegaMenu | null | undefined) {
  if (!menu) return
  selectMenu(menu.id)
  if (menuRootTo(menu)) close()
}

function onSectionActivate(section: PublicMegaMenuSection) {
  activeSectionId.value = section.id
  if (sectionTo(section)) close()
}

async function retry() {
  await fetchMegaMenu({ force: true })
}

onClickOutside(megaRef, close)

const route = useRoute()
watch(() => route.fullPath, close)

const { y } = useWindowScroll()
watch(y, () => {
  if (megaOpen.value) close()
})
</script>
