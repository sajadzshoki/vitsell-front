<template>
  <div dir="ltr" class="flex flex-col gap-6  relative  mb-4 ">

    <Swiper
        class="w-full h-full grow"
        :slides-per-view="slides"
        :space-between="0"
        :loop="false"
        :pagination="{clickable:true}"
        :keyboard="true"
        :modules="modules"
        :initial-slide="initialSlide || 0"
        :simulateTouch="true"
    >
      <!--      <TheSwiperControl :name="name"/>-->
      <SwiperSlide v-for="item in items" class="flex flex-col items-center justify-center transition-all ml-4 w-full"
                       :class="slideClass">
        <slot :item="item"/>
      </SwiperSlide>
    </Swiper>
  </div>
</template>

<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';

import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';

defineProps<{
  slideClass?: string
  items: Record<string, any>[]
  name?: string
  slides?: number | 'auto'
  navigation?: boolean
  pagination?: boolean
  initialSlide?: number
}>();

const modules = [Pagination];
</script>
<style lang="scss">
.swiper {
  @apply static;
}
.swiper-pagination {
  @apply absolute !-bottom-5 z-10 flex justify-center items-center ;

  .swiper-pagination-bullet {
    @apply bg-gray-500 w-2 h-2;
    &.swiper-pagination-bullet-active {
      @apply bg-primary-600;
    }
  }
}

//.swiper-button-next, .swiper-button-prev {
//  @apply w-12 w-12 h-12 bg-secondary-900 rounded-1/2;
//  &::after {
//    @apply text-white transform text-lg;
//  }
//}
//
//.swiper-button-prev {
//  &::after {
//    @apply translate-x-1/4;
//  }
//}
//
//.swiper-button-next {
//  &::after {
//    @apply -translate-x-1/4;
//  }
//}
</style>

