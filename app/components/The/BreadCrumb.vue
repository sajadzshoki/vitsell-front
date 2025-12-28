<template>
  <div class="flex items-center <sm:hidden">
    <NuxtLink to="/public" class="text-sm sm:text-base text-gray-500 pt-1">
      خانه
    </NuxtLink>

    <div v-for="(item, index) in list" :key="index" class="flex items-center">
      <p class="mx-1">/</p>
      <template v-if="index < list.length - 1">
        <NuxtLink
            :to="generatePath(index)"
            :class="[
            'text-sm sm:text-base pt-1 break-normal',
            index < list.length - 1 ? 'text-gray-500' : 'text-gray-800'
          ]"
        >
          {{ item }}
        </NuxtLink>
      </template>
      <template v-else>
        <p
            class="text-sm sm:text-base pt-1 break-normal"
            :class="index === list.length - 1 ? 'text-gray-800' : 'text-gray-500'"
        >
          {{ item }}
        </p>
      </template>
    </div>
  </div>
</template>


<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const segments = route.path.split('/').filter(Boolean)

const isId = (segment: string) => /^[0-9a-fA-F]{12,}$/.test(segment)

const mapSegmentToName = (segment: string, index: number) => {
  const mappings: Record<string, string> = {
    profile: 'پروفایل',
    healthRecord: 'پرونده سلامت',
    opg: 'تصاویر OPG',
    main: 'دسته‌بندی',
    category: 'دسته بندی',
    doctors: 'همه دکتر ها ',
    doctor: 'پروفایل دندانپزشک',
    ai: 'هوش مصنوعی',
    tarefe: 'تعرفه',
    comments: 'نظرات',
    misc: 'خدمات',
    loan: 'وام',
    insurance: 'بیمه',
    notification: 'اعلانات',
    info: 'اطلاعات شخصی',
    appointment: 'نوبت‌ها',
    booking: 'رزرو',
    payment: 'پرداخت',
    chat: 'آنلاین',
    paymentHistory: 'تاریخچه پرداخت',
  }

  if (mappings[segment]) return mappings[segment]

  if (isId(segment)) return 'جزئیات'

  return decodeURIComponent(segment)
}

const list = computed(() =>
    segments
        .filter(segment => segment !== '') // remove empty segments
        .map((segment, index) => mapSegmentToName(segment, index))
)

const generatePath = (index: number) => {
  return '/' + segments.slice(0, index + 1).join('/')
}
</script>









