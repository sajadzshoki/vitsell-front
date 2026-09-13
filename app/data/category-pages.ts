import type { Category } from '~/data/categories'

export type CategorySuggestedItem = {
  id: string
  title: string
  image: string
  query: string
}

export type CategoryPageMeta = {
  hero: {
    image: string
    eyebrow: string
    title: string
    subtitle: string
  }
  seo: {
    heading: string
    paragraphs: string[]
  }
}

export const categoryPageMeta: Record<string, CategoryPageMeta> = {
  mobile: {
    hero: {
      image: '/images/mock/iphone16pro-desert.jpg',
      eyebrow: 'کالای دیجیتال',
      title: 'گوشی موبایل',
      subtitle: 'جدیدترین گوشی‌های هوشمند از برندهای معتبر جهان با ارسال سریع و گارانتی معتبر',
    },
    seo: {
      heading: 'خرید گوشی موبایل',
      paragraphs: [
        'در ویتسل می‌توانید انواع گوشی موبایل از برندهای اپل، سامسونگ، شیائومی، هوآوی و سایر سازندگان معتبر را با بهترین قیمت و ارسال سریع تهیه کنید. از پرچمدارهای پرقدرت تا گوشی‌های اقتصادی، همه در یکجا.',
        'برای انتخاب گوشی مناسب به ظرفیت حافظه، کیفیت دوربین، عمر باتری و پشتیبانی از شبکه‌های ۵G توجه کنید. محصولات دارای گارانتی رسمی و امکان خرید اقساطی نیز در دسترس هستند.',
        'با مقایسه قیمت، امتیاز کاربران و موجودی انبار می‌توانید بهترین تصمیم را بگیرید. تیم پشتیبانی ویتسل در تمام مراحل خرید همراه شماست.',
      ],
    },
  },
  laptop: {
    hero: {
      image: '/images/mock/macbook-m4-spaceblack.jpg',
      eyebrow: 'کالای دیجیتال',
      title: 'لپ‌تاپ و کامپیوتر',
      subtitle: 'لپ‌تاپ‌های حرفه‌ای، گیمینگ، دانشجویی و تبلت برای هر نوع کاربری',
    },
    seo: {
      heading: 'خرید لپ‌تاپ',
      paragraphs: [
        'مجموعه‌ای گسترده از لپ‌تاپ‌های اپل، ایسوس، لنوو، اچ‌پی و سایر برندها برای برنامه‌نویسی، طراحی، گیمینگ و استفاده روزمره.',
        'قبل از خرید لپ‌تاپ به پردازنده، حافظه RAM، نوع ذخیره‌ساز SSD و کیفیت صفحه‌نمایش توجه کنید. مدل‌های گیمینگ با کارت گرافیک قدرتمند و مدل‌های سبک برای حمل‌و‌نقل در دسترس هستند.',
        'امکان مقایسه مشخصات فنی، مشاهده نظرات خریداران و بهره‌مندی از تخفیف‌های دوره‌ای از مزایای خرید از ویتسل است.',
      ],
    },
  },
  audio: {
    hero: {
      image: '/images/mock/sony-xm5-midnight.jpg',
      eyebrow: 'صوتی و تصویری',
      title: 'صوتی و هدفون',
      subtitle: 'هدفون، ایرپاد، اسپیکر و تجهیزات صوتی با کیفیت استودیویی',
    },
    seo: {
      heading: 'خرید هدفون و تجهیزات صوتی',
      paragraphs: [
        'از هدفون‌های بی‌سیم نویزکنسلینگ تا اسپیکرهای قابل حمل و ساندبار خانگی — همه در دسته صوتی ویتسل.',
        'برندهای سونی، اپل، بوز، جی‌بی‌ال و سنهایزر با گارانتی اصالت کالا عرضه می‌شوند.',
        'برای انتخاب مناسب به نوع اتصال، عمر باتری، مقاومت در برابر آب و کاربرد (ورزش، سفر، گیمینگ) توجه کنید.',
      ],
    },
  },
  tv: {
    hero: {
      image: '/images/mock/ipad-pro-m4.jpg',
      eyebrow: 'صوتی و تصویری',
      title: 'تلویزیون',
      subtitle: 'تلویزیون‌های هوشمند ۴K، OLED و QLED از برندهای معتبر',
    },
    seo: {
      heading: 'خرید تلویزیون',
      paragraphs: [
        'تلویزیون‌های سامسونگ، ال‌جی و سونی با پنل QLED، OLED و Mini LED برای تجربه تصویری بی‌نظیر.',
        'سایز مناسب را بر اساس فاصله viewing و ابعاد اتاق انتخاب کنید. مدل‌های هوشمند با سیستم‌عامل Tizen و webOS در دسترس هستند.',
      ],
    },
  },
  camera: {
    hero: {
      image: '/images/mock/apple-watch-ultra.jpg',
      eyebrow: 'کالای دیجیتال',
      title: 'دوربین',
      subtitle: 'دوربین‌های حرفه‌ای، ورزشی و کامپکت برای عکاسی و فیلم‌برداری',
    },
    seo: {
      heading: 'خرید دوربین',
      paragraphs: [
        'دوربین‌های بدون آینه، کامپکت و اکشن‌کم از برندهای کانن، سونی، گوپرو و DJI.',
        'برای انتخاب دوربین به سنسور، لنز، تثبیت تصویر و قابلیت فیلم‌برداری ۴K توجه کنید.',
      ],
    },
  },
  watch: {
    hero: {
      image: '/images/mock/apple-watch-ultra.jpg',
      eyebrow: 'کالای دیجیتال',
      title: 'ساعت هوشمند',
      subtitle: 'ساعت‌های هوشمند اپل، سامسونگ، گارمین و سایر برندها',
    },
    seo: {
      heading: 'خرید ساعت هوشمند',
      paragraphs: [
        'ساعت‌های هوشمند با قابلیت ردیابی سلامت، GPS، پرداخت و اتصال بلوتوث.',
        'مدل‌های ورزشی، لوکس و اقتصادی برای هر سلیقه و بودجه.',
      ],
    },
  },
  gaming: {
    hero: {
      image: '/images/mock/ps5-pro.jpg',
      eyebrow: 'سرگرمی',
      title: 'کنسول بازی',
      subtitle: 'پلی‌استیشن، ایکس‌باکس، نینتندو و لوازم جانبی گیمینگ',
    },
    seo: {
      heading: 'خرید کنسول بازی',
      paragraphs: [
        'کنسول‌های نسل جدید، دسته بازی، هدست گیمینگ و اکسسوری‌های مرتبط.',
        'برای انتخاب کنسول به کتابخانه بازی، قدرت پردازشی و نوع نمایشگر توجه کنید.',
      ],
    },
  },
  home: {
    hero: {
      image: '/images/mock/hero-tech-ecosystem.jpg',
      eyebrow: 'خانه و آشپزخانه',
      title: 'لوازم خانگی',
      subtitle: 'جاروبرقی، لوازم آشپزخانه و تجهیزات خانگی هوشمند',
    },
    seo: {
      heading: 'خرید لوازم خانگی',
      paragraphs: [
        'لوازم خانگی برندهای دایسون، ال‌جی، سامسونگ و شیائومی با ارسال سریع.',
        'از جاروبرقی رباتیک تا یخچال و ماشین لباسشویی — همه با گارانتی معتبر.',
      ],
    },
  },
  fashion: {
    hero: {
      image: '/images/mock/galaxy-s25-ultra.jpg',
      eyebrow: 'مد و پوشاک',
      title: 'مد و پوشاک',
      subtitle: 'پوشاک، کفش و اکسسوری اورجینال و با کیفیت',
    },
    seo: {
      heading: 'خرید پوشاک',
      paragraphs: [
        'کالکشن‌های فصل جدید از برندهای معتبر داخلی و بین‌المللی.',
        'سایزبندی استاندارد، امکان مرجوعی و ارسال رایگان برای سفارش‌های بالای حد نصاب.',
      ],
    },
  },
  beauty: {
    hero: {
      image: '/images/mock/sony-xm5-midnight.jpg',
      eyebrow: 'زیبایی و سلامت',
      title: 'زیبایی و سلامت',
      subtitle: 'لوازم آرایشی، بهداشتی و مراقبت پوست و مو',
    },
    seo: {
      heading: 'خرید لوازم آرایشی',
      paragraphs: [
        'محصولات اصل برندهای معتبر آرایشی و بهداشتی.',
        'راهنمای انتخاب بر اساس نوع پوست و نیازهای مراقبتی.',
      ],
    },
  },
}

const categoryImages: Record<string, string> = {
  mobile: '/images/mock/iphone16pro-desert.jpg',
  laptop: '/images/mock/macbook-m4-spaceblack.jpg',
  audio: '/images/mock/sony-xm5-midnight.jpg',
  tv: '/images/mock/ipad-pro-m4.jpg',
  camera: '/images/mock/apple-watch-ultra.jpg',
  watch: '/images/mock/apple-watch-ultra.jpg',
  gaming: '/images/mock/ps5-pro.jpg',
  home: '/images/mock/hero-tech-ecosystem.jpg',
  fashion: '/images/mock/galaxy-s25-ultra.jpg',
  beauty: '/images/mock/sony-xm5-midnight.jpg',
}

export function getCategoryImage(id: string, fallback?: string | null) {
  return fallback
    || categoryImages[id]
    || '/images/mock/hero-tech-ecosystem.jpg'
}

export function getCategoryPageMeta(id: string): CategoryPageMeta {
  return categoryPageMeta[id] ?? {
    hero: {
      image: categoryImages[id] ?? '/images/mock/hero-tech-ecosystem.jpg',
      eyebrow: 'ویتسل',
      title: id,
      subtitle: 'مشاهده محصولات و پیشنهادهای ویژه این دسته',
    },
    seo: {
      heading: 'درباره این دسته',
      paragraphs: [
        'در ویتسل می‌توانید محصولات متنوع این دسته را با بهترین قیمت و ارسال سریع تهیه کنید.',
      ],
    },
  }
}

export function buildSuggestedItems(category: Category, fallbackImage: string): CategorySuggestedItem[] {
  const items: CategorySuggestedItem[] = []

  for (const sub of category.subs) {
    for (const item of sub.items) {
      items.push({
        id: `${category.id}-${item}`,
        title: item,
        image: fallbackImage,
        query: item,
      })
    }
  }

  if (!items.length) {
    return [
      { id: `${category.id}-all`, title: category.name, image: fallbackImage, query: category.name },
      { id: `${category.id}-deals`, title: 'پیشنهاد ویژه', image: fallbackImage, query: 'تخفیف' },
      { id: `${category.id}-new`, title: 'جدیدترین‌ها', image: fallbackImage, query: 'جدید' },
      { id: `${category.id}-popular`, title: 'پرفروش‌ها', image: fallbackImage, query: 'پرفروش' },
    ]
  }

  return items
}
