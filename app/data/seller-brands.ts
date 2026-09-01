import { emptySeoMeta, type SeoMeta } from '~/data/seo'

export type SellerBrandStatus = 'active' | 'inactive'

export type SellerBrand = {
  id: string
  name: string
  slug: string
  logo: string | null
  description: string
  status: SellerBrandStatus
  sortOrder: number
  seo: SeoMeta
  createdAt: string
  updatedAt: string
}

export type SellerBrandFormValues = {
  id: string
  name: string
  slug: string
  logo: string
  description: string
  status: SellerBrandStatus
  sortOrder: number
  seo: SeoMeta
}

export const brandSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function emptyBrandForm(): SellerBrandFormValues {
  return {
    id: '',
    name: '',
    slug: '',
    logo: '',
    description: '',
    status: 'active',
    sortOrder: 0,
    seo: emptySeoMeta(),
  }
}

export function toBrandForm(brand: SellerBrand): SellerBrandFormValues {
  return {
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
    logo: brand.logo ?? '',
    description: brand.description,
    status: brand.status,
    sortOrder: brand.sortOrder,
    seo: { ...emptySeoMeta(), ...(brand.seo || {}) },
  }
}

export function buildDefaultSellerBrands(): SellerBrand[] {
  const now = new Date().toISOString()
  const names = [
    'Apple', 'Samsung', 'Xiaomi', 'Sony', 'LG', 'ASUS', 'Lenovo', 'HP',
    'Nike', 'Adidas', 'Canon', 'JBL', 'Huawei', 'Dell',
  ]
  return names.map((name, index) => ({
    id: `brand-${name.toLowerCase()}`,
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    logo: null,
    description: '',
    status: 'active' as const,
    sortOrder: index,
    seo: emptySeoMeta(),
    createdAt: now,
    updatedAt: now,
  }))
}
