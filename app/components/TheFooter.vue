<template>
  <footer class="mt-10 md:mt-16 bg-default border-t border-muted <md:hidden">
    <div class="mx-auto max-w-8xl px-3 sm:px-4 lg:px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6  border-muted border-b">
      <div
        v-for="item in trustItems"
        :key="item.id"
        class="flex items-center gap-3"
      >
        <div class="size-12 rounded-2xl bg-primary/10 text-primary grid place-items-center shrink-0">
          <UIcon :name="`i-tabler-${item.icon}`" class="size-6" />
        </div>
        <div class="min-w-0">
          <div class="text-sm font-semibold text-highlighted truncate">
            {{ $t(item.title) }}
          </div>
          <div class="text-xs text-muted mt-0.5 truncate">
            {{ $t(item.subtitle) }}
          </div>
        </div>
      </div>
    </div>

    <div class="mx-auto max-w-8xl px-3 sm:px-4 lg:px-6 py-10 grid grid-cols-2 lg:grid-cols-6 gap-8">
      <div class="col-span-2">
        <TheNavbarLogo class="mb-4" />
        <p class="text-sm text-muted leading-7 max-w-md">
          {{ $t(about) }}
        </p>
        <div class="flex items-center gap-2 mt-5">
          <UButton
            v-for="social in socials"
            :key="social.id"
            :to="social.href"
            :aria-label="$t(social.label)"
            color="neutral"
            variant="soft"
            size="sm"
            square
            :icon="`i-tabler-${social.icon}`"
            class="rounded-full"
          />
        </div>
      </div>

      <div
        v-for="column in columns"
        :key="column.id"
      >
        <h4 class="text-sm font-bold text-highlighted mb-4">
          {{ $t(column.title) }}
        </h4>
        <ul class="space-y-3">
          <li
            v-for="link in column.links"
            :key="link.label"
          >
            <NuxtLink
              :to="link.to"
              class="text-sm text-muted hover:text-primary transition text-start"
            >
              {{ $t(link.label) }}
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>

    <div class="border-t border-muted py-5 text-center text-xs text-dimmed num">
      {{ $t(copyright) }}
    </div>
  </footer>
</template>

<script setup lang="ts">
import {
  footerAbout,
  footerColumns,
  footerCopyright,
  footerSocials,
  footerTrustItems,
} from '~/data/footer'

const trustItems = footerTrustItems
const about = footerAbout
const socials = footerSocials
const columns = footerColumns
const copyright = footerCopyright
</script>
