<template>
  <UDrawer
    v-model:open="open"
    direction="right"
    :title="$t('دسته‌بندی کالاها')"
    :handle="false"
    close
    :ui="{ content: 'max-w-sm w-[80vw]' }"
  >
    <template #body>
      <nav class="flex flex-col -mx-4">
        <NuxtLink
          v-for="c in categories"
          :key="c.id"
          :to="{ name: 'category-id', params: { id: c.id } }"
          class="flex items-center gap-3 px-4 py-3.5 border-b border-muted hover:bg-muted transition"
          @click="open = false"
        >
          <UIcon :name="getCategoryIcon(c.id)" class="size-5 text-muted shrink-0" />
          <span class="flex-1 text-sm font-medium text-default">{{ $t(c.name) }}</span>
          <UIcon name="i-tabler-chevron-left" class="size-4 text-dimmed" />
        </NuxtLink>
      </nav>
    </template>
  </UDrawer>
</template>

<script setup lang="ts">
import { categories, getCategoryIcon } from '~/data/categories'

const open = defineModel<boolean>('open', { default: false })
</script>
