<template>
  <div class="flex flex-col gap-6 md:gap-8">
    <!-- Hero -->
    <section class="relative overflow-hidden rounded-2xl border border-muted bg-elevated">
      <div class="absolute inset-0 bg-gradient-to-bl from-primary/15 via-transparent to-secondary/10 pointer-events-none" />
      <div class="relative px-5 py-8 sm:(px-8 py-10) md:py-12 flex flex-col gap-4 max-w-3xl">
        <nav class="text-xs text-muted flex items-center gap-2 flex-wrap">
          <NuxtLink
            to="/"
            class="hover:text-primary transition cursor-pointer"
          >
            {{ $t('خانه') }}
          </NuxtLink>
          <span class="text-dimmed">/</span>
          <span class="text-toned">{{ $t('بلاگ') }}</span>
        </nav>

        <div class="inline-flex items-center gap-2 text-primary">
          <UIcon
            name="i-tabler-news"
            class="size-5"
          />
          <span class="text-xs font-medium">{{ $t('مجله دیجی‌شاپ') }}</span>
        </div>

        <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold text-highlighted leading-tight">
          {{ $t('بلاگ دیجی‌شاپ') }}
        </h1>
        <p class="text-sm md:text-base text-toned leading-8">
          {{ $t('راهنمای خرید، بررسی محصول و اخبار دنیای تکنولوژی — قبل از خرید، هوشمندانه بخوانید.') }}
        </p>

        <div class="flex flex-wrap items-center gap-3 pt-1">
          <div class="text-xs text-muted num">
            {{ publishedCount.toLocaleString('fa-IR') }} {{ $t('مطلب منتشر شده') }}
          </div>
          <span class="text-dimmed">·</span>
          <div class="text-xs text-muted">
            {{ $t('دسته‌بندی‌ها') }}:
            {{ categoryCount.toLocaleString('fa-IR') }}
          </div>
        </div>
      </div>
    </section>

    <!-- Category chips -->
    <section class="flex flex-col gap-3">
      <div class="flex items-center justify-between gap-3">
        <h2 class="text-sm font-bold text-highlighted">
          {{ $t('موضوعات') }}
        </h2>
        <UButton
          v-if="selectedCategory"
          color="neutral"
          variant="ghost"
          size="xs"
          icon="i-tabler-x"
          class="cursor-pointer"
          @click="clearCategory"
        >
          {{ $t('پاک کردن فیلتر') }}
        </UButton>
      </div>

      <div class="flex items-stretch gap-2 overflow-x-auto scrollbar-none pb-1 -mx-1 px-1">
        <button
          type="button"
          class="shrink-0 px-4 py-2.5 rounded-xl border text-sm font-medium transition cursor-pointer"
          :class="!selectedCategory
            ? 'border-primary bg-primary/10 text-primary'
            : 'border-muted bg-default text-toned hover:(border-primary/40 bg-primary/5 text-primary)'"
          @click="clearCategory"
        >
          {{ $t('همه') }}
        </button>
        <button
          v-for="chip in chips"
          :key="chip.id"
          type="button"
          class="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition cursor-pointer"
          :class="selectedCategory === chip.id
            ? 'border-primary bg-primary/10 text-primary'
            : 'border-muted bg-default text-toned hover:(border-primary/40 bg-primary/5 text-primary)'"
          @click="selectCategory(chip.id)"
        >
          <UIcon
            :name="chip.icon"
            class="size-4 shrink-0"
          />
          <span>{{ $t(chip.label) }}</span>
        </button>
      </div>
    </section>

    <!-- Category promo cards (reference-style) -->
    <section
      v-if="!selectedCategory"
      class="grid grid-cols-1 sm:grid-cols-3 gap-3"
    >
      <button
        v-for="chip in promoChips"
        :key="`promo-${chip.id}`"
        type="button"
        class="group text-start rounded-2xl border border-muted bg-muted/60 p-4 md:p-5 transition cursor-pointer hover:(border-primary/40 bg-primary/5)"
        @click="selectCategory(chip.id)"
      >
        <div class="size-10 rounded-xl bg-primary/10 text-primary grid place-items-center mb-3 transition group-hover:bg-primary group-hover:text-inverted">
          <UIcon
            :name="chip.icon"
            class="size-5"
          />
        </div>
        <h3 class="text-sm font-bold text-highlighted mb-1">
          {{ $t(chip.label) }}
        </h3>
        <p class="text-xs text-muted leading-6">
          {{ $t(chip.subtitle) }}
        </p>
      </button>
    </section>

    <!-- Empty -->
    <div
      v-if="!pagePosts.length"
      class="text-center py-16 bg-default border border-muted rounded-2xl"
    >
      <UIcon
        name="i-tabler-article-off"
        class="size-14 text-dimmed mx-auto mb-4"
      />
      <p class="text-sm text-muted mb-4">
        {{ $t('مطلبی در این دسته پیدا نشد') }}
      </p>
      <UButton
        color="primary"
        variant="soft"
        class="cursor-pointer"
        @click="clearCategory"
      >
        {{ $t('مشاهده همه مطالب') }}
      </UButton>
    </div>

    <!-- Posts -->
    <template v-else>
      <TheBlogPostCard
        v-if="featuredPost && page === 1 && !selectedCategory"
        :post="featuredPost"
        featured
      />

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <TheBlogPostCard
          v-for="post in gridPosts"
          :key="post.id"
          :post="post"
        />
      </div>

      <div
        v-if="totalPages > 1"
        class="flex items-center justify-center gap-2 flex-wrap pt-2"
      >
        <UButton
          color="neutral"
          variant="soft"
          size="sm"
          icon="i-tabler-chevron-right"
          class="cursor-pointer"
          :disabled="page <= 1"
          @click="goPage(page - 1)"
        >
          {{ $t('قبلی') }}
        </UButton>
        <div class="flex items-center gap-1">
          <UButton
            v-for="n in totalPages"
            :key="n"
            :color="n === page ? 'primary' : 'neutral'"
            :variant="n === page ? 'solid' : 'ghost'"
            size="sm"
            class="cursor-pointer min-w-9 num"
            @click="goPage(n)"
          >
            {{ n.toLocaleString('fa-IR') }}
          </UButton>
        </div>
        <UButton
          color="neutral"
          variant="soft"
          size="sm"
          trailing-icon="i-tabler-chevron-left"
          class="cursor-pointer"
          :disabled="page >= totalPages"
          @click="goPage(page + 1)"
        >
          {{ $t('بعدی') }}
        </UButton>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import {
  blogCategoryChips,
  blogPageSize,
  collectBlogCategories,
  toStaticBlogPost,
} from '~/data/seller-blog'

const route = useRoute()
const router = useRouter()
const { publishedPosts, ensureLoaded } = useBlog()

await ensureLoaded()

const selectedCategory = computed(() => {
  const raw = route.query.category
  const value = Array.isArray(raw) ? raw[0] : raw
  return typeof value === 'string' && value.trim() ? value.trim() : ''
})

const page = computed(() => {
  const raw = route.query.page
  const value = Array.isArray(raw) ? raw[0] : raw
  const n = Number.parseInt(String(value || '1'), 10)
  return Number.isFinite(n) && n > 0 ? n : 1
})

const chips = computed(() => {
  const known = new Map(blogCategoryChips.map(c => [c.id, c]))
  return collectBlogCategories(publishedPosts.value).map((id) => {
    const chip = known.get(id)
    return chip ?? {
      id,
      label: id,
      icon: 'i-tabler-tag',
      subtitle: '',
    }
  })
})

const promoChips = computed(() => blogCategoryChips.slice(0, 3))

const filtered = computed(() => {
  const list = publishedPosts.value.map(toStaticBlogPost)
  if (!selectedCategory.value) return list
  return list.filter(p => p.category === selectedCategory.value)
})

const publishedCount = computed(() => publishedPosts.value.length)
const categoryCount = computed(() => collectBlogCategories(publishedPosts.value).length)

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filtered.value.length / blogPageSize)),
)

const pagePosts = computed(() => {
  const start = (page.value - 1) * blogPageSize
  return filtered.value.slice(start, start + blogPageSize)
})

const featuredPost = computed(() => {
  if (selectedCategory.value || page.value !== 1) return null
  const popular = pagePosts.value.find(p => p.popular)
  return popular ?? pagePosts.value[0] ?? null
})

const gridPosts = computed(() => {
  if (!featuredPost.value) return pagePosts.value
  return pagePosts.value.filter(p => p.id !== featuredPost.value!.id)
})

function selectCategory(id: string) {
  void router.push({
    path: '/blog',
    query: { category: id },
  })
}

function clearCategory() {
  void router.push({ path: '/blog' })
}

function goPage(n: number) {
  const query: Record<string, string> = {}
  if (selectedCategory.value) query.category = selectedCategory.value
  if (n > 1) query.page = String(n)
  void router.push({ path: '/blog', query })
  if (import.meta.client) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}
</script>
