<template>
  <dev-only>
    <div class="flexCol  gap-2 pr-6  z-1000 opacity-70 group hover:( opacity-100 bg-opacity-80 -translate-x-10%) bg-gray-100 -translate-x-98% fixed top-40  select-none shadow-xl  w-fit px-4 py-4 rounded-xl
     transition-all  " :class="{'!-translate-x-10% ':loading}">
      <p class="text-center absolute rotate-45 -right-4 top-1/2 -translate-y-50% "> Dev Tools</p>
      <TheNuxtIcon name="loading" icon-type="svg" class="text-center self-center" v-if="loading"/>
      <p @click="switchUserType"
         class="bg-white text-nowrap hover:(font-600)  text-sm  b-(1 solid gray-500) cursor-pointer  w-fit rounded-full  px-3 py-1 ">
        UserType : {{ userType }}
      </p>
      <p @click="LogInLogOut"
         class="bg-white text-nowrap hover:(font-600)  text-sm  b-(1 solid gray-500) cursor-pointer  w-fit rounded-full  px-3 py-1 ">
        LogInOut  : {{ userId ? 'logOut' : 'login' }}
      </p>
    </div>

  </dev-only>
</template>

<script setup lang="ts">
const userId = useCookie('userId')
const phoneNumber = useLocalStorage('phoneNumber', '')
enum UserType {
  USER = 'user',
  PUBLISHER = 'publisher',
  // MARKETER = 'marketer'
}

const userType = useLocalStorage<UserType>('userType', UserType.USER)
const loading = ref(false)
const switchUserType = () => {
  const userTypes = Object.values(UserType)
  const currentIndex = userTypes.indexOf(userType.value)
  const nextIndex = (currentIndex + 1) % userTypes.length
  userType.value = userTypes[nextIndex]
}
const LogInLogOut = async () => {
  const phone = phoneNumber.value || '989109069118'
  loading.value = true
  if (userId.value) {
    userId.value = null
    loading.value = false
    return
  }
  let didLogin = false
  while (true) {
    const { result } = await useGet(`/user?phoneNumber=${phone}`)
    const id = result?.[0]?.id
    if (id) {
      userId.value = id
      break
    }
    if (didLogin) break
    didLogin = true
    await usePost('/login-by-phone-otp', {
      phoneNumber: phone,
      digit: 6
    })
  }

  loading.value = false
}

</script>
