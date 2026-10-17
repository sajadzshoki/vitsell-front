import type { SeoMeta } from '~/data/seo'
import type {
  SellerProductVariant,
  SellerProductVariantAxis,
} from '~/data/seller-product-variants'

export type ProductColor = {
  name: string
  hex: string
}

export type ProductSpec = {
  key: string
  value: string
  /** Optional section title (e.g. from Technolife configurations groups) */
  group?: string
}

export type Product = {
  id: string
  title: string
  brand: string
  category: string
  categoryLabel: string
  price: number
  oldPrice?: number
  rating: number
  reviews: number
  image: string
  /** Optional product image for dark color mode */
  imageDark?: string
  gallery?: string[]
  /** Alt text keyed by stored image URL (main, dark, gallery). */
  imageAlts?: Record<string, string>
  /** تصاویر اختصاصی سکشن معرفی (در غیر این صورت از gallery استفاده می‌شود) */
  descImages?: string[]
  /** آدرس ویدیو معرفی محصول */
  video?: string
  badge?: string
  colors?: ProductColor[]
  inStock?: boolean
  fastDelivery?: boolean
  shortDesc?: string
  shortName?: string
  description?: string
  features?: string[]
  buyNotes?: { icon: string, text: string }[]
  scores?: Record<string, number>
  specs?: ProductSpec[]
  seo?: SeoMeta
  tags?: string[]
  featured?: boolean
  published?: boolean
  hasVariants?: boolean
  sku?: string
  barcode?: string
  weight?: string
  /** موجودی انبار (از listing)؛ برای هشدار کم‌موجودی روی کارت */
  stock?: number
  lowStockThreshold?: number
  variantAxes?: SellerProductVariantAxis[]
  variants?: SellerProductVariant[]
  /** Seller-curated related product ids (one-way). Empty = show nothing. */
  relatedProductIds?: string[]
}

export const categoryLabels: Record<string, string> = {
  mobile: 'موبایل',
  laptop: 'لپ‌تاپ',
  audio: 'صوتی',
  tv: 'تلویزیون',
  camera: 'دوربین',
  watch: 'ساعت هوشمند',
  gaming: 'کنسول بازی',
  home: 'لوازم خانگی',
  fashion: 'مد و پوشاک',
  beauty: 'زیبایی و سلامت',
}

const featuredProducts: Product[] = [
  {
    id: 'iphone-16-pro',
    shortName: 'iPhone 16 Pro Max',
    scores: { 'عملکرد': 98, 'دوربین': 97, 'باتری': 74, 'نمایشگر': 95, 'طراحی': 94, 'ارزش خرید': 72 },
    title: 'گوشی موبایل اپل iPhone 16 Pro Max ظرفیت ۲۵۶ گیگابایت',
    brand: 'Apple',
    category: 'mobile',
    categoryLabel: 'موبایل',
    price: 89_900_000,
    oldPrice: 102_500_000,
    rating: 4.8,
    reviews: 1245,
    image: '/images/mock/iphone16pro-desert.jpg',
    gallery: [
      '/images/mock/iphone16pro-desert.jpg',
      '/images/mock/iphone16_PNG13.png',
      '/images/mock/galaxy-s25-ultra.jpg',
      '/images/mock/pngtree-samsung-s25-ultra-pro-mobile-phone-png-image_17883915.png',
      '/images/mock/ipad-pro-m4.jpg',
      '/images/mock/apple-watch-ultra.jpg',
      '/images/mock/macbook-m4-spaceblack.jpg',
      '/images/mock/sony-xm5-midnight.jpg',
      '/images/mock/ps5-pro.jpg',
      '/images/mock/hero-tech-ecosystem.jpg',
    ],
    badge: 'پیشنهاد ویژه',
    colors: [
      { name: 'تیتانیوم طبیعی', hex: '#8a8578' },
      { name: 'مشکی', hex: '#1c1c1e' },
      { name: 'سفید', hex: '#f5f5f0' },
      { name: 'آبی تیتانیوم', hex: '#3a4a5c' },
    ],
    inStock: true,
    fastDelivery: true,
    shortDesc:
      'آیفون ۱۶ پرو مکس با تراشه قدرتمند A18 Pro، بدنه تیتانیومی سبک و دوربین ۴۸ مگاپیکسلی پیشرفته، تجربه‌ای بی‌نظیر از فناوری روز دنیا را به شما هدیه می‌دهد.',
    description:
      'طراحی تیتانیومی نسل دوم، سبک‌تر و مقاوم‌تر از همیشه است و حس لوکس بودن را در دستان شما قرار می‌دهد.\nدوربین‌های پیشرفته با قابلیت کنترل دوربین و زوم اپتیکال، ثبت لحظات را به سطحی تازه می‌رسانند.\nباتری بهینه‌شده همراه با تراشه A18 Pro، عملکرد پایدار در بازی، فیلم‌برداری و کارهای روزمره را تضمین می‌کند.',
    video: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    descImages: [
      '/images/mock/iphone16pro-desert.jpg',
      '/images/mock/galaxy-s25-ultra.jpg',
      '/images/mock/ipad-pro-m4.jpg',
      '/images/mock/apple-watch-ultra.jpg',
    ],
    specs: [
      { key: 'صفحه‌نمایش', value: '۶.۹ اینچ Super Retina XDR OLED' },
      { key: 'پردازنده', value: 'Apple A18 Pro' },
      { key: 'حافظه داخلی', value: '۲۵۶ گیگابایت' },
      { key: 'رم', value: '۸ گیگابایت' },
      { key: 'دوربین اصلی', value: '۴۸ + ۱۲ + ۱۲ مگاپیکسل' },
      { key: 'باتری', value: '۴۶۸۵ میلی‌آمپرساعت' },
      { key: 'سیستم‌عامل', value: 'iOS 18' },
      { key: 'گارانتی', value: '۱۸ ماه گارانتی رسمی' },
    ],
  },
  {
    id: 'galaxy-s25-ultra',
    shortName: 'Galaxy S25 Ultra',
    scores: { 'عملکرد': 95, 'دوربین': 94, 'باتری': 82, 'نمایشگر': 93, 'طراحی': 90, 'ارزش خرید': 78 },
    title: 'گوشی موبایل سامسونگ Galaxy S25 Ultra ظرفیت ۵۱۲ گیگابایت',
    brand: 'Samsung',
    category: 'mobile',
    categoryLabel: 'موبایل',
    price: 72_400_000,
    oldPrice: 84_000_000,
    rating: 4.7,
    reviews: 645,
    image: '/images/mock/galaxy-s25-ultra.jpg',
    gallery: [
      '/images/mock/galaxy-s25-ultra.jpg',
      '/images/mock/pngtree-samsung-s25-ultra-pro-mobile-phone-png-image_17883915.png',
      '/images/mock/iphone16pro-desert.jpg',
      '/images/mock/iphone16_PNG13.png',
      '/images/mock/ipad-pro-m4.jpg',
      '/images/mock/apple-watch-ultra.jpg',
      '/images/mock/sony-xm5-midnight.jpg',
      '/images/mock/macbook-m4-spaceblack.jpg',
      '/images/mock/ps5-pro.jpg',
    ],
    badge: 'پرفروش',
    inStock: false,
    shortDesc: 'گلکسی S25 اولترا با قلم S Pen و دوربین قدرتمند ۲۰۰ مگاپیکسلی.',
  },
  {
    id: 'macbook-m4',
    shortName: 'MacBook Pro M4',
    scores: { 'عملکرد': 97, 'نمایشگر': 96, 'باتری': 85, 'قابلیت حمل': 88, 'کیفیت ساخت': 97, 'ارزش خرید': 75 },
    title: 'لپ‌تاپ اپل MacBook Pro 14 M4 با ۱۸GB RAM و ۵۱۲GB SSD',
    brand: 'Apple',
    category: 'laptop',
    categoryLabel: 'لپ‌تاپ',
    price: 145_000_000,
    oldPrice: 158_000_000,
    rating: 4.9,
    reviews: 512,
    image: '/images/mock/macbook-m4-spaceblack.jpg',
    badge: 'جدید',
    inStock: true,
  },
  {
    id: 'sony-xm5',
    shortName: 'WH-1000XM5',
    scores: { 'کیفیت صدا': 94, 'حذف نویز': 96, 'باتری': 88, 'راحتی': 84, 'امکانات': 82, 'ارزش خرید': 80 },
    title: 'هدفون بی‌سیم سونی مدل WH-1000XM5 با نویزکنسلینگ فعال',
    brand: 'Sony',
    category: 'audio',
    categoryLabel: 'صوتی',
    price: 18_500_000,
    oldPrice: 22_000_000,
    rating: 4.8,
    reviews: 890,
    image: '/images/mock/sony-xm5-midnight.jpg',
    inStock: true,
    fastDelivery: true,
  },
  {
    id: 'apple-watch-ultra',
    shortName: 'Apple Watch Ultra',
    scores: { 'نمایشگر': 92, 'باتری': 62, 'سنسورها': 88, 'قابلیت حمل': 90, 'امکانات': 85, 'ارزش خرید': 76 },
    title: 'ساعت هوشمند اپل واچ اولترا سایز ۴۹ میلی‌متر با بند اسپرت',
    brand: 'Apple',
    category: 'watch',
    categoryLabel: 'ساعت هوشمند',
    price: 21_800_000,
    oldPrice: 25_500_000,
    rating: 4.6,
    reviews: 428,
    image: '/images/mock/apple-watch-ultra.jpg',
    inStock: true,
  },
  {
    id: 'ps5-pro',
    shortName: 'PS5 Pro',
    scores: { 'عملکرد': 95, 'گرافیک': 96, 'حافظه': 80, 'سرعت': 85, 'ارزش خرید': 74 },
    title: 'کنسول بازی سونی PlayStation 5 Pro نسخه استاندارد با درایو دیسک',
    brand: 'Sony',
    category: 'gaming',
    categoryLabel: 'کنسول بازی',
    price: 32_500_000,
    oldPrice: 36_000_000,
    rating: 4.8,
    reviews: 2140,
    image: '/images/mock/ps5-pro.jpg',
    badge: 'موجود شد',
    inStock: true,
    fastDelivery: true,
  },
  {
    id: 'ipad-pro-m4',
    title: 'تبلت اپل iPad Pro M4 ظرفیت ۲۵۶ گیگابایت',
    brand: 'Apple',
    category: 'laptop',
    categoryLabel: 'لپ‌تاپ',
    price: 68_000_000,
    oldPrice: 75_000_000,
    rating: 4.8,
    reviews: 310,
    image: '/images/mock/ipad-pro-m4.jpg',
    inStock: true,
  },
]

const catalogImages = {
  phone: '/images/mock/iphone16pro-desert.jpg',
  samsung: '/images/mock/galaxy-s25-ultra.jpg',
  laptop: '/images/mock/macbook-m4-spaceblack.jpg',
  tablet: '/images/mock/ipad-pro-m4.jpg',
  audio: '/images/mock/sony-xm5-midnight.jpg',
  watch: '/images/mock/apple-watch-ultra.jpg',
  gaming: '/images/mock/ps5-pro.jpg',
} as const

type CatalogSeed = {
  id: string
  title: string
  brand: string
  category: keyof typeof categoryLabels
  price: number
  oldPrice?: number
  rating: number
  reviews: number
  image: string
  badge?: string
  inStock?: boolean
  fastDelivery?: boolean
}

const catalogSeeds: CatalogSeed[] = [
  { id: 'xiaomi-15-ultra', title: 'گوشی موبایل شیائومی 15 Ultra ظرفیت ۵۱۲ گیگابایت', brand: 'Xiaomi', category: 'mobile', price: 41_200_000, oldPrice: 46_800_000, rating: 4.6, reviews: 388, image: catalogImages.samsung, badge: 'پیشنهاد ویژه', fastDelivery: true },
  { id: 'samsung-a56', title: 'گوشی موبایل سامسونگ Galaxy A56 ظرفیت ۲۵۶ گیگابایت', brand: 'Samsung', category: 'mobile', price: 18_900_000, oldPrice: 21_400_000, rating: 4.4, reviews: 920, image: catalogImages.samsung, fastDelivery: true },
  { id: 'honor-400-pro', title: 'گوشی موبایل آنر 400 Pro ظرفیت ۵۱۲ گیگابایت', brand: 'Honor', category: 'mobile', price: 24_700_000, rating: 4.3, reviews: 210, image: catalogImages.phone, inStock: true },
  { id: 'huawei-pura-80', title: 'گوشی موبایل هوآوی Pura 80 ظرفیت ۲۵۶ گیگابایت', brand: 'Huawei', category: 'mobile', price: 36_500_000, oldPrice: 39_900_000, rating: 4.5, reviews: 156, image: catalogImages.phone, badge: 'جدید' },
  { id: 'nokia-g42', title: 'گوشی موبایل نوکیا G42 ظرفیت ۱۲۸ گیگابایت', brand: 'Nokia', category: 'mobile', price: 7_800_000, rating: 4.1, reviews: 640, image: catalogImages.samsung, inStock: true, fastDelivery: true },
  { id: 'pixel-9-pro', title: 'گوشی موبایل گوگل Pixel 9 Pro ظرفیت ۲۵۶ گیگابایت', brand: 'Google', category: 'mobile', price: 52_400_000, oldPrice: 58_000_000, rating: 4.7, reviews: 274, image: catalogImages.phone, badge: 'پرفروش' },
  { id: 'iphone-16', title: 'گوشی موبایل اپل iPhone 16 ظرفیت ۱۲۸ گیگابایت', brand: 'Apple', category: 'mobile', price: 64_900_000, oldPrice: 71_200_000, rating: 4.8, reviews: 1880, image: catalogImages.phone, fastDelivery: true },
  { id: 'galaxy-z-fold7', title: 'گوشی تاشو سامسونگ Galaxy Z Fold7 ظرفیت ۵۱۲ گیگابایت', brand: 'Samsung', category: 'mobile', price: 98_000_000, oldPrice: 109_000_000, rating: 4.6, reviews: 132, image: catalogImages.samsung, badge: 'جدید' },
  { id: 'redmi-note-14', title: 'گوشی موبایل شیائومی Redmi Note 14 Pro ظرفیت ۲۵۶ گیگابایت', brand: 'Xiaomi', category: 'mobile', price: 14_200_000, oldPrice: 16_500_000, rating: 4.4, reviews: 1540, image: catalogImages.samsung, fastDelivery: true },
  { id: 'nothing-phone-3', title: 'گوشی موبایل ناتینگ Phone 3 ظرفیت ۲۵۶ گیگابایت', brand: 'Nothing', category: 'mobile', price: 27_600_000, rating: 4.5, reviews: 98, image: catalogImages.phone },
  { id: 'asus-zenbook-14', title: 'لپ‌تاپ ایسوس Zenbook 14 OLED با ۱۶ گیگابایت رم و Core Ultra', brand: 'ASUS', category: 'laptop', price: 62_800_000, oldPrice: 69_500_000, rating: 4.6, reviews: 241, image: catalogImages.laptop, badge: 'پرفروش', fastDelivery: true },
  { id: 'asus-tuf-f16', title: 'لپ‌تاپ گیمینگ ایسوس TUF F16 با RTX 4060 و ۳۲ گیگابایت رم', brand: 'ASUS', category: 'laptop', price: 78_400_000, oldPrice: 86_000_000, rating: 4.5, reviews: 410, image: catalogImages.laptop, badge: 'پیشنهاد ویژه' },
  { id: 'asus-rog-strix', title: 'لپ‌تاپ گیمینگ ایسوس ROG Strix G16 با Core i9 و RTX 4070', brand: 'ASUS', category: 'laptop', price: 124_000_000, oldPrice: 138_000_000, rating: 4.8, reviews: 187, image: catalogImages.laptop, badge: 'جدید' },
  { id: 'lenovo-yoga-slim', title: 'لپ‌تاپ لنوو Yoga Slim 7 با پردازنده AMD Ryzen AI', brand: 'Lenovo', category: 'laptop', price: 54_900_000, oldPrice: 61_200_000, rating: 4.4, reviews: 166, image: catalogImages.laptop, fastDelivery: true },
  { id: 'lenovo-loq-15', title: 'لپ‌تاپ گیمینگ لنوو LOQ 15 با RTX 4050 و ۱۶ گیگابایت رم', brand: 'Lenovo', category: 'laptop', price: 48_700_000, rating: 4.3, reviews: 320, image: catalogImages.laptop },
  { id: 'hp-spectre-x360', title: 'لپ‌تاپ اچ‌پی Spectre x360 تبدیل‌شونده ۱۳ اینچ', brand: 'HP', category: 'laptop', price: 71_300_000, oldPrice: 79_800_000, rating: 4.5, reviews: 144, image: catalogImages.laptop },
  { id: 'hp-pavilion-15', title: 'لپ‌تاپ دانشجویی اچ‌پی Pavilion 15 با ۱۶ گیگابایت رم', brand: 'HP', category: 'laptop', price: 36_200_000, oldPrice: 41_000_000, rating: 4.2, reviews: 580, image: catalogImages.laptop, fastDelivery: true },
  { id: 'acer-swift-go', title: 'لپ‌تاپ ایسر Swift Go 14 با نمایشگر OLED', brand: 'Acer', category: 'laptop', price: 44_500_000, rating: 4.3, reviews: 203, image: catalogImages.laptop },
  { id: 'acer-nitro-16', title: 'لپ‌تاپ گیمینگ ایسر Nitro 16 با RTX 4060', brand: 'Acer', category: 'laptop', price: 67_900_000, oldPrice: 74_400_000, rating: 4.4, reviews: 276, image: catalogImages.laptop, badge: 'پرفروش' },
  { id: 'surface-laptop-7', title: 'لپ‌تاپ مایکروسافت Surface Laptop 7 با پردازنده Snapdragon X', brand: 'Microsoft', category: 'laptop', price: 89_600_000, oldPrice: 96_000_000, rating: 4.6, reviews: 119, image: catalogImages.laptop, badge: 'جدید' },
  { id: 'macbook-air-m3', title: 'لپ‌تاپ اپل MacBook Air 13 M3 با ۱۶ گیگابایت رم', brand: 'Apple', category: 'laptop', price: 79_800_000, oldPrice: 86_400_000, rating: 4.8, reviews: 734, image: catalogImages.laptop, fastDelivery: true },
  { id: 'macbook-pro-16', title: 'لپ‌تاپ اپل MacBook Pro 16 M4 Max برای برنامه‌نویسی و طراحی', brand: 'Apple', category: 'laptop', price: 198_000_000, oldPrice: 214_000_000, rating: 4.9, reviews: 88, image: catalogImages.laptop },
  { id: 'ipad-air-m2', title: 'تبلت اپل iPad Air M2 ظرفیت ۱۲۸ گیگابایت', brand: 'Apple', category: 'laptop', price: 38_500_000, oldPrice: 42_900_000, rating: 4.7, reviews: 455, image: catalogImages.tablet, fastDelivery: true },
  { id: 'galaxy-tab-s10', title: 'تبلت سامسونگ Galaxy Tab S10 Ultra ظرفیت ۲۵۶ گیگابایت', brand: 'Samsung', category: 'laptop', price: 52_100_000, rating: 4.6, reviews: 167, image: catalogImages.tablet },
  { id: 'airpods-pro-2', title: 'ایرپاد اپل AirPods Pro 2 با نویزکنسلینگ فعال', brand: 'Apple', category: 'audio', price: 12_400_000, oldPrice: 14_800_000, rating: 4.8, reviews: 2100, image: catalogImages.audio, badge: 'پرفروش', fastDelivery: true },
  { id: 'airpods-max', title: 'هدفون ایرپاد مکس اپل با قابلیت Spatial Audio', brand: 'Apple', category: 'audio', price: 28_900_000, oldPrice: 32_500_000, rating: 4.6, reviews: 390, image: catalogImages.audio },
  { id: 'sony-linkbuds', title: 'هدفون بی‌سیم سونی LinkBuds Fit برای ورزش', brand: 'Sony', category: 'audio', price: 8_600_000, rating: 4.3, reviews: 214, image: catalogImages.audio, fastDelivery: true },
  { id: 'jbl-tune-770', title: 'هدفون بلوتوثی جی‌بی‌ال Tune 770NC', brand: 'JBL', category: 'audio', price: 6_900_000, oldPrice: 8_200_000, rating: 4.4, reviews: 880, image: catalogImages.audio, badge: 'پیشنهاد ویژه' },
  { id: 'jbl-charge-5', title: 'اسپیکر قابل حمل جی‌بی‌ال Charge 5', brand: 'JBL', category: 'audio', price: 7_400_000, rating: 4.7, reviews: 1260, image: catalogImages.audio, fastDelivery: true },
  { id: 'anker-soundcore', title: 'هدفون انکر Soundcore Space One با نویزکنسلینگ', brand: 'Anker', category: 'audio', price: 5_200_000, oldPrice: 6_400_000, rating: 4.5, reviews: 670, image: catalogImages.audio },
  { id: 'sennheiser-momentum', title: 'هدفون سنهایزر Momentum 4 Wireless', brand: 'Sennheiser', category: 'audio', price: 16_800_000, oldPrice: 19_200_000, rating: 4.7, reviews: 233, image: catalogImages.audio },
  { id: 'bose-qc-ultra', title: 'هدفون بوز QuietComfort Ultra با نویزکنسلینگ', brand: 'Bose', category: 'audio', price: 19_400_000, rating: 4.6, reviews: 301, image: catalogImages.audio, badge: 'جدید' },
  { id: 'samsung-qled-65', title: 'تلویزیون سامسونگ ۶۵ اینچ QLED 4K مدل Q80D', brand: 'Samsung', category: 'tv', price: 68_500_000, oldPrice: 79_000_000, rating: 4.5, reviews: 412, image: catalogImages.tablet, badge: 'پیشنهاد ویژه' },
  { id: 'lg-oled-c4', title: 'تلویزیون ال‌جی ۵۵ اینچ OLED C4 هوشمند', brand: 'LG', category: 'tv', price: 82_000_000, oldPrice: 91_500_000, rating: 4.8, reviews: 198, image: catalogImages.tablet, badge: 'پرفروش' },
  { id: 'lg-nanocell-50', title: 'تلویزیون ال‌جی ۵۰ اینچ NanoCell 4K', brand: 'LG', category: 'tv', price: 32_400_000, rating: 4.3, reviews: 355, image: catalogImages.tablet, fastDelivery: true },
  { id: 'sony-bravia-75', title: 'تلویزیون سونی ۷۵ اینچ Bravia 7 Mini LED', brand: 'Sony', category: 'tv', price: 145_000_000, oldPrice: 162_000_000, rating: 4.7, reviews: 76, image: catalogImages.tablet },
  { id: 'xiaomi-tv-a-65', title: 'تلویزیون شیائومی ۶۵ اینچ A Pro 4K', brand: 'Xiaomi', category: 'tv', price: 28_700_000, oldPrice: 33_200_000, rating: 4.2, reviews: 890, image: catalogImages.tablet, fastDelivery: true },
  { id: 'sony-a7c-ii', title: 'دوربین بدون آینه سونی Alpha 7C II بدنه', brand: 'Sony', category: 'camera', price: 96_400_000, oldPrice: 104_000_000, rating: 4.8, reviews: 142, image: catalogImages.watch, badge: 'جدید' },
  { id: 'canon-r8', title: 'دوربین کانن EOS R8 بدون آینه', brand: 'Canon', category: 'camera', price: 71_800_000, rating: 4.6, reviews: 118, image: catalogImages.watch },
  { id: 'canon-g7x', title: 'دوربین کامپکت کانن PowerShot G7 X Mark III', brand: 'Canon', category: 'camera', price: 34_200_000, oldPrice: 38_900_000, rating: 4.5, reviews: 267, image: catalogImages.watch, fastDelivery: true },
  { id: 'gopro-13', title: 'دوربین ورزشی گوپرو Hero 13 Black', brand: 'GoPro', category: 'camera', price: 21_600_000, oldPrice: 24_800_000, rating: 4.7, reviews: 540, image: catalogImages.watch, badge: 'پرفروش' },
  { id: 'dji-osmo-pocket', title: 'دوربین DJI Osmo Pocket 3 کریتور کمبو', brand: 'DJI', category: 'camera', price: 29_900_000, rating: 4.8, reviews: 333, image: catalogImages.watch },
  { id: 'galaxy-watch-7', title: 'ساعت هوشمند سامسونگ Galaxy Watch 7 سایز ۴۴', brand: 'Samsung', category: 'watch', price: 14_800_000, oldPrice: 17_200_000, rating: 4.5, reviews: 610, image: catalogImages.watch, fastDelivery: true },
  { id: 'galaxy-watch-ultra', title: 'ساعت هوشمند سامسونگ Galaxy Watch Ultra', brand: 'Samsung', category: 'watch', price: 27_400_000, rating: 4.6, reviews: 188, image: catalogImages.watch, badge: 'جدید' },
  { id: 'garmin-fenix-8', title: 'ساعت هوشمند گارمین Fenix 8 مخصوص ورزش', brand: 'Garmin', category: 'watch', price: 41_900_000, oldPrice: 46_500_000, rating: 4.7, reviews: 95, image: catalogImages.watch },
  { id: 'xiaomi-watch-s4', title: 'ساعت هوشمند شیائومی Watch S4', brand: 'Xiaomi', category: 'watch', price: 6_400_000, oldPrice: 7_800_000, rating: 4.3, reviews: 720, image: catalogImages.watch, fastDelivery: true },
  { id: 'amazfit-t-rex', title: 'ساعت هوشمند امیزفیت T-Rex 3', brand: 'Amazfit', category: 'watch', price: 8_100_000, rating: 4.4, reviews: 248, image: catalogImages.watch },
  { id: 'ps5-slim', title: 'کنسول بازی سونی PlayStation 5 Slim با درایو', brand: 'Sony', category: 'gaming', price: 28_900_000, oldPrice: 32_400_000, rating: 4.8, reviews: 1680, image: catalogImages.gaming, badge: 'موجود شد', fastDelivery: true },
  { id: 'xbox-series-x', title: 'کنسول بازی مایکروسافت Xbox Series X', brand: 'Microsoft', category: 'gaming', price: 31_200_000, rating: 4.7, reviews: 540, image: catalogImages.gaming },
  { id: 'nintendo-switch-2', title: 'کنسول بازی نینتندو Switch 2 نسخه استاندارد', brand: 'Nintendo', category: 'gaming', price: 24_600_000, oldPrice: 27_800_000, rating: 4.6, reviews: 312, image: catalogImages.gaming, badge: 'جدید' },
  { id: 'steam-deck-oled', title: 'کنسول دستی Steam Deck OLED ظرفیت ۱ ترابایت', brand: 'Valve', category: 'gaming', price: 36_800_000, rating: 4.8, reviews: 221, image: catalogImages.gaming },
  { id: 'dualsense-edge', title: 'دسته بازی سونی DualSense Edge برای پلی‌استیشن', brand: 'Sony', category: 'gaming', price: 9_700_000, oldPrice: 11_200_000, rating: 4.5, reviews: 430, image: catalogImages.gaming, fastDelivery: true },
  { id: 'dyson-v15', title: 'جاروبرقی ایستاده دایسون V15 Detect Absolute', brand: 'Dyson', category: 'home', price: 38_400_000, oldPrice: 44_000_000, rating: 4.7, reviews: 289, image: catalogImages.audio, badge: 'پیشنهاد ویژه' },
  { id: 'dyson-airwrap', title: 'حالت‌دهنده مو دایسون Airwrap Complete', brand: 'Dyson', category: 'home', price: 29_500_000, rating: 4.6, reviews: 510, image: catalogImages.watch },
  { id: 'lg-washer-9', title: 'ماشین لباسشویی ال‌جی ۹ کیلوگرمی اینورتر', brand: 'LG', category: 'home', price: 42_800_000, oldPrice: 48_600_000, rating: 4.4, reviews: 176, image: catalogImages.tablet, fastDelivery: true },
  { id: 'samsung-fridge', title: 'یخچال فریزر سامسونگ ساید بای ساید', brand: 'Samsung', category: 'home', price: 86_000_000, oldPrice: 97_500_000, rating: 4.5, reviews: 134, image: catalogImages.tablet },
  { id: 'xiaomi-robot-vac', title: 'جارو رباتیک شیائومی Robot Vacuum X20', brand: 'Xiaomi', category: 'home', price: 18_200_000, oldPrice: 21_900_000, rating: 4.3, reviews: 802, image: catalogImages.audio, fastDelivery: true },
  { id: 'nike-air-max', title: 'کفش ورزشی نایکی Air Max مردانه', brand: 'Nike', category: 'fashion', price: 8_900_000, oldPrice: 11_200_000, rating: 4.4, reviews: 940, image: catalogImages.watch, badge: 'پرفروش', fastDelivery: true },
  { id: 'adidas-ultraboost', title: 'کفش دویدن آدیداس Ultraboost', brand: 'Adidas', category: 'fashion', price: 7_600_000, rating: 4.5, reviews: 611, image: catalogImages.watch },
  { id: 'zara-coat', title: 'پالتو زمستانی زارا مدل کلاسیک', brand: 'Zara', category: 'fashion', price: 5_400_000, oldPrice: 6_800_000, rating: 4.2, reviews: 220, image: catalogImages.tablet },
  { id: 'levis-501', title: 'شلوار جین لیوایز ۵۰۱ اورجینال', brand: 'Levi\'s', category: 'fashion', price: 4_800_000, rating: 4.6, reviews: 430, image: catalogImages.tablet, fastDelivery: true },
  { id: 'dyson-supersonic', title: 'سشوار دایسون Supersonic', brand: 'Dyson', category: 'beauty', price: 22_700_000, oldPrice: 25_900_000, rating: 4.7, reviews: 355, image: catalogImages.watch, badge: 'پیشنهاد ویژه' },
  { id: 'oral-b-io10', title: 'مسواک برقی Oral-B iO Series 10', brand: 'Oral-B', category: 'beauty', price: 9_300_000, rating: 4.5, reviews: 278, image: catalogImages.audio, fastDelivery: true },
  { id: 'philips-lumea', title: 'دستگاه لیزر خانگی فیلیپس Lumea', brand: 'Philips', category: 'beauty', price: 16_400_000, oldPrice: 19_100_000, rating: 4.4, reviews: 190, image: catalogImages.watch },
  { id: 'nivea-set', title: 'ست مراقبت پوست نیوآ مخصوص آقایان', brand: 'Nivea', category: 'beauty', price: 1_250_000, rating: 4.1, reviews: 860, image: catalogImages.audio, fastDelivery: true },
]

const seededProducts: Product[] = catalogSeeds.map((seed) => ({
  ...seed,
  categoryLabel: categoryLabels[seed.category],
  inStock: seed.inStock !== false,
  fastDelivery: seed.fastDelivery ?? false,
}))

export const products: Product[] = [...featuredProducts, ...seededProducts]

const LEAKED_IMAGE_NAME_RE = /technolife|تکنولایف/i

export function productImageAlt(
  alts: Record<string, string> | null | undefined,
  src: string,
  fallback: string,
) {
  const key = String(src || '').trim()
  const raw = key ? String(alts?.[key] || '').trim() : ''
  if (!raw || LEAKED_IMAGE_NAME_RE.test(raw)) return fallback.trim()
  return raw
}

export const formatPrice = (n: number) => {
  let locale = 'fa-IR'
  try {
    locale = useState<string>('platform-number-format', () => 'fa-IR').value || 'fa-IR'
  }
  catch {
    // outside Nuxt request context
  }
  return n.toLocaleString(locale)
}

/** Storefront currency label from platform settings (fallback: تومان). */
export const getCurrencyLabel = () => {
  try {
    return useState<string>('platform-currency-label', () => 'تومان').value || 'تومان'
  }
  catch {
    return 'تومان'
  }
}

export const dealsOfTheDay = products.filter(p => p.oldPrice).slice(0, 6)

export const bestSellers = products.slice(0, 10)

export const newArrivals = [...products].reverse().slice(0, 8)

export const getProductById = (id: string): Product => {
  try {
    const extras = useState<Product[]>('product-catalog-extras', () => [])
    const extra = extras.value.find(p => p.id === id)
    if (extra) return extra
  }
  catch {
    // outside Nuxt request context
  }
  return products.find(p => p.id === id) ?? products[0]!
}

export function registerCatalogProduct(product: Product) {
  const extras = useState<Product[]>('product-catalog-extras', () => [])
  if (extras.value.some(p => p.id === product.id)) return
  extras.value = [product, ...extras.value]
}

/** Resolve seller-curated related ids from a product list (order preserved). */
export function getRelatedProducts(
  product: Product,
  catalog: Product[] = products,
  limit?: number,
): Product[] {
  const ids = Array.isArray(product.relatedProductIds) ? product.relatedProductIds : []
  if (!ids.length) return []
  const byId = new Map(catalog.map(p => [p.id, p]))
  const out: Product[] = []
  for (const id of ids) {
    if (id === product.id) continue
    const match = byId.get(id)
    if (match) out.push(match)
    if (limit != null && out.length >= limit) break
  }
  return out
}

export function normalizeRelatedProductIds(ids: unknown, selfId?: string): string[] {
  if (!Array.isArray(ids)) return []
  const seen = new Set<string>()
  const out: string[] = []
  for (const item of ids) {
    const id = String(item || '').trim()
    if (!id || (selfId && id === selfId) || seen.has(id)) continue
    seen.add(id)
    out.push(id)
  }
  return out
}
