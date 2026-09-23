<script setup lang="ts">
/**
 * Legacy Digikala-style mega SEO paths → canonical `/search` (301).
 * Keeps old bookmarks / indexed URLs working without a second listing UI.
 */
import { toSearchRoute } from '~/data/categories'
import {
  megaMenuFilterToSearchRoute,
  type MegaMenuResolvePayload,
} from '~/data/mega-menu'

const route = useRoute()
const catId = String(route.params.catId ?? '').trim()
const rawPath = route.params.path
const parts = Array.isArray(rawPath)
  ? rawPath.map(p => String(p).trim()).filter(Boolean)
  : String(rawPath || '').split('/').map(p => p.trim()).filter(Boolean)

const pathKey = [catId, ...parts].filter(Boolean).join('/')

const { result } = pathKey
  ? await useGet<MegaMenuResolvePayload>(
      `/mega-menu/resolve?path=${encodeURIComponent(pathKey)}`,
      { headers: { 'no-error': true } },
    )
  : { result: null }

function resolveTarget() {
  if (result?.type === 'item' && !result.filter && result.href) {
    const href = result.href.trim()
    if (href && !href.startsWith('/category/')) return href
  }

  if (result?.filter) {
    return megaMenuFilterToSearchRoute(result.filter)
  }

  if (result?.category) {
    return toSearchRoute({ category: result.category })
  }

  if (result?.href?.trim().startsWith('/search')) {
    return result.href.trim()
  }

  if (catId) return toSearchRoute({ category: catId })
  return toSearchRoute({})
}

await navigateTo(resolveTarget(), { redirectCode: 301, replace: true })
</script>

<template>
  <div />
</template>
