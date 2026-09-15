<template>
  <div
    class="flex flex-1 min-h-0 w-full overflow-hidden md:(border border-muted rounded-2xl min-h-[28rem] shadow-sm)"
  >
    <!-- Root menus rail -->
    <aside
      class="shrink-0 bg-muted overflow-y-auto scrollbar-none border-e border-muted"
      :class="compact ? 'w-[4.75rem]' : 'w-[4.75rem] md:w-56'"
      :aria-label="$t('دسته‌بندی‌های اصلی')"
    >
      <div
        v-if="pending && !menus.length"
        class="py-10 grid place-items-center"
      >
        <UIcon
          name="i-tabler-loader-2"
          class="size-6 text-muted animate-spin"
        />
      </div>

      <div
        v-else-if="loadError && !menus.length"
        class="p-3 text-center"
      >
        <p class="text-[10px] text-muted mb-2 leading-snug">
          {{ $t(loadError) }}
        </p>
        <UButton
          color="primary"
          variant="soft"
          size="xs"
          class="cursor-pointer"
          @click="fetchMegaMenu({ force: true })"
        >
          {{ $t('تلاش دوباره') }}
        </UButton>
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
            class="relative w-full flex flex-col items-center gap-1 px-1 py-3 text-center transition-all cursor-pointer md:(flex-row gap-3 px-4 py-3 text-start)"
            :class="menu.id === activeId
              ? 'bg-default text-primary font-semibold'
              : 'text-toned hover:(bg-elevated text-primary)'"
            @click="selectMenu(menu.id)"
          >
            <span
              v-if="menu.id === activeId"
              class="absolute inset-y-0 start-0 w-0.5 bg-primary md:hidden"
              aria-hidden="true"
            />
            <UIcon
              :name="menuIcon(menu)"
              class="shrink-0 transition"
              :class="[
                compact ? 'size-6' : 'size-6 md:size-5',
                menu.id === activeId ? 'text-primary' : 'text-dimmed',
              ]"
            />
            <span
              class="leading-tight line-clamp-2"
              :class="compact ? 'text-[10px] font-medium' : 'text-[10px] md:text-sm font-medium'"
            >
              {{ $t(menu.title) }}
            </span>
          </button>
        </li>
      </ul>
    </aside>

    <!-- Sections + items panel -->
    <div class="flex-1 min-w-0 bg-default overflow-y-auto scrollbar-none">
      <template v-if="activeMenu">
        <component
          :is="menuRootTo(activeMenu) ? NuxtLink : 'div'"
          v-bind="menuRootTo(activeMenu)
            ? {
                to: menuRootTo(activeMenu)!,
                external: isExternalMegaHref(menuRootTo(activeMenu)),
                target: isExternalMegaHref(menuRootTo(activeMenu)) ? '_blank' : undefined,
                rel: isExternalMegaHref(menuRootTo(activeMenu)) ? 'noopener' : undefined,
              }
            : {}"
          class="flex items-center gap-2 px-4 py-3.5 border-b border-muted text-sm font-bold text-default"
          :class="menuRootTo(activeMenu) ? 'hover:(bg-muted text-primary) transition cursor-pointer' : ''"
        >
          <span class="flex-1 text-start">
            {{ $t('همه محصولات') }} {{ $t(activeMenu.title) }}
          </span>
          <UIcon
            v-if="menuRootTo(activeMenu)"
            name="i-tabler-chevron-left"
            class="size-4 shrink-0 text-dimmed"
          />
        </component>

        <nav
          v-if="activeMenu.sections.length"
          class="flex flex-col"
          :aria-label="$t('زیردسته‌ها')"
        >
          <div
            v-for="section in activeMenu.sections"
            :key="section.id"
            class="border-b border-muted last:border-b-0"
          >
            <button
              type="button"
              class="w-full flex items-center gap-2 px-4 py-3.5 text-start text-sm font-medium text-default hover:bg-muted transition cursor-pointer"
              @click="toggleSub(section.id)"
            >
              <span class="flex-1">{{ $t(section.title) }}</span>
              <UIcon
                name="i-tabler-chevron-down"
                class="size-4 shrink-0 text-dimmed transition"
                :class="{ 'rotate-180': isSubExpanded(section.id) }"
              />
            </button>

            <div
              v-if="isSubExpanded(section.id)"
              class="pb-2 bg-muted/40"
            >
              <template v-if="section.sections.length">
                <TheNavbarMobileMenuSection
                  v-for="child in section.sections"
                  :key="child.id"
                  :section="child"
                />
              </template>
              <ul
                v-else-if="section.items.length"
                class="pb-1"
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
                    class="block px-4 py-2.5 ps-6 text-xs text-toned hover:(bg-muted text-primary) transition cursor-pointer"
                  >
                    {{ item.title }}
                  </NuxtLink>
                  <span
                    v-else
                    class="block px-4 py-2.5 ps-6 text-xs text-toned"
                  >
                    {{ item.title }}
                  </span>
                </li>
              </ul>
              <p
                v-else
                class="px-4 py-3 text-xs text-dimmed"
              >
                {{ $t('موردی برای نمایش نیست') }}
              </p>
            </div>
          </div>
        </nav>

        <div
          v-else
          class="px-4 py-8 text-center"
        >
          <p class="text-sm text-dimmed mb-4">
            {{ $t('زیردسته‌ای یافت نشد.') }}
          </p>
          <UButton
            v-if="menuRootTo(activeMenu)"
            :to="menuRootTo(activeMenu)!"
            :external="isExternalMegaHref(menuRootTo(activeMenu))"
            :target="isExternalMegaHref(menuRootTo(activeMenu)) ? '_blank' : undefined"
            color="primary"
            variant="soft"
            size="sm"
            class="cursor-pointer"
          >
            {{ $t('مشاهده محصولات') }}
          </UButton>
        </div>
      </template>

      <div
        v-else-if="!pending"
        class="px-4 py-10 text-center text-sm text-dimmed"
      >
        {{ $t('منویی برای نمایش وجود ندارد') }}
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
  type PublicMegaMenu,
  type PublicMegaMenuItem,
} from '~/data/mega-menu'
import { resolveSellerAdminIconName } from '~/data/seller-admin-icons'
import { getCategoryIcon } from '~/data/categories'

defineProps<{
  compact?: boolean
}>()

const {
  menus,
  pending,
  loadError,
  fetchMegaMenu,
  activeId,
  activeMenu,
  selectMenu,
  toggleSub,
  isSubExpanded,
} = useCategoryBrowser()

function menuIcon(menu: PublicMegaMenu) {
  if (menu.icon) return resolveSellerAdminIconName(menu.icon)
  return getCategoryIcon(menu.slug || menu.id)
}

function menuRootTo(menu: PublicMegaMenu | null | undefined) {
  if (!menu) return null
  return megaMenuRootToRoute(menu)
}

function itemTo(item: PublicMegaMenuItem) {
  return megaMenuItemToRoute(item)
}
</script>
