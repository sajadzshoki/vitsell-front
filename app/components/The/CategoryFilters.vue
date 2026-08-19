<template>
  <div class="flex flex-col gap-5">
    <div class="flex items-center justify-between gap-2">
      <h2 class="font-600 text-highlighted">
        {{ $t('فیلترها') }}
      </h2>
      <UButton
          v-if="hasActiveFilters"
          variant="link"
          color="primary"
          size="xs"
          :label="$t('حذف فیلترها')"
          @click="resetFilters"
      />
    </div>

    <UFormField :label="$t('محدوده قیمت (تومان)')">
      <div class="grid grid-cols-2 gap-2">
        <UInput
            v-model="priceMin"
            type="number"
            size="sm"
            :placeholder="$t('از')"
        />
        <UInput
            v-model="priceMax"
            type="number"
            size="sm"
            :placeholder="$t('تا')"
        />
      </div>
    </UFormField>

    <USeparator/>

    <UFormField :label="$t('برند')">
      <div class="flex flex-col gap-2">
        <UCheckbox
            v-for="brand in brands"
            :key="brand.value"
            v-model="selectedBrands"
            :value="brand.value"
            :label="$t(brand.label)"
        />
      </div>
    </UFormField>

    <USeparator/>

    <UFormField :label="$t('حداقل امتیاز')">
      <div class="flex flex-wrap gap-2">
        <UButton
            v-for="rate in ratingFilters"
            :key="rate"
            size="xs"
            :variant="minRating === rate ? 'solid' : 'outline'"
            :color="minRating === rate ? 'primary' : 'neutral'"
            @click="minRating = minRating === rate ? null : rate"
        >
          {{ rate.toLocaleString('fa-IR') }}+
          <UIcon name="i-tabler-star-filled" class="size-3.5 text-warning"/>
        </UButton>
      </div>
    </UFormField>

    <USeparator/>

    <UCheckbox
        v-model="onlyAvailable"
        :label="$t('فقط کالاهای موجود')"
    />
  </div>
</template>

<script setup lang="ts">
const priceMin = defineModel<string>('priceMin', { default: '' })
const priceMax = defineModel<string>('priceMax', { default: '' })
const selectedBrands = defineModel<string[]>('selectedBrands', { default: () => [] })
const minRating = defineModel<number | null>('minRating', { default: null })
const onlyAvailable = defineModel<boolean>('onlyAvailable', { default: false })

const brands = [
  { label: 'سامسونگ', value: 'samsung' },
  { label: 'اپل', value: 'apple' },
  { label: 'شیائومی', value: 'xiaomi' },
  { label: 'سونی', value: 'sony' },
  { label: 'ایسوس', value: 'asus' },
]

const ratingFilters = [3, 4, 4.5]

const hasActiveFilters = computed(() =>
    !!priceMin.value
    || !!priceMax.value
    || (selectedBrands.value?.length ?? 0) > 0
    || minRating.value !== null
    || onlyAvailable.value,
)

function resetFilters() {
  priceMin.value = ''
  priceMax.value = ''
  selectedBrands.value = []
  minRating.value = null
  onlyAvailable.value = false
}

</script>
