<template>
  <div class="flex flex-col gap-3 p-1">
    <div class="flex justify-between items-center px-1">
      <div class="flex items-center gap-2">
        <Icon name="i-heroicons-document-text" class="text-white/60 w-4 h-4" />
        <span class="text-xs font-medium text-white/80">Quick Notes</span>
      </div>
      <button 
        v-if="myLocalNotes.length"
        @click="isNotesOpen = !isNotesOpen"
        class="text-[10px] px-2 py-0.5 rounded-full transition-colors border border-white/10"
        :class="isNotesOpen ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-transparent text-white/50 hover:text-white'"
      >
        {{ isNotesOpen ? 'Collapse' : `${myLocalNotes.length} notes` }}
      </button>
    </div>

    <div class="relative group">
      <input
        v-model="note"
        type="text"
        placeholder="Type a note and press Enter..."
        class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:bg-white/10 focus:border-white/20 transition-all"
        @keydown.enter="addNote"
        @focus="isOpen = true"
      />
      <div class="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <kbd class="text-[10px] text-white/30 font-sans">↵</kbd>
      </div>
    </div>

    <div
      ref="notesContainerRef"
      class="flex flex-col gap-1.5 overflow-y-auto transition-all duration-300 custom-scrollbar"
      :class="[
        isNotesOpen && hasNotes ? 'max-h-60 opacity-100 mt-1' : 'max-h-0 opacity-0 overflow-hidden'
      ]"
    >
      <div
        v-for="(noteItem, index) in myLocalNotes"
        :key="index"
        class="group/item flex items-start gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 transition-all cursor-pointer"
        @click="copyData(noteItem)"
      >
        <span class="text-[10px] text-white/30 font-mono mt-0.5">{{ index + 1 }}</span>
        <p class="text-xs text-white/80 flex-1 break-words leading-relaxed group-hover/item:text-white transition-colors">
          {{ noteItem }}
        </p>
        <button
          @click.stop="myLocalNotes.splice(index, 1)"
          class="opacity-100 p-1 hover:bg-red-500/20 rounded transition-all text-white/40 hover:text-red-400"
        >
          <Icon name="i-heroicons-x-mark" class="w-3 h-3" />
        </button>
      </div>

      <button
        v-if="myLocalNotes.length"
        @click="clearAll"
        class="self-end text-[10px] text-red-400/70 hover:text-red-400 hover:bg-red-400/10 px-2 py-1 rounded transition-colors mt-1"
      >
        Clear All
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, computed } from 'vue'

const note = ref('')
const isOpen = defineModel<boolean>()
const myLocalNotes = useLocalStorage<string[]>('myLocalNotes', [])
const isNotesOpen = ref(true)
const hasNotes = computed(() => myLocalNotes.value.length > 0)

const notesContainerRef = ref<HTMLElement | null>(null)

const addNote = async () => {
  const trimmed = (note.value || '').trim()
  if (!trimmed) return

  myLocalNotes.value.push(trimmed)
  note.value = ''
  isNotesOpen.value = true

  await nextTick()
  const el = notesContainerRef.value
  if (el) {
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }
}

const clearAll = () => {
  myLocalNotes.value = []
  isNotesOpen.value = false
}

// Helper to copy data (assuming it's globally available or needs to be imported, 
// but based on previous context it seemed to be used in template without import. 
// I'll add a local simple version just in case, or rely on auto-imports)
const { copy } = useClipboard()
const toast = useAppToast()

const copyData = (text: string) => {
  copy(text)
  toast.success('Note copied to clipboard')
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
