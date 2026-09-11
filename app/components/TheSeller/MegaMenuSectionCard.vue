<template>
  <div
    class="rounded-2xl border border-muted bg-default"
    :class="depth ? 'ms-4 md:ms-6' : ''"
  >
    <div class="flex items-start gap-2 px-3 py-3 flex-wrap">
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2 flex-wrap">
          <p class="font-bold text-sm text-highlighted">
            {{ section.title }}
          </p>
          <UBadge
            :color="section.status === 'active' ? 'success' : 'neutral'"
            variant="subtle"
            size="sm"
          >
            {{ section.status === 'active' ? $t('فعال') : $t('غیرفعال') }}
          </UBadge>
          <UBadge
            v-if="section.category"
            color="primary"
            variant="subtle"
            size="sm"
          >
            {{ section.category.name }}
          </UBadge>
        </div>
        <p class="text-xs text-muted mt-0.5">
          <span
            v-if="section.slug"
            class="num me-2"
            dir="ltr"
          >{{ section.slug }}</span>
          {{ section.items.length.toLocaleString('fa-IR') }} {{ $t('آیتم') }}
          ·
          {{ section.sections.length.toLocaleString('fa-IR') }} {{ $t('زیربخش') }}
        </p>
      </div>
      <div class="flex items-center gap-1 flex-wrap">
        <UButton
          v-if="can('mega_menu.update')"
          type="button"
          color="neutral"
          variant="ghost"
          size="xs"
          icon="i-tabler-arrow-up"
          class="cursor-pointer"
          :disabled="index === 0"
          @click="$emit('move-section', section.id, -1)"
        />
        <UButton
          v-if="can('mega_menu.update')"
          type="button"
          color="neutral"
          variant="ghost"
          size="xs"
          icon="i-tabler-arrow-down"
          class="cursor-pointer"
          :disabled="index === siblings.length - 1"
          @click="$emit('move-section', section.id, 1)"
        />
        <UButton
          v-if="can('mega_menu.update')"
          type="button"
          color="neutral"
          variant="ghost"
          size="xs"
          icon="i-tabler-pencil"
          class="cursor-pointer"
          @click="$emit('edit-section', section)"
        />
        <UButton
          v-if="can('mega_menu.update')"
          type="button"
          color="neutral"
          variant="ghost"
          size="xs"
          :icon="section.status === 'active' ? 'i-tabler-eye-off' : 'i-tabler-eye'"
          class="cursor-pointer"
          @click="$emit('toggle-section', section)"
        />
        <UButton
          v-if="can('mega_menu.create') || can('mega_menu.update')"
          type="button"
          color="primary"
          variant="ghost"
          size="xs"
          icon="i-tabler-folder-plus"
          class="cursor-pointer"
          @click="$emit('add-child', null, section.id)"
        />
        <UButton
          v-if="can('mega_menu.create') || can('mega_menu.update')"
          type="button"
          color="primary"
          variant="ghost"
          size="xs"
          icon="i-tabler-plus"
          class="cursor-pointer"
          @click="$emit('add-item', { sectionId: section.id })"
        />
        <UButton
          v-if="can('mega_menu.delete')"
          type="button"
          color="error"
          variant="ghost"
          size="xs"
          icon="i-tabler-trash"
          class="cursor-pointer"
          @click="$emit('delete-section', section.id)"
        />
      </div>
    </div>

    <ul
      v-if="section.items.length"
      class="border-t border-muted divide-y divide-muted"
    >
      <li
        v-for="(item, itemIndex) in section.items"
        :key="item.id"
        class="flex items-center gap-2 px-3 py-2"
      >
        <UBadge
          color="neutral"
          variant="subtle"
          size="sm"
          class="shrink-0"
        >
          {{ $t(megaMenuItemTypeLabel(item.type)) }}
        </UBadge>
        <div class="min-w-0 flex-1">
          <p class="text-sm text-default truncate">
            {{ item.title }}
          </p>
          <p class="text-[11px] text-muted truncate">
            <span
              v-if="item.slug"
              class="num me-1"
              dir="ltr"
            >{{ item.slug }}</span>
            {{ itemHint(item) }}
          </p>
        </div>
        <UBadge
          :color="item.status === 'active' ? 'success' : 'neutral'"
          variant="subtle"
          size="sm"
        >
          {{ item.status === 'active' ? $t('فعال') : $t('غیرفعال') }}
        </UBadge>
        <UButton
          v-if="can('mega_menu.update')"
          type="button"
          color="neutral"
          variant="ghost"
          size="xs"
          icon="i-tabler-arrow-up"
          class="cursor-pointer"
          :disabled="itemIndex === 0"
          @click="$emit('move-item', { sectionId: section.id, itemId: item.id, dir: -1 })"
        />
        <UButton
          v-if="can('mega_menu.update')"
          type="button"
          color="neutral"
          variant="ghost"
          size="xs"
          icon="i-tabler-arrow-down"
          class="cursor-pointer"
          :disabled="itemIndex === section.items.length - 1"
          @click="$emit('move-item', { sectionId: section.id, itemId: item.id, dir: 1 })"
        />
        <UButton
          v-if="can('mega_menu.update')"
          type="button"
          color="neutral"
          variant="ghost"
          size="xs"
          icon="i-tabler-pencil"
          class="cursor-pointer"
          @click="$emit('edit-item', { sectionId: section.id, item })"
        />
        <UButton
          v-if="can('mega_menu.update')"
          type="button"
          color="neutral"
          variant="ghost"
          size="xs"
          :icon="item.status === 'active' ? 'i-tabler-eye-off' : 'i-tabler-eye'"
          class="cursor-pointer"
          @click="$emit('toggle-item', item)"
        />
        <UButton
          v-if="can('mega_menu.delete')"
          type="button"
          color="error"
          variant="ghost"
          size="xs"
          icon="i-tabler-trash"
          class="cursor-pointer"
          @click="$emit('delete-item', item.id)"
        />
      </li>
    </ul>

    <div
      v-if="section.sections.length"
      class="p-3 space-y-3 border-t border-muted"
    >
      <TheSellerMegaMenuSectionCard
        v-for="(child, childIndex) in section.sections"
        :key="child.id"
        :section="child"
        :siblings="section.sections"
        :index="childIndex"
        :depth="depth + 1"
        @edit-section="$emit('edit-section', $event)"
        @add-child="(...args) => $emit('add-child', ...args)"
        @add-item="$emit('add-item', $event)"
        @edit-item="$emit('edit-item', $event)"
        @move-section="(...args) => $emit('move-section', ...args)"
        @move-item="$emit('move-item', $event)"
        @toggle-section="$emit('toggle-section', $event)"
        @toggle-item="$emit('toggle-item', $event)"
        @delete-section="$emit('delete-section', $event)"
        @delete-item="$emit('delete-item', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  megaMenuItemTypeLabel,
  type SellerMegaMenuItem,
  type SellerMegaMenuSection,
} from '~/data/mega-menu'

defineProps<{
  section: SellerMegaMenuSection
  siblings: SellerMegaMenuSection[]
  index: number
  depth: number
}>()

defineEmits<{
  'edit-section': [section: SellerMegaMenuSection]
  'add-child': [section: SellerMegaMenuSection | null, parentId?: string | null]
  'add-item': [payload: { sectionId: string, item?: SellerMegaMenuItem | null }]
  'edit-item': [payload: { sectionId: string, item?: SellerMegaMenuItem | null }]
  'move-section': [sectionId: string, dir: -1 | 1]
  'move-item': [payload: { sectionId: string, itemId: string, dir: -1 | 1 }]
  'toggle-section': [section: SellerMegaMenuSection]
  'toggle-item': [item: SellerMegaMenuItem]
  'delete-section': [id: string]
  'delete-item': [id: string]
}>()

const { can } = useSellerPermissions()

function itemHint(item: SellerMegaMenuItem) {
  if (item.type === 'category') return item.category?.name || item.categoryId || ''
  if (item.type === 'link') return item.url || ''
  const filter = item.filter
  if (!filter) return ''
  const parts: string[] = []
  if (filter.category) parts.push(filter.category)
  if (filter.brands?.length) parts.push(filter.brands.join('، '))
  if (filter.minPrice) parts.push(`min ${filter.minPrice}`)
  if (filter.maxPrice) parts.push(`max ${filter.maxPrice}`)
  if (filter.attrs) {
    for (const [slug, values] of Object.entries(filter.attrs)) {
      parts.push(`${slug}: ${values.join('|')}`)
    }
  }
  return parts.join(' · ')
}
</script>
