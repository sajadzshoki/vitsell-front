<template>
  <section v-if="promo">
    <div
      class="relative overflow-hidden rounded-3xl border border-primary/20 bg-default"
    >
      <div class="absolute inset-0 bg-primary/5 pointer-events-none" />
      <div
        class="absolute -top-16 -end-16 size-56 rounded-full bg-primary/15 blur-2xl pointer-events-none"
      />
      <div
        class="absolute -bottom-20 -start-10 size-48 rounded-full bg-secondary/10 blur-2xl pointer-events-none"
      />

      <div class="relative z-10 p-6 md:(p-8) flex flex-col lg:(flex-row items-center) gap-6 md:gap-8">
        <div class="flex-1 min-w-0 text-start">
          <span class="inline-flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full mb-3">
            <UIcon name="i-tabler-sparkles" class="size-3.5" />
            {{ $t(promo.eyebrow) }}
          </span>

          <h3 class="text-xl md:text-2xl font-bold text-highlighted mb-2">
            {{ $t(promo.title) }}
          </h3>
          <p class="text-sm text-toned leading-7 max-w-xl mb-5">
            {{ $t(promo.subtitle) }}
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <div
              v-for="perk in perks"
              :key="perk.label"
              class="flex items-center gap-2.5 rounded-2xl bg-muted/80 border border-muted px-3 py-2.5"
            >
              <div class="size-9 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
                <UIcon :name="perk.icon" class="size-5" />
              </div>
              <span class="text-xs font-medium text-toned leading-5">
                {{ $t(perk.label) }}
              </span>
            </div>
          </div>

          <UButton
            v-if="promo.primaryCta.to"
            :to="promo.primaryCta.to"
            color="primary"
            size="lg"
            trailing-icon="i-tabler-arrow-left"
            class="font-bold"
          >
            {{ $t(promo.primaryCta.label) }}
          </UButton>
        </div>

        <div
          class="shrink-0 size-28 md:size-36 rounded-3xl bg-primary grid place-items-center shadow-lg shadow-primary/25"
        >
          <UIcon name="i-tabler-crown" class="size-14 md:size-16 text-inverted" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { promos } = useHome()

const promo = computed(() => {
  const list = promos.value
  return list.find(p => p.id === 'plus')
    ?? list.find(p => p.tone === 'primary')
    ?? null
})

const perks = [
  { icon: 'i-tabler-truck-delivery', label: 'ارسال رایگان نامحدود' },
  { icon: 'i-tabler-discount-2', label: 'تخفیف‌های اختصاصی' },
  { icon: 'i-tabler-headset', label: 'پشتیبانی ویژه' },
]
</script>
