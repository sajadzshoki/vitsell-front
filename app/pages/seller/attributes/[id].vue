<template>
  <div>
    <div
      v-if="loading && !attribute"
      class="py-16 grid place-items-center"
    >
      <UIcon
        name="i-tabler-loader-2"
        class="size-8 text-primary animate-spin"
      />
    </div>
    <div
      v-else-if="!attribute"
      class="bg-default border border-muted rounded-2xl p-8 text-center"
    >
      <UIcon
        name="i-tabler-list-details"
        class="size-14 text-dimmed mx-auto mb-4"
      />
      <p class="text-sm text-muted mb-4">
        {{ $t('ویژگی پیدا نشد') }}
      </p>
      <UButton
        to="/seller/attributes"
        color="primary"
        variant="soft"
        class="cursor-pointer"
      >
        {{ $t('بازگشت به ویژگی‌ها') }}
      </UButton>
    </div>
    <TheSellerAttributeForm
      v-else
      :initial="attribute"
    />
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const { fetchAttribute, getById } = useSellerAttributes()

definePageMeta({
  layout: 'seller',
  middleware: ['auth', 'admin'],
})

const loading = ref(true)
const attributeId = computed(() => String(route.params.id ?? ''))
const attribute = computed(() => getById(attributeId.value) ?? null)

onMounted(async () => {
  loading.value = true
  try {
    if (attributeId.value) await fetchAttribute(attributeId.value, { force: true })
  }
  finally {
    loading.value = false
  }
})

useSeoMeta({
  title: () => attribute.value
    ? `${t('ویرایش ویژگی')} · ${attribute.value.name}`
    : t('ویرایش ویژگی'),
})
</script>
