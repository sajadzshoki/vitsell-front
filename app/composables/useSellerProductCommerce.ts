import {
  emptyProductCommerce,
  type SellerProductCommerce,
  type SellerProductVariant,
} from '~/data/seller-product-variants'
import { emptySeoMeta } from '~/data/seo'

export function useSellerProductCommerce() {
  const map = useState<Record<string, SellerProductCommerce>>(
    'seller-product-commerce',
    () => ({}),
  )

  function getCommerce(productId: string): SellerProductCommerce {
    if (!map.value[productId]) {
      return emptyProductCommerce(productId)
    }
    return map.value[productId]!
  }

  function saveCommerce(productId: string, data: Partial<SellerProductCommerce>) {
    const previous = getCommerce(productId)
    const next: SellerProductCommerce = {
      ...previous,
      ...data,
      productId,
      seo: data.seo ? { ...emptySeoMeta(), ...data.seo } : previous.seo,
      variants: data.variants ? data.variants.map(v => ({ ...v })) : previous.variants,
      variantAxes: data.variantAxes ? data.variantAxes.map(a => ({ ...a })) : previous.variantAxes,
      tags: data.tags ? [...data.tags] : previous.tags,
    }
    map.value = { ...map.value, [productId]: next }
    return next
  }

  function setVariants(productId: string, variants: SellerProductVariant[]) {
    return saveCommerce(productId, { variants })
  }

  /** Alias used by public product SEO wiring */
  function getByProductId(productId: string): SellerProductCommerce {
    return getCommerce(productId)
  }

  return {
    map,
    getCommerce,
    getByProductId,
    saveCommerce,
    setVariants,
  }
}
