export type ProductColor = {
  name: string
  hex: string
}

export type ProductSpec = {
  key: string
  value: string
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
  gallery?: string[]
  badge?: string
  colors?: ProductColor[]
  inStock?: boolean
  shortDesc?: string
  specs?: ProductSpec[]
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
}

export const products: Product[] = [
  {
    id: 'iphone-16-pro',
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
      '/images/mock/galaxy-s25-ultra.jpg',
      '/images/mock/ipad-pro-m4.jpg',
      '/images/mock/apple-watch-ultra.jpg',
    ],
    badge: 'پیشنهاد ویژه',
    colors: [
      { name: 'تیتانیوم طبیعی', hex: '#8a8578' },
      { name: 'مشکی', hex: '#1c1c1e' },
      { name: 'سفید', hex: '#f5f5f0' },
      { name: 'آبی تیتانیوم', hex: '#3a4a5c' },
    ],
    inStock: true,
    shortDesc:
      'آیفون ۱۶ پرو مکس با تراشه قدرتمند A18 Pro، بدنه تیتانیومی سبک و دوربین ۴۸ مگاپیکسلی پیشرفته، تجربه‌ای بی‌نظیر از فناوری روز دنیا را به شما هدیه می‌دهد.',
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
    title: 'گوشی موبایل سامسونگ Galaxy S25 Ultra ظرفیت ۵۱۲ گیگابایت',
    brand: 'Samsung',
    category: 'mobile',
    categoryLabel: 'موبایل',
    price: 72_400_000,
    oldPrice: 84_000_000,
    rating: 4.7,
    reviews: 645,
    image: '/images/mock/galaxy-s25-ultra.jpg',
    badge: 'پرفروش',
    inStock: true,
    shortDesc: 'گلکسی S25 اولترا با قلم S Pen و دوربین قدرتمند ۲۰۰ مگاپیکسلی.',
  },
  {
    id: 'macbook-m4',
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
  },
  {
    id: 'apple-watch-ultra',
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

export const formatPrice = (n: number) => n.toLocaleString('fa-IR')

export const dealsOfTheDay = products.filter(p => p.oldPrice).slice(0, 6)

export const bestSellers = products.slice(0, 8)

export const newArrivals = [...products].reverse().slice(0, 8)

export const getProductById = (id: string): Product =>
  products.find(p => p.id === id) ?? products[0]!

export const getRelatedProducts = (product: Product, limit = 4): Product[] =>
  products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, limit)
