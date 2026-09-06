<template>
  <div>
    <div
      class="rounded-xl border border-muted bg-default overflow-hidden"
      :class="{ 'ring-1 ring-error': Boolean(error) }"
    >
      <UEditor
        v-slot="{ editor }"
        v-model="model"
        content-type="html"
        :placeholder="placeholder || $t('متن را بنویسید…')"
        :mention="false"
        :image="variant === 'full'"
        :handlers="customHandlers"
        dir="rtl"
        :class="minHeightClass"
        :ui="editorUi"
      >
        <UEditorToolbar
          :editor="editor"
          :items="toolbarItems"
          layout="fixed"
          color="neutral"
          variant="ghost"
          active-color="primary"
          active-variant="soft"
          size="sm"
          class="sticky top-0 z-1 flex flex-wrap gap-0.5 border-b border-muted bg-muted/40 px-2 py-1.5"
        />
      </UEditor>
    </div>
    <p
      v-if="error"
      class="mt-1.5 text-xs text-error"
    >
      {{ error }}
    </p>
    <p
      v-else-if="help"
      class="mt-1.5 text-xs text-muted leading-5"
    >
      {{ help }}
    </p>

    <TheSellerMediaPicker
      v-if="variant === 'full'"
      v-model:open="mediaOpen"
      kind="image"
      @select="onMediaSelect"
    />

    <UModal
      v-model:open="altOpen"
      :title="$t('متن جایگزین تصویر (alt)')"
      :description="$t('برای سئو و دسترس‌پذیری، توضیح کوتاه تصویر الزامی است')"
    >
      <template #body>
        <div class="space-y-3">
          <div
            v-if="pendingSrc"
            class="rounded-xl overflow-hidden border border-muted bg-muted aspect-video flex items-center justify-center"
          >
            <img
              :src="pendingSrc"
              :alt="pendingAlt || $t('پیش‌نمایش')"
              class="max-h-40 object-contain"
            >
          </div>
          <TheFormInput
            v-model="pendingAlt"
            :label="$t('متن جایگزین')"
            :placeholder="$t('مثلاً مقایسه دو گوشی روی میز')"
            :error="altError"
            required
            icon="i-tabler-text-caption"
          />
        </div>
      </template>
      <template #footer>
        <div class="flex items-center justify-end gap-2">
          <UButton
            type="button"
            color="neutral"
            variant="outline"
            class="cursor-pointer"
            @click="cancelAlt"
          >
            {{ $t('انصراف') }}
          </UButton>
          <UButton
            type="button"
            color="primary"
            class="cursor-pointer font-bold"
            @click="confirmAlt"
          >
            {{ $t('درج تصویر') }}
          </UButton>
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="linkOpen"
      :title="editingLink ? $t('ویرایش لینک') : $t('افزودن لینک')"
      :description="$t('ابتدا متن را انتخاب کنید، سپس آدرس کامل را وارد کنید')"
    >
      <template #body>
        <div class="space-y-3">
          <TheFormInput
            v-model="pendingHref"
            :label="$t('آدرس لینک')"
            placeholder="https://example.com یا /product/..."
            :error="linkError"
            required
            dir="ltr"
            icon="i-tabler-link"
            :help="$t('مثال: https://digishop.ir/blog/guide یا /search?category=mobile')"
            @keydown.enter.prevent="confirmLink"
          />
        </div>
      </template>
      <template #footer>
        <div class="flex items-center justify-between gap-2 w-full">
          <UButton
            v-if="editingLink"
            type="button"
            color="error"
            variant="ghost"
            class="cursor-pointer"
            @click="removeLink"
          >
            {{ $t('حذف لینک') }}
          </UButton>
          <div class="flex items-center gap-2 ms-auto">
            <UButton
              type="button"
              color="neutral"
              variant="outline"
              class="cursor-pointer"
              @click="cancelLink"
            >
              {{ $t('انصراف') }}
            </UButton>
            <UButton
              type="button"
              color="primary"
              class="cursor-pointer font-bold"
              @click="confirmLink"
            >
              {{ editingLink ? $t('ذخیره لینک') : $t('اعمال لینک') }}
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { EditorCustomHandlers, EditorToolbarItem } from '@nuxt/ui'
import type { Editor } from '@tiptap/vue-3'

export type TextEditorVariant = 'full' | 'simple'

const model = defineModel<string>({ default: '' })

const props = withDefaults(defineProps<{
  placeholder?: string
  error?: string
  help?: string
  /** full = blog/page body; simple = SEO / short descriptions */
  variant?: TextEditorVariant
  /** Tailwind min-height utility, e.g. min-h-72 or min-h-28 */
  minHeightClass?: string
}>(), {
  variant: 'full',
  minHeightClass: '',
})

const { t } = useI18n()
const toast = useAppToast()

const mediaOpen = ref(false)
const altOpen = ref(false)
const linkOpen = ref(false)
const pendingEditor = shallowRef<Editor | null>(null)
const pendingSrc = ref('')
const pendingAlt = ref('')
const altError = ref('')
const pendingHref = ref('')
const linkError = ref('')
const editingLink = ref(false)

const minHeightClass = computed(() => {
  if (props.minHeightClass) return props.minHeightClass
  return props.variant === 'simple' ? 'min-h-28' : 'min-h-72'
})

const editorUi = computed(() => ({
  base: `px-3 py-3 text-sm text-toned leading-8 focus:outline-none ${minHeightClass.value}`,
  content: 'ds-text-editor-content',
}))

function normalizeHref(raw: string) {
  const value = raw.trim()
  if (!value) return ''
  if (/^(https?:\/\/|mailto:|tel:|\/|#)/i.test(value)) return value
  return `https://${value}`
}

function openLinkModal(editor: Editor) {
  pendingEditor.value = editor
  const current = String(editor.getAttributes('link').href || '')
  editingLink.value = Boolean(current)
  pendingHref.value = current || 'https://'
  linkError.value = ''
  linkOpen.value = true
}

function cancelLink() {
  linkOpen.value = false
  pendingHref.value = ''
  linkError.value = ''
  editingLink.value = false
}

function removeLink() {
  const editor = pendingEditor.value
  if (editor) editor.chain().focus().extendMarkRange('link').unsetLink().run()
  cancelLink()
  pendingEditor.value = null
}

function confirmLink() {
  const href = normalizeHref(pendingHref.value)
  if (!href || href === 'https://') {
    linkError.value = t('آدرس لینک الزامی است')
    toast.warning(t('آدرس لینک را وارد کنید'))
    return
  }
  const editor = pendingEditor.value
  if (!editor) {
    cancelLink()
    return
  }
  const { empty } = editor.state.selection
  if (empty && !editor.isActive('link')) {
    linkError.value = t('ابتدا متن مورد نظر را انتخاب کنید')
    toast.warning(t('ابتدا متن مورد نظر را انتخاب کنید'))
    return
  }
  editor
    .chain()
    .focus()
    .extendMarkRange('link')
    .setLink({ href, target: '_blank', rel: 'noopener noreferrer' })
    .run()
  cancelLink()
  pendingEditor.value = null
}

function openImagePicker(editor: Editor) {
  pendingEditor.value = editor
  pendingSrc.value = ''
  pendingAlt.value = ''
  altError.value = ''
  mediaOpen.value = true
}

function onMediaSelect(value: string | string[]) {
  const src = Array.isArray(value) ? value[0] : value
  if (!src?.trim()) return
  pendingSrc.value = src.trim()
  pendingAlt.value = ''
  altError.value = ''
  altOpen.value = true
}

function cancelAlt() {
  altOpen.value = false
  pendingSrc.value = ''
  pendingAlt.value = ''
  altError.value = ''
}

function confirmAlt() {
  const alt = pendingAlt.value.trim()
  if (!alt) {
    altError.value = t('متن جایگزین الزامی است')
    toast.warning(t('برای سئو، alt تصویر را وارد کنید'))
    return
  }
  const editor = pendingEditor.value
  const src = pendingSrc.value
  if (!editor || !src) {
    cancelAlt()
    return
  }
  editor.chain().focus().setImage({ src, alt }).run()
  altOpen.value = false
  pendingSrc.value = ''
  pendingAlt.value = ''
  altError.value = ''
  pendingEditor.value = null
}

const customHandlers = computed((): EditorCustomHandlers => {
  const link = {
    canExecute: (editor: Editor) => editor.can().setLink({ href: '' }) || editor.can().unsetLink(),
    execute: (editor: Editor) => {
      openLinkModal(editor)
      return editor.chain()
    },
    isActive: (editor: Editor) => editor.isActive('link'),
    isDisabled: (editor: Editor) => {
      const { selection } = editor.state
      return selection.empty && !editor.isActive('link')
    },
  }
  if (props.variant === 'simple') {
    return { link } satisfies EditorCustomHandlers
  }
  return {
    link,
    image: {
      canExecute: (editor: Editor) => editor.can().setImage({ src: '' }),
      execute: (editor: Editor) => {
        openImagePicker(editor)
        return editor.chain()
      },
      isActive: (editor: Editor) => editor.isActive('image'),
      isDisabled: undefined,
    },
  } satisfies EditorCustomHandlers
})

const toolbarItems = computed((): EditorToolbarItem[][] => {
  const history: EditorToolbarItem[] = [
    { kind: 'undo', icon: 'i-tabler-arrow-back-up', tooltip: { text: t('بازگردانی') } },
    { kind: 'redo', icon: 'i-tabler-arrow-forward-up', tooltip: { text: t('جلو') } },
  ]
  const marks: EditorToolbarItem[] = [
    { kind: 'mark', mark: 'bold', icon: 'i-tabler-bold', tooltip: { text: t('ضخیم') } },
    { kind: 'mark', mark: 'italic', icon: 'i-tabler-italic', tooltip: { text: t('کج') } },
    { kind: 'mark', mark: 'underline', icon: 'i-tabler-underline', tooltip: { text: t('زیرخط') } },
    { kind: 'mark', mark: 'strike', icon: 'i-tabler-strikethrough', tooltip: { text: t('خط‌خورده') } },
  ]
  const linkItem: EditorToolbarItem = {
    kind: 'link',
    icon: 'i-tabler-link',
    tooltip: { text: t('لینک') },
  }
  const clear: EditorToolbarItem[] = [
    { kind: 'clearFormatting', icon: 'i-tabler-clear-formatting', tooltip: { text: t('پاک کردن قالب') } },
  ]

  if (props.variant === 'simple') {
    return [
      history,
      marks,
      [linkItem],
      clear,
    ]
  }

  return [
    history,
    [
      {
        icon: 'i-tabler-heading',
        tooltip: { text: t('تیترها (سئو)') },
        content: { align: 'start' },
        items: [
          { kind: 'heading', level: 2, icon: 'i-tabler-h-2', label: t('تیتر ۲') },
          { kind: 'heading', level: 3, icon: 'i-tabler-h-3', label: t('تیتر ۳') },
          { kind: 'heading', level: 4, icon: 'i-tabler-h-4', label: t('تیتر ۴') },
          { kind: 'paragraph', icon: 'i-tabler-pilcrow', label: t('پاراگراف') },
        ],
      },
      {
        icon: 'i-tabler-list',
        tooltip: { text: t('فهرست') },
        content: { align: 'start' },
        items: [
          { kind: 'bulletList', icon: 'i-tabler-list', label: t('فهرست نقطه‌ای') },
          { kind: 'orderedList', icon: 'i-tabler-list-numbers', label: t('فهرست عددی') },
        ],
      },
      { kind: 'blockquote', icon: 'i-tabler-blockquote', tooltip: { text: t('نقل‌قول') } },
      { kind: 'horizontalRule', icon: 'i-tabler-minus', tooltip: { text: t('خط جداکننده') } },
    ],
    marks,
    [
      linkItem,
      {
        kind: 'image',
        icon: 'i-tabler-photo',
        tooltip: { text: t('تصویر از کتابخانه') },
      },
    ],
    clear,
  ]
})
</script>

<style>
.ds-text-editor-content h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--ui-text-highlighted);
  margin: 1rem 0 0.5rem;
  line-height: 1.7;
}
.ds-text-editor-content h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--ui-text-highlighted);
  margin: 0.85rem 0 0.4rem;
  line-height: 1.7;
}
.ds-text-editor-content h4 {
  font-size: 1rem;
  font-weight: 700;
  color: var(--ui-text-highlighted);
  margin: 0.75rem 0 0.35rem;
  line-height: 1.7;
}
.ds-text-editor-content p {
  margin: 0.4rem 0;
}
.ds-text-editor-content ul {
  list-style: disc;
  padding-inline-start: 1.25rem;
  margin: 0.5rem 0;
}
.ds-text-editor-content ol {
  list-style: decimal;
  padding-inline-start: 1.25rem;
  margin: 0.5rem 0;
}
.ds-text-editor-content blockquote {
  border-inline-start: 3px solid var(--ui-primary);
  padding-inline-start: 0.85rem;
  margin: 0.75rem 0;
  color: var(--ui-text-muted);
}
.ds-text-editor-content a {
  color: var(--ui-primary);
  text-decoration: underline;
  cursor: pointer;
}
.ds-text-editor-content img {
  max-width: 100%;
  border-radius: 0.75rem;
  margin: 0.75rem 0;
}
.ds-text-editor-content hr {
  border: 0;
  border-top: 1px solid var(--ui-border);
  margin: 1rem 0;
}
</style>
