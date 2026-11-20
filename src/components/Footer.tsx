import { Moon, Sun } from 'lucide-react';
import type { WorkshopSettings } from '../shared/types';
import type { ThemeMode } from '../shared/workshopLogic';

interface FooterProps {
  settings: WorkshopSettings;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onNavigateAdmin: () => void;
}

export function Footer({
  settings,
  theme,
  onToggleTheme,
  onNavigateAdmin,
}: FooterProps) {
  return (
    <footer className="bg-white dark:bg-[#080A0C] border-t border-zinc-200 dark:border-zinc-800/80 py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-right">
          <div className="text-base font-bold text-zinc-900 dark:text-white mb-1">
            {settings.siteName}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{settings.footerText}</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-zinc-600 dark:text-zinc-400">
          <a href="#home" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
            الرئيسية
          </a>
          <a href="#capabilities" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
            القدرات
          </a>
          <a href="#works" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
            أعمالنا
          </a>
          <a href="#quote" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
            طلب مقايسة
          </a>
          <button
            type="button"
            onClick={onToggleTheme}
            className="inline-flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium transition-colors cursor-pointer"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" />
                <span>نهاري</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-zinc-700" aria-hidden="true" />
                <span>ليلي</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onNavigateAdmin}
            className="text-zinc-700 dark:text-zinc-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium transition-colors cursor-pointer"
          >
            لوحة الإدارة
          </button>
        </div>
      </div>
    </footer>
  );
}
