<template>
  <div ref="wrapRef" class="relative flex-1 w-full md:max-w-xl">
    <!-- Border on wrapper so global input{border:none} cannot kill it; flex = icon/text align -->
    <label
      class="group flex items-center gap-2.5 h-12 w-full ps-4 pe-4 rounded-2xl bg-elevated hover:bg-muted focus-within:bg-default border-2 border-default focus-within:border-primary transition cursor-text"
    >
      <UIcon
        name="i-tabler-search"
        class="size-5 shrink-0 text-dimmed transition group-focus-within:text-primary"
      />
      <input
        v-model="query"
        type="search"
        :placeholder="$t('جستجو در دیجی‌شاپ...')"
        class="flex-1 min-w-0 h-full bg-transparent border-0 text-sm leading-none text-default placeholder:text-dimmed"
        @focus="open = true"
        @keydown.enter="doSearch"
      >
    </label>

    <div
      v-if="open && (suggestions.length > 0 || !query.trim())"
      class="absolute top-full inset-x-0 mt-2 z-30 bg-default border border-muted rounded-2xl shadow-xl overflow-hidden"
    >
      <div v-if="!query.trim()" class="p-3">
        <div class="text-[11px] text-dimmed mb-2 px-2">
          {{ $t('جستجوهای پرطرفدار') }}
        </div>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="s in popularSearches"
            :key="s"
            type="button"
            class="text-xs bg-elevated hover:bg-primary/10 hover:text-primary text-toned px-3 py-1.5 rounded-lg transition"
            @click="pickPopular(s)"
          >
            {{ s }}
          </button>
        </div>
      </div>
      <div v-else class="py-2">
        <button
          v-for="s in suggestions"
          :key="s.id"
          type="button"
          class="w-full flex items-center gap-3 px-3 py-2 text-start hover:bg-muted transition"
          @click="goProduct(s.id)"
        >
          <TheIcon
            :name="s.image || 'noImage.png'"
            icon-type="img"
            class="!size-10 rounded-lg object-cover bg-muted shrink-0"
          />
          <div class="flex-1 min-w-0">
            <div class="text-xs text-default truncate">{{ s.title }}</div>
            <div class="text-[10px] text-dimmed">{{ s.brand }}</div>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { popularSearches, toSearchRoute } from '~/data/categories'
import { products } from '~/data/products'

const query = defineModel<string>({ default: '' })

const open = ref(false)
const wrapRef = ref<HTMLElement | null>(null)

const suggestions = computed(() => {
  const q = query.value.trim()
  if (!q) return []
  const lower = q.toLowerCase()
  return products
    .filter(p => p.title.includes(q) || p.brand.toLowerCase().includes(lower))
    .slice(0, 5)
})

function close() {
  open.value = false
}

function doSearch() {
  const q = query.value.trim()
  if (!q) return
  navigateTo(toSearchRoute({ q }))
  close()
}

function pickPopular(s: string) {
  query.value = s
  navigateTo(toSearchRoute({ q: s }))
  close()
}

function goProduct(id: string) {
  navigateTo({ name: 'product-id', params: { id } })
  query.value = ''
  close()
}

onClickOutside(wrapRef, close)
</script>
