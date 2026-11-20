const CAPABILITIES = [
  {
    number: '01.',
    title: 'خراطة CNC والمخارط التقليدية الثقيلة',
    summary:
      'تشغيل القطع الأسطوانية والمخروطية والفلانشات بأطوال تصل إلى 2000 مم وأقطار حتى 650 مم مع تكرار إنتاجي مطابق للرسم الهندسي.',
    specs: 'الصلب 4140 · ستانلس ستيل 304/316 · ألومنيوم 6061 · نحاس وبرونز',
    spanClass: 'lg:col-span-2',
  },
  {
    number: '02.',
    title: 'تصنيع التروس والأعمدة الميكانيكية',
    summary:
      'فرز وتخليق التروس العدلة والحلزونية والترس الدودي وأعمدة نقل الحركة مع مجاري الخوابير والمعالجة الحرارية.',
    specs: 'موديول 1 إلى 10 · أعمدة قلاووظ شبه منحرف · صلابة سطحية حتى 58 HRC',
    spanClass: 'lg:col-span-1',
  },
  {
    number: '03.',
    title: 'الهندسة العكسية وقطع الغيار الصناعية',
    summary:
      'رفع مقاسات القطع التالفة أو المستوردة باستخدام الميكروميتر والفرجار الرقمي وإعادة تصنيعها بخامات مطابقة أو أعلى تحملاً.',
    specs: 'تفاوت ±0.01 مم · جلب برونزية · محاور مكابس وخطوط إنتاج',
    spanClass: 'lg:col-span-1',
  },
  {
    number: '04.',
    title: 'تشكيل المعادن وتصنيع الهياكل والحوامل',
    summary:
      'تجهيز قواعد الماكينات، حوامل التثبيت، ألواح الارتكاز المثقبة، والتجميع المعدني الدقيق للمصانع ومواقع الإنشاءات.',
    specs: 'صاج وحديد إنشائي St52 · تفريز وتفتيح مجاري · تشطيب وتجهيز للتركيب',
    spanClass: 'lg:col-span-2',
  },
];

export function CapabilitiesBento() {
  return (
    <section
      id="capabilities"
      className="py-20 lg:py-24 bg-zinc-50 dark:bg-[#0B0D10] border-b border-zinc-200 dark:border-zinc-800/80 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-2">
              قدرات التشغيل والتصنيع
            </p>
            <h2 className="text-2xl sm:text-4xl font-bold text-zinc-900 dark:text-white max-w-2xl text-right">
              تجهيزات هندسية متكاملة من العينة الواحدة حتى خطوط الإنتاج
            </h2>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md leading-relaxed">
            فحص أبعاد كل قطعة قبل التسليم لضمان التوافق الميكانيكي المباشر وتقليل وقت توقف الماكينات.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {CAPABILITIES.map((cap) => (
            <article
              key={cap.number}
              className={`${cap.spanClass} bg-white dark:bg-[#12151B] border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 sm:p-8 flex flex-col justify-between transition-colors hover:border-zinc-300 dark:hover:border-zinc-700`}
            >
              <div>
                <div className="text-sm font-mono font-semibold text-orange-600 dark:text-orange-400 tabular-nums mb-3">
                  {cap.number}
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">
                  {cap.title}
                </h3>
                <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed mb-6">
                  {cap.summary}
                </p>
              </div>

              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800/80 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {cap.specs}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
