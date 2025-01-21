<template>
  <form
      class="flex gap-4 items-stretch text-base text-primary min-h-16"
      @submit.prevent="upload"
      @dragover.prevent
      @dragenter="hovered = true"
      @dragleave="hovered = false"
      @drop.stop.prevent="drop"
  >
    <input
        v-if="!max || files.length < max"
        id="image"
        type="file"
        alt="uploadImage"
        hidden
        accept="image/*"
        multiple
        @change="upload($event.target)"
    />
    <label
        for="image"
        class="flex flex-row items-center justify-center gap-2 bg-box rounded-lg w-57 outline-1 outline-dashed outline-offset-6 my-2 mr-2 cursor-pointer border-border border-1"
        :class="[
        hovered ? 'outline-danger text-danger' : 'outline-primary text-primary',
        uploaderClass,
      ]"
    >
      <i class="flex justify-center items-center svg:(w-8 h-8)">
        <TheNuxtIcon icon-type="svg" name="gallery-export"/>
      </i>
      <b>{{ label || $t('آپلود تصویر') }}</b>
    </label>
    <transition-group
        name="list"
        tag="div"
        class="flex flex-row flex-wrap gap-4 items-stretch"
        :class="filesClass"
    >
      <div
          v-for="(image, index) in files"
          :key="index"
          class="bg-box rounded-lg aspect-square w-16 overflow-hidden relative border-(1 solid)"
          :class="[
          selected === index && selectable
            ? 'border-primary'
            : 'border-transparent',
        ]"
      >
        <img
            :src="image"
            :alt="index"
            class="w-full h-full object-cover"
        />
        <div v-if="selectable"
             class="absolute inset-0 bg-white bg-opacity-50 svg:(w-6 h-6) opacity-30 transition duration-300 cursor-pointer hover:(opacity-100)"
             @click.self="emit('select', index)">
        </div>
        <TheNuxtIcon icon-type="svg"
                     name="gallery-remove"
                     class="z-1 absolute left-0 bottom-0 hover:(text-danger) cursor-pointer w-6 h-6"
                     @click="deleteImage(index)"
        />
      </div>
    </transition-group>
  </form>
</template>

<script lang="ts" setup>
//@ts-ignore
import watermark from "watermarkjs"
import {addWatermarkToFile} from "~/composables/global";

const emit = defineEmits(['select', 'update:modelValue'])
const props = defineProps<{
  label?: string
  selected?: number
  max?: number
  uploaderClass?: string
  filesClass?: string
  selectable?: string
  watermark?: string | null
}>()
const hovered = ref(false)
const loadedpicture = ref('')
const files = defineModel({default: () => []})

const drop = (e) => {
  hovered.value = false
  upload(e.dataTransfer)
}
const upload = (evt) => {
  if (props.max && files.value.length >= props.max) return

  for (let i = 0; i < evt?.files?.length; i++) {
    compile(evt.files[i])
  }
}
const compile = async (file) => {
  if (!file.type.includes('image')) return

  if (props.watermark) {
    let f = await addWatermarkToFile(file, props.watermark)
    uploadToServer(f)
  } else {
    uploadToServer(file)
  }
}
const uploadToServer = async (file) => {
  const fm = new FormData()
  fm.append('file', file)
  const {result} = await usePost('/upload', fm)
  if (result) {
    files.value = [...files.value, result]
  }
}
const deleteImage = (index) => {
  files.value.splice(index, 1)
  emit(
      'select',
      props.selected > 0 ? props.selected - 1 : props.selected
  )
}
</script>
