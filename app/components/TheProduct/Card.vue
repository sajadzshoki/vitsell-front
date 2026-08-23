<template>
  <NuxtLink
    class="bg-default p-3 rounded-2xl border border-default flexCol  w-full max-w-94 min-w-54 group hover:shadow-md transition-all  "
    :to="{ name: 'product-id', params: { id: 1 } }"
  >
    <div class="!w-full !h-52 rounded-2xl overflow-hidden mb-1.5 relative">
      <TheIcon
        name="/images/mock/galaxy-s25-ultra.jpg"
        icon-type="img"
        class="!w-full !h-full object-cover hover:scale-102 transition-all duration-300"
      />
      <p class="text-sm text-white absolute right-2 top-2 rounded-full leading-5 px-2 py-1 bg-gray-500/35 backdrop-blur-2 z-2">دسته‌بندی</p>
      <p class="text-sm text-white absolute left-2 top-2 rounded-full leading-5 px-2 py-1 bg-error backdrop-blur-2 z-2">5%</p>
    </div>
    <p class="text leading-6.5 font-500 line-clamp-2 mb-2.5">
      گوشی موبایل اپل 15 iPhone ProMax ظرفیت 256 گیگابایت
    </p>
    <p class="line-through text-neutral text-(end sm)">300,000,000</p>
    <p class="text-end self-end text-lg font-600 items-center gap-1.5 flex">
      289,000,000<span class=" text-( xs) font-400">{{ t("تومان") }}</span>
    </p>
  </NuxtLink>
</template>

<script setup lang="ts">
const { t } = useI18n();
</script>
