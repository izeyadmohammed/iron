import { ArrowDownLeft, Moon, Sun, Wrench } from 'lucide-react';
import { useState } from 'react';
import { HERO_WORKSHOP_IMAGE } from '../shared/seedData';
import type { WorkshopSettings } from '../shared/types';
import type { ThemeMode } from '../shared/workshopLogic';

interface HeroSectionProps {
  settings: WorkshopSettings;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onRequestQuote: () => void;
}

const WORKSHOP_METRICS = [
  { value: '+18 عاماً', label: 'خبرة في تشغيل المعادن والتروس' },
  { value: '±0.01 مم', label: 'دقة التفاوت الهندسي المعتمدة' },
  { value: '48 ساعة', label: 'متوسط تسليم العينات الأولية' },
  { value: '+1,200', label: 'قطعة ومشروع صناعي منفذ' },
];

export function HeroSection({
  settings,
  theme,
  onToggleTheme,
  onRequestQuote,
}: HeroSectionProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <section id="home" className="pt-16 bg-zinc-50 dark:bg-[#0B0D10] transition-colors">
      <div className="relative overflow-hidden border-b border-zinc-200 dark:border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-18">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-zinc-200/80 dark:border-zinc-800/70">
            <p className="text-sm font-medium text-orange-600 dark:text-orange-400 tracking-wide">
              {settings.heroSubtitle}
            </p>

            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={
                theme === 'dark'
                  ? 'التبديل إلى الوضع النهاري'
                  : 'التبديل إلى الوضع الليلي'
              }
              className="inline-flex items-center gap-2 min-h-[40px] px-3.5 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#12151B] text-zinc-700 dark:text-zinc-200 hover:border-orange-500 dark:hover:border-orange-500 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" />
                  <span>الوضع النهاري</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-zinc-700" aria-hidden="true" />
                  <span>الوضع الليلي</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center text-right">
              <h1
                className="font-black text-zinc-900 dark:text-white leading-[1.2] mb-6 text-right max-w-xl"
                style={{
                  fontSize: 'clamp(2.25rem, 4vw, 3.75rem)',
                }}
              >
                {settings.heroTitle}
              </h1>

              <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-xl mb-8">
                {settings.heroDesc}
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={onRequestQuote}
                  className="inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold px-6 py-3.5 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
                >
                  <span>اطلب مقايسة تصنيع</span>
                  <ArrowDownLeft className="w-4 h-4" aria-hidden="true" />
                </button>

                <a
                  href="#works"
                  className="inline-flex items-center justify-center border border-zinc-300 dark:border-zinc-700 hover:border-zinc-500 dark:hover:border-zinc-500 bg-white dark:bg-transparent text-zinc-800 dark:text-zinc-100 hover:text-zinc-950 dark:hover:text-white font-semibold px-6 py-3.5 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                >
                  استعرض الأعمال المنفذة
                </a>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative w-full h-72 sm:h-96 lg:h-full min-h-[340px] rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-200 dark:bg-[#12151B]">
                {!imgError ? (
                  <img
                    src={HERO_WORKSHOP_IMAGE}
                    alt="مخرطة CNC أثناء تشغيل عمود صلب داخل الورشة"
                    referrerPolicy="no-referrer"
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-zinc-200 via-zinc-100 to-zinc-200 dark:from-zinc-900 dark:via-[#151820] dark:to-zinc-950 p-6 text-center">
                    <Wrench className="w-12 h-12 text-orange-500 mb-3" aria-hidden="true" />
                    <p className="text-zinc-700 dark:text-zinc-300 font-semibold">{settings.siteName}</p>
                  </div>
                )}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-black/25 dark:from-[#0B0D10]/70 via-transparent to-transparent pointer-events-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#101318] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-zinc-200 dark:bg-zinc-800/80">
            {WORKSHOP_METRICS.map((metric) => (
              <div key={metric.label} className="bg-white dark:bg-[#101318] py-6 px-4 sm:px-6 transition-colors">
                <div className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white tabular-nums mb-1">
                  {metric.value}
                </div>
                <div className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                  {metric.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
