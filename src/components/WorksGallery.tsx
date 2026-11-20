import { Search, Wrench } from 'lucide-react';
import { useState } from 'react';
import { CATEGORY_LABELS, filterProjects } from '../shared/workshopLogic';
import type { Project, ProjectCategory } from '../shared/types';

interface WorksGalleryProps {
  projects: Project[];
  loading: boolean;
  onSelectProject: (project: Project) => void;
}

const FILTER_OPTIONS: Array<{ value: 'all' | ProjectCategory; label: string }> = [
  { value: 'all', label: 'جميع الأعمال' },
  { value: 'cnc', label: CATEGORY_LABELS.cnc },
  { value: 'gears', label: CATEGORY_LABELS.gears },
  { value: 'spare_parts', label: CATEGORY_LABELS.spare_parts },
  { value: 'fabrication', label: CATEGORY_LABELS.fabrication },
];

export function WorksGallery({
  projects,
  loading,
  onSelectProject,
}: WorksGalleryProps) {
  const [activeCategory, setActiveCategory] = useState<'all' | ProjectCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const filtered = filterProjects(projects, activeCategory, searchQuery);

  return (
    <section
      id="works"
      className="py-20 lg:py-24 bg-zinc-100/70 dark:bg-[#0E1116] border-b border-zinc-200 dark:border-zinc-800/80 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-2">
              سجل الأعمال المنفذة
            </p>
            <h2 className="text-2xl sm:text-4xl font-bold text-zinc-900 dark:text-white">
              نماذج من مشغولات الورشة
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative">
              <label htmlFor="works-search" className="sr-only">
                ابحث في الأعمال بالاسم أو الخامة
              </label>
              <Search
                className="w-4 h-4 text-zinc-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="works-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالقطعة أو الخامة..."
                className="w-full sm:w-64 bg-white dark:bg-[#12151B] border border-zinc-300 dark:border-zinc-800 focus:border-orange-500 rounded-lg pr-10 pl-3 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div
          role="group"
          aria-label="تصفية الأعمال حسب التخصص"
          className="flex flex-wrap items-center gap-1.5 p-1.5 bg-white dark:bg-[#12151B] border border-zinc-200 dark:border-zinc-800 rounded-xl w-fit mb-10"
        >
          {FILTER_OPTIONS.map((option) => {
            const isActive = activeCategory === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActiveCategory(option.value)}
                className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-orange-600 text-white'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="bg-white dark:bg-[#12151B] border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden animate-pulse"
              >
                <div className="aspect-[4/3] bg-zinc-200 dark:bg-zinc-800/70" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3" />
                  <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-[#12151B] border border-zinc-200 dark:border-zinc-800 rounded-xl p-10 text-center">
            <p className="text-zinc-800 dark:text-zinc-300 font-semibold mb-2">
              لا توجد مشغولات مطابقة لخيارات البحث الحالية
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-5">
              يمكنك إعادة ضبط الفلاتر لعرض جميع أعمال الورشة أو طلب قطعة بمواصفات خاصة.
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveCategory('all');
                setSearchQuery('');
              }}
              className="bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              عرض جميع الأعمال
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((project) => {
              const hasFailed = failedImages[project.id];
              return (
                <article
                  key={project.id}
                  className="bg-white dark:bg-[#12151B] border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600 rounded-xl overflow-hidden flex flex-col transition-colors"
                >
                  <div className="aspect-[4/3] bg-zinc-200 dark:bg-zinc-900 overflow-hidden relative">
                    {!hasFailed ? (
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        referrerPolicy="no-referrer"
                        onError={() =>
                          setFailedImages((prev) => ({ ...prev, [project.id]: true }))
                        }
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-900 dark:to-zinc-950 p-4 text-center">
                        <Wrench className="w-8 h-8 text-orange-500 mb-2" aria-hidden="true" />
                        <span className="text-xs text-zinc-600 dark:text-zinc-400">{project.title}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                        <span className="text-orange-600 dark:text-orange-400 font-medium">
                          {project.categoryLabel}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{project.material}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">{project.tolerance}</span>
                      </div>

                      <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
                        {project.title}
                      </h3>

                      <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-2">
                        {project.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between gap-4">
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono tabular-nums">
                        {project.dimensions}
                      </span>
                      <button
                        type="button"
                        onClick={() => onSelectProject(project)}
                        aria-label={`عرض مواصفات ${project.title}`}
                        className="text-sm font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-500 dark:hover:text-orange-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        عرض المواصفات
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
