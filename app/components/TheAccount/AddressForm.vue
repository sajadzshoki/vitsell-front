<template>
  <section class="bg-muted/40 border border-muted rounded-2xl overflow-hidden">
    <div class="flex items-center justify-between gap-3 px-4 py-3 sm:(px-5 py-4) border-b border-muted bg-default/80">
      <div class="flex items-center gap-2.5 min-w-0">
        <div class="size-9 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
          <UIcon :name="isEditing ? 'i-tabler-map-pin' : 'i-tabler-map-pin-plus'" class="size-5" />
        </div>
        <div class="min-w-0">
          <h3 class="text-sm font-bold text-highlighted">
            {{ isEditing ? $t('ویرایش آدرس') : $t('افزودن آدرس جدید') }}
          </h3>
          <p class="text-[11px] text-muted mt-0.5 hidden sm:block">
            {{ $t('اطلاعات گیرنده و محل تحویل را وارد کنید') }}
          </p>
        </div>
      </div>
      <UButton
        type="button"
        color="neutral"
        variant="ghost"
        size="sm"
        icon="i-tabler-x"
        :aria-label="$t('بستن')"
        class="shrink-0"
        @click="$emit('cancel')"
      />
    </div>

    <form
      class="p-4 sm:p-5 space-y-4"
      @submit.prevent="onSubmit"
    >
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TheFormInput
          v-model="addressForm.title"
          :label="$t('عنوان آدرس (اختیاری)')"
          icon="i-tabler-home"
          :placeholder="$t('خانه / محل کار')"
        />
        <TheFormInput
          v-model="addressForm.fullName"
          :label="$t('نام و نام خانوادگی')"
          required
          icon="i-tabler-user"
          :placeholder="$t('نام گیرنده')"
          :error="errors.fullName"
          @update:model-value="errors.fullName = ''"
        />
        <TheFormInput
          v-model="addressForm.phone"
          :label="$t('شماره موبایل')"
          required
          digits-only
          type="tel"
          inputmode="numeric"
          :maxlength="11"
          dir="ltr"
          icon="i-tabler-device-mobile"
          :placeholder="$t('۰۹۱۲۳۴۵۶۷۸۹')"
          :error="errors.phone"
          @update:model-value="errors.phone = ''"
        />
        <TheFormInput
          v-model="addressForm.postalCode"
          :label="$t('کدپستی')"
          digits-only
          :maxlength="10"
          dir="ltr"
          icon="i-tabler-mailbox"
          :placeholder="$t('۱۰ رقم')"
        />

        <TheFormSelect
          v-model="addressForm.province"
          :label="$t('استان')"
          :items="provinceItems"
          icon="i-tabler-map"
          :placeholder="$t('انتخاب استان')"
          :search-placeholder="$t('جستجوی استان...')"
          @update:model-value="onProvinceChange"
        />

        <TheFormSelect
          v-model="addressForm.city"
          :label="$t('شهر')"
          :items="cityItems"
          icon="i-tabler-building-community"
          :placeholder="cityPlaceholder"
          :search-placeholder="$t('جستجوی شهر...')"
          :disabled="!addressForm.province"
        />
      </div>

      <UFormField
        :label="$t('آدرس دقیق پستی')"
        required
        :error="errors.address || undefined"
        :ui="{ label: 'text-sm', error: 'text-[11px] text-error mt-1' }"
      >
        <UTextarea
          v-model="addressForm.address"
          :rows="3"
          size="xl"
          :placeholder="$t('خیابان، کوچه، پلاک، واحد')"
          class="w-full"
          :ui="textareaUi"
          @update:model-value="errors.address = ''"
        />
      </UFormField>

      <div class="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-1 border-t border-muted">
        <UButton
          type="button"
          color="neutral"
          variant="outline"
          size="lg"
          class="sm:min-w-28"
          :disabled="saving"
          @click="$emit('cancel')"
        >
          {{ $t('انصراف') }}
        </UButton>
        <UButton
          type="submit"
          color="primary"
          size="lg"
          class="font-bold sm:min-w-36"
          trailing-icon="i-tabler-check"
          :loading="saving"
        >
          {{ isEditing ? $t('ذخیره تغییرات') : $t('ذخیره آدرس') }}
        </UButton>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  saving?: boolean
}>(), {
  saving: false,
})

const emit = defineEmits<{
  save: []
  cancel: []
}>()

const { t } = useI18n()
const store = useCheckoutStore()
const { addressForm, editingAddressId } = storeToRefs(store)
const { getCitiesForProvince, getProvinceOptions, fetchLocations } = useLocations()
await fetchLocations()

const saving = computed(() => props.saving)

const isEditing = computed(() => !!editingAddressId.value)

const errors = reactive({
  fullName: '',
  phone: '',
  address: '',
})

const provinceItems = computed(() => getProvinceOptions())

const cityItems = computed(() =>
  getCitiesForProvince(addressForm.value.province),
)

const cityPlaceholder = computed(() =>
  addressForm.value.province
    ? t('انتخاب شهر')
    : t('ابتدا استان را انتخاب کنید'),
)

const textareaUi = {
  base: 'rounded-xl ring-0! focus-visible:ring-0! focus-visible:outline-none',
}

function onProvinceChange() {
  const cities = getCitiesForProvince(addressForm.value.province)
  if (!cities.includes(addressForm.value.city)) {
    addressForm.value.city = cities[0] ?? ''
  }
}

function validate() {
  errors.fullName = !addressForm.value.fullName.trim()
    ? t('نام گیرنده الزامی است')
    : ''
  errors.phone = !/^09\d{9}$/.test(addressForm.value.phone.trim())
    ? t('شماره موبایل معتبر نیست')
    : ''
  errors.address = !addressForm.value.address.trim()
    ? t('آدرس دقیق الزامی است')
    : ''

  return !errors.fullName && !errors.phone && !errors.address
}

function onSubmit() {
  if (props.saving) return
  if (!validate()) return
  emit('save')
}
</script>
