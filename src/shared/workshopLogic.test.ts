import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildPhoneHref,
  buildWhatsAppHref,
  computeDashboardMetrics,
  filterProjects,
  normalizePhoneDigits,
  resolveInitialTheme,
  toggleThemeMode,
  validateQuoteInput,
} from './workshopLogic';
import type { Project, QuoteInquiry } from './types';

const sampleProjects: Project[] = [
  {
    id: 'p1',
    title: 'تروس حلزونية صلب مقسى',
    category: 'gears',
    categoryLabel: 'تروس وأعمدة',
    material: 'صلب 4140 مقسى',
    tolerance: '±0.015 مم',
    dimensions: 'Ø180 × 65 مم',
    year: '2026',
    sector: 'خطوط الإنتاج',
    description: 'تصنيع مجموعة تروس نقل حركة لخط تعبئة صناعي.',
    imageUrl: '/media/work_precision_gears_1795175062369.jpg',
    featured: true,
    createdAt: '2026-10-01T10:00:00.000Z',
  },
  {
    id: 'p2',
    title: 'فلانشات ستانلس ستيل CNC',
    category: 'cnc',
    categoryLabel: 'خراطة CNC',
    material: 'ستانلس ستيل 316L',
    tolerance: '±0.02 مم',
    dimensions: 'Ø220 × 28 مم',
    year: '2026',
    sector: 'المحطات الهيدروليكية',
    description: 'فلانشات ضغط عالي مقاومة للتآكل.',
    imageUrl: '/media/work_cnc_flange_1795175063002.jpg',
    featured: false,
    createdAt: '2026-10-02T10:00:00.000Z',
  },
];

test('filterProjects filters by category and Arabic/English query', () => {
  assert.equal(filterProjects(sampleProjects, 'all', '').length, 2);
  assert.equal(filterProjects(sampleProjects, 'gears', '').length, 1);
  assert.equal(filterProjects(sampleProjects, 'all', 'ستانلس').length, 1);
  assert.equal(filterProjects(sampleProjects, 'cnc', 'تروس').length, 0);
});

test('normalizePhoneDigits converts Arabic numerals and strips formatting', () => {
  assert.equal(normalizePhoneDigits('٠١٠١٢٣٤٥٦٧٨'), '01012345678');
  assert.equal(normalizePhoneDigits('+20 100-555-1234'), '+201005551234');
});

test('validateQuoteInput rejects empty/invalid inputs and accepts valid request', () => {
  const invalid = validateQuoteInput({
    customerName: 'أ',
    phone: '123',
    serviceType: '',
    material: '',
    quantity: 0,
    details: 'قصير',
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.customerName);
  assert.ok(invalid.errors.phone);
  assert.ok(invalid.errors.serviceType);
  assert.ok(invalid.errors.material);
  assert.ok(invalid.errors.quantity);
  assert.ok(invalid.errors.details);

  const valid = validateQuoteInput({
    customerName: 'محمد حسن',
    phone: '01012345678',
    company: 'مصنع النيل',
    serviceType: 'خراطة CNC',
    material: 'صلب 4140',
    quantity: 12,
    details: 'مطلوب تصنيع 12 عمود نقل حركة بقطر 45 مم وطول 320 مم',
  });
  assert.equal(valid.valid, true);
  assert.deepEqual(valid.errors, {});
});

test('computeDashboardMetrics counts projects and inquiry statuses accurately', () => {
  const inquiries: QuoteInquiry[] = [
    {
      id: 'q1',
      customerName: 'أحمد علي',
      phone: '01000000001',
      serviceType: 'خراطة CNC',
      material: 'ألومنيوم',
      quantity: 5,
      details: 'تفاصيل القطعة المطلوبة بدقة',
      status: 'new',
      createdAt: '2026-11-01T10:00:00.000Z',
    },
    {
      id: 'q2',
      customerName: 'كريم محمود',
      phone: '01000000002',
      serviceType: 'تروس وأعمدة',
      material: 'صلب',
      quantity: 2,
      details: 'ترس حلزوني 24 سنة',
      status: 'quoted',
      createdAt: '2026-11-02T10:00:00.000Z',
    },
  ];
  const metrics = computeDashboardMetrics(sampleProjects, inquiries);
  assert.equal(metrics.totalProjects, 2);
  assert.equal(metrics.featuredProjects, 1);
  assert.equal(metrics.totalInquiries, 2);
  assert.equal(metrics.newInquiries, 1);
  assert.equal(metrics.quotedInquiries, 1);
});

test('buildPhoneHref and buildWhatsAppHref format links cleanly', () => {
  assert.equal(buildPhoneHref('+20 112-634-6329'), 'tel:+201126346329');
  assert.equal(buildWhatsAppHref('+20 112-634-6329'), 'https://wa.me/201126346329');
});

test('resolveInitialTheme and toggleThemeMode switch between dark and light accurately', () => {
  assert.equal(resolveInitialTheme(null), 'dark');
  assert.equal(resolveInitialTheme('dark'), 'dark');
  assert.equal(resolveInitialTheme('light'), 'light');
  assert.equal(toggleThemeMode('dark'), 'light');
  assert.equal(toggleThemeMode('light'), 'dark');
});

