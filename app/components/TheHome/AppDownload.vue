<template>
  <section v-if="stores.length">
    <div
      class="rounded-2xl bg-inverted px-4 py-4 md:(px-6 py-5) flex flex-col md:(flex-row items-center justify-between) gap-4"
    >
      <div class="flex items-center gap-3 min-w-0">
        <div class="size-11 rounded-xl bg-primary grid place-items-center shrink-0">
          <UIcon name="i-tabler-shopping-bag" class="size-6 text-inverted" />
        </div>
        <p class="font-bold text-sm md:text-base text-inverted truncate">
          {{ $t('دانلود اپلیکیشن دیجی‌شاپ') }}
        </p>
      </div>

      <div class="flex items-center gap-2 flex-wrap">
        <UButton
          v-for="store in stores"
          :key="store.id"
          :href="store.href"
          color="neutral"
          variant="solid"
          size="sm"
          :icon="`i-tabler-${store.icon}`"
          class="bg-default !text-highlighted hover:bg-elevated font-medium"
        >
          {{ $t(store.label) }}
        </UButton>

        <UButton
          type="button"
          color="neutral"
          variant="solid"
          size="sm"
          square
          icon="i-tabler-dots"
          class="bg-default !text-highlighted hover:bg-elevated"
          :aria-label="$t('سایر روش‌های دانلود')"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { appStores: stores } = useHome()
</script>
