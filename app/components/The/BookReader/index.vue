<!--"epubjs": "^0.3.93",-->
<!--<TheBookReader-->
<!--    v-if="readBook"-->
<!--    :data="data"-->
<!--    :preview="isPreview"-->
<!--    :previewPages="10"-->
<!--    @close="() => { readBook = false; isPreview = false }"-->
<!--/>-->
<template>
  <div class="fixed inset-0 z-10 w-full md:h-100vh flexCol" :style="{ background: hostBg }">
    <!-- Top bar -->
    <div
        v-if="showMenu"
        class="w-full bg-#D8D8D8 b-b-(1 solid gray-950) z-20 text-black px-4 py-2 flex  items-center justify-between gap-3"
    >
      <div class="flex items-center gap-2">
        <button
            class="w-9 h-9 rounded-lg b-(1 solid black/20) bg-white/70 hover:bg-white flex items-center justify-center"
            @click="openPanel()"
            aria-label="Open settings panel"
            type="button"
        >
          <span class="text-5 leading-none">≡</span>
        </button>

        <TheNuxtIcon name="home" icon-type="svg" class="text-2xl cursor-pointer" @click="$emit('close')" />
      </div>
      <p class="text-(sm gray-800) base  leading-7">
        {{ data?.title || $t("No title") }}
        <span v-if="data?.author?.length"> | Authors: {{ data?.author?.join(" , ") }}</span>
        <span v-if="data?.translator?.length"> | Translators: {{ data?.translator?.join(" , ") }}</span>
      </p>
    </div>

    <!-- Reader -->
    <div class="flex  gap-4 items-center md:px-30 <md:(py-4 rounded-xl) px-6 !bg-#e7e7e7 w-full relative">

      <TheNuxtIcon
          name="arrow"
          icon-type="svg"
          class="text-13 <md:hidden !rotate-90 cursor-pointer"
          @click="navigation('prev')"
      />
      <div
          ref="bookContainer"
          class="w-full h-[calc(100vh-0px)] <md:h-[calc(100vh-30px)]"
          :class="showMenu && 'h-[calc(90vh-0px)] <md:h-[calc(90vh-90px)]'"
      />

      <div v-if="isLoading" class="absolute inset-0 z-30 flex items-center justify-center bg-black/20">
        <TheNuxtIcon name="loading2" class="!text-15" />
      </div>
      <TheNuxtIcon name="arrow" icon-type="svg" class="text-13 <md:hidden cursor-pointer" @click="navigation('next')" />

    </div>

    <!-- Gesture layer -->
    <div ref="gestureLayer" class="pointer-events-auto absolute inset-0 z-10 select-none flex">
      <div class="h-full" style="width: 33.3333%" @click="navigation('prev')"></div>
      <div class="h-full" style="width: 33.3333%" @click="toggleMenu"></div>
      <div class="h-full" style="width: 33.3333%" @click="navigation('next')"></div>
    </div>

    <!-- Bottom progress -->
    <div v-if="preview" class="px-2 md:hidden  text-(xs center gray-700 nowrap) z-20" dir="rtl">
      حالت پیش‌نمایش فعال است ({{ previewPages }} صفحه).
    </div>
    <!-- Replace ONLY the bottom progress block in TheBookReader.vue with this -->
    <div v-if="showMenu" class="flex items-center gap-3 px-6 pt-2 z-20">
      <div v-if="preview" class="px-2 <md:hidden  text-(xs gray-700 nowrap) z-20" dir="rtl">
        حالت پیش‌نمایش فعال است ({{ previewPages }} صفحه).
      </div>
      <p class="flex gap-1 text-(xs gray-800 nowrap) px-2">
        <template v-if="totalPages !== null && !isPaginating">
          {{ totalPages }}
          <span>از</span>
          {{ currentPage }}
        </template>
        <template v-else>
          <TheNuxtIcon name="loading"/>
        </template>
      </p>
      <!-- clickable/seekable bar -->
      <div
          ref="progressBarEl"
          class="h-1 w-full rounded bg-white relative cursor-pointer select-none"
          dir="rtl"
          @pointerdown.prevent="onProgressPointerDown"
      >
        <div class="h-full rounded relative" :style="{ width: progress * 100 + '%', background: '#009DAEFF' }">
          <!-- knob -->
          <div class="absolute left-0 z-10 -top-1 bg-primary-500 rounded-full !w-3 !h-3" />
        </div>
      </div>

    </div>


    <!-- Right-side panel + backdrop -->
    <TheBookReaderSettingsPanel
        :panel-open="panelOpen"
        :panel-tab="panelTab"
        :toc-items="tocItems"
        :toc-loading="tocLoading"
        :search-query="searchQuery"
        :searching="searching"
        :search-results="searchResults"
        :prefs="prefs"
        :bg-presets="bgPresets"
        :text-presets="textPresets"
        @close-panel="closePanel"
        @update:panel-tab="(val) => panelTab = val"
        @update:search-query="(val) => searchQuery = val"
        @open-toc-href="openTocHref"
        @go-to-cfi="goToCfi"
        @run-search="runSearch"
        @clear-search="clearSearch"
        @apply-prefs="applyPreferences"
        @change-font-size="changeFontSize"
        @set-bg="setBg"
        @set-text="setText"
        @reset-prefs="resetPrefs"
    />
  </div>
</template>

<script setup lang="ts">
import ePub from "epubjs";
import TocNode, { type TocItem } from "./TocNode.vue";
import type { Product } from "~~/types/models";

const props = defineProps<{ data: Product,  preview?: boolean ,previewPages?: number}>();
defineEmits<{ (e: "close"): void }>();

const bookContainer = ref<HTMLElement | null>(null);
const gestureLayer = ref<HTMLElement | null>(null);

const isPreview = computed(() => !!props.preview)
const previewLimit = computed(() => Math.max(1, props.previewPages ?? 10))

const book = ref<any>();
const rendition = ref<any>(null);

const isLoading = ref(true);

const showMenu = ref(true);
const hostBg = "#ECECEC";
const bookBgDefault = "#F7F7F7";

// pagination/progress state
const currentPage = ref<number>(1)
const actualTotalPages = ref<number | null>(null)   // real book pages
const totalPages = computed<number | null>(() => {  // what UI uses
  if (actualTotalPages.value == null) return null
  return isPreview.value ? Math.min(actualTotalPages.value, previewLimit.value) : actualTotalPages.value
})

// const totalPages = ref<number | null>(null) // null = not ready yet
const progress = ref(0)
const isPaginating = ref(true)


const clampLocationToEffectiveTotal = (loc: number) => {
  const t = totalPages.value ?? 1
  return Math.min(Math.max(1, loc), t)
}
const updatePaginationFromCfi = (cfi?: string) => {
  if (!cfi) return
  const totalReal = book.value?.locations?.total
  if (!totalReal || totalReal <= 0) return

  try {
    const whereReal = book.value.locations.locationFromCfi(cfi) || 1
    const where = clampLocationToEffectiveTotal(whereReal)

    currentPage.value = where

    // progress must be based on effective total (preview)
    const effTotal = totalPages.value ?? 1
    progress.value = effTotal > 1 ? (where - 1) / (effTotal - 1) : 0
  } catch {}
}
const toggleMenu = () => (showMenu.value = !showMenu.value);
const navigation = async (dir: "prev" | "next") => {
  if (!rendition.value) return

  // if full mode, keep original behavior
  if (!isPreview.value || totalPages.value == null) {
    return rendition.value[dir]?.()
  }

  // preview mode: prevent going beyond limit
  const loc = rendition.value.currentLocation?.()
  const cfi = loc?.start?.cfi
  if (!cfi) return rendition.value[dir]?.()

  try {
    const whereReal = book.value.locations.locationFromCfi(cfi) || 1

    if (dir === "next") {
      const nextLoc = whereReal + 1
      const limit = previewLimit.value
      if (nextLoc > limit) return // stop at last preview page

      const nextCfi = book.value.locations.cfiFromLocation(nextLoc)
      if (nextCfi) return rendition.value.display(nextCfi)
    } else {
      const prevLoc = Math.max(1, whereReal - 1)
      const prevCfi = book.value.locations.cfiFromLocation(prevLoc)
      if (prevCfi) return rendition.value.display(prevCfi)
    }
  } catch {
    return rendition.value[dir]?.()
  }
}




// progress bar -----------------------------------------------
// Add these refs/state + functions inside <script setup lang="ts"> of TheBookReader.vue

const progressBarEl = ref<HTMLElement | null>(null);
const isSeeking = ref(false);

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

const seekToPercentage = async (pct: number) => {
  if (!book.value?.locations || !rendition.value) return
  const effTotal = totalPages.value
  if (!effTotal || effTotal <= 0) return

  const percent = Math.min(1, Math.max(0, pct))
  const loc = Math.max(1, Math.round(percent * effTotal))

  // loc is already within preview range (effective total)
  const cfi = book.value.locations.cfiFromLocation(loc)
  if (!cfi) return

  try {
    await rendition.value.display(cfi)
  } catch {}
}


const percentFromPointer = (clientX: number) => {
  const el = progressBarEl.value;
  if (!el) return null;

  const rect = el.getBoundingClientRect();
  const x = clientX - rect.left;
  const raw = rect.width ? x / rect.width : 0;

  // because bar is RTL (like your UI), click on the RIGHT should mean higher progress.
  // In RTL, visual "start" is right, so we invert.
  return clamp01(1 - raw);
};

const onProgressPointerDown = async (e: PointerEvent) => {
  const p = percentFromPointer(e.clientX);
  if (p === null) return;

  isSeeking.value = true;
  (e.currentTarget as HTMLElement)?.setPointerCapture?.(e.pointerId);

  await seekToPercentage(p);

  const onMove = async (ev: PointerEvent) => {
    if (!isSeeking.value) return;
    const mp = percentFromPointer(ev.clientX);
    if (mp === null) return;
    await seekToPercentage(mp);
  };

  const onUp = (ev: PointerEvent) => {
    isSeeking.value = false;
    try {
      (e.currentTarget as HTMLElement)?.releasePointerCapture?.(e.pointerId);
    } catch {}
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    window.removeEventListener("pointercancel", onUp);
  };

  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("pointerup", onUp, { passive: true });
  window.addEventListener("pointercancel", onUp, { passive: true });
};

// -----------------------------------------------







// ---------------- Right panel state ----------------
const panelOpen = ref(false);
const panelTab = ref<"toc" | "search" | "settings">("toc");

const openPanel = (tab: "toc" | "search" | "settings" = "toc") => {
  panelTab.value = tab;
  panelOpen.value = true;
};
const closePanel = () => (panelOpen.value = false);

// TOC
const tocItems = ref<TocItem[]>([]);
const tocLoading = ref(false);

const openTocHref = async (href: string) => {
  try {
    if (!href) return;
    await rendition.value?.display?.(href);
    closePanel();
  } catch {
    // ignore
  }
};

// Search
const searchQuery = ref("");
const searching = ref(false);
const searchResults = ref<Array<{ cfi: string; excerpt: string }>>([]);

const clearSearch = () => {
  searchQuery.value = "";
  searchResults.value = [];
};

const goToCfi = async (cfi: string) => {
  try {
    if (!cfi) return;
    await rendition.value?.display?.(cfi);
    closePanel();
  } catch {
    // ignore
  }
};

const runSearch = async () => {
  const q = searchQuery.value.trim();
  if (!q || !book.value) {
    searchResults.value = [];
    return;
  }

  searching.value = true;
  searchResults.value = [];

  try {
    const spineItems: any[] = book.value?.spine?.spineItems || [];
    const loader = book.value.load?.bind(book.value);

    const MAX_RESULTS = 200;

    for (let i = 0; i < spineItems.length; i++) {
      if (searchResults.value.length >= MAX_RESULTS) break;

      const item = spineItems[i];
      try {
        await item.load(loader);
        const matches = await item.find(q);
        if (Array.isArray(matches)) {
          for (const m of matches) {
            if (searchResults.value.length >= MAX_RESULTS) break;
            if (m?.cfi) {
              searchResults.value.push({
                cfi: m.cfi,
                excerpt: (m.excerpt || "").replace(/\s+/g, " ").trim(),
              });
            }
          }
        }
      } catch {
        // ignore per section
      } finally {
        try {
          item.unload?.();
        } catch {
          // ignore
        }
      }
    }
  } finally {
    searching.value = false;
    panelTab.value = "search";
  }
};

// ---------------- Reader preferences ----------------
const prefsKey = computed(() => `reader_prefs_${props.data?.id || props.data?.mainFile || "book"}`);

const prefs = reactive({
  fontFamily: "Dana, sans-serif",
  fontSize: 14,
  lineHeight: 26,
  bg: "#F7F7F7",
  text: "#2F180E",
});

const bgPresets = ["#F7F7F7", "#EFE8DA", "#0F172A", "#111827"];
const textPresets = ["#2F180E", "#111827", "#E5E7EB"];

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

const persistPrefs = () => {
  if (import.meta.server) return;
  try {
    localStorage.setItem(prefsKey.value, JSON.stringify({ ...prefs }));
  } catch {}
};

const loadPrefs = () => {
  if (import.meta.server) return;
  try {
    const raw = localStorage.getItem(prefsKey.value);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      if (typeof parsed.fontFamily === "string") prefs.fontFamily = parsed.fontFamily;
      if (typeof parsed.fontSize === "number") prefs.fontSize = clamp(parsed.fontSize, 10, 24);
      if (typeof parsed.lineHeight === "number") prefs.lineHeight = clamp(parsed.lineHeight, 18, 40);
      if (typeof parsed.bg === "string") prefs.bg = parsed.bg;
      if (typeof parsed.text === "string") prefs.text = parsed.text;
    }
  } catch {}
};

const applyPreferences = () => {
  if (!rendition.value) return;

  if (bookContainer.value) bookContainer.value.style.background = prefs.bg;

  rendition.value.themes.register("customTheme", {
    "html, body": {
      background: hostBg,
      "background-color": hostBg,
      color: prefs.text,
      "font-family": prefs.fontFamily,
      "font-weight": "400",
      "font-style": "normal",
      "font-size": `${prefs.fontSize}px`,
      "line-height": `${prefs.lineHeight}px`,
    },
    "a, a:link, a:visited, a:hover, a:active": {
      color: `${prefs.text} !important`,
      "text-decoration": "none !important",
      "font-family": prefs.fontFamily,
    },
    "p, li, span, div, blockquote": {
      "font-size": `${prefs.fontSize}px`,
      "line-height": `${prefs.lineHeight}px`,
      color: `${prefs.text} !important`,
      "font-family": prefs.fontFamily,
    },
    img: { "max-width": "100%" },
  });

  rendition.value.themes.select("customTheme");

  rendition.value.themes.override("color", prefs.text, true);
  rendition.value.themes.override("font-family", prefs.fontFamily, true);
  rendition.value.themes.override("background-color", prefs.bg, true);
  rendition.value.themes.override("font-size", `${prefs.fontSize}px`, true);
  rendition.value.themes.override("line-height", `${prefs.lineHeight}px`, true);

  persistPrefs();
};

const changeFontSize = (delta: number) => {
  prefs.fontSize = clamp(prefs.fontSize + delta, 10, 24);
  applyPreferences();
};

const setBg = (bg: string) => {
  prefs.bg = bg;
  applyPreferences();
};

const setText = (tc: string) => {
  prefs.text = tc;
  applyPreferences();
};

const resetPrefs = () => {
  prefs.fontFamily = "Dana, sans-serif";
  prefs.fontSize = 14;
  prefs.lineHeight = 26;
  prefs.bg = bookBgDefault;
  prefs.text = "#2F180E";
  applyPreferences();
};

// ---------------- Swipe/drag detection ----------------
let startX = 0;
let startY = 0;
let startT = 0;
let dragging = false;

const SWIPE_DIST = 60;
const SWIPE_TIME = 500;
const MAX_OFF_AXIS = 80;

const onPointerDown = (e: PointerEvent | TouchEvent) => {
  const p = "touches" in e ? e.touches[0] : (e as PointerEvent);
  startX = p.clientX;
  startY = p.clientY;
  startT = Date.now();
  dragging = true;
};

const onPointerMove = () => {
  if (!dragging) return;
};

const onPointerUp = (e: PointerEvent | TouchEvent) => {
  if (!dragging) return;

  const p =
      "changedTouches" in e && e.changedTouches.length ? e.changedTouches[0] : (e as PointerEvent);

  const dx = p.clientX - startX;
  const dy = p.clientY - startY;
  const dt = Date.now() - startT;
  dragging = false;

  if (Math.abs(dy) > MAX_OFF_AXIS) return;

  const isSwipe = (dt <= SWIPE_TIME && Math.abs(dx) > 20) || Math.abs(dx) >= SWIPE_DIST;
  if (!isSwipe) return;

  if (dx < 0) navigation("prev");
  else navigation("next");
};

onMounted(async () => {
  isLoading.value = true;

  loadPrefs();

  book.value = ePub(props.data?.mainFile);

  rendition.value = book.value?.renderTo(bookContainer.value!, {
    width: "100%",
    height: "100%",
  });

  const failSafe = window.setTimeout(() => {
    isLoading.value = false;
  }, 15000);

  const done = () => {
    window.clearTimeout(failSafe);
    isLoading.value = false;
  };

  applyPreferences();

  const lastCfiKey = `reader_cfi_${props.data?.id || props.data?.mainFile || "book"}`;
  const savedCfi = (() => {
    try {
      return localStorage.getItem(lastCfiKey);
    } catch {
      return null;
    }
  })();

  await rendition.value.display(savedCfi || undefined);

  const cfiKey = `reader_cfi_${props.data?.id || props.data?.mainFile || "book"}`
  const saved = (() => {
    try { return localStorage.getItem(cfiKey) } catch { return null }
  })()

  await rendition.value.display(saved || undefined)

// locations generation (controls page count readiness)
  isPaginating.value = true
  totalPages.value = null

  // book.value.ready.then(async () => {
  //   try {
  //     await book.value.locations.generate(1600);
  //     totalPages.value = book.value.locations.total || 1;
  //   } catch {
  //     totalPages.value = 1;
  //   }
  // });

  book.value.ready.then(async () => {
    try {
      await book.value.locations.generate(1600)
      actualTotalPages.value  = book.value.locations.total || 1

      // after locations become available, immediately compute correct page/progress
      const currentLoc = rendition.value?.currentLocation?.()
      const currentCfi = currentLoc?.start?.cfi || saved || undefined
      updatePaginationFromCfi(currentCfi)
    } catch {
      actualTotalPages.value  = 1
    } finally {
      isPaginating.value = false
    }
  })
  // rendition.value.on("relocated", (loc: any) => {
  //   const cfi = loc?.start?.cfi;
  //   if (!cfi) return;
  //
  //   try {
  //     localStorage.setItem(lastCfiKey, cfi);
  //   } catch {}
  //
  //   try {
  //     const where = book.value.locations.locationFromCfi(cfi) || 1;
  //     currentPage.value = Math.min(Math.max(1, where), totalPages.value);
  //     progress.value = book.value.locations.percentageFromCfi(cfi) || 0;
  //   } catch {}
  // });
  // relocated handler (works both before & after locations generation)
  rendition.value.on("relocated", (loc: any) => {
    const cfi = loc?.start?.cfi
    if (!cfi) return

    try { localStorage.setItem(cfiKey, cfi) } catch {}

    // Only updates when totalPages is ready
    updatePaginationFromCfi(cfi)
  })

  // TOC
  tocLoading.value = true;
  book.value.ready
      .then(() => {
        const navToc = book.value?.navigation?.toc || [];
        tocItems.value = (navToc as TocItem[]) || [];
      })
      .finally(() => {
        tocLoading.value = false;
      });

  if (bookContainer.value) bookContainer.value.style.background = prefs.bg;

  rendition.value.on("rendered", done);
  rendition.value.on("relocated", done);
  rendition.value.on("displayError", () => {
    window.clearTimeout(failSafe);
    isLoading.value = false;
  });

  const el = gestureLayer.value!;
  el.addEventListener("pointerdown", onPointerDown, { passive: true });
  el.addEventListener("pointermove", onPointerMove, { passive: true });
  el.addEventListener("pointerup", onPointerUp, { passive: true });
  el.addEventListener("pointercancel", () => (dragging = false));

  el.addEventListener("touchstart", onPointerDown, { passive: true });
  el.addEventListener("touchmove", onPointerMove, { passive: true });
  el.addEventListener("touchend", onPointerUp, { passive: true });
  el.addEventListener("touchcancel", () => (dragging = false));
});

onBeforeUnmount(() => {
  rendition.value?.destroy?.();

  const el = gestureLayer.value;
  if (!el) return;

  el.removeEventListener("pointerdown", onPointerDown as any);
  el.removeEventListener("pointermove", onPointerMove as any);
  el.removeEventListener("pointerup", onPointerUp as any);

  el.removeEventListener("touchstart", onPointerDown as any);
  el.removeEventListener("touchmove", onPointerMove as any);
  el.removeEventListener("touchend", onPointerUp as any);
});
</script>

<style>
[draggable] {
  -webkit-user-drag: none;
}
</style>
