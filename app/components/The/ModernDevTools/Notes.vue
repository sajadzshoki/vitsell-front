<template>
  <div class="flex flex-col gap-3">
    <div class="flex justify-between items-center">
      <span class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        Reminders
        <UBadge v-if="myLocalNotes.length" :label="myLocalNotes.length" size="xs" color="primary" variant="subtle" class="ml-1 rounded-full" />
      </span>
      <UButton
        v-if="myLocalNotes.length"
        :label="isNotesOpen ? 'Hide' : 'Show'"
        :color="isNotesOpen ? 'gray' : 'primary'"
        variant="ghost"
        size="2xs"
        @click="isNotesOpen = !isNotesOpen"
      />
    </div>

    <UInput
      v-model="note"
      icon="i-heroicons-pencil-square"
      placeholder="Type a note..."
      size="sm"
      :ui="{ icon: { trailing: { pointer: '' } } }"
      @keydown.enter="addNote"
      @focus="isOpen = true"
    >
      <template #trailing>
        <UButton
          v-show="note"
          color="gray"
          variant="link"
          icon="i-heroicons-arrow-right"
          :padded="false"
          @click="addNote"
        />
      </template>
    </UInput>

    <div
      ref="notesContainerRef"
      class="flex flex-col gap-2 transition-all duration-300 ease-in-out overflow-hidden"
      :class="[isNotesOpen && hasNotes ? 'max-h-60 opacity-100 overflow-y-auto pr-1' : 'max-h-0 opacity-0']"
    >
      <div
        v-for="(noteItem, index) in myLocalNotes"
        :key="index"
        class="group flex items-start justify-between gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
      >
        <span
          class="text-xs text-gray-700 dark:text-gray-200 cursor-pointer flex-1 break-all leading-relaxed"
          @click="copyData(noteItem)"
          title="Click to copy"
        >
          <span class="text-gray-400 font-mono text-[10px] mr-1">{{ index + 1 }}.</span>
          {{ noteItem }}
        </span>
        
        <UButton
          icon="i-heroicons-trash"
          color="red"
          variant="ghost"
          size="2xs"
          class="opacity-0 group-hover:opacity-100 transition-opacity -mr-1"
          @click.stop="myLocalNotes.splice(index, 1)"
        />
      </div>
      
      <div v-if="myLocalNotes.length" class="flex justify-end mt-1">
         <UButton
            label="Clear All"
            color="red"
            variant="soft"
            size="2xs"
            icon="i-heroicons-trash"
            @click="clearAll"
         />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick } from 'vue'

const note = ref('')
const isOpen = defineModel<boolean>()
const myLocalNotes = useLocalStorage<string[]>('myLocalNotes', [])
const isNotesOpen = ref(true)
const hasNotes = computed(() => myLocalNotes.value.length > 0)
const notesContainerRef = ref<HTMLElement | null>(null)
const toast = useAppToast()

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
    if(confirm('Delete all notes?')) {
        myLocalNotes.value = []
        isNotesOpen.value = false
    }
}

const copyData = async (text: string) => {
    try {
        await navigator.clipboard.writeText(text)
        toast.success('Copied to clipboard')
    } catch (e) {
        toast.error('Failed to copy')
    }
}
</script>
