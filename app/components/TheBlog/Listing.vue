<template>
  <div class="flex flex-col gap-6 md:gap-8">
    <!-- Hero -->
    <section
      class="w-screen max-w-[100vw] ms-[calc(50%-50vw)] -mt-2 md:-mt-4 bg-elevated"
    >
      <div class="mx-auto max-w-8xl w-full px-3 sm:px-4 lg:px-6 py-8 md:py-12 flex flex-col items-center text-center gap-4">
        <nav class="w-full text-xs text-muted flex items-center justify-start gap-2 flex-wrap">
          <NuxtLink
            to="/"
            class="hover:text-primary transition-all  cursor-pointer"
          >
            {{ $t('خانه') }}
          </NuxtLink>
          <span class="text-dimmed">/</span>
          <span class="text-toned">{{ $t('بلاگ') }}</span>
        </nav>

        <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold text-highlighted leading-tight">
          {{ $t('بلاگ ویتسل') }}
        </h1>
        <p class="text-sm md:text-base text-muted leading-8 max-w-2xl">
          {{ $t('راهنمای خرید، بررسی محصولات و تازه‌ترین اخبار دنیای تکنولوژی؛ هوشمندانه‌تر انتخاب کنید.') }}
        </p>

        <form
          class="w-full max-w-xl mt-1"
          @submit.prevent="submitSearch"
        >
          <div class="flex items-stretch rounded-xl border border-muted bg-default overflow-hidden focus-within:border-primary/50 transition">
            <div class="flex items-center flex-1 min-w-0 gap-2 ps-3.5 pe-2">
              <UIcon
                name="i-tabler-search"
                class="size-5 text-dimmed shrink-0"
              />
              <input
                v-model="searchDraft"
                type="search"
                class="flex-1 min-w-0 h-11 bg-transparent border-none outline-none text-sm text-default placeholder:text-dimmed"
                :placeholder="$t('جستجو در مطالب بلاگ...')"
                autocomplete="off"
              >
            </div>
            <UButton
              type="submit"
              color="primary"
              size="md"
              class="rounded-none rounded-s-xl px-5 shrink-0 cursor-pointer"
            >
              {{ $t('جستجو') }}
            </UButton>
          </div>
        </form>
      </div>
    </section>

    <!-- Latest -->
    <section
      v-if="showLatest"
      class="flex flex-col gap-5"
    >
      <h2 class="text-lg md:text-xl font-bold text-highlighted text-start">
        {{ $t('آخرین‌های ویتسل') }}
      </h2>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">
        <div class="lg:col-span-5">
          <TheBlogPostCard
            v-if="featuredPost"
            :post="featuredPost"
            variant="featured"
          />
        </div>
        <div class="lg:col-span-7 flex flex-col gap-4">
          <TheBlogPostCard
            v-for="post in sidePosts"
            :key="post.id"
            :post="post"
            variant="side"
          />
        </div>
      </div>
    </section>

    <!-- Articles -->
    <section class="flex flex-col gap-5">
      <h2 class="text-lg md:text-xl font-bold text-highlighted text-start">
        {{ $t('مقالات') }}
      </h2>

      <div class="flex items-stretch gap-2 overflow-x-auto scrollbar-none pb-1 -mx-1 px-1">
        <button
          type="button"
          class="shrink-0 px-4 py-2 rounded-full border text-sm font-medium transition-all  cursor-pointer"
          :class="!selectedCategory
            ? 'border-primary bg-primary text-inverted'
            : 'border-muted bg-default text-toned hover:(border-primary/40 bg-primary/5 text-primary)'"
          @click="clearCategory"
        >
          {{ $t('همه') }}
        </button>
        <button
          v-for="chip in chips"
          :key="chip.id"
          type="button"
          class="shrink-0 px-4 py-2 rounded-full border text-sm font-medium transition-all  cursor-pointer"
          :class="selectedCategory === chip.id
            ? 'border-primary bg-primary text-inverted'
            : 'border-muted bg-default text-toned hover:(border-primary/40 bg-primary/5 text-primary)'"
          @click="selectCategory(chip.id)"
        >
          {{ $t(chip.label) }}
        </button>
      </div>

      <div
        v-if="!pagePosts.length && (selectedCategory || searchQuery)"
        class="text-center py-16 border border-muted rounded-2xl"
      >
        <UIcon
          name="i-tabler-article-off"
          class="size-14 text-dimmed mx-auto mb-4"
        />
        <p class="text-sm text-muted mb-4">
          {{ searchQuery ? $t('مطلبی با این جستجو پیدا نشد') : $t('مطلبی در این دسته پیدا نشد') }}
        </p>
        <UButton
          color="primary"
          variant="soft"
          class="cursor-pointer"
          @click="resetFilters"
        >
          {{ $t('مشاهده همه مطالب') }}
        </UButton>
      </div>

      <template v-else-if="pagePosts.length">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
          <TheBlogPostCard
            v-for="post in pagePosts"
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
    </section>
  </div>
</template>

<script setup lang="ts">
import {
  blogCategoryChips,
  blogPageSize,
  collectBlogCategories,
  toStaticBlogPost,
} from '~/data/seller-blog'

const LATEST_COUNT = 4

const route = useRoute()
const router = useRouter()
const { publishedPosts, ensureLoaded } = useBlog()

await ensureLoaded()

const selectedCategory = computed(() => {
  const raw = route.query.category
  const value = Array.isArray(raw) ? raw[0] : raw
  return typeof value === 'string' && value.trim() ? value.trim() : ''
})

const searchQuery = computed(() => {
  const raw = route.query.q
  const value = Array.isArray(raw) ? raw[0] : raw
  return typeof value === 'string' ? value.trim() : ''
})

const page = computed(() => {
  const raw = route.query.page
  const value = Array.isArray(raw) ? raw[0] : raw
  const n = Number.parseInt(String(value || '1'), 10)
  return Number.isFinite(n) && n > 0 ? n : 1
})

const searchDraft = ref(searchQuery.value)
watch(searchQuery, (q) => {
  searchDraft.value = q
})

const allPosts = computed(() => publishedPosts.value.map(toStaticBlogPost))

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

const showLatest = computed(() =>
  !selectedCategory.value && !searchQuery.value && page.value === 1 && allPosts.value.length > 0,
)

const latestPosts = computed(() => allPosts.value.slice(0, LATEST_COUNT))
const featuredPost = computed(() => latestPosts.value[0] ?? null)
const sidePosts = computed(() => latestPosts.value.slice(1, LATEST_COUNT))

const filtered = computed(() => {
  let list = allPosts.value

  if (selectedCategory.value) {
    list = list.filter(p => p.category === selectedCategory.value)
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter((p) => {
      const hay = [p.title, p.excerpt, p.category, p.author].join(' ').toLowerCase()
      return hay.includes(q)
    })
  }

  // On default first page, articles exclude the latest block posts
  if (showLatest.value) {
    const latestIds = new Set(latestPosts.value.map(p => p.id))
    list = list.filter(p => !latestIds.has(p.id))
  }

  return list
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filtered.value.length / blogPageSize)),
)

const pagePosts = computed(() => {
  const start = (page.value - 1) * blogPageSize
  return filtered.value.slice(start, start + blogPageSize)
})

function pushBlogQuery(next: { category?: string, q?: string, page?: number }) {
  const query: Record<string, string> = {}
  const category = next.category ?? selectedCategory.value
  const q = next.q !== undefined ? next.q : searchQuery.value
  const pageNum = next.page ?? 1
  if (category) query.category = category
  if (q) query.q = q
  if (pageNum > 1) query.page = String(pageNum)
  void router.push({ path: '/blog', query })
}

function selectCategory(id: string) {
  pushBlogQuery({ category: id, page: 1 })
}

function clearCategory() {
  pushBlogQuery({ category: '', page: 1 })
}

function submitSearch() {
  pushBlogQuery({ q: searchDraft.value.trim(), page: 1 })
}

function resetFilters() {
  searchDraft.value = ''
  void router.push({ path: '/blog' })
}

function goPage(n: number) {
  pushBlogQuery({ page: n })
  if (import.meta.client) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}
</script>
