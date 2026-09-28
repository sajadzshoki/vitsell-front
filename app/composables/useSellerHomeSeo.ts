import type { HomeSeoBlock } from '~/data/home'

function apiMessage(error: { data?: { errors?: { message?: string }[], message?: string } } | null | undefined, fallback: string) {
  return error?.data?.errors?.map(item => item.message).filter(Boolean).join(' ، ')
    || error?.data?.message
    || fallback
}

function mapBlock(raw: Partial<HomeSeoBlock>): HomeSeoBlock | null {
  const title = String(raw.title || '').trim()
  const paragraphs = Array.isArray(raw.paragraphs)
    ? raw.paragraphs.map(item => String(item || '').trim()).filter(Boolean)
    : []
  const label = String(raw.inlineLink?.label || '').trim()
  const to = String(raw.inlineLink?.to || '').trim()
  if (!title || !paragraphs.length) return null
  const block: HomeSeoBlock = { title, paragraphs }
  if (label && to) block.inlineLink = { label, to }
  return block
}

export function useSellerHomeSeo() {
  async function fetchHomeSeo() {
    const { result, error } = await useGet<{ blocks: HomeSeoBlock[] }>('/seller/home-seo', {
      headers: { 'no-error': true },
    })
    if (error || !result) {
      return { ok: false as const, blocks: [] as HomeSeoBlock[], message: apiMessage(error, 'بارگذاری متن صفحه اصلی ناموفق بود') }
    }
    const blocks = Array.isArray(result.blocks)
      ? result.blocks.map(mapBlock).filter((block): block is HomeSeoBlock => Boolean(block))
      : []
    return { ok: true as const, blocks, message: '' }
  }

  async function saveHomeSeo(blocks: HomeSeoBlock[]) {
    const { result, error } = await usePut<{ blocks: HomeSeoBlock[] }>('/seller/home-seo', { blocks }, {
      headers: { 'no-error': true },
    })
    if (error || !result) {
      return { ok: false as const, blocks: [] as HomeSeoBlock[], message: apiMessage(error, 'ذخیره متن صفحه اصلی ناموفق بود') }
    }
    const saved = Array.isArray(result.blocks)
      ? result.blocks.map(mapBlock).filter((block): block is HomeSeoBlock => Boolean(block))
      : []
    return { ok: true as const, blocks: saved, message: '' }
  }

  return { fetchHomeSeo, saveHomeSeo }
}
