<template>
  <div class="space-y-2.5 md:space-y-4">
    <div
      v-for="(group, gi) in specGroups"
      :key="gi"
      class="rounded-xl md:rounded-2xl border border-muted bg-muted/40 overflow-hidden"
    >
      <button
        type="button"
        class="w-full flex items-center justify-between gap-3 px-3 py-2.5 md:(px-5 py-4) text-start hover:bg-elevated/50 transition"
        @click="toggleGroup(gi)"
      >
        <span class="text-xs md:text-sm font-bold text-highlighted">
          {{ $t(group.title) }}
        </span>
        <div class="flex items-center gap-2 shrink-0">
          <span class="text-[10px] md:text-[11px] text-muted num">
            {{ group.items.length.toLocaleString('fa-IR') }} {{ $t('مورد') }}
          </span>
          <UIcon
            name="i-tabler-chevron-up"
            class="size-4 text-muted transition"
            :class="openGroups[gi] ? '' : 'rotate-180'"
          />
        </div>
      </button>

      <div
        v-show="openGroups[gi]"
        class="border-t border-muted px-3 py-2 md:(px-5 py-4)"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          <div
            v-for="(spec, si) in group.items"
            :key="si"
            class="flex justify-between gap-3 border-b border-muted/60 last:border-0 py-2 md:py-3"
          >
            <span class="text-[11px] md:text-xs text-muted shrink-0">{{ $t(spec.key) }}</span>
            <span class="text-[11px] leading-6 md:text-xs text-highlighted font-medium text-end">
              {{ spec.value }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProductSpecGroup } from '~/data/product-detail'

const props = defineProps<{
  specGroups: ProductSpecGroup[]
}>()

const openGroups = ref<boolean[]>(props.specGroups.map(() => true))

watch(
  () => props.specGroups,
  (groups) => {
    openGroups.value = groups.map(() => true)
  },
)

function toggleGroup(index: number) {
  openGroups.value[index] = !openGroups.value[index]
}
</script>
