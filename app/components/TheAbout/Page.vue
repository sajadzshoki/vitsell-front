<template>
  <div class="flex flex-col gap-6 md:gap-8">
    <!-- Hero -->
    <section
      v-if="visibility.hero"
      class="relative overflow-hidden rounded-2xl border border-muted bg-elevated min-h-64 md:min-h-80"
    >
      <img
        v-if="about.heroImage"
        :src="about.heroImage"
        :alt="about.title"
        class="absolute inset-0 size-full object-cover"
      >
      <div class="absolute inset-0 bg-inverted/65" />
      <div class="relative z-10 px-5 py-10 sm:(px-8 py-12) md:py-14 max-w-3xl flex flex-col gap-3">
        <nav class="text-xs text-inverted/70 flex items-center gap-2 flex-wrap mb-1">
          <NuxtLink
            to="/"
            class="hover:text-inverted transition-all  cursor-pointer"
          >
            {{ $t('خانه') }}
          </NuxtLink>
          <span>/</span>
          <span class="text-inverted">{{ $t(about.title) }}</span>
        </nav>

        <span class="inline-flex items-center gap-2 text-xs font-medium text-inverted/90">
          <UIcon
            name="i-tabler-building-store"
            class="size-4"
          />
          {{ $t(about.eyebrow) }}
        </span>

        <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold text-inverted leading-tight">
          {{ $t(about.title) }}
        </h1>
        <p class="text-sm md:text-base text-inverted/85 leading-8 max-w-2xl">
          {{ $t(about.subtitle) }}
        </p>
      </div>
    </section>

    <!-- Stats -->
    <section
      v-if="visibility.stats && about.stats.length"
      class="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4"
    >
      <div
        v-for="stat in about.stats"
        :key="stat.id"
        class="bg-default border border-muted rounded-2xl p-4 md:p-5 flex flex-col items-center text-center"
      >
        <div class="size-11 rounded-xl bg-primary/10 text-primary grid place-items-center mb-3 overflow-hidden">
          <img
            v-if="isSellerAdminIconImage(stat.icon)"
            :src="resolveMediaUrl(stat.icon)"
            alt=""
            class="size-5 object-contain"
          >
          <UIcon
            v-else
            :name="resolveSellerAdminIconName(stat.icon)"
            class="size-5"
          />
        </div>
        <div class="text-xl md:text-2xl font-black text-highlighted num">
          {{ $t(stat.value) }}
        </div>
        <div class="text-xs text-muted mt-1">
          {{ $t(stat.label) }}
        </div>
      </div>
    </section>

    <!-- Story -->
    <section
      v-if="visibility.story"
      class="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6"
    >
      <div class="lg:col-span-7 bg-default border border-muted rounded-2xl p-5 md:p-7">
        <h2 class="text-lg md:text-xl font-bold text-highlighted mb-4 leading-8">
          {{ $t(about.storyTitle) }}
        </h2>
        <div class="flex flex-col gap-4 text-sm md:text-base text-toned leading-8">
          <div
            v-if="isRichStory"
            class="blog-prose"
            v-html="safeStoryHtml"
          />
          <template v-else>
            <p
              v-for="(paragraph, index) in about.story"
              :key="index"
            >
              {{ $t(paragraph) }}
            </p>
          </template>
        </div>
      </div>

      <div class="lg:col-span-5 flex flex-col gap-4">
        <div class="bg-primary/5 border border-primary/20 rounded-2xl p-5 md:p-6">
          <div class="flex items-center gap-2 text-primary mb-2">
            <UIcon
              name="i-tabler-target"
              class="size-5"
            />
            <h3 class="text-sm font-bold">
              {{ $t(about.missionTitle) }}
            </h3>
          </div>
          <div
            v-if="isRichMission"
            class="blog-prose text-sm text-toned leading-7"
            v-html="safeMissionHtml"
          />
          <p
            v-else
            class="text-sm text-toned leading-7"
          >
            {{ $t(about.mission) }}
          </p>
        </div>
        <div class="bg-default border border-muted rounded-2xl p-5 md:p-6">
          <div class="flex items-center gap-2 text-primary mb-2">
            <UIcon
              name="i-tabler-eye"
              class="size-5"
            />
            <h3 class="text-sm font-bold text-highlighted">
              {{ $t(about.visionTitle) }}
            </h3>
          </div>
          <div
            v-if="isRichVision"
            class="blog-prose text-sm text-toned leading-7"
            v-html="safeVisionHtml"
          />
          <p
            v-else
            class="text-sm text-toned leading-7"
          >
            {{ $t(about.vision) }}
          </p>
        </div>
      </div>
    </section>

    <!-- Values -->
    <section
      v-if="visibility.values && about.values.length"
      class="flex flex-col gap-4"
    >
      <h2 class="text-lg font-bold text-highlighted">
        {{ $t('ارزش‌های ما') }}
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div
          v-for="item in about.values"
          :key="item.id"
          class="bg-default border border-muted rounded-2xl p-5 transition-all  hover:(border-primary/40 bg-primary/5)"
        >
          <div class="size-11 rounded-xl bg-primary/10 text-primary grid place-items-center mb-3 overflow-hidden">
            <img
              v-if="isSellerAdminIconImage(item.icon)"
              :src="resolveMediaUrl(item.icon)"
              alt=""
              class="size-5 object-contain"
            >
            <UIcon
              v-else
              :name="resolveSellerAdminIconName(item.icon)"
              class="size-5"
            />
          </div>
          <h3 class="text-sm font-bold text-highlighted mb-1.5">
            {{ $t(item.title) }}
          </h3>
          <p class="text-xs text-toned leading-6">
            {{ $t(item.description) }}
          </p>
        </div>
      </div>
    </section>

    <!-- Timeline -->
    <section
      v-if="visibility.milestones && about.milestones.length"
      class="bg-default border border-muted rounded-2xl p-5 md:p-7"
    >
      <h2 class="text-lg font-bold text-highlighted mb-6">
        {{ $t('مسیر رشد ما') }}
      </h2>
      <div class="flex flex-col gap-0">
        <div
          v-for="(item, index) in about.milestones"
          :key="item.id"
          class="flex gap-4"
        >
          <div class="flex flex-col items-center shrink-0">
            <div class="size-10 rounded-xl bg-primary/10 text-primary grid place-items-center text-xs font-bold num">
              {{ $t(item.year) }}
            </div>
            <div
              v-if="index < about.milestones.length - 1"
              class="w-px flex-1 min-h-8 bg-muted my-1"
            />
          </div>
          <div class="pb-6 min-w-0">
            <h3 class="text-sm font-bold text-highlighted mb-1">
              {{ $t(item.title) }}
            </h3>
            <p class="text-sm text-toned leading-7">
              {{ $t(item.description) }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Team -->
    <section
      v-if="visibility.team && about.team.length"
      class="flex flex-col gap-4"
    >
      <div>
        <h2 class="text-lg font-bold text-highlighted">
          {{ $t(about.teamTitle) }}
        </h2>
        <p
          v-if="about.teamSubtitle"
          class="text-sm text-muted mt-1"
        >
          {{ $t(about.teamSubtitle) }}
        </p>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="member in about.team"
          :key="member.id"
          class="bg-default border border-muted rounded-2xl overflow-hidden"
        >
          <div class="aspect-[4/3] bg-muted overflow-hidden">
            <img
              v-if="member.image"
              :src="member.image"
              :alt="member.name"
              class="size-full object-cover"
              loading="lazy"
            >
            <div
              v-else
              class="size-full grid place-items-center"
            >
              <TheIcon
                icon-type="img"
                name="noImage.png"
                class="size-12 opacity-60"
              />
            </div>
          </div>
          <div class="p-4">
            <h3 class="text-sm font-bold text-highlighted">
              {{ $t(member.name) }}
            </h3>
            <p class="text-[11px] text-primary font-medium mt-0.5">
              {{ $t(member.role) }}
            </p>
            <p
              v-if="member.bio"
              class="text-xs text-toned leading-6 mt-2"
            >
              {{ $t(member.bio) }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section
      v-if="visibility.cta"
      class="relative overflow-hidden rounded-2xl border border-primary/25 bg-primary/5 p-6 md:p-8"
    >
      <div class="absolute inset-0 bg-gradient-to-bl from-primary/10 via-transparent to-secondary/10 pointer-events-none" />
      <div class="relative z-10 flex flex-col md:(flex-row items-center justify-between) gap-5">
        <div class="max-w-xl">
          <h2 class="text-lg md:text-xl font-bold text-highlighted mb-2">
            {{ $t(about.cta.title) }}
          </h2>
          <p class="text-sm text-toned leading-7">
            {{ $t(about.cta.subtitle) }}
          </p>
        </div>
        <div class="flex items-center gap-3 flex-wrap shrink-0">
          <UButton
            :to="about.cta.primaryTo"
            color="primary"
            size="lg"
            class="font-bold"
          >
            {{ $t(about.cta.primaryLabel) }}
          </UButton>
          <UButton
            :to="about.cta.secondaryTo"
            color="neutral"
            variant="outline"
            size="lg"
          >
            {{ $t(about.cta.secondaryLabel) }}
          </UButton>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import {
  defaultAboutSectionVisibility,
  type AboutSectionVisibility,
} from '~/data/about'
import {
  contentToHtml,
  isRichBlogContent,
  looksLikeHtml,
  sanitizeBlogHtml,
} from '~/data/seller-blog'
import {
  isSellerAdminIconImage,
  resolveSellerAdminIconName,
} from '~/data/seller-admin-icons'
import { resolveMediaUrl } from '~/composables/fetch'

const props = defineProps<{
  sectionVisibility?: AboutSectionVisibility | null
}>()

const { about, ensureLoaded } = useAbout()

await ensureLoaded()

const visibility = computed<AboutSectionVisibility>(() => ({
  ...defaultAboutSectionVisibility(),
  ...(about.value.sectionVisibility || {}),
  ...(props.sectionVisibility || {}),
}))

const isRichStory = computed(() => isRichBlogContent(about.value.story || []))
const safeStoryHtml = computed(() =>
  sanitizeBlogHtml(contentToHtml(about.value.story || [])),
)

const isRichMission = computed(() => looksLikeHtml(about.value.mission || ''))
const safeMissionHtml = computed(() =>
  sanitizeBlogHtml(contentToHtml([about.value.mission].filter(Boolean))),
)

const isRichVision = computed(() => looksLikeHtml(about.value.vision || ''))
const safeVisionHtml = computed(() =>
  sanitizeBlogHtml(contentToHtml([about.value.vision].filter(Boolean))),
)
</script>
