<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-3 flex-wrap">
      <div>
        <h3 class="font-bold text-highlighted">
          {{ $t('زیردسته‌ها') }}
        </h3>
        <p class="text-xs text-muted mt-1 leading-6">
          {{ $t('گروه‌های زیردسته برای مگامنو و چیپ‌های جستجو') }}
        </p>
      </div>
      <UButton
        type="button"
        color="primary"
        variant="soft"
        size="sm"
        icon="i-tabler-plus"
        @click="addGroup"
      >
        {{ $t('افزودن گروه') }}
      </UButton>
    </div>

    <div
      v-if="!model.length"
      class="rounded-2xl border border-dashed border-muted bg-muted/40 px-4 py-8 text-center"
    >
      <UIcon
        name="i-tabler-folders"
        class="size-10 text-dimmed mx-auto mb-3"
      />
      <p class="text-sm text-muted">
        {{ $t('هنوز گروهی اضافه نشده است') }}
      </p>
    </div>

    <div
      v-else
      class="space-y-3"
    >
      <div
        v-for="(group, groupIndex) in model"
        :key="groupIndex"
        class="rounded-2xl border border-muted bg-muted/30 p-4 space-y-4"
      >
        <div class="flex items-start gap-2">
          <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 min-w-0">
            <TheFormInput
              :model-value="group.name"
              :label="$t('نام گروه')"
              :placeholder="$t('مثلاً برندهای موبایل')"
              required
              @update:model-value="updateGroup(groupIndex, { name: String($event) })"
            />
            <TheFormInput
              :model-value="group.image ?? ''"
              :label="$t('تصویر گروه')"
              :placeholder="$t('آدرس تصویر (اختیاری)')"
              dir="ltr"
              icon="i-tabler-photo"
              @update:model-value="updateGroup(groupIndex, { image: String($event) || null })"
            />
          </div>
          <div class="flex items-center gap-1 pt-7 shrink-0">
            <UButton
              type="button"
              color="neutral"
              variant="ghost"
              size="sm"
              icon="i-tabler-arrow-up"
              :disabled="groupIndex === 0"
              :aria-label="$t('جابه‌جایی به بالا')"
              @click="moveGroup(groupIndex, -1)"
            />
            <UButton
              type="button"
              color="neutral"
              variant="ghost"
              size="sm"
              icon="i-tabler-arrow-down"
              :disabled="groupIndex === model.length - 1"
              :aria-label="$t('جابه‌جایی به پایین')"
              @click="moveGroup(groupIndex, 1)"
            />
            <UButton
              type="button"
              color="error"
              variant="ghost"
              size="sm"
              icon="i-tabler-trash"
              :aria-label="$t('حذف گروه')"
              @click="removeGroup(groupIndex)"
            />
          </div>
        </div>

        <div class="space-y-2">
          <div class="text-xs font-medium text-toned">
            {{ $t('آیتم‌های گروه') }}
          </div>
          <div
            v-if="!group.items.length"
            class="text-xs text-muted"
          >
            {{ $t('آیتمی ثبت نشده است') }}
          </div>
          <div
            v-for="(item, itemIndex) in group.items"
            :key="`${groupIndex}-${itemIndex}`"
            class="flex items-center gap-2"
          >
            <TheFormInput
              :model-value="item"
              class="flex-1"
              :placeholder="$t('مثلاً سامسونگ')"
              size="md"
              @update:model-value="updateItem(groupIndex, itemIndex, String($event))"
            />
            <UButton
              type="button"
              color="neutral"
              variant="ghost"
              size="sm"
              icon="i-tabler-arrow-up"
              :disabled="itemIndex === 0"
              :aria-label="$t('جابه‌جایی به بالا')"
              @click="moveItem(groupIndex, itemIndex, -1)"
            />
            <UButton
              type="button"
              color="neutral"
              variant="ghost"
              size="sm"
              icon="i-tabler-arrow-down"
              :disabled="itemIndex === group.items.length - 1"
              :aria-label="$t('جابه‌جایی به پایین')"
              @click="moveItem(groupIndex, itemIndex, 1)"
            />
            <UButton
              type="button"
              color="error"
              variant="ghost"
              size="sm"
              icon="i-tabler-x"
              :aria-label="$t('حذف آیتم')"
              @click="removeItem(groupIndex, itemIndex)"
            />
          </div>
          <UButton
            type="button"
            color="neutral"
            variant="soft"
            size="sm"
            icon="i-tabler-plus"
            @click="addItem(groupIndex)"
          >
            {{ $t('افزودن آیتم') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CategorySub } from '~/data/categories'
import { emptySubGroup } from '~/data/seller-categories'

const model = defineModel<CategorySub[]>({ required: true })

function commit(next: CategorySub[]) {
  model.value = next
}

function addGroup() {
  commit([...model.value, emptySubGroup()])
}

function removeGroup(index: number) {
  commit(model.value.filter((_, i) => i !== index))
}

function moveGroup(index: number, delta: number) {
  const target = index + delta
  if (target < 0 || target >= model.value.length) return
  const next = [...model.value]
  const [row] = next.splice(index, 1)
  next.splice(target, 0, row!)
  commit(next)
}

function updateGroup(index: number, patch: Partial<CategorySub>) {
  commit(model.value.map((group, i) => (i === index ? { ...group, ...patch } : group)))
}

function addItem(groupIndex: number) {
  commit(model.value.map((group, i) => {
    if (i !== groupIndex) return group
    return { ...group, items: [...group.items, ''] }
  }))
}

function updateItem(groupIndex: number, itemIndex: number, value: string) {
  commit(model.value.map((group, i) => {
    if (i !== groupIndex) return group
    const items = [...group.items]
    items[itemIndex] = value
    return { ...group, items }
  }))
}

function removeItem(groupIndex: number, itemIndex: number) {
  commit(model.value.map((group, i) => {
    if (i !== groupIndex) return group
    return { ...group, items: group.items.filter((_, j) => j !== itemIndex) }
  }))
}

function moveItem(groupIndex: number, itemIndex: number, delta: number) {
  commit(model.value.map((group, i) => {
    if (i !== groupIndex) return group
    const target = itemIndex + delta
    if (target < 0 || target >= group.items.length) return group
    const items = [...group.items]
    const [row] = items.splice(itemIndex, 1)
    items.splice(target, 0, row!)
    return { ...group, items }
  }))
}
</script>
