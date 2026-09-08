<template>
  <TheSearchPage />
</template>

<script setup lang="ts">
/**
 * Legacy `/search?category=` → Digikala-style `/search/category-{id}` (SEO).
 * Manual search / filters stay on query (`?q=` / `?brands=`).
 */
const route = useRoute()
const category = String(route.query.category ?? '').trim()
if (category) {
  const nextQuery = { ...route.query }
  delete nextQuery.category
  await navigateTo(
    { path: `/search/category-${category}`, query: nextQuery },
    { redirectCode: 301, replace: true },
  )
}
</script>
