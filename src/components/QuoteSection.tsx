import { CheckCircle2, Clock, MapPin, MessageCircle, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { submitQuoteInquiry } from '../api/client';
import type { QuoteInput, QuoteInquiry, WorkshopSettings } from '../shared/types';
import { buildPhoneHref, buildWhatsAppHref, validateQuoteInput } from '../shared/workshopLogic';

interface QuoteSectionProps {
  settings: WorkshopSettings;
  prefilledProject?: { serviceType: string; material: string; title: string } | null;
}

const SERVICE_OPTIONS = [
  'خراطة CNC',
  'تروس وأعمدة',
  'قطع غيار صناعية',
  'تشكيل معادن',
];

const MATERIAL_OPTIONS = [
  'صلب كربوني 4140 / St52',
  'ستانلس ستيل 304 / 316L',
  'ألومنيوم 6061 / 7075',
  'نحاس / برونز فسفوري',
  'تيفلون / خامات هندسية أخرى',
];

export function QuoteSection({ settings, prefilledProject }: QuoteSectionProps) {
  const [form, setForm] = useState<QuoteInput>({
    customerName: '',
    phone: '',
    company: '',
    serviceType: SERVICE_OPTIONS[0],
    material: MATERIAL_OPTIONS[0],
    quantity: 1,
    details: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof QuoteInput, string>>>({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedInquiry, setSubmittedInquiry] = useState<QuoteInquiry | null>(null);

  const materialOptions =
    prefilledProject?.material && !MATERIAL_OPTIONS.includes(prefilledProject.material)
      ? [prefilledProject.material, ...MATERIAL_OPTIONS]
      : MATERIAL_OPTIONS;

  useEffect(() => {
    if (prefilledProject) {
      setForm((prev) => ({
        ...prev,
        serviceType: SERVICE_OPTIONS.includes(prefilledProject.serviceType)
          ? prefilledProject.serviceType
          : SERVICE_OPTIONS[0],
        material: prefilledProject.material,
        details: `مطلوب تصنيع قطعة مماثلة لمشروع: ${prefilledProject.title} — الكمية والمقاسات المطلوبة: `,
      }));
      setSubmittedInquiry(null);
      setErrors({});
    }
  }, [prefilledProject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    const validation = validateQuoteInput(form);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      const created = await submitQuoteInquiry(form);
      setSubmittedInquiry(created);
      setForm({
        customerName: '',
        phone: '',
        company: '',
        serviceType: SERVICE_OPTIONS[0],
        material: MATERIAL_OPTIONS[0],
        quantity: 1,
        details: '',
      });
    } catch (err) {
      const apiErr = err as Error & { fieldErrors?: Partial<Record<keyof QuoteInput, string>> };
      if (apiErr.fieldErrors) {
        setErrors(apiErr.fieldErrors);
      }
      setServerError(apiErr.message || 'تعذر إرسال الطلب، يرجى المحاولة مرة أخرى.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="quote" className="py-20 lg:py-24 bg-zinc-50 dark:bg-[#0B0D10] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-5 bg-white dark:bg-[#12151B] border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-2">
                تواصل وطلب مقايسة
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-4">
                أرسل مواصفات القطعة واحصل على تسعير دقيق
              </h2>
              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed mb-8">
                نستقبل طلبات التشغيل الفردي وخطوط الإنتاج. أرسل تفاصيل المقاسات والخامة أو تواصل معنا مباشرة لإرسال الرسم الهندسي أو العينة.
              </p>

              <div className="space-y-5 border-t border-zinc-200 dark:border-zinc-800 pt-6 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <div className="text-zinc-500 dark:text-zinc-400 text-xs mb-0.5">عنوان الورشة</div>
                    <div className="text-zinc-900 dark:text-zinc-100 font-medium">{settings.address}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <div className="text-zinc-500 dark:text-zinc-400 text-xs mb-0.5">مواعيد العمل</div>
                    <div className="text-zinc-900 dark:text-zinc-100 font-medium">{settings.workingHours}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
              <a
                href={buildPhoneHref(settings.phone)}
                className="inline-flex items-center justify-center gap-2 bg-zinc-50 dark:bg-[#0B0D10] border border-zinc-300 dark:border-zinc-700 hover:border-orange-500 text-zinc-900 dark:text-white font-semibold py-3 px-4 rounded-lg transition-colors text-sm whitespace-nowrap"
              >
                <Phone className="w-4 h-4 text-orange-600 dark:text-orange-400" aria-hidden="true" />
                <span className="tabular-nums" dir="ltr">{settings.phone}</span>
              </a>

              <a
                href={buildWhatsAppHref(settings.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-emerald-50 dark:bg-emerald-600/15 border border-emerald-600/30 dark:border-emerald-600/40 hover:bg-emerald-100 dark:hover:bg-emerald-600/25 text-emerald-800 dark:text-emerald-200 font-semibold py-3 px-4 rounded-lg transition-colors text-sm whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                <span>تواصل واتساب</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white dark:bg-[#12151B] border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 sm:p-8">
            {submittedInquiry ? (
              <div className="h-full flex flex-col justify-center items-start py-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mb-4" aria-hidden="true" />
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                  تم استلام طلب المقايسة بنجاح
                </h3>
                <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed mb-6">
                  تم تسجيل طلبك برقم مرجعي{' '}
                  <span className="font-mono font-semibold text-orange-600 dark:text-orange-400 tabular-nums" dir="ltr">
                    {submittedInquiry.id}
                  </span>
                  . سيتواصل معك فريق الورشة خلال ساعات العمل لمراجعة المقاسات وتأكيد التكلفة ومدة التنفيذ.
                </p>

                <div className="w-full bg-zinc-50 dark:bg-[#0B0D10] border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 text-sm space-y-2 mb-6">
                  <div className="flex justify-between gap-4">
                    <span className="text-zinc-500 dark:text-zinc-400">العميل</span>
                    <span className="text-zinc-900 dark:text-white font-medium">{submittedInquiry.customerName}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-zinc-500 dark:text-zinc-400">الخدمة والخامة</span>
                    <span className="text-zinc-900 dark:text-white font-medium">
                      {submittedInquiry.serviceType} · {submittedInquiry.material}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-zinc-500 dark:text-zinc-400">الكمية</span>
                    <span className="text-zinc-900 dark:text-white font-mono tabular-nums">{submittedInquiry.quantity}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSubmittedInquiry(null)}
                  className="bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
                >
                  إرسال طلب مقايسة جديد
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="quote-name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-200 mb-1.5">
                      الاسم بالكامل *
                    </label>
                    <input
                      id="quote-name"
                      type="text"
                      value={form.customerName}
                      onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
                      placeholder="مثال: م. أحمد محمود"
                      className="w-full bg-zinc-50 dark:bg-[#0B0D10] border border-zinc-300 dark:border-zinc-700 focus:border-orange-500 rounded-lg px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none"
                    />
                    {errors.customerName && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.customerName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="quote-phone" className="block text-sm font-medium text-zinc-700 dark:text-zinc-200 mb-1.5">
                      رقم الموبايل *
                    </label>
                    <input
                      id="quote-phone"
                      type="tel"
                      dir="ltr"
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      placeholder="01012345678"
                      className="w-full bg-zinc-50 dark:bg-[#0B0D10] border border-zinc-300 dark:border-zinc-700 focus:border-orange-500 rounded-lg px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white text-left placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none tabular-nums"
                    />
                    {errors.phone && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.phone}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="quote-service" className="block text-sm font-medium text-zinc-700 dark:text-zinc-200 mb-1.5">
                      نوع الخدمة *
                    </label>
                    <select
                      id="quote-service"
                      value={form.serviceType}
                      onChange={(e) => setForm((f) => ({ ...f, serviceType: e.target.value }))}
                      className="w-full bg-zinc-50 dark:bg-[#0B0D10] border border-zinc-300 dark:border-zinc-700 focus:border-orange-500 rounded-lg px-3 py-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none"
                    >
                      {SERVICE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="quote-material" className="block text-sm font-medium text-zinc-700 dark:text-zinc-200 mb-1.5">
                      الخامة المطلوبة *
                    </label>
                    <select
                      id="quote-material"
                      value={form.material}
                      onChange={(e) => setForm((f) => ({ ...f, material: e.target.value }))}
                      className="w-full bg-zinc-50 dark:bg-[#0B0D10] border border-zinc-300 dark:border-zinc-700 focus:border-orange-500 rounded-lg px-3 py-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none"
                    >
                      {materialOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="quote-quantity" className="block text-sm font-medium text-zinc-700 dark:text-zinc-200 mb-1.5">
                      الكمية (قطعة) *
                    </label>
                    <input
                      id="quote-quantity"
                      type="number"
                      min={1}
                      max={100000}
                      value={form.quantity}
                      onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                      className="w-full bg-zinc-50 dark:bg-[#0B0D10] border border-zinc-300 dark:border-zinc-700 focus:border-orange-500 rounded-lg px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white tabular-nums focus:outline-none"
                    />
                    {errors.quantity && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.quantity}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="quote-company" className="block text-sm font-medium text-zinc-700 dark:text-zinc-200 mb-1.5">
                    اسم المصنع أو الشركة (اختياري)
                  </label>
                  <input
                    id="quote-company"
                    type="text"
                    value={form.company || ''}
                    onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                    placeholder="مثال: شركة الدلتا للصناعات الهندسية"
                    className="w-full bg-zinc-50 dark:bg-[#0B0D10] border border-zinc-300 dark:border-zinc-700 focus:border-orange-500 rounded-lg px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="quote-details" className="block text-sm font-medium text-zinc-700 dark:text-zinc-200 mb-1.5">
                    وصف القطعة والأبعاد المطلوبة *
                  </label>
                  <textarea
                    id="quote-details"
                    rows={4}
                    value={form.details}
                    onChange={(e) => setForm((f) => ({ ...f, details: e.target.value }))}
                    placeholder="اذكر الأقطار والأطوال ونوع السن أو الخوابير وموعد التسليم المطلوب..."
                    className="w-full bg-zinc-50 dark:bg-[#0B0D10] border border-zinc-300 dark:border-zinc-700 focus:border-orange-500 rounded-lg px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none"
                  />
                  {errors.details && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.details}</p>
                  )}
                </div>

                {serverError && (
                  <p role="alert" className="text-sm text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3.5 py-2.5">
                    {serverError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto bg-orange-600 hover:bg-orange-500 disabled:opacity-60 text-white font-semibold px-7 py-3 rounded-lg transition-colors cursor-pointer"
                >
                  {submitting ? 'جاري إرسال الطلب...' : 'إرسال طلب المقايسة'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
