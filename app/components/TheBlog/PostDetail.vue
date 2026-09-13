<template>
  <article class="flex flex-col gap-5 md:gap-6">
    <nav class="text-xs text-muted flex items-center gap-2 flex-wrap">
      <NuxtLink
        to="/"
        class="hover:text-primary transition cursor-pointer"
      >
        {{ $t('خانه') }}
      </NuxtLink>
      <span class="text-dimmed">/</span>
      <NuxtLink
        :to="blogIndexPath"
        class="hover:text-primary transition cursor-pointer"
      >
        {{ $t('بلاگ') }}
      </NuxtLink>
      <span class="text-dimmed">/</span>
      <span class="text-toned line-clamp-1">
        {{ $t(post.title) }}
      </span>
    </nav>

    <div class="flex items-start justify-between gap-4">
      <h1 class="text-xl sm:text-2xl md:text-3xl font-bold text-highlighted leading-9 md:leading-10 text-start flex-1 min-w-0">
        {{ $t(post.title) }}
      </h1>

      <div class="flex items-center gap-1 shrink-0 -mt-0.5">
        <UButton
          color="neutral"
          variant="ghost"
          size="md"
          square
          icon="i-tabler-share"
          class="cursor-pointer"
          :aria-label="$t('اشتراک‌گذاری')"
          @click="onShare"
        />
        <UButton
          color="neutral"
          variant="ghost"
          size="md"
          square
          :icon="bookmarked ? 'i-tabler-bookmark-filled' : 'i-tabler-bookmark'"
          class="cursor-pointer"
          :class="bookmarked ? 'text-primary' : ''"
          :aria-label="bookmarked ? $t('حذف از نشان‌شده‌ها') : $t('نشان کردن')"
          @click="toggleBookmark"
        />
      </div>
    </div>

    <div class="relative w-full aspect-[16/9] md:aspect-[2.7/1] rounded-2xl bg-muted overflow-hidden">
      <img
        v-if="post.image"
        :src="post.image"
        :alt="$t(post.title)"
        class="size-full object-cover"
      >
      <div
        v-else
        class="size-full grid place-items-center"
      >
        <TheIcon
          icon-type="img"
          name="noImage.png"
          class="size-16 opacity-60"
        />
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 pt-2 md:pt-4">
      <!-- Main article (RTL start = right) -->
      <div class="lg:col-span-8 xl:col-span-9 min-w-0 flex flex-col gap-5">
        <div class="flex items-center gap-2 flex-wrap text-[11px] text-dimmed">
          <NuxtLink
            :to="{ path: blogIndexPath, query: { category: post.category } }"
            class="font-medium text-primary hover:text-primary/80 transition cursor-pointer"
          >
            {{ $t(post.category) }}
          </NuxtLink>
          <span v-if="post.date">·</span>
          <time
            v-if="post.date"
            class="num"
          >
            {{ $t(post.date) }}
          </time>
          <span v-if="post.readTime">·</span>
          <span v-if="post.readTime">
            {{ $t('مطالعه') }} {{ $t(post.readTime) }}
          </span>
        </div>

        <p
          v-if="post.excerpt"
          class="text-sm md:text-base text-toned leading-8"
        >
          {{ $t(post.excerpt) }}
        </p>

        <div
          v-if="isRichContent"
          class="blog-prose text-sm md:text-base text-toned leading-8"
          v-html="safeHtml"
        />
        <div
          v-else
          class="flex flex-col gap-4 text-sm md:text-base text-toned leading-8"
        >
          <p
            v-for="(paragraph, index) in post.content"
            :key="index"
          >
            {{ $t(paragraph) }}
          </p>
        </div>

        <div
          v-if="post.highlights?.length"
          class="mt-2 p-4 md:p-5 rounded-xl bg-muted/40 border border-muted"
        >
          <h2 class="text-sm font-bold text-highlighted mb-3 flex items-center gap-2">
            <UIcon
              name="i-tabler-list-check"
              class="size-4 text-primary"
            />
            {{ $t('نکات کلیدی') }}
          </h2>
          <ul class="flex flex-col gap-2.5">
            <li
              v-for="(item, index) in post.highlights"
              :key="index"
              class="flex items-start gap-2.5 text-sm text-toned leading-7"
            >
              <UIcon
                name="i-tabler-circle-check"
                class="size-4 text-primary shrink-0 mt-1"
              />
              <span>{{ $t(item) }}</span>
            </li>
          </ul>
        </div>

        <div
          v-if="categoryLinks.length"
          class="flex flex-wrap items-center gap-2"
        >
          <span class="text-xs text-muted">
            {{ $t('دسته‌های مرتبط') }}:
          </span>
          <UButton
            v-for="cat in categoryLinks"
            :key="cat.id"
            :to="toSearchRoute({ category: cat.id })"
            color="primary"
            variant="soft"
            size="xs"
            class="cursor-pointer"
          >
            {{ $t(cat.name) }}
          </UButton>
        </div>
      </div>

      <!-- Sidebar related (RTL end = left) -->
      <aside
        v-if="morePosts.length"
        class="lg:col-span-4 xl:col-span-3"
      >
        <div class="lg:sticky lg:top-28 flex flex-col border-s border-muted ps-4 md:ps-5">
          <h2 class="text-sm font-bold text-highlighted mb-3">
            {{ $t('مطالب مرتبط') }}
          </h2>
          <ul class="flex flex-col">
            <li
              v-for="(item, index) in morePosts"
              :key="item.id"
            >
              <NuxtLink
                :to="getBlogPostPath(item.id)"
                class="block py-2.5 text-sm leading-6 transition cursor-pointer border-s-2 -ms-4 md:-ms-5 ps-4 md:ps-5"
                :class="index === 0
                  ? 'border-primary text-highlighted font-medium'
                  : 'border-transparent text-muted hover:(text-primary border-primary/40)'"
              >
                {{ $t(item.title) }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </aside>
    </div>
  </article>
</template>

<script setup lang="ts">
import { getCategoryById, toSearchRoute } from '~/data/categories'
import {
  contentToHtml,
  isRichBlogContent,
  sanitizeBlogHtml,
} from '~/data/seller-blog'
import {
  getBlogPostPath,
  staticPagePaths,
  type StaticBlogPost,
} from '~/data/static-pages'

const BOOKMARK_KEY = 'vitsell-blog-bookmarks'

const props = defineProps<{
  post: StaticBlogPost
  morePosts?: StaticBlogPost[]
}>()

const { t } = useI18n()
const toast = useToast()

const blogIndexPath = staticPagePaths.blog
const morePosts = computed(() => props.morePosts ?? [])

const isRichContent = computed(() => isRichBlogContent(props.post.content ?? []))

const safeHtml = computed(() =>
  sanitizeBlogHtml(contentToHtml(props.post.content ?? [])),
)

const categoryLinks = computed(() =>
  (props.post.relatedCategories ?? [])
    .map(id => getCategoryById(id))
    .filter((cat): cat is NonNullable<typeof cat> => Boolean(cat)),
)

const bookmarked = ref(false)

function readBookmarks(): string[] {
  if (!import.meta.client) return []
  try {
    const raw = localStorage.getItem(BOOKMARK_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.map(String) : []
  }
  catch {
    return []
  }
}

function writeBookmarks(ids: string[]) {
  if (!import.meta.client) return
  localStorage.setItem(BOOKMARK_KEY, JSON.stringify(ids))
}

function syncBookmark() {
  bookmarked.value = readBookmarks().includes(props.post.id)
}

function toggleBookmark() {
  const ids = new Set(readBookmarks())
  if (ids.has(props.post.id)) {
    ids.delete(props.post.id)
    bookmarked.value = false
    toast.add({ title: t('از نشان‌شده‌ها حذف شد'), color: 'neutral' })
  }
  else {
    ids.add(props.post.id)
    bookmarked.value = true
    toast.add({ title: t('نشان شد'), color: 'primary' })
  }
  writeBookmarks([...ids])
}

async function onShare() {
  const url = import.meta.client ? window.location.href : ''
  if (!url) return
  if (navigator.share) {
    try {
      await navigator.share({
        title: props.post.title,
        text: props.post.excerpt,
        url,
      })
      return
    }
    catch {
      // cancelled
    }
  }
  try {
    await navigator.clipboard.writeText(url)
    toast.add({ title: t('لینک کپی شد'), color: 'success' })
  }
  catch {
    toast.add({ title: t('کپی لینک ممکن نشد'), color: 'error' })
  }
}

onMounted(syncBookmark)
watch(() => props.post.id, syncBookmark)
</script>
