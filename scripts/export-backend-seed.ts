import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { products, categoryLabels } from '../app/data/products.ts'
import { categories } from '../app/data/categories.ts'
import { categoryPageMeta } from '../app/data/category-pages.ts'
import { productMockReviews, productMockQuestions } from '../app/data/product-detail.ts'
import { heroSlides, heroFeatures } from '../app/data/hero.ts'
import { homeBrands, homeCircleItems, homePromos } from '../app/data/home.ts'
import { cartDiscountCodes } from '../app/data/cart.ts'
import { citiesByProvince } from '../app/data/iran-locations.ts'
import { compareTemplates, radarCriteriaByCategory } from '../app/data/compare.ts'
import {
  footerTrustItems,
  footerColumns,
  footerSocials,
  footerAbout,
  footerCopyright,
  footerContact,
  footerAppStores,
  footerBadges,
} from '../app/data/footer.ts'
import {
  defaultSellerShop,
  defaultSellerListings,
  defaultSellerOrders,
  defaultSellerReviews,
  defaultSellerPayouts,
  defaultSellerSales,
} from '../app/data/seller.ts'
import { blogPosts, staticPages } from '../app/data/static-pages.ts'

const outDir = join(process.cwd(), '../digishop-back/database/seed_data')
mkdirSync(outDir, { recursive: true })

function write(name: string, data: unknown) {
  writeFileSync(join(outDir, name), JSON.stringify(data, null, 2), 'utf8')
  console.log('wrote', name)
}

write(
  'categories.json',
  categories.map((c) => ({
    ...c,
    pageMeta: categoryPageMeta[c.id] ?? null,
  })),
)

write(
  'products.json',
  products.map((p) => ({
    ...p,
    categoryLabel: p.categoryLabel || categoryLabels[p.category] || p.category,
  })),
)

write('reviews.json', productMockReviews)
write('questions.json', productMockQuestions)

write('content.json', {
  heroSlides,
  heroFeatures,
  homeBrands: [...homeBrands],
  homeCircles: homeCircleItems,
  homePromos,
  citiesByProvince,
  compareTemplates,
  radarCriteriaByCategory,
  footerTrustItems,
  footerColumns,
  footerSocials,
  footerAbout,
  footerCopyright,
  footerContact,
  footerAppStores,
  footerBadges,
  categoryLabels,
  cartDiscountCodes,
})

write('blog.json', blogPosts)

write(
  'static-pages.json',
  Object.values(staticPages).map((page) => ({
    id: page.id,
    path: page.path,
    title: page.title,
    subtitle: page.subtitle,
    icon: page.icon,
    sections: page.sections,
  })),
)

write('seller.json', {
  shop: defaultSellerShop,
  listings: defaultSellerListings,
  orders: defaultSellerOrders,
  reviews: defaultSellerReviews,
  payouts: defaultSellerPayouts,
  sales: defaultSellerSales,
})

console.log('done →', outDir)
