<template>
  <div class="bg-default border border-muted rounded-2xl p-4 md:p-5 mb-5 overflow-x-auto">
    <div class="flex items-center gap-2 md:gap-4 min-w-max">
      <template
        v-for="(s, i) in checkoutSteps"
        :key="s.id"
      >
        <button
          type="button"
          class="flex items-center gap-2 md:gap-3 transition"
          :class="i <= step ? '' : 'opacity-50 cursor-not-allowed'"
          :disabled="i > step"
          @click="onSelect(s.id)"
        >
          <span
            class="size-9 rounded-full grid place-items-center text-sm font-bold transition shrink-0"
            :class="step === i
              ? 'bg-primary text-inverted shadow-lg shadow-primary/30'
              : i < step
                ? 'bg-success text-inverted'
                : 'bg-muted text-dimmed'"
          >
            <UIcon
              v-if="i < step"
              name="i-tabler-check"
              class="size-4"
            />
            <span
              v-else
              class="num"
            >{{ (i + 1).toLocaleString('fa-IR') }}</span>
          </span>
          <span class="hidden md:block text-start">
            <span
              class="text-sm font-medium block"
              :class="step === i
                ? 'text-highlighted'
                : i < step
                  ? 'text-success'
                  : 'text-dimmed'"
            >
              {{ $t(s.name) }}
            </span>
          </span>
        </button>
        <div
          v-if="i < checkoutSteps.length - 1"
          class="flex-1 h-0.5 rounded-full transition min-w-4"
          :class="i < step ? 'bg-success' : 'bg-muted'"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { checkoutSteps, type CheckoutStepId } from '~/data/checkout'

const store = useCheckoutStore()
const { step } = storeToRefs(store)

function onSelect(id: CheckoutStepId) {
  store.goToStep(id)
}
</script>
