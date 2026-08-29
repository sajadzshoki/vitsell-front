<template>
  <section>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div
        v-for="feature in features"
        :key="feature.id"
        class="bg-default rounded-2xl p-3 flex items-center gap-3"
      >
        <div class="size-11 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
          <UIcon :name="`i-tabler-${feature.icon}`" class="size-6" />
        </div>
        <div class="min-w-0">
          <div class="text-xs md:text-sm font-bold text-highlighted truncate">
            {{ $t(feature.title) }}
          </div>
          <div class="text-[10px] md:text-xs text-muted truncate">
            {{ $t(feature.subtitle) }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { heroFeatures: features } = useHome()
</script>
