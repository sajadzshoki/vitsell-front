<template>
  <div class="space-y-5">
    <div class="md:hidden">
      <UButton
        to="/seller/warehouses"
        color="neutral"
        variant="ghost"
        size="sm"
        icon="i-tabler-chevron-right"
        class="cursor-pointer"
      >
        {{ $t('بازگشت به انبارها') }}
      </UButton>
    </div>

    <TheSellerForbidden
      v-if="!canView"
      :message="isEdit ? $t('برای ویرایش انبار مجوز warehouses.update لازم است') : $t('برای ایجاد انبار مجوز warehouses.create لازم است')"
    />

    <div
      v-else
      class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0"
    >
      <div class="mb-5">
        <h2 class="font-bold text-highlighted">
          {{ isEdit ? $t('ویرایش انبار') : $t('افزودن انبار') }}
        </h2>
        <p class="text-xs text-muted mt-1 leading-6">
          {{ $t('نام، کد، موقعیت و وضعیت انبار را تنظیم کنید.') }}
        </p>
      </div>

      <form
        class="grid grid-cols-1 md:grid-cols-2 gap-4"
        @submit.prevent="submit"
      >
        <TheFormInput
          v-if="!isEdit"
          v-model="form.id"
          :label="$t('شناسه (اختیاری)')"
          :placeholder="$t('مثلاً wh-shiraz')"
          dir="ltr"
          icon="i-tabler-id"
          :help="$t('خالی بماند → از کد انبار ساخته می‌شود')"
        />

        <TheFormInput
          v-model="form.name"
          :label="$t('نام انبار')"
          :placeholder="$t('مثلاً انبار مرکزی تهران')"
          required
          :error="errors.name"
          icon="i-tabler-building-warehouse"
        />

        <TheFormInput
          v-model="form.code"
          :label="$t('کد انبار')"
          :placeholder="$t('مثلاً THR-01')"
          dir="ltr"
          required
          :error="errors.code"
          icon="i-tabler-hash"
        />

        <TheFormInput
          v-model="form.city"
          :label="$t('شهر')"
          :placeholder="$t('مثلاً تهران')"
          icon="i-tabler-map-pin"
        />

        <TheFormInput
          v-model="form.address"
          class="md:col-span-2"
          :label="$t('آدرس')"
          :placeholder="$t('آدرس کامل انبار')"
          icon="i-tabler-home"
        />

        <UFormField
          :label="$t('وضعیت')"
          required
        >
          <USelect
            v-model="form.status"
            :items="statusItems"
            value-key="value"
            class="w-full"
          />
        </UFormField>

        <UFormField
          :label="$t('انبار پیش‌فرض')"
          :help="$t('برای موجودی محصولات بدون انبار اختصاصی')"
        >
          <USwitch
            v-model="form.isDefault"
            class="cursor-pointer"
          />
        </UFormField>

        <div class="md:col-span-2 flex items-center justify-end gap-2 pt-2">
          <UButton
            to="/seller/warehouses"
            color="neutral"
            variant="ghost"
            class="cursor-pointer"
          >
            {{ $t('انصراف') }}
          </UButton>
          <UButton
            type="submit"
            color="primary"
            icon="i-tabler-device-floppy"
            class="cursor-pointer"
            :loading="saving"
          >
            {{ isEdit ? $t('ذخیره تغییرات') : $t('ایجاد انبار') }}
          </UButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toWarehouseForm, type SellerWarehouse, type SellerWarehouseFormValues } from '~/data/seller-inventory'

const props = defineProps<{
  initial?: SellerWarehouse | null
}>()

const { t } = useI18n()
const toast = useAppToast()
const router = useRouter()
const { can } = useSellerPermissions()
const { emptyWarehouseForm, createWarehouse, updateWarehouse } = useSellerInventory()

const isEdit = computed(() => Boolean(props.initial))
const canView = computed(() =>
  isEdit.value ? can('warehouses.update') : can('warehouses.create'),
)

const form = ref<SellerWarehouseFormValues>(
  props.initial ? toWarehouseForm(props.initial) : emptyWarehouseForm(),
)
const errors = ref<Record<string, string>>({})
const saving = ref(false)

const statusItems = computed(() => [
  { value: 'active', label: t('فعال') },
  { value: 'inactive', label: t('غیرفعال') },
])

watch(
  () => props.initial,
  (value) => {
    form.value = value ? toWarehouseForm(value) : emptyWarehouseForm()
  },
)

function validate() {
  const next: Record<string, string> = {}
  if (!form.value.name.trim()) next.name = t('نام الزامی است')
  if (!form.value.code.trim()) next.code = t('کد الزامی است')
  errors.value = next
  return Object.keys(next).length === 0
}

async function submit() {
  if (!validate()) return
  saving.value = true
  try {
    const result = isEdit.value && props.initial
      ? await updateWarehouse(props.initial.id, form.value)
      : await createWarehouse(form.value)

    if (!result.ok) {
      toast.error(result.error)
      return
    }

    toast.success(isEdit.value ? t('انبار به‌روز شد') : t('انبار ایجاد شد'))
    await router.push(`/seller/warehouses/${result.warehouse.id}`)
  }
  finally {
    saving.value = false
  }
}
</script>
