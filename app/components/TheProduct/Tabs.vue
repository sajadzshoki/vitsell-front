<template>
  <div class="md:bg-default md:rounded-3xl md:border md:border-muted">
    <nav
      class="sticky top-0 z-30 md:top-[7.25rem] border-b border-muted bg-default/95 backdrop-blur-md md:rounded-t-3xl"
      :aria-label="$t('بخش‌های محصول')"
    >
      <div class="flex overflow-x-auto gap-0 px-1 md:px-4 scrollbar-none">
        <button
          v-for="tab in tabItems"
          :key="tab.value"
          type="button"
          class="relative shrink-0 whitespace-nowrap font-medium px-2.5 py-2.5 text-[10px] md:(px-5 py-4 text-sm) cursor-pointer transition-all  text-muted hover:text-primary border-b-2 border-transparent"
          :class="activeTab === tab.value ? 'text-primary border-primary' : ''"
          :aria-current="activeTab === tab.value ? 'true' : undefined"
          @click="scrollToSection(tab.value)"
        >
          {{ tab.label }}
        </button>
      </div>
    </nav>

    <div class="p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6">
      <section
        v-for="(tab, index) in tabItems"
        :id="sectionId(tab.value)"
        :key="tab.value"
        :ref="el => setSectionRef(tab.value, el)"
        class="scroll-mt-14 md:scroll-mt-[9.5rem] rounded-2xl border border-muted bg-muted/40 overflow-hidden"
      >
        <div class="flex items-center gap-2.5 px-3.5 py-3 md:(px-5 py-4) border-b border-muted bg-elevated/60">
          <span
            class="size-8 md:size-9 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0"
          >
            <UIcon
              :name="tab.icon"
              class="size-4 md:size-5"
            />
          </span>
          <div class="min-w-0 flex-1">
            <h2 class="text-sm md:text-base font-bold text-highlighted">
              {{ tab.label }}
            </h2>
            <p
              v-if="tab.hint"
              class="text-[10px] md:text-xs text-muted mt-0.5 truncate"
            >
              {{ tab.hint }}
            </p>
          </div>
          <span class="text-[10px] md:text-xs text-dimmed num shrink-0">
            {{ (index + 1).toLocaleString('fa-IR') }} / {{ tabItems.length.toLocaleString('fa-IR') }}
          </span>
        </div>

        <div class="px-3.5 py-4 md:(px-5 py-5)">
          <TheProductTabsDesc
            v-if="tab.value === 'desc'"
            :product="product"
          />
          <TheProductTabsSpecs
            v-else-if="tab.value === 'specs'"
            :spec-groups="specGroups"
          />
          <TheProductTabsReviews
            v-else-if="tab.value === 'reviews'"
            :product="product"
          />
          <TheProductTabsQuestions
            v-else-if="tab.value === 'questions'"
            :product="product"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/data/products'

const props = defineProps<{
  product: Product
}>()

const activeTab = defineModel<string>({ default: 'desc' })

const { t } = useI18n()
const { specGroups } = useProductDetail(() => props.product)

const tabItems = computed(() => [
  {
    label: t('معرفی محصول'),
    value: 'desc',
    icon: 'i-tabler-file-text',
    hint: t('توضیحات، ویدیو و تصاویر'),
  },
  {
    label: t('مشخصات فنی'),
    value: 'specs',
    icon: 'i-tabler-list-details',
    hint: t('ویژگی‌ها و جزئیات فنی'),
  },
  {
    label: t('دیدگاه‌ها'),
    value: 'reviews',
    icon: 'i-tabler-message-star',
    hint: t('نظرات خریداران'),
  },
  {
    label: t('سؤالات و پاسخ‌ها'),
    value: 'questions',
    icon: 'i-tabler-message-question',
    hint: t('پرسش‌های کاربران'),
  },
])

function sectionId(value: string) {
  return `product-${value}`
}

const sectionEls = new Map<string, HTMLElement>()
let lockActiveFromScroll = false
let lockTimer: ReturnType<typeof setTimeout> | null = null
let skipWatchScroll = false

function setSectionRef(value: string, el: Element | ComponentPublicInstance | null) {
  if (el instanceof HTMLElement) {
    sectionEls.set(value, el)
    return
  }
  sectionEls.delete(value)
}

function lockScrollSync(ms = 900) {
  lockActiveFromScroll = true
  if (lockTimer) clearTimeout(lockTimer)
  lockTimer = setTimeout(() => {
    lockActiveFromScroll = false
  }, ms)
}

function scrollToSection(value: string) {
  const el = sectionEls.get(value) ?? document.getElementById(sectionId(value))
  if (!el) return

  skipWatchScroll = true
  activeTab.value = value
  nextTick(() => {
    skipWatchScroll = false
  })

  lockScrollSync()
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

watch(activeTab, (value, prev) => {
  if (!value || value === prev || skipWatchScroll || lockActiveFromScroll) return
  scrollToSection(value)
})

let observer: IntersectionObserver | null = null

function bindObserver() {
  observer?.disconnect()
  observer = new IntersectionObserver(
    (entries) => {
      if (lockActiveFromScroll) return
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
      const top = visible[0]
      if (!top?.target?.id) return
      const value = top.target.id.replace(/^product-/, '')
      if (!value || activeTab.value === value) return
      skipWatchScroll = true
      activeTab.value = value
      nextTick(() => {
        skipWatchScroll = false
      })
    },
    {
      rootMargin: '-18% 0px -55% 0px',
      threshold: [0.12, 0.3, 0.55],
    },
  )

  for (const tab of tabItems.value) {
    const el = sectionEls.get(tab.value) ?? document.getElementById(sectionId(tab.value))
    if (el) observer.observe(el)
  }
}

onMounted(() => {
  nextTick(bindObserver)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  if (lockTimer) clearTimeout(lockTimer)
})
</script>
