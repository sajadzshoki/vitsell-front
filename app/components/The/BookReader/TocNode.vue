
<template>
  <div class="w-full">
    <button
        class="w-full text-right flex items-center justify-between gap-2 p-2 rounded-xl bg-white/60 hover:bg-white b-(1 solid black/10)"
        @click="onClick"
        type="button"
    >
      <div class="text-(xs gray-900) leading-5 line-clamp-2">
        {{ item.label || "—" }}
      </div>

      <div class="text-(xs gray-700) select-none">
        <template v-if="hasChildren">{{ expanded ? "▾" : "▸" }}</template>
        <template v-else>↩</template>
      </div>
    </button>

    <div v-if="hasChildren && expanded" class="mr-4 mt-2 space-y-1">
      <TheBookReaderTocNode v-for="(child, idx) in item.subitems" :key="idx" :item="child" @open="$emit('open', $event)" />
    </div>
  </div>
</template>

<script setup lang="ts">
export type TocItem = {
  label?: string;
  href?: string;
  subitems?: TocItem[];
};

const props = defineProps<{ item: TocItem }>();
const emit = defineEmits<{ (e: "open", href: string): void }>();

const expanded = ref(true);
const hasChildren = computed(() => Array.isArray(props.item.subitems) && props.item.subitems.length > 0);

const onClick = () => {
  if (props.item.href) emit("open", props.item.href);
  else if (hasChildren.value) expanded.value = !expanded.value;
};
</script>
