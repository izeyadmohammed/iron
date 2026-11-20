import { Wrench, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Project } from '../shared/types';

interface ProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
  onRequestSimilar: (project: Project) => void;
}

export function ProjectDetailModal({
  project,
  onClose,
  onRequestSimilar,
}: ProjectDetailModalProps) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [project?.id]);

  useEffect(() => {
    if (!project) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-[#12151B] border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-2xl w-full overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
            <span className="text-orange-600 dark:text-orange-400 font-medium">
              {project.categoryLabel}
            </span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{project.year}</span>
          </div>
          <button
            type="button"
            aria-label="إغلاق نافذة المواصفات"
            onClick={onClose}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-6">
          <div className="aspect-[16/10] rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            {!imgError ? (
              <img
                src={project.imageUrl}
                alt={project.title}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <Wrench className="w-10 h-10 text-orange-500 mb-2" aria-hidden="true" />
                <span className="text-sm text-zinc-600 dark:text-zinc-400">{project.title}</span>
              </div>
            )}
          </div>

          <div>
            <h3 id="project-modal-title" className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">
              {project.title}
            </h3>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed">
              {project.description}
            </p>
          </div>

          <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg divide-y divide-zinc-200 dark:divide-zinc-800 text-sm">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-zinc-500 dark:text-zinc-400">الخامة المستخدمة</span>
              <span className="font-medium text-zinc-900 dark:text-white">{project.material}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-zinc-500 dark:text-zinc-400">دقة التفاوت الهندسي</span>
              <span className="font-mono font-medium text-zinc-900 dark:text-white tabular-nums">
                {project.tolerance}
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-zinc-500 dark:text-zinc-400">الأبعاد المرجعية</span>
              <span className="font-mono font-medium text-zinc-900 dark:text-white tabular-nums">
                {project.dimensions}
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-zinc-500 dark:text-zinc-400">القطاع الصناعي</span>
              <span className="font-medium text-zinc-900 dark:text-white">{project.sector}</span>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-3 bg-zinc-50 dark:bg-[#0E1116]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white rounded-lg border border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors cursor-pointer"
          >
            إغلاق
          </button>
          <button
            type="button"
            onClick={() => onRequestSimilar(project)}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-500 rounded-lg transition-colors cursor-pointer"
          >
            اطلب قطعة مماثلة
          </button>
        </div>
      </div>
    </div>
  );
}
