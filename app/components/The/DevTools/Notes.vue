

<template>
  <div class="bg-black/60 max-h-100   rounded-xl cursor-auto p-2    flexCol  gap-2 ">
    <div class="flex justify-between w-full items-center ">
      <p class="text-white text-xs">Reminders</p>
      <p @click.prevent="isNotesOpen=!isNotesOpen"
         v-show="myLocalNotes.length"
         class="text-(xs ) hover:brightness-90 cursor-pointer" :class="isNotesOpen?'text-#ff3030ff':'text-green'">
        {{ isNotesOpen ? 'Hide' : ('Show ') }}
      </p>
    </div>
    <input class="bg-white rounded-full  px-3 py-1 text-xs "
           dir="ltr"
           v-model="note"
           placeholder="Type . . . "
           @keydown.enter="addNote"
           @focus="isOpen=true"/>
    <div
        ref="notesContainerRef"
        class="overflow-y-auto overflow-x-none flexCol gap-1 transition-all duration-300 ease-in-out
         -m-2 mb-1 pr-2"
        :class="[
    isNotesOpen && hasNotes
      ? 'max-h-100 opacity-100'
      : 'max-h-0 opacity-0 pointer-events-none'
  ]"
    >
      <p
          v-for="(note, index) in myLocalNotes"
          :key="index"
          class="text-(white sm) transition-all b-b-(1 solid white/50) p-2 pb-1 hover:bg-black/50 break-word flex justify-between items-center gap-2"
      >
        <!-- CLICK TO COPY -->
        <span
            class="hover:text-#7DFFECFF cursor-pointer flex-1" @click="copyData(note)">{{ index + 1 }} . {{ note }}</span>
        <!-- CLICK TO DELETE ONLY -->
        <TheNuxtIcon
            name="close"
            icon-type="svg"
            class="cursor-pointer hover:text-#ff3030ff"
            @click.stop="myLocalNotes.splice(index, 1)"
        />
      </p>

    </div>
    <p class="text-(white xs) cursor-pointer w-fit bg-#ff3030ff hover:brightness-90
    px-2 py-2px rounded-full leading-4.5 flex flexCenter"
       @click="[ isNotesOpen = false,myLocalNotes = []]"
       v-if="myLocalNotes?.length && isNotesOpen">Clear All</p>
  </div>
</template>
<script setup lang="ts">
import {nextTick} from 'vue'

const note = ref()
const isOpen = defineModel()
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

  // wait for DOM update, then scroll to bottom
  await nextTick()
  const el = notesContainerRef.value
  if (el) {
    // el.scrollTop = el.scrollHeight
    el.scrollTo({top: el.scrollHeight, behavior: 'smooth'})
  }

}

</script>
