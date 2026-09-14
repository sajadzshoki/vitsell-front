<template>
  <div class="space-y-5">
    <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
      <TheSellerPageHeader
        :title="$t('روش‌های ارسال')"
        :count-label="!methodsLoading ? `${shippingMethods.length.toLocaleString('fa-IR')} ${$t('روش')}` : undefined"
      >
        <template
          v-if="canManage"
          #actions
        >
          <UButton
            type="button"
            color="primary"
            size="sm"
            icon="i-tabler-plus"
            class="cursor-pointer"
            @click="openCreate"
          >
            {{ $t('روش ارسال جدید') }}
          </UButton>
        </template>
      </TheSellerPageHeader>

      <div
        v-if="(methodsLoading || methodsPending) && !shippingMethods.length"
        class="py-16 grid place-items-center"
      >
        <UIcon
          name="i-tabler-loader-2"
          class="size-8 text-primary animate-spin"
        />
      </div>

      <TheSellerEmptyState
        v-else-if="!shippingMethods.length"
        icon="i-tabler-truck-delivery"
        :message="$t('روش ارسالی تعریف نشده')"
      >
        <template
          v-if="canManage"
          #actions
        >
          <UButton
            type="button"
            color="primary"
            variant="soft"
            icon="i-tabler-plus"
            class="cursor-pointer"
            @click="openCreate"
          >
            {{ $t('افزودن اولین روش ارسال') }}
          </UButton>
        </template>
      </TheSellerEmptyState>

      <div
        v-else
        class="space-y-3"
      >
        <div
          v-for="method in shippingMethods"
          :key="method.id"
          class="bg-muted border border-muted rounded-2xl p-4"
        >
          <div class="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div class="font-medium text-highlighted">
                {{ method.name }}
              </div>
              <div class="text-[11px] text-muted mt-1">
                {{ method.carrier || '—' }} · {{ method.estimatedDays || '—' }}
              </div>
              <div class="text-[11px] text-dimmed mt-1 num" dir="ltr">
                {{ method.id }}
              </div>
            </div>
            <UBadge
              :color="method.status === 'active' ? 'success' : 'neutral'"
              variant="subtle"
              size="xs"
            >
              {{ method.status === 'active' ? $t('فعال') : $t('غیرفعال') }}
            </UBadge>
          </div>
          <div
            v-if="canManage"
            class="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
          >
            <TheFormInput
              :model-value="editDraft[method.id]?.name ?? method.name"
              :label="$t('نام')"
              @update:model-value="patchDraft(method.id, 'name', String($event ?? ''))"
            />
            <TheFormInput
              :model-value="editDraft[method.id]?.carrier ?? method.carrier"
              :label="$t('شرکت حمل')"
              @update:model-value="patchDraft(method.id, 'carrier', String($event ?? ''))"
            />
            <TheFormInput
              :model-value="editDraft[method.id]?.estimatedDays ?? method.estimatedDays"
              :label="$t('زمان تقریبی')"
              :placeholder="$t('مثلاً ۲–۴ روز')"
              @update:model-value="patchDraft(method.id, 'estimatedDays', String($event ?? ''))"
            />
            <TheFormInput
              :model-value="formatPriceInput(editDraft[method.id]?.baseCost ?? method.baseCost)"
              :label="$t('هزینه پایه (تومان)')"
              dir="ltr"
              thousand-sep
              @update:model-value="setDraftCost(method.id, $event)"
            />
            <UFormField :label="$t('وضعیت')">
              <USelect
                :model-value="editDraft[method.id]?.status ?? method.status"
                :items="statusItems"
                value-key="value"
                class="w-full"
                @update:model-value="setDraftStatus(method.id, String($event ?? ''))"
              />
            </UFormField>
            <div class="flex items-end gap-2 flex-wrap">
              <UButton
                type="button"
                color="primary"
                variant="soft"
                size="sm"
                class="cursor-pointer"
                :loading="savingMethodId === method.id"
                @click="saveMethod(method.id)"
              >
                {{ $t('ذخیره') }}
              </UButton>
              <UButton
                type="button"
                color="error"
                variant="ghost"
                size="sm"
                icon="i-tabler-trash"
                class="cursor-pointer"
                @click="openDeleteMethod(method)"
              >
                {{ $t('حذف') }}
              </UButton>
            </div>
          </div>
          <div
            v-else
            class="mt-3 text-sm num"
          >
            {{ formatPrice(method.baseCost) }} {{ $t('تومان') }}
          </div>
        </div>
      </div>
    </div>

    <UModal
      v-model:open="createOpen"
      :title="$t('روش ارسال جدید')"
      :description="$t('روش ارسال دلخواه خود را برای فروشگاه تعریف کنید')"
    >
      <template #body>
        <div class="space-y-3">
          <TheFormInput
            v-model="createForm.name"
            :label="$t('نام')"
            required
            :error="createErrors.name"
            :placeholder="$t('مثلاً ارسال با پیک محلی')"
          />
          <TheFormInput
            v-model="createForm.carrier"
            :label="$t('شرکت حمل')"
            :placeholder="$t('مثلاً پیک اختصاصی')"
          />
          <TheFormInput
            v-model="createForm.estimatedDays"
            :label="$t('زمان تقریبی')"
            :placeholder="$t('مثلاً ۱–۳ روز')"
          />
          <TheFormInput
            v-model="createForm.baseCost"
            :label="$t('هزینه پایه (تومان)')"
            dir="ltr"
            thousand-sep
          />
          <UFormField :label="$t('وضعیت')">
            <USelect
              v-model="createForm.status"
              :items="statusItems"
              value-key="value"
              class="w-full"
            />
          </UFormField>
        </div>
      </template>
      <template #footer>
        <div class="flex items-center gap-2 w-full justify-end">
          <UButton
            color="neutral"
            variant="outline"
            class="cursor-pointer"
            @click="createOpen = false"
          >
            {{ $t('انصراف') }}
          </UButton>
          <UButton
            color="primary"
            class="font-bold cursor-pointer"
            :loading="creating"
            @click="submitCreate"
          >
            {{ $t('ثبت روش ارسال') }}
          </UButton>
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="deleteOpen"
      :title="$t('حذف روش ارسال')"
      :description="$t('این روش از لیست ارسال حذف می‌شود.')"
    >
      <template #body>
        <div
          v-if="pendingDelete"
          class="rounded-xl border border-muted bg-muted/40 p-4 text-sm space-y-2"
        >
          <div class="flex items-center justify-between gap-3">
            <span class="text-muted">{{ $t('نام') }}</span>
            <span class="font-medium text-highlighted">{{ pendingDelete.name }}</span>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex items-center gap-2 w-full justify-end">
          <UButton
            color="neutral"
            variant="outline"
            class="cursor-pointer"
            @click="deleteOpen = false"
          >
            {{ $t('انصراف') }}
          </UButton>
          <UButton
            color="error"
            class="font-bold cursor-pointer"
            :loading="deleting"
            @click="confirmDeleteMethod"
          >
            {{ $t('حذف') }}
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { formatPrice } from '~/data/products'
import { formatPriceInput } from '~/data/seller-product-form'
import type { SellerShippingMethod } from '~/data/seller-returns-refunds'

type MethodDraft = {
  name?: string
  carrier?: string
  estimatedDays?: string
  baseCost?: number
  status?: 'active' | 'inactive'
}

const { t } = useI18n()
const toast = useAppToast()
const { can } = useSellerPermissions()
const {
  shippingMethods,
  pending: methodsPending,
  fetchList,
  updateMethod,
  createMethod,
  deleteMethod,
} = useSellerShipping()

const canManage = computed(() => can('shipping.manage'))

const methodsLoading = ref(true)
const savingMethodId = ref<string | null>(null)
const editDraft = ref<Record<string, MethodDraft>>({})

const createOpen = ref(false)
const creating = ref(false)
const createErrors = ref<Partial<Record<'name', string>>>({})
const createForm = ref({
  name: '',
  carrier: '',
  estimatedDays: '',
  baseCost: '0',
  status: 'active' as 'active' | 'inactive',
})

const deleteOpen = ref(false)
const deleting = ref(false)
const pendingDelete = ref<SellerShippingMethod | null>(null)

const statusItems = computed(() => [
  { label: t('فعال'), value: 'active' },
  { label: t('غیرفعال'), value: 'inactive' },
])

function apiErrorMessage(error: any, fallback: string) {
  return (
    error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
    || error?.data?.message
    || error?.message
    || fallback
  )
}

function patchDraft(id: string, key: keyof MethodDraft, value: string) {
  editDraft.value = {
    ...editDraft.value,
    [id]: { ...editDraft.value[id], [key]: value },
  }
}

function setDraftCost(id: string, value: string | number) {
  const raw = Number(String(value ?? '').replace(/\D/g, '')) || 0
  editDraft.value = {
    ...editDraft.value,
    [id]: { ...editDraft.value[id], baseCost: raw },
  }
}

function setDraftStatus(id: string, value: string) {
  const status = value === 'inactive' ? 'inactive' : 'active'
  editDraft.value = {
    ...editDraft.value,
    [id]: { ...editDraft.value[id], status },
  }
}

function openCreate() {
  createForm.value = {
    name: '',
    carrier: '',
    estimatedDays: '',
    baseCost: '0',
    status: 'active',
  }
  createErrors.value = {}
  createOpen.value = true
}

function openDeleteMethod(method: SellerShippingMethod) {
  pendingDelete.value = method
  deleteOpen.value = true
}

async function loadMethods() {
  methodsLoading.value = true
  try {
    const { ok, error } = await fetchList({ force: true })
    if (!ok) {
      toast.error(apiErrorMessage(error, t('بارگذاری روش‌های ارسال ناموفق بود')))
    }
  }
  finally {
    methodsLoading.value = false
  }
}

async function submitCreate() {
  const name = createForm.value.name.trim()
  if (!name) {
    createErrors.value = { name: t('نام الزامی است') }
    return
  }
  createErrors.value = {}
  creating.value = true
  try {
    const result = await createMethod({
      name,
      carrier: createForm.value.carrier.trim(),
      estimatedDays: createForm.value.estimatedDays.trim(),
      baseCost: Number(String(createForm.value.baseCost).replace(/\D/g, '')) || 0,
      status: createForm.value.status,
    })
    if (!result.ok) {
      toast.error(t(result.error))
      return
    }
    createOpen.value = false
    toast.success(t('روش ارسال اضافه شد'))
  }
  finally {
    creating.value = false
  }
}

async function confirmDeleteMethod() {
  if (!pendingDelete.value) return
  deleting.value = true
  try {
    const result = await deleteMethod(pendingDelete.value.id)
    if (!result.ok) {
      toast.error(t(result.error))
      return
    }
    deleteOpen.value = false
    pendingDelete.value = null
    toast.success(t('روش ارسال حذف شد'))
  }
  finally {
    deleting.value = false
  }
}

async function saveMethod(id: string) {
  const method = shippingMethods.value.find(m => m.id === id)
  if (!method) return
  const draft = editDraft.value[id]
  savingMethodId.value = id
  try {
    const result = await updateMethod(id, {
      name: draft?.name ?? method.name,
      carrier: draft?.carrier ?? method.carrier,
      estimatedDays: draft?.estimatedDays ?? method.estimatedDays,
      baseCost: draft?.baseCost ?? method.baseCost,
      status: draft?.status ?? method.status,
    })
    if (!result.ok) {
      toast.error(t(result.error))
      return
    }
    const next = { ...editDraft.value }
    delete next[id]
    editDraft.value = next
    toast.success(t('روش ارسال به‌روزرسانی شد'))
  }
  finally {
    savingMethodId.value = null
  }
}

onMounted(() => {
  void loadMethods()
})
</script>
