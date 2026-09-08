<template>
  <section class="bg-default border border-muted rounded-2xl p-4 sm:p-5">
    <div class="flex items-center justify-between gap-3 mb-4">
      <h3 class="font-bold text-highlighted">{{ $t('دسترسی سریع') }}</h3>
      <span class="text-[11px] text-muted hidden sm:inline">
        {{ $t('میان‌برهای پرکاربرد حساب') }}
      </span>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
      <NuxtLink
        v-for="action in accountQuickActions"
        :key="action.id"
        :to="action.to"
        class="group flex flex-col gap-3 rounded-2xl border border-muted bg-muted/40 p-3.5 sm:p-4 transition-all  hover:(border-primary/25 bg-primary/5) cursor-pointer text-start"
      >
        <div
          class="size-10 rounded-xl grid place-items-center shrink-0 transition-all  group-hover:scale-105"
          :class="action.iconWrap"
        >
          <UIcon
            :name="action.icon"
            class="size-5"
          />
        </div>
        <div class="min-w-0">
          <div class="text-sm font-semibold text-highlighted truncate">
            {{ $t(action.label) }}
          </div>
          <div class="text-[11px] text-muted mt-0.5 truncate">
            {{ $t(action.hint) }}
          </div>
        </div>
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import { accountQuickActions } from '~/data/account-dashboard'
</script>
