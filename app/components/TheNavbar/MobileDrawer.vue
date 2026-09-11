<template>
  <UDrawer
    v-model:open="open"
    direction="right"
    :title="$t('دسته‌بندی کالاها')"
    :handle="false"
    close
    :ui="{ content: 'max-w-sm w-[80vw]' }"
  >
    <button
      type="button"
      class="size-11 grid place-items-center rounded-xl text-toned hover:bg-elevated transition cursor-pointer"
      :aria-label="$t('دسته‌بندی کالاها')"
    >
      <UIcon
        name="i-tabler-menu-2"
        class="size-5"
      />
    </button>

    <template #body>
      <nav class="flex flex-col -mx-4">
        <NuxtLink
          v-if="isAdmin"
          to="/seller"
          class="flex items-center gap-3 px-4 py-3.5 text-start border-b border-muted hover:bg-muted transition cursor-pointer"
          @click="open = false"
        >
          <UIcon
            name="i-tabler-settings"
            class="size-5 text-primary shrink-0"
          />
          <span class="flex-1 text-sm font-medium text-primary">{{ $t('پنل مدیریت') }}</span>
          <UIcon
            name="i-tabler-chevron-left"
            class="size-4 text-dimmed shrink-0"
          />
        </NuxtLink>

        <div
          v-if="pending && !menus.length"
          class="py-12 grid place-items-center"
        >
          <UIcon
            name="i-tabler-loader-2"
            class="size-7 text-muted animate-spin"
          />
        </div>

        <div
          v-else-if="loadError && !menus.length"
          class="px-4 py-8 text-center"
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
          class="px-4 py-8 text-sm text-dimmed text-center"
        >
          {{ $t('منویی برای نمایش وجود ندارد') }}
        </div>

        <div
          v-for="menu in menus"
          :key="menu.id"
          class="border-b border-muted"
        >
          <div class="flex items-center">
            <NuxtLink
              v-if="menuRootTo(menu)"
              :to="menuRootTo(menu)!"
              :external="isExternalMegaHref(menuRootTo(menu))"
              :target="isExternalMegaHref(menuRootTo(menu)) ? '_blank' : undefined"
              rel="noopener"
              class="flex flex-1 items-center gap-3 px-4 py-3.5 text-start hover:bg-muted transition min-w-0 cursor-pointer"
              @click="open = false"
            >
              <UIcon
                :name="menuIcon(menu)"
                class="size-5 text-muted shrink-0"
              />
              <span class="flex-1 text-sm font-medium text-default truncate">{{ $t(menu.title) }}</span>
            </NuxtLink>
            <button
              v-else
              type="button"
              class="flex flex-1 items-center gap-3 px-4 py-3.5 text-start hover:bg-muted transition min-w-0 cursor-pointer"
              @click="toggle(menu.id)"
            >
              <UIcon
                :name="menuIcon(menu)"
                class="size-5 text-muted shrink-0"
              />
              <span class="flex-1 text-sm font-medium text-default truncate">{{ $t(menu.title) }}</span>
            </button>
            <button
              v-if="menu.sections.length"
              type="button"
              class="size-11 shrink-0 grid place-items-center text-dimmed hover:bg-muted transition cursor-pointer"
              :aria-label="$t('زیردسته‌ها')"
              @click="toggle(menu.id)"
            >
              <UIcon
                name="i-tabler-chevron-down"
                class="size-4 transition"
                :class="{ 'rotate-180': expanded === menu.id }"
              />
            </button>
          </div>

          <div
            v-if="expanded === menu.id && menu.sections.length"
            class="bg-muted/60 pb-2"
          >
            <TheNavbarMobileMenuSection
              v-for="section in menu.sections"
              :key="section.id"
              :section="section"
              @navigate="open = false"
            />
          </div>
        </div>
      </nav>
    </template>
  </UDrawer>
</template>

<script setup lang="ts">
import {
  isExternalMegaHref,
  megaMenuRootToRoute,
  type PublicMegaMenu,
} from '~/data/mega-menu'
import { resolveSellerAdminIconName } from '~/data/seller-admin-icons'
import { getCategoryIcon } from '~/data/categories'

const open = defineModel<boolean>('open', { default: false })
const expanded = ref('')

const { menus, pending, loadError, fetchMegaMenu } = useMegaMenu()
const { profile, profileLoaded, fetchProfile } = useAccount()
const { isLoggedIn } = useShop()

const isAdmin = computed(() => profile.value.role === 'admin')

await fetchMegaMenu()

watch(open, async (v) => {
  if (v && isLoggedIn.value && !profileLoaded.value) {
    await fetchProfile()
  }
})

const route = useRoute()
watch(() => route.fullPath, () => {
  open.value = false
})

function toggle(id: string) {
  expanded.value = expanded.value === id ? '' : id
}

function menuIcon(menu: PublicMegaMenu) {
  if (menu.icon) return resolveSellerAdminIconName(menu.icon)
  return getCategoryIcon(menu.slug || menu.id)
}

function menuRootTo(menu: PublicMegaMenu) {
  return megaMenuRootToRoute(menu)
}
</script>
