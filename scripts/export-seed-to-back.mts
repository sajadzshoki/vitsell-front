import { writeFileSync, mkdirSync, readFileSync } from 'node:fs'
import { products, categoryLabels } from '../app/data/products.ts'
import { categories } from '../app/data/categories.ts'
import { categoryPageMeta } from '../app/data/category-pages.ts'
import { heroSlides, heroFeatures } from '../app/data/hero.ts'
import { homeBrands, homeCircleItems, homePromos } from '../app/data/home.ts'
import { cartDiscountCodes } from '../app/data/cart.ts'
import { citiesByProvince } from '../app/data/iran-locations.ts'
import { compareTemplates, radarCriteriaByCategory } from '../app/data/compare.ts'
import { footerTrustItems, footerColumns, footerSocials } from '../app/data/footer.ts'
import {
  defaultSellerShop,
  defaultSellerListings,
  defaultSellerOrders,
  defaultSellerReviews,
  defaultSellerPayouts,
  defaultSellerSales,
} from '../app/data/seller.ts'

function extractExportArray(source: string, exportName: string): unknown {
  const marker = `export const ${exportName}`
  const start = source.indexOf(marker)
  if (start < 0) throw new Error(`missing ${exportName}`)
  const eq = source.indexOf('=', start)
  const arrStart = source.indexOf('[', eq)
  let depth = 0
  let end = arrStart
  for (let i = arrStart; i < source.length; i++) {
    if (source[i] === '[') depth++
    if (source[i] === ']') {
      depth--
      if (depth === 0) {
        end = i + 1
        break
      }
    }
  }
  // strip trailing `as const` and TS-only; evaluate as JS with Function
  const literal = source.slice(arrStart, end)
  return Function(`"use strict"; return (${literal})`)()
}

const productDetailSrc = readFileSync('./app/data/product-detail.ts', 'utf8')
const productMockReviews = extractExportArray(productDetailSrc, 'productMockReviews')
const productMockQuestions = extractExportArray(productDetailSrc, 'productMockQuestions')

const staticSrc = readFileSync('./app/data/static-pages.ts', 'utf8')
const blogPosts = extractExportArray(staticSrc, 'blogPosts')

const outDir = 'D:/digishop-back/database/seed_data'
mkdirSync(outDir, { recursive: true })

function write(name: string, data: unknown) {
  writeFileSync(`${outDir}/${name}`, JSON.stringify(data, null, 2), 'utf8')
  console.log('wrote', name)
}

write('products.json', products)
write(
  'categories.json',
  categories.map((c) => ({
    ...c,
    pageMeta: (categoryPageMeta as Record<string, unknown>)[c.id] ?? null,
  }))
)
write('reviews.json', productMockReviews)
write('questions.json', productMockQuestions)
write('content.json', {
  heroSlides,
  heroFeatures,
  homeBrands,
  homeCircles: homeCircleItems,
  homePromos,
  citiesByProvince,
  compareTemplates,
  radarCriteriaByCategory,
  footerTrustItems,
  footerColumns,
  footerSocials,
  categoryLabels,
  cartDiscountCodes,
})
write('blog.json', blogPosts)
write('seller.json', {
  shop: defaultSellerShop,
  listings: defaultSellerListings,
  orders: defaultSellerOrders,
  reviews: defaultSellerReviews,
  payouts: defaultSellerPayouts,
  sales: defaultSellerSales,
})

console.log('done products=', products.length)
