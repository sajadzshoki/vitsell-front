<template>
  <form
      class="flex flex-col relative"
      @dragenter="hovered=true"
      @dragleave="hovered=false"
      @submit.prevent="upload"
      @dragover.prevent
      @drop.stop.prevent="drop">
    <label
        class="flex justify-center items-stretch bg-gray-100 rounded-2xl relative overflow-hidden cursor-pointer h-full"
        :class="{'p-2' : !value}">
      <slot name="icon">
        <div v-if="!value" class="flex flex-col item-stretch gap-3 p-2 border-(2 dashed) rounded-2xl grow"
             :class="label ? 'border-(gray-200)' : 'border-transparent' ">
          <TheNuxtIcon
              class="flex justify-center items-center text-gray-400 w-full h-full rounded-lg"
              :class="label ? 'text-3xl' : 'text-8xl'"
              :name="icon" icon-type="svg"/>
          <p class="text-(xs gray-400) font-extrabold text-center">
            {{ label }}
          </p>
        </div>
        <TheNuxtIcon
            v-else
            :name="value"
            class="object-cover bg-gray-100 rounded-lg !w-full h-full"/>
      </slot>
      <input
          :disabled="!disabled" accept=".JPG,.PNG,.GIF,.SVG,.MP4,.WEBM,.MP3,.WAV,.OGG,.GLB,.GLTF"
          alt="uploadImage" hidden type="file"
          @change="upload($event.target)"/>
    </label>

  </form>
</template>

<script setup>
const props = defineProps({
  edit: {
    type: Boolean,
    default: true
  },
  disabled: {
    type: Boolean,
    default: true
  },
  icon: {
    type: String,
    default: 'upload-file'
  },
  label: {
    type: String,
    default: ''
  }
})
const image = ref({})
const hovered = ref(false)
const loadedPicture = ref(0)
const value = defineModel()

const drop = (e) => {
  hovered.value = false
  upload(e.dataTransfer)
}

const upload = (evt) => {
  compile(evt.files[0])
}

const compile = (file) => {
  const fileReader = new FileReader()
  fileReader.addEventListener("loadstart", (event) => {
    loadedPicture.value = ((event.loaded / event.total) * 100).toFixed(0)
  })
  fileReader.addEventListener("progress", (event) => {
    loadedPicture.value = ((event.loaded / event.total) * 100).toFixed(0)
  })
  fileReader.addEventListener("load", async (event) => {
    loadedPicture.value = ((event.loaded / event.total) * 100).toFixed(0)
    image.value = {
      file,
      data: event?.target?.result,
      name: file?.name
    }
    const fm = new FormData()
    fm.append("file", image.value.file)
    const {result} = await usePost('/upload', fm)
      if(result){
          value.value = result
      }
    // value.value = BASE_URL
  })
  fileReader.readAsDataURL(file)
}
</script>
