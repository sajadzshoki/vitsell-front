<template>
  <div
      class="relative flexCol gap-3 items-center   rounded-lg cursor-pointer border-(1 gray-200 solid) bg-white p-4"
      :class="[mini ? 'max-w-36' : 'w-full',isLoading&&'cursor-not-allowed',validation&&'!border-red']">
    <input
v-if="!isLoading"
        type="file"
        id="1"
        class="absolute w-32   opacity-0 h-16 cursor-pointer w-full"
        @change="upload($event.target)"
        accept="image/*"
    />

    <div class="text-center text-primary-750 text-sm flex flex-col justify-center items-center gap-2">
      <!--      <TheNuxtIcon v-if="isLoading" name="Loading" icon-type="svg" class="!text-2xl text-center "/>-->
      <TheNuxtIcon v-if="isLoading" name="Loading" icon-type="svg" class="!text-2xl text-center "/>
      <TheNuxtIcon   v-else name="Upload-2" icon-type="svg" class="!text-(2xl center) "/>
      <p  class="text-(sm gray-600)" v-if="isLoading">در حال بارگذاری ...</p>
      <p  class="text-(xs ) font-600 leading-6" v-else>{{label}}</p>
    </div>
    <!--  v-if="value?.length && multi  "-->

    <div class="w-full min-h-20 border-(1 gray-200 solid) rounded-md p-2 grid grid-cols-4 gap-2 justify-evenly" v-if="files?.length">
      <div class="relative h-15 w-15 "
           v-for="(image,index) in files">
<!--        <video v-if="isVideo(image)" :src="image" controls class="w-full h-full object-cover rounded-xl"></video>-->
        <img :src="image" alt="uploaded" class="w-full h-full  object-cover rounded-lg"/>

        <TheNuxtIcon name="close" icon-type="svg" class="text-(sm white) bg-black rounded-full absolute -right-1 -top-1" @click="removeImage(index)"/>
      </div>
    </div>
<!--    <div v-if="value.video" class="flexCol gap-2  w-full">-->
<!--      <video controls class="w-full h-full rounded-lg max-h-60 object-cover">-->
<!--        <source :src="value.video" type="video/mp4"/>-->
<!--      </video>-->
<!--      <div class="w-full rounded-xl border-(1 solid red-500 ) py-3" @click="removeVideo">-->
<!--        <p class="text-(center red-500)">حذف</p>-->
<!--      </div>-->
<!--      &lt;!&ndash;        <TheButton label="جایگزین کردن ویدئو" />&ndash;&gt;-->
<!--    </div>-->

  </div>
  <!--<TheLog :data="isLoading"/>-->
</template>


<script setup lang="ts">
const {$toast} = useNuxtApp()
const props = withDefaults(defineProps<{
  mini?: boolean,
  max?: number,
  label?: string,
  multi?: boolean,
  validation?:boolean,
}>(), {
  multi: true,
  mini: false,
  max: 6,
  label:'بارگذاری تصویر '
})

const files = defineModel<{ images: string[] }>();
const isLoading = ref<boolean>(false);

const compile = async (file) => {
  isLoading.value = true
  const fm = new FormData()
  fm.append("file", file)
  const {result} = await usePost('/upload', fm)
  // if (result) {
  //   if (props.multi) {
  //     value.value = [...(value.value || []), result]
  //   } else {
  //     value.value = result
  //   }
  // }
  if (result) {
    // if (file.type.startsWith("video")) {
    //   value.value.video = result; // Only one video
    // }
     if (props.multi) {
      files.value = [...(files.value || []), result];
    } else {
      files.value = [result];
    }
  }
  isLoading.value = false
};

const upload = (input: HTMLInputElement) => {
  //handles the max count of uploads
  if (props.multi && Array.isArray(files.value) && files.value.length >= props.max) {
    $toast.error(`بیشترین تعداد آپلود عکس  ${props.max} تا است`)
    return;
  }
  const file = input.files?.[0];
  if (file) compile(file);
}
const removeImage = (index: number) => {
  files.value = files.value?.filter((_, i) => i !== index);
};
// const removeVideo = () => {
//   value.value.video = "";
// };
const isVideo = (url: string) => {
  return url.match(/\.(mp4|mov|avi|wmv|flv|webm)$/i);
}

</script>

