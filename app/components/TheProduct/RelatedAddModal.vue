<template>
  <USlideover
    v-model:open="open"
    :side="panelSide"
    :modal="false"
    :dismissible="false"
    :overlay="false"
    :ui="{
      content: panelSide === 'left'
        ? 'max-w-md w-[min(100vw,26rem)] shadow-xl ring ring-default'
        : 'max-h-[85vh] shadow-xl ring ring-default',
      header: 'border-b border-muted',
      body: 'p-0 flex-1 min-h-0 overflow-hidden',
    }"
  >
    <template #title>
      <div class="flex items-center gap-2">
        <UIcon
          name="i-tabler-circle-check-filled"
          class="size-5 shrink-0 text-success"
        />
        <span class="font-bold text-highlighted">{{ $t('کالا اضافه شد!') }}</span>
      </div>
    </template>
    <template #body>
      <TheProductRelatedAddPanel
        :items="items"
        :pending="pending"
        @close="open = false"
      />
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import type { Product } from '~/data/products'

const props = defineProps<{
  open: boolean
  product: Product | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const open = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value),
})

const breakpoints = useBreakpoints({ lg: 1024 })
const panelSide = computed(() => (breakpoints.lg.value ? 'left' : 'bottom'))

const { fetchRelatedForProduct } = useRelatedProducts()
const items = ref<Product[]>([])
const pending = ref(false)

watch(
  () => [props.open, props.product?.id] as const,
  async ([isOpen]) => {
    if (!isOpen || !props.product) {
      items.value = []
      return
    }
    pending.value = true
    try {
      items.value = await fetchRelatedForProduct(props.product)
    }
    finally {
      pending.value = false
    }
  },
)
</script>
