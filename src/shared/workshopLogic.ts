import type {
  DashboardMetrics,
  Project,
  ProjectCategory,
  QuoteInput,
  QuoteInquiry,
  ValidationResult,
} from './types';

export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  cnc: 'خراطة CNC',
  gears: 'تروس وأعمدة',
  fabrication: 'تشكيل معادن',
  spare_parts: 'قطع غيار صناعية',
};

export const INQUIRY_STATUS_LABELS: Record<QuoteInquiry['status'], string> = {
  new: 'طلب جديد',
  reviewing: 'قيد المراجعة',
  quoted: 'تم التسعير',
  completed: 'مكتمل التنفيذ',
};

export function filterProjects(
  projects: Project[],
  category: 'all' | ProjectCategory,
  searchQuery: string
): Project[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return projects.filter((project) => {
    const matchesCategory =
      category === 'all' || project.category === category;
    if (!matchesCategory) return false;

    if (!normalizedQuery) return true;

    const haystack = [
      project.title,
      project.material,
      project.categoryLabel,
      project.sector,
      project.description,
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });
}

export function normalizePhoneDigits(rawPhone: string): string {
  const arabicDigits = '٠١٢٣٤٥٦٧٨٩';
  const converted = rawPhone.replace(/[٠-٩]/g, (d) =>
    String(arabicDigits.indexOf(d))
  );
  return converted.replace(/[^\d+]/g, '');
}

export function validateQuoteInput(input: QuoteInput): ValidationResult {
  const errors: ValidationResult['errors'] = {};

  if (!input.customerName || input.customerName.trim().length < 2) {
    errors.customerName = 'يرجى إدخال الاسم بالكامل (حرفان على الأقل).';
  }

  const normalizedPhone = normalizePhoneDigits(input.phone || '');
  const digitsOnly = normalizedPhone.replace(/\D/g, '');
  if (digitsOnly.length < 10 || digitsOnly.length > 15) {
    errors.phone = 'يرجى إدخال رقم هاتف صحيح مكون من 10 إلى 15 رقماً.';
  }

  if (!input.serviceType || input.serviceType.trim().length === 0) {
    errors.serviceType = 'يرجى اختيار نوع الخدمة المطلوبة.';
  }

  if (!input.material || input.material.trim().length === 0) {
    errors.material = 'يرجى تحديد نوع الخامة المطلوبة.';
  }

  const qty = Number(input.quantity);
  if (!Number.isFinite(qty) || qty < 1 || qty > 100000) {
    errors.quantity = 'الكمية يجب أن تكون رقماً بين 1 و 100,000 قطعة.';
  }

  if (!input.details || input.details.trim().length < 8) {
    errors.details = 'يرجى كتابة وصف واضح للمقاسات أو القطعة المطلوبة.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function computeDashboardMetrics(
  projects: Project[],
  inquiries: QuoteInquiry[]
): DashboardMetrics {
  return {
    totalProjects: projects.length,
    featuredProjects: projects.filter((p) => p.featured).length,
    totalInquiries: inquiries.length,
    newInquiries: inquiries.filter((i) => i.status === 'new').length,
    quotedInquiries: inquiries.filter((i) => i.status === 'quoted').length,
  };
}

export function buildPhoneHref(phone: string): string {
  const cleaned = normalizePhoneDigits(phone);
  return `tel:${cleaned}`;
}

export function buildWhatsAppHref(whatsapp: string): string {
  const digitsOnly = normalizePhoneDigits(whatsapp).replace(/\D/g, '');
  return `https://wa.me/${digitsOnly}`;
}

export type ThemeMode = 'dark' | 'light';

export function resolveInitialTheme(saved: string | null): ThemeMode {
  return saved === 'light' ? 'light' : 'dark';
}

export function toggleThemeMode(current: ThemeMode): ThemeMode {
  return current === 'dark' ? 'light' : 'dark';
}
