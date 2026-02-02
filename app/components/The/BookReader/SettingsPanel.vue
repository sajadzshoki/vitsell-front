<!-- components/TheReaderPanel.vue -->
<template>
  <div v-if="panelOpen" class="absolute inset-0 z-40">
    <div class="absolute inset-0 bg-black/30" @click="$emit('close-panel')" />
    <aside
        class="absolute top-0 right-0 h-full w-[340px] max-w-[92vw] bg-#EFE8DA b-l-(1 solid black/15) shadow-2xl flexCol"
        dir="rtl"
    >
      <!-- Panel header -->
      <div class="p-3 flex items-center justify-between b-b-(1 solid black/10)">
        <div class="text-(sm gray-900) font-600">فهرست و تنظیمات</div>
        <button
            class="w-9 h-9 rounded-lg b-(1 solid black/15) bg-white/70 hover:bg-white flex items-center justify-center"
            @click="$emit('close-panel')"
            aria-label="Close panel"
            type="button"
        >
          <span class="text-5 leading-none">×</span>
        </button>
      </div>

      <!-- Search box -->
      <div class="p-3">
        <div class="relative flex ">
          <input
              v-model="searchQuery"
              class="w-full rounded-xl bg-white/80 b-(1 solid black/12) px-10 py-2 outline-none focus:(b-black/30 bg-white)"
              placeholder="جستجو"
              @keydown.enter.prevent="runSearch()"
          />
          <div class="absolute left-3 top-1/2 -translate-y-50% text-black/60 select-none">⌕</div>
        </div>

        <div class="mt-2 flex items-center gap-2">
          <button
              class="px-3 py-1.5 rounded-lg bg-black/5 hover:bg-black/10 b-(1 solid black/10) text-(xs gray-900)"
              @click="runSearch()"
              :disabled="searching || !searchQuery.trim()"
              type="button"
          >
            {{ searching ? "در حال جستجو..." : "جستجو" }}
          </button>
          <button
              class="px-3 py-1.5 rounded-lg bg-black/5 hover:bg-black/10 b-(1 solid black/10) text-(xs gray-900)"
              @click="clearSearch()"
              type="button"
          >
            پاک کردن
          </button>
        </div>
      </div>

      <!-- Tabs -->
      <div class="px-3 pb-2">
        <div class="grid grid-cols-3 rounded-xl overflow-hidden b-(1 solid black/10) bg-white/60">
          <button
              class="py-2 text-(xs gray-900) hover:bg-white/70"
              :class="panelTab === 'toc' && 'bg-white font-600'"
              @click="panelTab = 'toc'"
              type="button"
          >
            فهرست
          </button>
          <button
              class="py-2 text-(xs gray-900) hover:bg-white/70"
              :class="panelTab === 'search' && 'bg-white font-600'"
              @click="panelTab = 'search'"
              type="button"
          >
            جستجو
          </button>
          <button
              class="py-2 text-(xs gray-900) hover:bg-white/70"
              :class="panelTab === 'settings' && 'bg-white font-600'"
              @click="panelTab = 'settings'"
              type="button"
          >
            تنظیمات
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-auto px-3 pb-4">
        <!-- TOC -->
        <div v-if="panelTab === 'toc'">
          <div v-if="tocLoading" class="text-(sm gray-700) py-2">در حال بارگذاری فهرست...</div>
          <div v-else-if="!tocItems.length" class="text-(sm gray-700) py-2">فهرست موجود نیست.</div>

          <div v-else class="space-y-1">
            <TheBookReaderTocNode v-for="(item, idx) in tocItems" :key="idx" :item="item" @open="openTocHref" />
          </div>
        </div>

        <!-- Search results -->
        <div v-else-if="panelTab === 'search'">
          <div v-if="searching" class="text-(sm gray-700) py-2">در حال جستجو در کتاب...</div>
          <div v-else-if="!searchResults.length" class="text-(sm gray-700) py-2">نتیجه‌ای یافت نشد.</div>

          <div v-else class="space-y-2">
            <button
                v-for="(r, i) in searchResults"
                :key="i"
                class="w-full text-right p-3 rounded-xl bg-white/70 hover:bg-white b-(1 solid black/10)"
                @click="goToCfi(r.cfi)"
                type="button"
            >
              <div class="text-(xs gray-900) leading-5 line-clamp-3">
                {{ r.excerpt || "..." }}
              </div>
            </button>
          </div>
        </div>

        <!-- Settings -->
        <div v-else class="space-y-5">
          <div class="space-y-2">
            <div class="text-(sm gray-900) font-600">انتخاب فونت</div>
            <select
                v-model="prefs.fontFamily"
                class="w-full rounded-xl bg-white/80 b-(1 solid black/12) px-3 py-2 outline-none focus:(b-black/30 bg-white)"
                @change="$emit('apply-prefs')"
            >
              <option value="IRANSansX, sans-serif">Default</option>
              <option value="Tahoma, IRANSansX, sans-serif">Tahoma</option>
              <option value="serif">Serif</option>
              <option value="Vazirmatn, IRANSansX, sans-serif">Vazirmatn</option>
            </select>
          </div>

          <div class="space-y-2">
            <div class="text-(sm gray-900) font-600">انتخاب اندازه فونت</div>
            <div class="flex items-center justify-between gap-3">
              <button
                  class="w-10 h-10 rounded-xl b-(1 solid black/12) bg-white/70 hover:bg-white flex items-center justify-center"
                  @click="$emit('change-font-size', -1)"
                  type="button"
              >
                <span class="text-5 leading-none">−</span>
              </button>

              <div class="text-(sm gray-900) font-600">{{ prefs.fontSize }}px</div>

              <button
                  class="w-10 h-10 rounded-xl b-(1 solid black/12) bg-white/70 hover:bg-white flex items-center justify-center"
                  @click="$emit('change-font-size', 1)"
                  type="button"
              >
                <span class="text-5 leading-none">+</span>
              </button>
            </div>

            <div class="text-(xs gray-700)">ارتفاع خط: {{ prefs.lineHeight }}px</div>
            <input
                type="range"
                min="18"
                max="40"
                step="1"
                v-model.number="prefs.lineHeight"
                class="w-full"
                @input="$emit('apply-prefs')"
            />
          </div>

          <div class="space-y-2">
            <div class="text-(sm gray-900) font-600">انتخاب رنگ</div>

            <div class="text-(xs gray-700)">پس‌زمینه</div>
            <div class="flex items-center gap-3">
              <button
                  v-for="bg in bgPresets"
                  :key="bg"
                  class="w-9 h-9 rounded-xl b-(2 solid transparent) shadow-sm"
                  :style="{ background: bg, borderColor: prefs.bg === bg ? 'rgba(0,0,0,0.55)' : 'transparent' }"
                  @click="$emit('set-bg', bg)"
                  type="button"
              />
            </div>

            <div class="text-(xs gray-700) mt-3">رنگ متن</div>
            <div class="flex items-center gap-3">
              <button
                  v-for="tc in textPresets"
                  :key="tc"
                  class="w-9 h-9 rounded-xl b-(2 solid transparent) shadow-sm"
                  :style="{ background: tc, borderColor: prefs.text === tc ? 'rgba(0,0,0,0.55)' : 'transparent' }"
                  @click="$emit('set-text', tc)"
                  type="button"
              />
            </div>
          </div>

          <div class="pt-2">
            <button
                class="w-full py-2 rounded-xl bg-black/5 hover:bg-black/10 b-(1 solid black/10) text-(sm gray-900)"
                @click="$emit('reset-prefs')"
                type="button"
            >
              بازنشانی تنظیمات
            </button>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import TocNode, { type TocItem } from "./TocNode.vue";

const props = defineProps<{
  panelOpen: boolean;
  panelTab: "toc" | "search" | "settings";
  tocItems: TocItem[];
  tocLoading: boolean;
  searchQuery: string;
  searching: boolean;
  searchResults: Array<{ cfi: string; excerpt: string }>;
  prefs: {
    fontFamily: string;
    fontSize: number;
    lineHeight: number;
    bg: string;
    text: string;
  };
  bgPresets: string[];
  textPresets: string[];
}>();

const emit = defineEmits<{
  (e: "close-panel"): void;
  (e: "update:panelTab", value: "toc" | "search" | "settings"): void;
  (e: "update:searchQuery", value: string): void;
  (e: "open-toc-href", href: string): void;
  (e: "go-to-cfi", cfi: string): void;
  (e: "run-search"): void;
  (e: "clear-search"): void;
  (e: "apply-prefs"): void;
  (e: "change-font-size", delta: number): void;
  (e: "set-bg", bg: string): void;
  (e: "set-text", tc: string): void;
  (e: "reset-prefs"): void;
}>();

const panelTab = computed({
  get: () => props.panelTab,
  set: (value) => emit("update:panelTab", value)
});

const searchQuery = computed({
  get: () => props.searchQuery,
  set: (value) => emit("update:searchQuery", value)
});

const openTocHref = (href: string) => emit("open-toc-href", href);
const goToCfi = (cfi: string) => emit("go-to-cfi", cfi);
const runSearch = () => emit("run-search");
const clearSearch = () => emit("clear-search");
</script>