<template>
  <div class="flex gap-0 rounded-9px" :class="validation ? 'border-(red solid 1)' : ''">
    <!-- Dropdown واحد -->
    <div class="w-16 bg-gray-50 flex justify-center items-center border-l-(2 solid gray-500)">
      <TheDropdown
        iconClass="!svg:h-4.5 !svg:w-4.5 !rounded-full !overflow-hidden"
        className="!h-full !border-none"
        dropdownClass="!w-[200%] !max-h-50"
        valueKey="id"
        v-model="priceType"
        :data="data"
      />
    </div>

    <!-- Input مبلغ -->
    <div class="grow">
      <TheInput
        v-model="price"
        inputType="number"
        class="w-full !rounded-r-none !overflow-hidden !rounded-l-lg"
        :placeholder="$t('مبلغ را وارد کنید')"
      />
    </div>
  </div>

  <!-- نمایش نهایی -->
  <Thelog :data="finalNumber" />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const data = [
  { title: 'ريال', id: '1' },
  { title: 'دلار', id: '2' }
]

const priceType = ref('1')
const price = ref('')

// Props
const props = defineProps<{
  validation?: boolean
}>()

// مقدار ترکیبی finalNumber
const finalNumber = defineModel()

watch([priceType, price], () => {
  finalNumber.value = `${priceType.value}${price.value}`
})
</script>
