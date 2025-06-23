<template>
  <form
      class="flex flex-col relative"
      @dragenter="hovered=true"
      @dragleave="hovered=false"
      @submit.prevent="upload"
      @dragover.prevent
      @drop.stop.prevent="drop">
    <label
        class="flex justify-center rounded-lg items-stretch relative  cursor-pointer h-full"
        :class="[className]">
      <slot name="icon">
        <div v-if="!value && !loading" class="flex flex-col item-stretch gap-3 px-2 rounded-2xl grow">
          <TheNuxtIcon
              class="flex justify-center items-center text-xl  w-full h-full rounded-lg"
              :class="[iconClass]"
              :name="icon" icon-type="svg"/>

          <p class="text-(2.5 ) font-500 text-center" :class="[labelClass]">{{ label }}</p>
        </div>
        <TheNuxtIcon v-else-if="loading" name="Loading" icon-type="svg" class="text-3xl"/>
        <TheNuxtIcon
            v-else-if="value && !loading && showValue"
            :name="value"
            class="object-cover rounded-lg  rounded-lg !w-full !h-full"/>
      </slot>
      <input
          :disabled="disabled" accept=".JPG,.PNG,.GIF,.SVG,.MP4,.WEBM,.MP3,.WAV,.OGG,.GLB,.GLTF"
          alt="uploadImage" hidden  type="file"
          @change="upload($event.target)"/>
    </label>

  </form>
  <!--  <TheLog :data="loading" :fixed="false"/>-->
</template>

<script setup lang="ts">

const props = withDefaults(defineProps<{
  className?:string,
  edit?: boolean,
  disabled?: boolean,
  icon?: string,
  iconClass?:string,
  label?: string,
  labelClass?: string,
  showValue?: boolean,
}>(),{
  icon:'Upload',
  showValue:true
})
const hovered = ref(false)
const value = defineModel()
const loading = ref(false)
const drop = (e) => {
  hovered.value = false
  upload(e.dataTransfer)
}

const upload =async (evt) => {
  loading.value = true
  await compile(evt.files[0])
  loading.value = false
}

const compile = async (file) => {
  const fileReader = new FileReader()
  const fm = new FormData()
  fm.append("file", file)
  const {result} = await usePost('/upload', fm)
  if(result){
    value.value = result
  }
  fileReader.readAsDataURL(file)
  // value.value = BASE_URL
}



</script>
