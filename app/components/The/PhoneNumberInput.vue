<template>
    <div class="flex gap-0 rounded-9px" :class="validation ? 'border-(red solid 1)' : ''">
      <div class="w-16 bg-gray-50 border-l-(2 solid gray-500) flex justify-center items-center">
        <TheDropdown
          icon="arrow-down"
          iconClass="!svg:h-4.5 !svg:w-4.5 !rounded-full !overflow-hidden"
          className="!h-full !border-none"
          dropdownClass="!w-[200%] !max-h-50"
          :withTitle="false"
          :withSelectIcon="true"
          :removable="false"
          valueKey="title"
          v-model="country"
          :data="data"
          :disabled="disabled"
          :withCloseIcon="false"
        />
      </div>

      <div class="grow">
        <TheInput
          v-model="phoneNumber"
          inputType="number"
          inputMode='numeric'
          max-length="10"
          :disabled="disabled"
          class="w-full !rounded-r-none"
          className="rounded-none !overflow-hidden !rounded-l-lg"
          :placeholder="'(+' + country + ')'"
        />
      </div>

      <!-- فقط برای تست -->
      <!-- {{ finalNumber }} -->

    </div>
  </template>

  <script setup lang="ts">
    import { ref, computed, watch } from 'vue'

    // props
    const props = defineProps<{
      validation?: boolean
      disabled?: boolean
    }>()

    // v-model
    const finalNumber = defineModel<string>()

    // کشور انتخاب شده
    const country = ref(98)

    // شماره بدون کد کشور
    const phoneNumber = ref('')

    // دیتای کشورها
    const data = [
      { title: 98, icon: 'flags/ir' },
      { title: 1, icon: 'flags/us' },
      { title: 7, icon: 'flags/ru' },
      { title: 20, icon: 'flags/eg' },
      { title: 27, icon: 'flags/za' },
      { title: 30, icon: 'flags/gr' },
      { title: 31, icon: 'flags/nl' },
      { title: 32, icon: 'flags/be' },
      { title: 33, icon: 'flags/fr' },
      { title: 34, icon: 'flags/es' },
      { title: 39, icon: 'flags/it' },
      { title: 44, icon: 'flags/gb' },
      { title: 45, icon: 'flags/dk' },
      { title: 46, icon: 'flags/se' },
      { title: 47, icon: 'flags/no' },
      { title: 48, icon: 'flags/pl' },
      { title: 49, icon: 'flags/de' },
      { title: 52, icon: 'flags/mx' },
      { title: 55, icon: 'flags/br' },
      { title: 60, icon: 'flags/my' },
      { title: 61, icon: 'flags/au' },
      { title: 62, icon: 'flags/id' },
      { title: 63, icon: 'flags/ph' },
      { title: 64, icon: 'flags/nz' },
      { title: 65, icon: 'flags/sg' },
      { title: 66, icon: 'flags/th' },
      { title: 81, icon: 'flags/jp' },
      { title: 82, icon: 'flags/kr' },
      { title: 84, icon: 'flags/vn' },
      { title: 86, icon: 'flags/cn' },
      { title: 90, icon: 'flags/tr' },
      { title: 91, icon: 'flags/in' },
      { title: 92, icon: 'flags/pk' },
      { title: 93, icon: 'flags/af' },
      { title: 94, icon: 'flags/lk' },
      { title: 95, icon: 'flags/mm' },
      { title: 211, icon: 'flags/ss' },
      { title: 212, icon: 'flags/ma' },
      { title: 213, icon: 'flags/dz' },
      { title: 216, icon: 'flags/tn' },
      { title: 218, icon: 'flags/ly' },
      { title: 234, icon: 'flags/ng' },
      { title: 249, icon: 'flags/sd' },
      { title: 250, icon: 'flags/rw' },
      { title: 254, icon: 'flags/ke' },
      { title: 255, icon: 'flags/tz' },
      { title: 256, icon: 'flags/ug' },
      { title: 260, icon: 'flags/zm' },
      { title: 263, icon: 'flags/zw' },
      { title: 351, icon: 'flags/pt' },
      { title: 380, icon: 'flags/ua' },
      { title: 381, icon: 'flags/rs' },
      { title: 852, icon: 'flags/hk' },
      { title: 853, icon: 'flags/mo' },
      { title: 886, icon: 'flags/tw' },
      { title: 964, icon: 'flags/iq' },
      { title: 965, icon: 'flags/kw' },
      { title: 966, icon: 'flags/sa' },
      { title: 967, icon: 'flags/ye' },
      { title: 968, icon: 'flags/om' },
      { title: 971, icon: 'flags/ae' },
      { title: 972, icon: 'flags/il' },
      { title: 973, icon: 'flags/bh' },
      { title: 974, icon: 'flags/qa' },
      { title: 975, icon: 'flags/bt' },
      { title: 976, icon: 'flags/mn' },
    ]

    // --- 1 : تشخیص کشور از روی شماره کامل ---
    const detectCountry = (phone: string) => {
      const sorted = [...data].sort((a, b) => String(b.title).length - String(a.title).length)

      for (const item of sorted) {
        const code = String(item.title)
        if (phone.startsWith(code)) {
          return item
        }
      }
      return null
    }

    // --- 2 : وقتی فاینال نامبر از بیرون تغییر کرد ---
    watch(
      () => finalNumber.value,
      (val) => {
        if (!val) return
        const detected = detectCountry(val)
        if (detected) {
          country.value = detected.title
          phoneNumber.value = val.replace(String(detected.title), '')
        }
      },
      { immediate: true }
    )

    // --- 3 : آپدیت finalNumber وقتی کاربر dropdown یا input تغییر داد ---
    watch([country, phoneNumber], () => {
      finalNumber.value = String(country.value) + String(phoneNumber.value)
    })
    </script>
