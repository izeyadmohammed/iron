import type { Project, QuoteInquiry, WorkshopSettings } from './types';

export const HERO_WORKSHOP_IMAGE = './media/hero_lathe_workshop_1795175063653.jpg';

export const DEFAULT_SETTINGS: WorkshopSettings = {
  siteName: 'ورشة الخراطة',
  heroTitle: 'نحول المعدن الخام إلى قطع هندسية عالية الدقة',
  heroSubtitle: 'العاشر من رمضان · خدمات الخراطة الصناعية وتشكيل المعادن',
  heroDesc:
    'ورشة متخصصة في خراطة CNC، تصنيع التروس والأعمدة، وتشغيل قطع الغيار الصناعية للمصانع والمقاولين بتفاوت هندسي يصل إلى ±0.01 مم.',
  phone: '+201126346329',
  whatsapp: '201126346329',
  address: 'المنطقة الصناعية الثالثة، مدينة العاشر من رمضان',
  workingHours: 'السبت – الخميس | 8:30 صباحاً – 6:30 مساءً',
  footerText: '© 2026 ورشة الخراطة للهندسة الدقيقة. جميع الحقوق محفوظة.',
};

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-101',
    title: 'تروس حلزونية وأعمدة نقل حركة',
    category: 'gears',
    categoryLabel: 'تروس وأعمدة',
    material: 'صلب كربوني 4140 مقسى',
    tolerance: '±0.015 مم',
    dimensions: 'Ø180 × 420 مم',
    year: '2026',
    sector: 'خطوط التعبئة والتغليف',
    description:
      'تصنيع وفرز مجموعة تروس حلزونية متعشقة مع أعمدة قلاووظ شبه منحرف (Trapezoidal) ومعالجة حرارية لرفع مقاومة التآكل تحت الأحمال المستمرة.',
    imageUrl: './media/work_precision_gears_1795175062369.jpg',
    featured: true,
    createdAt: '2026-10-18T09:00:00.000Z',
  },
  {
    id: 'proj-102',
    title: 'فلانشات ووصلات هيدروليك ستانلس',
    category: 'cnc',
    categoryLabel: 'خراطة CNC',
    material: 'ستانلس ستيل 316L',
    tolerance: '±0.020 مم',
    dimensions: 'Ø240 × 32 مم',
    year: '2026',
    sector: 'محطات الضخ والبتروكيماويات',
    description:
      'تشغيل فلانشات ضغط عالي ووصلات رباعية مقلوظة بالكامل على مخارط CNC مع فحص استوائية الأسطح وثقوب التثبيت.',
    imageUrl: './media/work_cnc_flange_1795175063002.jpg',
    featured: true,
    createdAt: '2026-10-14T11:30:00.000Z',
  },
  {
    id: 'proj-103',
    title: 'جلب نحاسية ومحاور تحميل برونزية',
    category: 'spare_parts',
    categoryLabel: 'قطع غيار صناعية',
    material: 'برونز فسفوري CuSn8',
    tolerance: '±0.010 مم',
    dimensions: 'Ø75 × 58 مم',
    year: '2026',
    sector: 'معدات الكسارات والمكابس',
    description:
      'خراطة وتشطيب مرآوي لجلب نحاسية ذات ترتره خارجية وصواميل قفل مقلوظة M36×1.5 لاستبدال القطع المستوردة بدقة مطابقة للمصنع.',
    imageUrl: './media/work_brass_bushings_1795175062935.jpg',
    featured: true,
    createdAt: '2026-10-08T14:15:00.000Z',
  },
  {
    id: 'proj-104',
    title: 'حوامل تثبيت ومشغولات صاج ثقيل',
    category: 'fabrication',
    categoryLabel: 'تشكيل معادن',
    material: 'صلب إنشائي St52 / ألومنيوم 6061',
    tolerance: '±0.050 مم',
    dimensions: '350 × 280 × 22 مم',
    year: '2026',
    sector: 'الإنشاءات المعدنية والماكينات',
    description:
      'قص وتشكيل قواعد تثبيت وتفريز ألواح ارتكاز للمحركات الثقيلة مع تفتيح مجاري التثبيت بدقة وتجهيزها للتركيب المباشر.',
    imageUrl: './media/work_steel_fabrication_1795175063956.jpg',
    featured: false,
    createdAt: '2026-09-29T08:45:00.000Z',
  },
];

export const INITIAL_INQUIRIES: QuoteInquiry[] = [
  {
    id: 'INQ-2601',
    customerName: 'م. طارق عبد الرحمن',
    phone: '01098765432',
    company: 'الشركة الهندسية للصناعات الغذائية',
    serviceType: 'تروس وأعمدة',
    material: 'ستانلس ستيل 304',
    quantity: 6,
    details: 'مطلوب تصنيع 6 أعمدة خلاط طول 650 مم بقطر 50 مم مع خابور تثبيت حسب العينة.',
    status: 'reviewing',
    createdAt: '2026-11-18T10:20:00.000Z',
  },
  {
    id: 'INQ-2602',
    customerName: 'أ. سامح المنصوري',
    phone: '01234567891',
    company: 'ورشة صيانة الشهابي',
    serviceType: 'قطع غيار صناعية',
    material: 'نحاس / برونز',
    quantity: 20,
    details: 'جلب برونز لمكبس هيدروليك قطر داخلي 42 مم وخارجي 64 مم بطول 45 مم.',
    status: 'quoted',
    createdAt: '2026-11-17T15:40:00.000Z',
  },
];
