<template>
  <main class="w-full py-2 md:py-4">
    <template v-if="pending && !page">
      <USkeleton class="h-4 w-40 mb-4 rounded-lg" />
      <div class="bg-default border border-muted rounded-2xl p-5 mb-5 flex items-center gap-4">
        <USkeleton class="size-12 rounded-2xl shrink-0" />
        <div class="flex-1 min-w-0 space-y-2">
          <USkeleton class="h-5 w-48 rounded-lg" />
          <USkeleton class="h-3 w-64 rounded-lg" />
        </div>
      </div>
      <USkeleton class="h-72 rounded-2xl" />
    </template>

    <template v-else-if="page">
      <nav class="text-xs text-muted flex items-center gap-2 mb-4 flex-wrap">
        <NuxtLink to="/" class="hover:text-primary transition">
          {{ $t('خانه') }}
        </NuxtLink>
        <span class="text-dimmed">/</span>
        <span class="text-toned">{{ $t(page.title) }}</span>
      </nav>

      <div class="bg-default border border-muted rounded-2xl p-5 mb-5 flex items-center gap-4">
        <div class="size-12 rounded-2xl bg-primary/10 text-primary grid place-items-center shrink-0">
          <UIcon :name="page.icon" class="size-6" />
        </div>
        <div class="flex-1 min-w-0">
          <h1 class="text-lg font-bold text-highlighted">
            {{ $t(page.title) }}
          </h1>
          <p class="text-xs text-muted mt-1">
            {{ $t(page.subtitle) }}
          </p>
        </div>
      </div>

      <div class="flex flex-col gap-5">
        <template
          v-for="(section, index) in page.sections"
          :key="index"
        >
          <TheStaticContactSection
            v-if="section.type === 'contact-block'"
            :items="section.items"
          />

          <TheStaticFaqSection
            v-else-if="section.type === 'faq'"
            :categories="section.categories"
            :items="section.items"
          />

          <section
            v-else
            class="bg-default border border-muted rounded-2xl p-5 md:p-6"
          >
            <div
              v-if="section.type === 'stats'"
              class="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              <div
                v-for="(stat, sIndex) in section.items"
                :key="sIndex"
                class="flex flex-col items-center text-center p-4 rounded-xl bg-muted/40 border border-muted"
              >
                <div class="size-10 rounded-xl bg-primary/10 text-primary grid place-items-center mb-2">
                  <UIcon :name="stat.icon" class="size-5" />
                </div>
                <div class="text-xl font-black text-highlighted num">
                  {{ $t(stat.value) }}
                </div>
                <div class="text-xs text-muted mt-1">
                  {{ $t(stat.label) }}
                </div>
              </div>
            </div>

            <template v-else>
              <h2
                v-if="(section.type === 'list' || section.type === 'steps') && section.title"
                class="text-base font-bold text-highlighted mb-4"
              >
                {{ $t(section.title) }}
              </h2>

              <div
                v-if="section.type === 'paragraphs'"
                class="text-sm text-toned leading-7"
              >
                <div
                  v-if="isRichParagraphs(section.items)"
                  class="blog-prose"
                  v-html="safeParagraphHtml(section.items)"
                />
                <div
                  v-else
                  class="flex flex-col gap-3"
                >
                  <p
                    v-for="(paragraph, pIndex) in section.items"
                    :key="pIndex"
                  >
                    {{ $t(paragraph) }}
                  </p>
                </div>
              </div>

              <ul
                v-else-if="section.type === 'list'"
                class="flex flex-col gap-2.5 text-sm text-toned leading-7"
              >
                <li
                  v-for="(item, lIndex) in section.items"
                  :key="lIndex"
                  class="flex items-start gap-2.5"
                >
                  <UIcon name="i-tabler-circle-check" class="size-4 text-primary shrink-0 mt-1" />
                  <span>{{ $t(item) }}</span>
                </li>
              </ul>

              <div
                v-else-if="section.type === 'steps'"
                class="flex flex-col gap-0"
              >
                <div
                  v-for="(step, stepIndex) in section.items"
                  :key="stepIndex"
                  class="flex gap-4"
                >
                  <div class="flex flex-col items-center shrink-0">
                    <div class="size-10 rounded-xl bg-primary/10 text-primary grid place-items-center">
                      <UIcon :name="step.icon" class="size-5" />
                    </div>
                    <div
                      v-if="stepIndex < section.items.length - 1"
                      class="w-px flex-1 min-h-6 bg-muted my-1"
                    />
                  </div>
                  <div class="pb-6 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-[11px] font-bold text-primary num">
                        {{ stepIndex + 1 }}
                      </span>
                      <h3 class="text-sm font-bold text-highlighted">
                        {{ $t(step.title) }}
                      </h3>
                    </div>
                    <p
                      v-if="step.description"
                      class="text-sm text-toned leading-7"
                    >
                      {{ $t(step.description) }}
                    </p>
                  </div>
                </div>
              </div>

              <div
                v-else-if="section.type === 'blog'"
                class="flex flex-col gap-4"
              >
                <NuxtLink
                  v-for="post in section.items"
                  :key="post.id"
                  :to="getBlogPostPath(post.id)"
                  class="group flex flex-col sm:flex-row sm:items-stretch gap-4 p-4 rounded-xl border border-muted transition hover:(border-primary/30 bg-primary/5)"
                >
                  <div class="w-full sm:w-36 md:w-44 shrink-0 rounded-xl overflow-hidden bg-muted aspect-16/10 sm:aspect-auto">
                    <img
                      :src="post.image"
                      :alt="post.title"
                      class="size-full object-cover"
                      loading="lazy"
                    >
                  </div>
                  <div class="flex-1 min-w-0 flex flex-col justify-center">
                    <div class="flex items-center gap-2 flex-wrap mb-1">
                      <span class="text-[11px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {{ $t(post.category) }}
                      </span>
                      <span class="text-[11px] text-dimmed num">
                        {{ $t(post.date) }}
                      </span>
                      <span class="text-[11px] text-dimmed">
                        · {{ $t(post.readTime) }}
                      </span>
                    </div>
                    <h3 class="text-sm font-bold text-highlighted mb-1 transition group-hover:text-primary">
                      {{ $t(post.title) }}
                    </h3>
                    <p class="text-sm text-toned leading-7 mb-2">
                      {{ $t(post.excerpt) }}
                    </p>
                    <p class="text-[11px] text-muted">
                      {{ $t('نویسنده') }}: {{ $t(post.author) }}
                    </p>
                  </div>
                </NuxtLink>
              </div>

              <div
                v-else-if="section.type === 'jobs'"
                class="flex flex-col gap-3"
              >
                <div
                  v-for="(job, jIndex) in section.items"
                  :key="jIndex"
                  class="p-4 rounded-xl border border-muted transition hover:(border-primary/30 bg-primary/5)"
                >
                  <div class="flex flex-col sm:flex-row sm:items-start gap-3">
                    <div class="flex-1 min-w-0">
                      <h3 class="text-sm font-bold text-highlighted">
                        {{ $t(job.title) }}
                      </h3>
                      <p class="text-xs text-muted mt-1">
                        {{ $t(job.department) }} · {{ $t(job.location) }}
                      </p>
                      <p class="text-sm text-toned leading-7 mt-2">
                        {{ $t(job.description) }}
                      </p>
                    </div>
                    <div class="flex items-center gap-2 shrink-0 self-start">
                      <span class="text-[11px] font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                        {{ $t(job.type) }}
                      </span>
                      <UButton
                        :to="staticPagePaths.contact"
                        color="primary"
                        variant="soft"
                        size="sm"
                      >
                        {{ $t('ارسال رزومه') }}
                      </UButton>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </section>
        </template>
      </div>
    </template>

    <div
      v-else
      class="bg-default border border-muted rounded-2xl p-10 text-center"
    >
      <UIcon name="i-tabler-file-off" class="size-16 text-dimmed mx-auto mb-4" />
      <p class="text-sm text-muted">{{ $t('بارگذاری صفحه ناموفق بود') }}</p>
    </div>
  </main>
</template>

<script setup lang="ts">
import type { StaticPage, StaticPageId } from '~/data/static-pages'
import { getBlogPostPath, staticPagePaths } from '~/data/static-pages'
import {
  contentToHtml,
  isRichBlogContent,
  sanitizeBlogHtml,
} from '~/data/seller-blog'
import { faqPageJsonLd } from '~/composables/useJsonLd'

const props = defineProps<{
  pageId: StaticPageId
}>()

const { t } = useI18n()
const toast = useAppToast()
const { fetchStaticPage, getPage } = useStaticPages()

function isRichParagraphs(items: string[]) {
  return isRichBlogContent(items)
}

function safeParagraphHtml(items: string[]) {
  return sanitizeBlogHtml(contentToHtml(items))
}

const { data: page, pending } = await useAsyncData<StaticPage | null>(
  `static-page-${props.pageId}`,
  async () => {
    const { result, error: fetchError } = await fetchStaticPage(props.pageId, { force: true })
    if (fetchError || !result) {
      if (import.meta.client) {
        toast.error(t('بارگذاری صفحه ناموفق بود'))
      }
      return null
    }
    return result
  },
  {
    default: () => getPage(props.pageId),
  },
)

useEntitySeo(() => ({
  fallbackTitle: page.value?.title ? t(page.value.title) : t('صفحه'),
  fallbackDescription: page.value?.subtitle ? t(page.value.subtitle) : '',
  path: page.value?.path || staticPagePaths[props.pageId],
}))

useJsonLd(() => {
  const current = page.value
  if (!current) return null
  const faqItems = current.sections
    .filter((section): section is Extract<StaticPage['sections'][number], { type: 'faq' }> =>
      section.type === 'faq',
    )
    .flatMap(section => section.items.map(item => ({
      question: item.question,
      answer: item.answer,
    })))
  return faqPageJsonLd(faqItems)
})
</script>
