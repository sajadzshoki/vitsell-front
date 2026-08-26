export type StaticPageId =
  | 'about'
  | 'contact'
  | 'careers'
  | 'blog'
  | 'faq'
  | 'returns'
  | 'terms'
  | 'privacy'
  | 'guide-order'
  | 'guide-shipping'
  | 'guide-payment'

export type StaticFaqCategory = {
  id: string
  label: string
  icon: string
}

export type StaticFaqItem = {
  categoryId: string
  question: string
  answer: string
}

export type StaticContactItem = {
  icon: string
  label: string
  value: string
  href?: string
}

export type StaticBlogPost = {
  id: string
  title: string
  excerpt: string
  date: string
  category: string
  readTime: string
  author: string
}

export type StaticJobItem = {
  title: string
  department: string
  location: string
  type: string
  description: string
}

export type StaticStatItem = {
  icon: string
  value: string
  label: string
}

export type StaticStepItem = {
  title: string
  description?: string
  icon: string
}

export type StaticSection =
  | { type: 'paragraphs'; items: string[] }
  | { type: 'list'; title?: string; items: string[] }
  | { type: 'faq'; categories: StaticFaqCategory[]; items: StaticFaqItem[] }
  | { type: 'contact-block'; items: StaticContactItem[] }
  | { type: 'blog'; items: StaticBlogPost[] }
  | { type: 'jobs'; items: StaticJobItem[] }
  | { type: 'stats'; items: StaticStatItem[] }
  | { type: 'steps'; title?: string; items: StaticStepItem[] }

export type StaticPage = {
  id: StaticPageId
  path: string
  title: string
  subtitle: string
  icon: string
  sections: StaticSection[]
}

export const contactFormSubjects = [
  { id: 'order', label: 'پیگیری سفارش' },
  { id: 'support', label: 'پشتیبانی فنی' },
  { id: 'return', label: 'مرجوعی کالا' },
  { id: 'suggestion', label: 'پیشنهاد و انتقاد' },
  { id: 'complaint', label: 'ثبت شکایت' },
  { id: 'other', label: 'سایر موارد' },
] as const

export const faqCategories: StaticFaqCategory[] = [
  { id: 'order', label: 'ثبت سفارش', icon: 'i-tabler-shopping-cart' },
  { id: 'shipping', label: 'ارسال', icon: 'i-tabler-truck-delivery' },
  { id: 'payment', label: 'پرداخت', icon: 'i-tabler-credit-card' },
  { id: 'return', label: 'مرجوعی', icon: 'i-tabler-refresh' },
  { id: 'account', label: 'حساب کاربری', icon: 'i-tabler-user' },
  { id: 'product', label: 'محصولات', icon: 'i-tabler-device-mobile' },
]

export const faqItems: StaticFaqItem[] = [
  {
    categoryId: 'order',
    question: 'چطور سفارش خود را ثبت کنم؟',
    answer: 'محصول را به سبد اضافه کنید، آدرس و روش ارسال را انتخاب کرده و پرداخت را تکمیل کنید. راهنمای کامل در صفحه «نحوه ثبت سفارش» موجود است.',
  },
  {
    categoryId: 'order',
    question: 'آیا می‌توانم سفارش را ویرایش کنم؟',
    answer: 'تا قبل از تأیید نهایی در انبار امکان ویرایش آدرس یا لغو سفارش وجود دارد. پس از آن باید با پشتیبانی تماس بگیرید.',
  },
  {
    categoryId: 'order',
    question: 'کد پیگیری سفارش را از کجا ببینم؟',
    answer: 'پس از ثبت سفارش، کد پیگیری در صفحه تأیید و همچنین در بخش «سفارش‌های من» حساب کاربری نمایش داده می‌شود.',
  },
  {
    categoryId: 'shipping',
    question: 'زمان ارسال سفارش چقدر است؟',
    answer: 'سفارش‌های تهران معمولاً ۱ تا ۲ روز کاری و سایر شهرها ۲ تا ۵ روز کاری تحویل داده می‌شوند.',
  },
  {
    categoryId: 'shipping',
    question: 'هزینه ارسال چگونه محاسبه می‌شود؟',
    answer: 'بر اساس وزن مرسوله، شهر مقصد و روش ارسال انتخابی. سفارش‌های بالای ۵ میلیون تومان ارسال رایگان دارند.',
  },
  {
    categoryId: 'shipping',
    question: 'آیا ارسال به شهرستان دارید؟',
    answer: 'بله. ارسال به تمام شهرهای ایران از طریق پست پیشتاز و تیپاکس انجام می‌شود.',
  },
  {
    categoryId: 'payment',
    question: 'روش‌های پرداخت چیست؟',
    answer: 'پرداخت آنلاین از درگاه بانکی، پرداخت در محل برای برخی شهرها و استفاده از کد تخفیف در checkout.',
  },
  {
    categoryId: 'payment',
    question: 'پرداخت ناموفق بود؛ پول از حسابم کم شد',
    answer: 'مبالغ کسرشده معمولاً تا ۷۲ ساعت کاری به حساب شما بازمی‌گردد. در صورت تأخیر با پشتیبانی تماس بگیرید.',
  },
  {
    categoryId: 'return',
    question: 'چگونه کالا را مرجوع کنم؟',
    answer: 'تا ۷ روز پس از تحویل، از حساب کاربری درخواست مرجوعی ثبت کنید. کالا باید سالم و در بسته اصلی باشد.',
  },
  {
    categoryId: 'return',
    question: 'بازگشت وجه چقدر طول می‌کشد؟',
    answer: 'پس از تأیید سلامت کالا، وجه حداکثر تا ۷۲ ساعت کاری به حساب بانکی شما واریز می‌شود.',
  },
  {
    categoryId: 'account',
    question: 'چطور رمز عبور را تغییر دهم؟',
    answer: 'از بخش تنظیمات حساب کاربری یا با ورود OTP از صفحه login می‌توانید اطلاعات خود را به‌روز کنید.',
  },
  {
    categoryId: 'account',
    question: 'چند آدرس می‌توانم ثبت کنم؟',
    answer: 'بدون محدودیت. یکی از آدرس‌ها را به عنوان پیش‌فرض انتخاب کنید تا در checkout سریع‌تر باشد.',
  },
  {
    categoryId: 'product',
    question: 'آیا کالاها گارانتی دارند؟',
    answer: 'بله. تمامی کالاها دارای گارانتی معتبر شرکتی هستند. مدت و شرایط در صفحه هر محصول درج شده است.',
  },
  {
    categoryId: 'product',
    question: 'چطور از اصل بودن کالا مطمئن شوم؟',
    answer: 'دیجی‌شاپ فقط از تامین‌کنندگان رسمی خرید می‌کند و کد رجیستری / سریال کالا در فاکتور درج می‌شود.',
  },
]

export const staticPagePaths: Record<StaticPageId, string> = {
  about: '/about',
  contact: '/contact',
  careers: '/careers',
  blog: '/blog',
  faq: '/faq',
  returns: '/returns',
  terms: '/terms',
  privacy: '/privacy',
  'guide-order': '/guide/order',
  'guide-shipping': '/guide/shipping',
  'guide-payment': '/guide/payment',
}

export const staticPages: Record<StaticPageId, StaticPage> = {
  about: {
    id: 'about',
    path: staticPagePaths.about,
    title: 'درباره دیجی‌شاپ',
    subtitle: 'بزرگ‌ترین فروشگاه اینترنتی محصولات دیجیتال',
    icon: 'i-tabler-building-store',
    sections: [
      {
        type: 'stats',
        items: [
          { icon: 'i-tabler-calendar', value: '۱۰+', label: 'سال فعالیت' },
          { icon: 'i-tabler-users', value: '۵۰۰K+', label: 'مشتری راضی' },
          { icon: 'i-tabler-package', value: '۱۰K+', label: 'محصول فعال' },
          { icon: 'i-tabler-map-pin', value: '۳۱', label: 'استان تحت پوشش' },
        ],
      },
      {
        type: 'paragraphs',
        items: [
          'دیجی‌شاپ از سال ۱۳۹۵ با هدف ارائه تجربه‌ای مطمئن، سریع و شفاف در خرید آنلاین محصولات دیجیتال فعالیت خود را آغاز کرد. امروز هزاران محصول اصل از برندهای معتبر در اختیار مشتریان سراسر کشور قرار دارد.',
          'ما با تمرکز بر اصالت کالا، پشتیبانی پاسخ‌گو و لجستیک بهینه، تلاش می‌کنیم هر سفارش در کوتاه‌ترین زمان و با بالاترین کیفیت به دست شما برسد.',
        ],
      },
      {
        type: 'list',
        title: 'ارزش‌های ما',
        items: [
          'تضمین اصالت و سلامت فیزیکی کالا',
          'قیمت‌گذاری شفاف و رقابتی',
          'پشتیبانی ۷ روز هفته',
          'ارسال سریع به سراسر ایران',
        ],
      },
    ],
  },

  contact: {
    id: 'contact',
    path: staticPagePaths.contact,
    title: 'تماس با ما',
    subtitle: 'پاسخگویی ۷ روز هفته از ساعت ۹ تا ۲۱',
    icon: 'i-tabler-phone',
    sections: [
      {
        type: 'contact-block',
        items: [
          { icon: 'i-tabler-phone', label: 'تلفن پشتیبانی', value: '۰۲۱-۶۱۹۳۰۰۰۰', href: 'tel:02161930000' },
          { icon: 'i-tabler-mail', label: 'ایمیل', value: 'support@digishop.ir', href: 'mailto:support@digishop.ir' },
          { icon: 'i-tabler-map-pin', label: 'آدرس', value: 'تهران، خیابان ولیعصر، بالاتر از پارک ساعی' },
          { icon: 'i-tabler-clock', label: 'ساعات پاسخگویی', value: 'هر روز ۹:۰۰ تا ۲۱:۰۰' },
        ],
      },
      {
        type: 'paragraphs',
        items: [
          'برای پیگیری سفارش، ابتدا وارد حساب کاربری خود شوید و از بخش «سفارش‌های من» وضعیت را مشاهده کنید. در صورت نیاز به راهنمایی بیشتر، فرم بالا را پر کنید یا با شماره پشتیبانی تماس بگیرید.',
        ],
      },
    ],
  },

  careers: {
    id: 'careers',
    path: staticPagePaths.careers,
    title: 'فرصت‌های شغلی',
    subtitle: 'به تیم دیجی‌شاپ بپیوندید',
    icon: 'i-tabler-briefcase',
    sections: [
      {
        type: 'paragraphs',
        items: [
          'در دیجی‌شاپ به دنبال افراد مشتاق، یادگیرنده و مسئولیت‌پذیر هستیم. اگر به دنیای تجارت الکترونیک و فناوری علاقه دارید، موقعیت‌های زیر را بررسی کنید.',
        ],
      },
      {
        type: 'jobs',
        items: [
          {
            title: 'کارشناس پشتیبانی مشتریان',
            department: 'پشتیبانی',
            location: 'تهران',
            type: 'تمام‌وقت',
            description: 'پاسخگویی تلفنی و چت به مشتریان، پیگیری سفارش و ثبت تیکت.',
          },
          {
            title: 'توسعه‌دهنده فرانت‌اند',
            department: 'فناوری',
            location: 'تهران / دورکاری',
            type: 'تمام‌وقت',
            description: 'توسعه رابط کاربری با Vue/Nuxt و همکاری نزدیک با تیم طراحی.',
          },
          {
            title: 'کارشناس بازاریابی دیجیتال',
            department: 'مارکتینگ',
            location: 'تهران',
            type: 'تمام‌وقت',
            description: 'مدیریت کمپین‌ها، SEO و تحلیل رفتار کاربر.',
          },
          {
            title: 'انباردار',
            department: 'عملیات',
            location: 'کرج',
            type: 'تمام‌وقت',
            description: 'کنترل موجودی، بسته‌بندی و هماهنگی با واحد ارسال.',
          },
        ],
      },
      {
        type: 'paragraphs',
        items: [
          'رزومه خود را به careers@digishop.ir ارسال کنید و عنوان موقعیت شغلی را در موضوع ایمیل ذکر نمایید.',
        ],
      },
    ],
  },

  blog: {
    id: 'blog',
    path: staticPagePaths.blog,
    title: 'بلاگ دیجی‌شاپ',
    subtitle: 'راهنما، بررسی و اخبار دنیای تکنولوژی',
    icon: 'i-tabler-news',
    sections: [
      {
        type: 'blog',
        items: [
          {
            id: '1',
            title: 'راهنمای خرید گوشی هوشمند ۱۴۰۵',
            excerpt: 'قبل از خرید گوشی جدید، این ۷ نکته را حتماً بررسی کنید تا بهترین انتخاب را داشته باشید.',
            date: '۱۵ مرداد ۱۴۰۵',
            category: 'راهنمای خرید',
            readTime: '۸ دقیقه',
            author: 'تیم دیجی‌شاپ',
          },
          {
            id: '2',
            title: 'مقایسه لپ‌تاپ‌های دانشجویی',
            excerpt: 'بهترین گزینه‌های اقتصادی برای دانشجوها با تمرکز بر باتری، وزن و کارایی.',
            date: '۸ مرداد ۱۴۰۵',
            category: 'بررسی محصول',
            readTime: '۶ دقیقه',
            author: 'علی محمدی',
          },
          {
            id: '3',
            title: 'نکات نگهداری از باتری گجت‌ها',
            excerpt: 'چطور عمر باتری لپ‌تاپ و موبایل خود را افزایش دهید؟',
            date: '۱ مرداد ۱۴۰۵',
            category: 'آموزش',
            readTime: '۵ دقیقه',
            author: 'سارا رضایی',
          },
          {
            id: '4',
            title: 'ترندهای تکنولوژی پاییز ۱۴۰۵',
            excerpt: 'از هوش مصنوعی در گجت‌ها تا نمایشگرهای تاشو؛ نگاهی به بازار امسال.',
            date: '۲۵ تیر ۱۴۰۵',
            category: 'اخبار',
            readTime: '۴ دقیقه',
            author: 'تیم دیجی‌شاپ',
          },
        ],
      },
    ],
  },

  faq: {
    id: 'faq',
    path: staticPagePaths.faq,
    title: 'پاسخ به سوالات',
    subtitle: 'پرسش‌های متداول مشتریان',
    icon: 'i-tabler-help',
    sections: [
      {
        type: 'faq',
        categories: faqCategories,
        items: faqItems,
      },
    ],
  },

  returns: {
    id: 'returns',
    path: staticPagePaths.returns,
    title: 'رویه‌های بازگشت کالا',
    subtitle: '۷ روز ضمانت بازگشت',
    icon: 'i-tabler-refresh',
    sections: [
      {
        type: 'paragraphs',
        items: [
          'مشتریان دیجی‌شاپ می‌توانند تا ۷ روز پس از دریافت کالا، در صورت عدم رضایت یا مغایرت، درخواست مرجوعی ثبت کنند.',
        ],
      },
      {
        type: 'steps',
        title: 'مراحل ثبت مرجوعی',
        items: [
          { icon: 'i-tabler-login', title: 'ورود به حساب', description: 'وارد حساب کاربری شوید و سفارش مربوطه را باز کنید.' },
          { icon: 'i-tabler-file-description', title: 'ثبت درخواست', description: 'دلیل مرجوعی را انتخاب و توضیحات را وارد کنید.' },
          { icon: 'i-tabler-truck', title: 'ارسال کالا', description: 'مرسوله را طبق راهنمای پشتیبانی ارسال یا تحویل پیک دهید.' },
          { icon: 'i-tabler-cash', title: 'بازگشت وجه', description: 'پس از بررسی، وجه تا ۷۲ ساعت به حساب شما واریز می‌شود.' },
        ],
      },
      {
        type: 'list',
        title: 'شرایط مرجوعی',
        items: [
          'کالا در بسته‌بندی اصلی و بدون آسیب فیزیکی باشد.',
          'پلمپ و لیبل‌های اصلی حذف نشده باشند.',
          'لوازم جانبی و اقلام همراه کامل بازگردانده شوند.',
          'کالاهای مصرفی یا شخصی‌سازی‌شده مشمول مرجوعی نیستند.',
        ],
      },
    ],
  },

  terms: {
    id: 'terms',
    path: staticPagePaths.terms,
    title: 'شرایط استفاده',
    subtitle: 'قوانین و مقررات استفاده از دیجی‌شاپ',
    icon: 'i-tabler-file-text',
    sections: [
      {
        type: 'paragraphs',
        items: [
          'استفاده از وب‌سایت و خدمات دیجی‌شاپ به منزله پذیرش شرایط زیر است. لطفاً پیش از ثبت سفارش این موارد را مطالعه کنید.',
        ],
      },
      {
        type: 'list',
        title: 'تعهدات کاربر',
        items: [
          'ارائه اطلاعات صحیح هنگام ثبت‌نام و ثبت سفارش',
          'عدم استفاده از سایت برای اهداف غیرقانونی',
          'رعایت حقوق مالکیت فکری محتوا و تصاویر سایت',
        ],
      },
      {
        type: 'list',
        title: 'تعهدات دیجی‌شاپ',
        items: [
          'ارائه اطلاعات دقیق محصولات و قیمت‌ها',
          'ارسال کالای سالم و مطابق با سفارش',
          'حفاظت از اطلاعات شخصی کاربران طبق سیاست حریم خصوصی',
        ],
      },
      {
        type: 'paragraphs',
        items: [
          'دیجی‌شاپ حق تغییر قیمت‌ها و شرایط فروش را بدون اطلاع قبلی برای سفارش‌های جدید محفوظ می‌دارد. سفارش‌های ثبت‌شده طبق شرایط زمان ثبت پردازش می‌شوند.',
        ],
      },
    ],
  },

  privacy: {
    id: 'privacy',
    path: staticPagePaths.privacy,
    title: 'حریم خصوصی',
    subtitle: 'نحوه جمع‌آوری و استفاده از اطلاعات شما',
    icon: 'i-tabler-lock',
    sections: [
      {
        type: 'paragraphs',
        items: [
          'دیجی‌شاپ به حفظ حریم خصوصی کاربران متعهد است. اطلاعات شخصی شما صرفاً برای ارائه خدمات، پردازش سفارش و بهبود تجربه خرید استفاده می‌شود.',
        ],
      },
      {
        type: 'list',
        title: 'اطلاعاتی که جمع‌آوری می‌کنیم',
        items: [
          'نام، شماره تماس و آدرس برای ارسال سفارش',
          'سوابق خرید و تعامل با پشتیبانی',
          'اطلاعات فنی مانند نوع مرورگر و دستگاه (برای بهبود امنیت)',
        ],
      },
      {
        type: 'list',
        title: 'حفاظت از داده‌ها',
        items: [
          'انتقال امن اطلاعات با پروتکل HTTPS',
          'محدودسازی دسترسی داخلی به اطلاعات حساس',
          'عدم فروش اطلاعات شخصی به اشخاص ثالث',
        ],
      },
      {
        type: 'paragraphs',
        items: [
          'برای حذف حساب یا درخواست دسترسی به داده‌های شخصی، با پشتیبانی تماس بگیرید.',
        ],
      },
    ],
  },

  'guide-order': {
    id: 'guide-order',
    path: staticPagePaths['guide-order'],
    title: 'نحوه ثبت سفارش',
    subtitle: 'راهنمای گام‌به‌گام خرید از دیجی‌شاپ',
    icon: 'i-tabler-shopping-cart',
    sections: [
      {
        type: 'steps',
        title: 'مراحل خرید',
        items: [
          { icon: 'i-tabler-search', title: 'جستجو و انتخاب', description: 'محصول را از دسته‌بندی یا جستجو پیدا کنید.' },
          { icon: 'i-tabler-shopping-cart-plus', title: 'افزودن به سبد', description: 'رنگ و تعداد را انتخاب و به سبد اضافه کنید.' },
          { icon: 'i-tabler-map-pin', title: 'ثبت آدرس', description: 'آدرس تحویل و روش ارسال را مشخص کنید.' },
          { icon: 'i-tabler-credit-card', title: 'پرداخت', description: 'روش پرداخت را انتخاب و سفارش را نهایی کنید.' },
          { icon: 'i-tabler-package', title: 'پیگیری', description: 'از بخش سفارش‌های من وضعیت را دنبال کنید.' },
        ],
      },
      {
        type: 'paragraphs',
        items: [
          'پس از ثبت موفق، کد پیگیری سفارش برای شما نمایش داده می‌شود. در صورت بروز مشکل در پرداخت، سفارش به صورت خودکار لغو نمی‌شود و می‌توانید مجدداً تلاش کنید.',
        ],
      },
    ],
  },

  'guide-shipping': {
    id: 'guide-shipping',
    path: staticPagePaths['guide-shipping'],
    title: 'رویه ارسال سفارش',
    subtitle: 'زمان‌بندی و هزینه ارسال',
    icon: 'i-tabler-truck-delivery',
    sections: [
      {
        type: 'paragraphs',
        items: [
          'سفارش‌های ثبت‌شده پس از تأیید پرداخت، ظرف ۲۴ ساعت کاری آماده و تحویل پست یا پیک می‌شوند.',
        ],
      },
      {
        type: 'steps',
        title: 'مراحل ارسال',
        items: [
          { icon: 'i-tabler-check', title: 'تأیید پرداخت', description: 'سفارش پس از پرداخت موفق در صف پردازش قرار می‌گیرد.' },
          { icon: 'i-tabler-box', title: 'بسته‌بندی', description: 'کالا با بسته‌بندی امن و ضدضربه آماده می‌شود.' },
          { icon: 'i-tabler-truck', title: 'تحویل به پست/پیک', description: 'مرسوله به شرکت حمل انتخابی تحویل داده می‌شود.' },
          { icon: 'i-tabler-home', title: 'تحویل به مشتری', description: 'کد رهگیری از طریق پیامک ارسال می‌شود.' },
        ],
      },
      {
        type: 'list',
        title: 'هزینه ارسال',
        items: [
          'سفارش‌های بالای ۵ میلیون تومان: ارسال رایگان',
          'سایر سفارش‌ها: بر اساس وزن، مقصد و روش انتخابی محاسبه می‌شود',
        ],
      },
    ],
  },

  'guide-payment': {
    id: 'guide-payment',
    path: staticPagePaths['guide-payment'],
    title: 'شیوه‌های پرداخت',
    subtitle: 'گزینه‌های پرداخت امن',
    icon: 'i-tabler-credit-card',
    sections: [
      {
        type: 'steps',
        title: 'روش‌های موجود',
        items: [
          { icon: 'i-tabler-credit-card', title: 'پرداخت آنلاین', description: 'تمامی کارت‌های عضو شبکه شتاب.' },
          { icon: 'i-tabler-cash', title: 'پرداخت در محل', description: 'برای برخی شهرها هنگام تحویل.' },
          { icon: 'i-tabler-discount-2', title: 'کد تخفیف', description: 'در مرحله checkout قابل اعمال.' },
        ],
      },
      {
        type: 'paragraphs',
        items: [
          'تمامی پرداخت‌های آنلاین از درگاه امن بانکی انجام می‌شود و دیجی‌شاپ اطلاعات کارت شما را ذخیره نمی‌کند.',
          'در صورت ناموفق بودن تراکنش، مبلغ حداکثر تا ۷۲ ساعت به حساب شما بازمی‌گردد.',
        ],
      },
    ],
  },
}

export function getStaticPage(id: StaticPageId): StaticPage {
  return staticPages[id]
}
