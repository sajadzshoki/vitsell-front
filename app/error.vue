<script setup>
const router = useRouter()
const error = useError()

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}
const {t} = useI18n()
function goHome() {
  router.push('/')
}
</script>

<template>
  <div class=" bg-primary-900  min-h-screen flex flex-col  items-center justify-center px-6 text-center">



    <!-- Title -->
    <h1 class="text-(3xl white) font-semibold mb-2">
{{t('      No routes with this name is available')}}
    </h1>

    <!-- Subtitle -->
    <p class="text-gray-200 mb-6">
{{t('      The page you are looking for does not exist.')}}
    </p>

    <!-- Buttons -->
    <div class="flex gap-4">
      <TheButton :label="t('Go Back')" :fill="false" @click="goBack"/>
      <TheButton :label="t('Go Home')" :fill="false" @click="goHome"/>

    </div>
    <!-- Error Image -->
    <TheNuxtIcon
        name="404.png"
        class="!h-100 !w-auto mb-6 mt-10"
    />
  </div>
</template>
