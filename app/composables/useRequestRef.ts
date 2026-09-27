/**
 * Per-request ref that is not copied into the Nuxt payload.
 * useState cannot hold a Promise — devalue throws while rendering HTML.
 */
const buckets = new WeakMap<object, Map<string, Ref<unknown>>>()

export function useRequestRef<T>(key: string, init: () => T) {
  const nuxtApp = useNuxtApp()
  let bucket = buckets.get(nuxtApp)
  if (!bucket) {
    bucket = new Map()
    buckets.set(nuxtApp, bucket)
  }
  const existing = bucket.get(key) as Ref<T> | undefined
  if (existing) return existing
  const created = ref(init()) as Ref<T>
  bucket.set(key, created)
  return created
}
