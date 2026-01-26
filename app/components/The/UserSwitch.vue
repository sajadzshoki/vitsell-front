
<template>
<dev-only>
  <p @click="switchUserType"
     class="bg-white select-none opacity-50 text-sm shadow-xl b-(1 solid gray-500)
      cursor-pointer hover:( opacity-100) transition-all rounded-full z-1000 fixed top-40  left-2 px-3 py-1">
    {{userType}}
  </p>
</dev-only>
</template>

<script setup lang="ts">
enum UserType {
  USER = 'user',
  PUBLISHER = 'publisher',
  MARKETER = 'marketer'
}
const userType = useLocalStorage<UserType>('userType', UserType.USER)

const switchUserType = () => {
  const userTypes = Object.values(UserType)
  const currentIndex = userTypes.indexOf(userType.value)
  const nextIndex = (currentIndex + 1) % userTypes.length
  userType.value = userTypes[nextIndex]
}
</script>
