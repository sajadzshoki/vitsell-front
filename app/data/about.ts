export type AboutStat = {
  id: string
  icon: string
  value: string
  label: string
}

export type AboutValue = {
  id: string
  icon: string
  title: string
  description: string
}

export type AboutMilestone = {
  id: string
  year: string
  title: string
  description: string
}

export type AboutTeamMember = {
  id: string
  name: string
  role: string
  bio: string
  image: string
}

export type AboutCta = {
  title: string
  subtitle: string
  primaryLabel: string
  primaryTo: string
  secondaryLabel: string
  secondaryTo: string
}

export type AboutPagePayload = {
  title: string
  subtitle: string
  eyebrow: string
  heroImage: string
  storyTitle: string
  story: string[]
  missionTitle: string
  mission: string
  visionTitle: string
  vision: string
  stats: AboutStat[]
  values: AboutValue[]
  milestones: AboutMilestone[]
  teamTitle: string
  teamSubtitle: string
  team: AboutTeamMember[]
  cta: AboutCta
}

export function emptyAboutStat(): AboutStat {
  return {
    id: `stat-${Date.now()}`,
    icon: 'i-tabler-chart-bar',
    value: '',
    label: '',
  }
}

export function emptyAboutValue(): AboutValue {
  return {
    id: `value-${Date.now()}`,
    icon: 'i-tabler-heart',
    title: '',
    description: '',
  }
}

export function emptyAboutMilestone(): AboutMilestone {
  return {
    id: `mile-${Date.now()}`,
    year: '',
    title: '',
    description: '',
  }
}

export function emptyAboutTeamMember(): AboutTeamMember {
  return {
    id: `member-${Date.now()}`,
    name: '',
    role: '',
    bio: '',
    image: '',
  }
}

export function buildDefaultAboutPage(): AboutPagePayload {
  return {
    title: 'درباره دیجی‌شاپ',
    subtitle: 'بزرگ‌ترین فروشگاه اینترنتی محصولات دیجیتال با تمرکز روی اصالت، سرعت و پشتیبانی واقعی',
    eyebrow: 'داستان ما',
    heroImage: '/images/mock/hero-tech-ecosystem.jpg',
    storyTitle: 'از یک ایده ساده تا همراه خرید دیجیتال شما',
    story: [
      'دیجی‌شاپ از سال ۱۳۹۵ با هدف ارائه تجربه‌ای مطمئن، سریع و شفاف در خرید آنلاین محصولات دیجیتال فعالیت خود را آغاز کرد. امروز هزاران محصول اصل از برندهای معتبر در اختیار مشتریان سراسر کشور قرار دارد.',
      'ما باور داریم خرید آنلاین باید بدون استرس باشد: از لحظه انتخاب تا تحویل درب منزل. به همین دلیل روی اصالت کالا، قیمت شفاف، ارسال سریع و پشتیبانی پاسخ‌گو سرمایه‌گذاری می‌کنیم.',
      'تیم ما ترکیبی از متخصصان فناوری، عملیات و پشتیبانی است که هر روز برای بهتر شدن تجربه خرید شما تلاش می‌کنند.',
    ],
    missionTitle: 'ماموریت ما',
    mission:
      'دسترسی آسان همه ایرانیان به محصولات دیجیتال اصل، با قیمت منصفانه، ارسال مطمئن و پشتیبانی انسانی.',
    visionTitle: 'چشم‌انداز ما',
    vision:
      'تبدیل شدن به قابل‌اعتمادترین مقصد خرید دیجیتال در ایران؛ جایی که کیفیت، شفافیت و رضایت مشتری در اولویت است.',
    stats: [
      { id: 'years', icon: 'i-tabler-calendar', value: '۱۰+', label: 'سال فعالیت' },
      { id: 'customers', icon: 'i-tabler-users', value: '۵۰۰K+', label: 'مشتری راضی' },
      { id: 'products', icon: 'i-tabler-package', value: '۱۰K+', label: 'محصول فعال' },
      { id: 'provinces', icon: 'i-tabler-map-pin', value: '۳۱', label: 'استان تحت پوشش' },
    ],
    values: [
      {
        id: 'authenticity',
        icon: 'i-tabler-shield-check',
        title: 'اصالت کالا',
        description: 'فقط کالای اصل با گارانتی معتبر؛ بدون ریسک و بدون ابهام.',
      },
      {
        id: 'transparency',
        icon: 'i-tabler-eye',
        title: 'شفافیت قیمت',
        description: 'قیمت‌گذاری رقابتی و روشن، بدون هزینه پنهان در مسیر خرید.',
      },
      {
        id: 'support',
        icon: 'i-tabler-headset',
        title: 'پشتیبانی واقعی',
        description: 'همراهی ۷ روز هفته از انتخاب محصول تا پس از تحویل.',
      },
      {
        id: 'delivery',
        icon: 'i-tabler-truck-delivery',
        title: 'ارسال سریع',
        description: 'لجستیک بهینه برای رساندن سفارش در کوتاه‌ترین زمان ممکن.',
      },
    ],
    milestones: [
      {
        id: 'm-1395',
        year: '۱۳۹۵',
        title: 'آغاز مسیر',
        description: 'راه‌اندازی دیجی‌شاپ با تمرکز روی موبایل و لوازم جانبی اصل.',
      },
      {
        id: 'm-1398',
        year: '۱۳۹۸',
        title: 'گسترش سراسری',
        description: 'پوشش ارسال به سراسر کشور و راه‌اندازی انبار مرکزی.',
      },
      {
        id: 'm-1401',
        year: '۱۴۰۱',
        title: 'تجربه دیجیتال بهتر',
        description: 'بازطراحی فروشگاه آنلاین، اپلیکیشن و پشتیبانی چندکاناله.',
      },
      {
        id: 'm-1405',
        year: '۱۴۰۵',
        title: 'اکوسیستم کامل',
        description: 'گسترش به لپ‌تاپ، گیمینگ، صوتی و پوشیدنی‌های هوشمند.',
      },
    ],
    teamTitle: 'تیم دیجی‌شاپ',
    teamSubtitle: 'افرادی که هر روز برای تجربه بهتر خرید شما تلاش می‌کنند',
    team: [
      {
        id: 'ceo',
        name: 'سارا محمدی',
        role: 'مدیرعامل',
        bio: 'تمرکز روی رشد پایدار و تجربه مشتری.',
        image: '/images/mock/hero-tech-ecosystem.jpg',
      },
      {
        id: 'ops',
        name: 'علی رضایی',
        role: 'مدیر عملیات',
        bio: 'مسئول لجستیک، انبار و زمان تحویل.',
        image: '/images/mock/iphone16pro-desert.jpg',
      },
      {
        id: 'cx',
        name: 'مریم حسینی',
        role: 'مدیر تجربه مشتری',
        bio: 'طراحی مسیر پشتیبانی و رضایت خریداران.',
        image: '/images/mock/galaxy-s25-ultra.jpg',
      },
      {
        id: 'tech',
        name: 'رضا کریمی',
        role: 'مدیر فناوری',
        bio: 'ساخت پلتفرم سریع، امن و مقیاس‌پذیر.',
        image: '/images/mock/macbook-m4-spaceblack.jpg',
      },
    ],
    cta: {
      title: 'آماده خرید هوشمند هستید؟',
      subtitle: 'از جدیدترین گجت‌ها تا لوازم جانبی اصل — با خیال راحت انتخاب کنید.',
      primaryLabel: 'مشاهده محصولات',
      primaryTo: '/search',
      secondaryLabel: 'تماس با ما',
      secondaryTo: '/contact',
    },
  }
}

export function cloneAboutPage(payload: AboutPagePayload): AboutPagePayload {
  return JSON.parse(JSON.stringify(payload)) as AboutPagePayload
}
