<template>
  <div
    ref="megaRef"
    class="relative"
    @mouseenter="megaOpen = true"
    @mouseleave="megaOpen = false"
  >
    <NuxtLink
      to="/category"
      class="inline-flex items-center gap-1.5 text-xs md:text-sm text-toned hover:text-primary transition whitespace-nowrap py-1"
      @click="close"
    >
      <UIcon name="i-tabler-menu-2" class="size-4 shrink-0" />
      <span>{{ $t('دسته بندی محصولات') }}</span>
      <UIcon
        name="i-tabler-chevron-down"
        class="size-3.5 text-dimmed transition-transform"
        :class="{ 'rotate-180': megaOpen }"
      />
    </NuxtLink>

    <!-- digi-clone: absolute top-full right-0 → in RTL use start-0 so panel grows toward end -->
    <div
      v-if="megaOpen"
      class="absolute top-full start-0 mt-1 w-[min(800px,90vw)] bg-default border border-muted rounded-3xl shadow-2xl overflow-hidden flex z-50 min-h-[25rem]"
    >
      <div class="w-1/3 bg-muted py-3 border-e border-muted">
        <button
          v-for="c in categories"
          :key="c.id"
          type="button"
          class="w-full flex items-center gap-3 px-5 py-3 text-sm text-start transition"
          :class="activeCat === c.id
            ? 'bg-default text-primary font-bold shadow-sm'
            : 'text-toned hover:bg-elevated'"
          @mouseenter="activeCat = c.id"
          @click="goCategory(c.id)"
        >
          <UIcon :name="getCategoryIcon(c.id)" class="size-5 shrink-0" />
          {{ $t(c.name) }}
        </button>
      </div>

      <div class="w-2/3 p-6 bg-default">
        <div class="flex items-center justify-between mb-6 pb-3 border-b border-muted">
          <h3 class="font-bold text-highlighted text-lg">
            {{ $t(activeCategory?.name || '') }}
          </h3>
          <span class="text-xs text-muted">
            {{ $t('یک زیردسته را انتخاب کنید') }}
          </span>
          <UButton
            color="primary"
            variant="link"
            size="xs"
            trailing-icon="i-tabler-arrow-left"
            class="font-bold shrink-0"
            @click="goCategory(activeCat)"
          >
            {{ $t('صفحه دسته') }}
          </UButton>
        </div>

        <div
          v-if="activeCategory?.subs?.length"
          class="grid grid-cols-2 gap-x-8 gap-y-6"
        >
          <div v-for="sub in activeCategory.subs" :key="sub.name">
            <h4 class="font-bold text-default text-sm mb-3 flex items-center gap-2">
              <span class="size-1.5 rounded-full bg-primary shrink-0" />
              {{ $t(sub.name) }}
            </h4>
            <ul class="space-y-2.5">
              <li v-for="item in sub.items" :key="item">
                <button
                  type="button"
                  class="text-xs text-muted hover:text-primary transition text-start"
                  @click="goSearch(item)"
                >
                  {{ item }}
                </button>
              </li>
            </ul>
          </div>
        </div>
        <div v-else class="text-sm text-dimmed py-10">
          {{ $t('زیردسته‌ای یافت نشد.') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { categories, getCategoryIcon, toCategoryRoute, toSearchRoute } from '~/data/categories'

const megaOpen = ref(false)
const megaRef = ref<HTMLElement | null>(null)
const activeCat = ref(categories[0]!.id)

const activeCategory = computed(() =>
  categories.find(c => c.id === activeCat.value),
)

function close() {
  megaOpen.value = false
}

function goCategory(id: string) {
  navigateTo(toCategoryRoute(id))
  close()
}

function goSearch(q: string) {
  navigateTo(toSearchRoute({ q, category: activeCat.value }))
  close()
}

onClickOutside(megaRef, close)

const { y } = useWindowScroll()
watch(y, () => {
  if (megaOpen.value) close()
})
</script>
