import { Menu, X } from 'lucide-react';
import { useState } from 'react';

interface NavbarProps {
  siteName: string;
  onRequestQuote: () => void;
}

export function Navbar({ siteName, onRequestQuote }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: '#home', label: 'الرئيسية' },
    { href: '#capabilities', label: 'القدرات' },
    { href: '#works', label: 'أعمالنا' },
    { href: '#quote', label: 'تواصل معنا' },
  ];

  const handleLinkClick = () => {
    setMobileOpen(false);
  };

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-white/90 dark:bg-[#0B0D10]/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800/90 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        <a
          href="#home"
          className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-white whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded"
        >
          {siteName}
        </a>

        <nav
          aria-label="التنقل الرئيسي"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-600 dark:text-zinc-300"
        >
          {navLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="hover:text-zinc-950 dark:hover:text-white underline-offset-8 hover:underline decoration-orange-500 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded px-1 py-1"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onRequestQuote}
            className="hidden md:inline-flex items-center justify-center bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
          >
            اطلب مقايسة
          </button>

          <button
            type="button"
            aria-label={mobileOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg border border-zinc-300 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0B0D10] px-4 py-4 space-y-2">
          {navLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={handleLinkClick}
              className="block py-2.5 px-3 text-base font-medium text-zinc-700 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg"
            >
              {item.label}
            </a>
          ))}
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              onRequestQuote();
            }}
            className="w-full mt-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold py-3 px-4 rounded-lg text-center cursor-pointer"
          >
            اطلب مقايسة
          </button>
        </div>
      )}
    </header>
  );
}
