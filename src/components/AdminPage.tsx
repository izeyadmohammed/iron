import {
  ArrowRight,
  FolderKanban,
  Inbox,
  LogOut,
  Moon,
  Plus,
  Settings,
  Sun,
  Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  checkAdminSession,
  createProject,
  deleteInquiry,
  deleteProject,
  fetchInquiries,
  fetchProjects,
  fetchSettings,
  loginAdmin,
  logoutAdmin,
  updateInquiryStatus,
  updateProject,
  updateSettings,
} from '../api/client';
import type {
  InquiryStatus,
  Project,
  ProjectCategory,
  QuoteInquiry,
  WorkshopSettings,
} from '../shared/types';
import {
  CATEGORY_LABELS,
  INQUIRY_STATUS_LABELS,
  computeDashboardMetrics,
  type ThemeMode,
} from '../shared/workshopLogic';

interface AdminPageProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  onNavigateHome: () => void;
  onDataUpdated: () => void;
}

type AdminTab = 'projects' | 'inquiries' | 'settings';

const TAB_LABELS: Record<AdminTab, string> = {
  projects: 'المشاريع والأعمال',
  inquiries: 'طلبات المقايسات',
  settings: 'إعدادات الورشة',
};

const PRESET_IMAGES = [
  { label: 'تروس وأعمدة صلب', url: '/media/work_precision_gears_1795175062369.jpg' },
  { label: 'فلانشات CNC ستانلس', url: '/media/work_cnc_flange_1795175063002.jpg' },
  { label: 'جلب ومحاور نحاس', url: '/media/work_brass_bushings_1795175062935.jpg' },
  { label: 'تشكيل وهياكل حديد', url: '/media/work_steel_fabrication_1795175063956.jpg' },
];

export function AdminPage({
  theme,
  onToggleTheme,
  onNavigateHome,
  onDataUpdated,
}: AdminPageProps) {
  const [authChecked, setAuthChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState<AdminTab>('projects');
  const [loadingData, setLoadingData] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [inquiries, setInquiries] = useState<QuoteInquiry[]>([]);
  const [settings, setSettings] = useState<WorkshopSettings | null>(null);

  const [inquiryFilter, setInquiryFilter] = useState<'all' | InquiryStatus>('all');
  const [projectSearch, setProjectSearch] = useState('');
  const [confirmDeleteProjId, setConfirmDeleteProjId] = useState<string | null>(null);
  const [confirmDeleteInqId, setConfirmDeleteInqId] = useState<string | null>(null);

  const [newProj, setNewProj] = useState({
    title: '',
    category: 'cnc' as ProjectCategory,
    material: 'صلب كربوني 4140',
    tolerance: '±0.020 مم',
    dimensions: 'Ø120 × 200 مم',
    year: '2026',
    sector: 'خطوط الإنتاج',
    description: '',
    imageUrl: PRESET_IMAGES[0].url,
    imageDataUrl: '',
    featured: false,
  });
  const [projStatusMsg, setProjStatusMsg] = useState('');
  const [projErrorMsg, setProjErrorMsg] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [savingProject, setSavingProject] = useState(false);

  const [settingsMsg, setSettingsMsg] = useState('');
  const [settingsError, setSettingsError] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  const loadAllAdminData = async () => {
    setLoadingData(true);
    try {
      const [projList, inqList, currentSettings] = await Promise.all([
        fetchProjects(),
        fetchInquiries(),
        fetchSettings(),
      ]);
      setProjects(projList);
      setInquiries(inqList);
      setSettings(currentSettings);
    } catch {
      setAuthenticated(false);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    checkAdminSession()
      .then((ok) => {
        setAuthenticated(ok);
        if (ok) return loadAllAdminData();
      })
      .finally(() => setAuthChecked(true));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);
    try {
      await loginAdmin(phone, password);
      setAuthenticated(true);
      await loadAllAdminData();
    } catch (err) {
      setLoginError(
        err instanceof Error ? err.message : 'تعذر تسجيل الدخول.'
      );
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logoutAdmin();
    setAuthenticated(false);
    setPhone('');
    setPassword('');
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setNewProj((prev) => ({ ...prev, imageDataUrl: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setProjErrorMsg('');
    setProjStatusMsg('');

    if (newProj.title.trim().length < 2) {
      setProjErrorMsg('يرجى إدخال اسم المشروع.');
      return;
    }

    setSavingProject(true);
    try {
      const created = await createProject(newProj);
      setProjects((prev) => [created, ...prev]);
      setNewProj({
        title: '',
        category: 'cnc',
        material: 'صلب كربوني 4140',
        tolerance: '±0.020 مم',
        dimensions: 'Ø120 × 200 مم',
        year: '2026',
        sector: 'خطوط الإنتاج',
        description: '',
        imageUrl: PRESET_IMAGES[0].url,
        imageDataUrl: '',
        featured: false,
      });
      setSelectedFileName('');
      setProjStatusMsg('تمت إضافة المشروع ونشره على الموقع بنجاح.');
      onDataUpdated();
    } catch (err) {
      setProjErrorMsg(err instanceof Error ? err.message : 'تعذر إضافة المشروع.');
    } finally {
      setSavingProject(false);
    }
  };

  const handleToggleFeatured = async (proj: Project) => {
    const updated = await updateProject(proj.id, { featured: !proj.featured });
    setProjects((prev) => prev.map((p) => (p.id === proj.id ? updated : p)));
    onDataUpdated();
  };

  const handleDeleteProject = async (id: string) => {
    await deleteProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setConfirmDeleteProjId(null);
    onDataUpdated();
  };

  const handleInquiryStatusChange = async (id: string, status: InquiryStatus) => {
    const updated = await updateInquiryStatus(id, status);
    setInquiries((prev) => prev.map((i) => (i.id === id ? updated : i)));
  };

  const handleDeleteInquiry = async (id: string) => {
    await deleteInquiry(id);
    setInquiries((prev) => prev.filter((i) => i.id !== id));
    setConfirmDeleteInqId(null);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSettingsMsg('');
    setSettingsError('');
    setSavingSettings(true);
    try {
      const updated = await updateSettings(settings);
      setSettings(updated);
      setSettingsMsg('تم حفظ إعدادات الورشة وتحديث الموقع بنجاح.');
      onDataUpdated();
    } catch (err) {
      setSettingsError(err instanceof Error ? err.message : 'تعذر حفظ الإعدادات.');
    } finally {
      setSavingSettings(false);
    }
  };

  const inputClass =
    'w-full bg-zinc-50 dark:bg-[#0B0D10] border border-zinc-300 dark:border-zinc-700 focus:border-orange-500 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none';

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-[#0B0D10] flex items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">
        جاري التحقق من الجلسة...
      </div>
    );
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-zinc-50 dark:bg-[#0B0D10] flex items-center justify-center p-4 transition-colors">
        <div className="w-full max-w-md bg-white dark:bg-[#12151B] border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">
                لوحة إدارة الورشة
              </h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                سجل الدخول برقم الموبايل لإدارة الأعمال وطلبات المقايسات.
              </p>
            </div>
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}
              className="p-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:border-orange-500 transition-colors shrink-0 cursor-pointer"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" />
              ) : (
                <Moon className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="admin-phone" className="block text-sm font-medium text-zinc-700 dark:text-zinc-200 mb-1.5">
                رقم الموبايل
              </label>
              <input
                id="admin-phone"
                type="tel"
                dir="ltr"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01126346329"
                className={`${inputClass} px-3.5 py-2.5 text-left tabular-nums`}
              />
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-200 mb-1.5">
                كلمة المرور
              </label>
              <input
                id="admin-password"
                type="password"
                dir="ltr"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`${inputClass} px-3.5 py-2.5 text-left`}
              />
            </div>

            {loginError && (
              <p role="alert" className="text-sm text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full bg-orange-600 hover:bg-orange-500 disabled:opacity-60 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors cursor-pointer"
            >
              {loggingIn ? 'جاري الدخول...' : 'دخول إلى لوحة الإدارة'}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span className="tabular-nums" dir="ltr">
              بيانات تجريبية: 01126346329 / admin123
            </span>
            <button
              type="button"
              onClick={onNavigateHome}
              className="inline-flex items-center gap-1 text-zinc-700 dark:text-zinc-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              <span>العودة للموقع</span>
            </button>
          </div>
        </div>
      </main>
    );
  }

  const metrics = computeDashboardMetrics(projects, inquiries);
  const filteredProjects = projects.filter((p) =>
    !projectSearch.trim()
      ? true
      : p.title.toLowerCase().includes(projectSearch.trim().toLowerCase()) ||
        p.material.toLowerCase().includes(projectSearch.trim().toLowerCase())
  );
  const filteredInquiries = inquiries.filter(
    (inq) => inquiryFilter === 'all' || inq.status === inquiryFilter
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0B0D10] text-zinc-900 dark:text-zinc-100 flex flex-col lg:flex-row transition-colors">
      <aside className="lg:w-64 bg-white dark:bg-[#101318] border-b lg:border-b-0 lg:border-l border-zinc-200 dark:border-zinc-800 shrink-0 flex flex-col justify-between">
        <div className="p-4 lg:p-6">
          <div className="flex items-center justify-between lg:block mb-4 lg:mb-8">
            <div className="text-lg font-extrabold text-zinc-900 dark:text-white">
              {settings?.siteName || 'ورشة الخراطة'}
            </div>
            <button
              type="button"
              onClick={onNavigateHome}
              className="lg:hidden text-xs text-zinc-600 dark:text-zinc-300 hover:text-orange-600 dark:hover:text-orange-400 cursor-pointer"
            >
              عرض الموقع
            </button>
          </div>

          <nav aria-label="أقسام لوحة الإدارة" className="flex lg:flex-col gap-1.5 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('projects')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'projects'
                  ? 'bg-orange-600 text-white'
                  : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 hover:text-zinc-950 dark:hover:text-white'
              }`}
            >
              <FolderKanban className="w-4 h-4" aria-hidden="true" />
              <span>المشاريع والأعمال</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('inquiries')}
              className={`flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'inquiries'
                  ? 'bg-orange-600 text-white'
                  : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 hover:text-zinc-950 dark:hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Inbox className="w-4 h-4" aria-hidden="true" />
                <span>طلبات المقايسات</span>
              </span>
              <span className="font-mono text-xs tabular-nums opacity-85">
                {metrics.newInquiries}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-orange-600 text-white'
                  : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 hover:text-zinc-950 dark:hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4" aria-hidden="true" />
              <span>إعدادات الورشة</span>
            </button>
          </nav>
        </div>

        <div className="hidden lg:block p-6 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
          <button
            type="button"
            onClick={onToggleTheme}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white border border-zinc-300 dark:border-zinc-800 hover:border-orange-500 rounded-lg transition-colors cursor-pointer"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" />
                <span>الوضع النهاري</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4" aria-hidden="true" />
                <span>الوضع الليلي</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onNavigateHome}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white border border-zinc-300 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
            <span>عرض الموقع العام</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            <span>تسجيل خروج</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 px-4 sm:px-8 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4 bg-white dark:bg-[#0B0D10]">
          <div className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
            <span>لوحة الإدارة</span>
            <span aria-hidden="true">/</span>
            <span className="text-zinc-900 dark:text-white font-semibold">{TAB_LABELS[activeTab]}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}
              className="lg:hidden inline-flex items-center justify-center p-2 rounded-lg border border-zinc-300 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 cursor-pointer"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" />
              ) : (
                <Moon className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
            <button
              type="button"
              onClick={onNavigateHome}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white border border-zinc-300 dark:border-zinc-800 px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer"
            >
              العودة للموقع
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="lg:hidden inline-flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400 border border-zinc-300 dark:border-zinc-800 px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer"
            >
              خروج
            </button>
          </div>
        </header>

        <main className="p-4 sm:p-8 space-y-8 max-w-6xl w-full">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            <div className="bg-white dark:bg-[#12151B] p-4 sm:p-5">
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">إجمالي المشاريع</div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-white tabular-nums">{metrics.totalProjects}</div>
            </div>
            <div className="bg-white dark:bg-[#12151B] p-4 sm:p-5">
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">مشاريع مميزة</div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-white tabular-nums">{metrics.featuredProjects}</div>
            </div>
            <div className="bg-white dark:bg-[#12151B] p-4 sm:p-5">
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">طلبات مقايسة جديدة</div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 tabular-nums">{metrics.newInquiries}</div>
            </div>
            <div className="bg-white dark:bg-[#12151B] p-4 sm:p-5">
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">إجمالي الطلبات الواردة</div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-white tabular-nums">{metrics.totalInquiries}</div>
            </div>
          </div>

          {loadingData ? (
            <div className="py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
              جاري تحميل بيانات الورشة...
            </div>
          ) : activeTab === 'projects' ? (
            <div className="space-y-8">
              <section className="bg-white dark:bg-[#12151B] border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-orange-600 dark:text-orange-400" aria-hidden="true" />
                  <span>إضافة مشروع جديد للمعرض</span>
                </h2>

                <form onSubmit={handleCreateProject} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="proj-title" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        اسم المشروع *
                      </label>
                      <input
                        id="proj-title"
                        type="text"
                        required
                        value={newProj.title}
                        onChange={(e) => setNewProj((p) => ({ ...p, title: e.target.value }))}
                        placeholder="مثال: عمود كرنك صلب CNC"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label htmlFor="proj-category" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        التخصص
                      </label>
                      <select
                        id="proj-category"
                        value={newProj.category}
                        onChange={(e) =>
                          setNewProj((p) => ({ ...p, category: e.target.value as ProjectCategory }))
                        }
                        className={inputClass}
                      >
                        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="proj-material" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        الخامة
                      </label>
                      <input
                        id="proj-material"
                        type="text"
                        value={newProj.material}
                        onChange={(e) => setNewProj((p) => ({ ...p, material: e.target.value }))}
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label htmlFor="proj-tolerance" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        دقة التفاوت
                      </label>
                      <input
                        id="proj-tolerance"
                        type="text"
                        value={newProj.tolerance}
                        onChange={(e) => setNewProj((p) => ({ ...p, tolerance: e.target.value }))}
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label htmlFor="proj-dimensions" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        الأبعاد المرجعية
                      </label>
                      <input
                        id="proj-dimensions"
                        type="text"
                        value={newProj.dimensions}
                        onChange={(e) => setNewProj((p) => ({ ...p, dimensions: e.target.value }))}
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label htmlFor="proj-preset" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        صورة افتراضية من المعرض
                      </label>
                      <select
                        id="proj-preset"
                        value={newProj.imageUrl}
                        onChange={(e) =>
                          setNewProj((p) => ({ ...p, imageUrl: e.target.value, imageDataUrl: '' }))
                        }
                        className={inputClass}
                      >
                        {PRESET_IMAGES.map((img) => (
                          <option key={img.url} value={img.url}>
                            {img.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="proj-desc" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        الوصف الفني
                      </label>
                      <textarea
                        id="proj-desc"
                        rows={2}
                        value={newProj.description}
                        onChange={(e) => setNewProj((p) => ({ ...p, description: e.target.value }))}
                        placeholder="تفاصيل التشغيل والمعالجة..."
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <span className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        أو ارفع صورة من جهازك (اختياري)
                      </span>
                      <label
                        htmlFor="proj-file"
                        className="flex items-center justify-between gap-3 bg-zinc-50 dark:bg-[#0B0D10] border border-zinc-300 dark:border-zinc-700 hover:border-orange-500 rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors"
                      >
                        <span className="text-zinc-500 dark:text-zinc-400 truncate">
                          {selectedFileName || 'لم يتم اختيار ملف'}
                        </span>
                        <span className="bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white text-xs font-semibold px-3 py-1 rounded shrink-0">
                          اختيار صورة
                        </span>
                      </label>
                      <input
                        id="proj-file"
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleImageFileChange}
                        className="sr-only"
                      />
                    </div>
                  </div>

                  {projErrorMsg && (
                    <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                      {projErrorMsg}
                    </p>
                  )}
                  {projStatusMsg && (
                    <p className="text-sm text-emerald-600 dark:text-emerald-400">{projStatusMsg}</p>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <label className="inline-flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newProj.featured}
                        onChange={(e) => setNewProj((p) => ({ ...p, featured: e.target.checked }))}
                        className="rounded border-zinc-400 dark:border-zinc-700 text-orange-600"
                      />
                      <span>تمييز المشروع</span>
                    </label>

                    <button
                      type="submit"
                      disabled={savingProject}
                      className="bg-orange-600 hover:bg-orange-500 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
                    >
                      {savingProject ? 'جاري النشر...' : 'حفظ ونشر المشروع'}
                    </button>
                  </div>
                </form>
              </section>

              <section className="bg-white dark:bg-[#12151B] border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white">المشاريع المنشورة</h2>
                  <div className="w-full sm:w-64">
                    <label htmlFor="admin-proj-search" className="sr-only">
                      بحث في المشاريع
                    </label>
                    <input
                      id="admin-proj-search"
                      type="search"
                      value={projectSearch}
                      onChange={(e) => setProjectSearch(e.target.value)}
                      placeholder="تصفية المشاريع..."
                      className={inputClass}
                    />
                  </div>
                </div>

                {filteredProjects.length === 0 ? (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 py-8 text-center">
                    لا توجد مشاريع مطابقة.
                  </p>
                ) : (
                  <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {filteredProjects.map((proj) => (
                      <div
                        key={proj.id}
                        className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={proj.imageUrl}
                            alt={proj.title}
                            referrerPolicy="no-referrer"
                            className="w-16 h-12 rounded-lg object-cover border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 shrink-0"
                          />
                          <div>
                            <div className="font-semibold text-zinc-900 dark:text-white text-sm">
                              {proj.title}
                            </div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 flex flex-wrap gap-2">
                              <span>{proj.categoryLabel}</span>
                              <span aria-hidden="true">·</span>
                              <span>{proj.material}</span>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono tabular-nums">{proj.tolerance}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleToggleFeatured(proj)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                              proj.featured
                                ? 'border-orange-600/40 dark:border-orange-500/50 bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-300'
                                : 'border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-500'
                            }`}
                          >
                            {proj.featured ? 'مميز' : 'تمييز'}
                          </button>

                          {confirmDeleteProjId === proj.id ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleDeleteProject(proj.id)}
                                className="px-2.5 py-1.5 text-xs font-medium bg-red-600 text-white rounded-lg cursor-pointer"
                              >
                                تأكيد
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteProjId(null)}
                                className="px-2.5 py-1.5 text-xs font-medium border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg cursor-pointer"
                              >
                                إلغاء
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              aria-label={`حذف ${proj.title}`}
                              onClick={() => setConfirmDeleteProjId(proj.id)}
                              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" aria-hidden="true" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          ) : activeTab === 'inquiries' ? (
            <section className="bg-white dark:bg-[#12151B] border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">طلبات المقايسات الواردة</h2>

                <div className="flex flex-wrap items-center gap-1.5 bg-zinc-100 dark:bg-[#0B0D10] p-1 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  {(['all', 'new', 'reviewing', 'quoted', 'completed'] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setInquiryFilter(status)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                        inquiryFilter === status
                          ? 'bg-orange-600 text-white'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                      }`}
                    >
                      {status === 'all' ? 'الكل' : INQUIRY_STATUS_LABELS[status]}
                    </button>
                  ))}
                </div>
              </div>

              {filteredInquiries.length === 0 ? (
                <div className="py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  لا توجد طلبات مقايسة ضمن هذا التصنيف حالياً.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-right border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400">
                        <th className="py-3 px-3 font-medium">المرجع</th>
                        <th className="py-3 px-3 font-medium">العميل</th>
                        <th className="py-3 px-3 font-medium">الموبايل</th>
                        <th className="py-3 px-3 font-medium">الخدمة والخامة</th>
                        <th className="py-3 px-3 font-medium">الكمية</th>
                        <th className="py-3 px-3 font-medium">التفاصيل</th>
                        <th className="py-3 px-3 font-medium">الحالة</th>
                        <th className="py-3 px-3 font-medium">إجراء</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                      {filteredInquiries.map((inq) => (
                        <tr key={inq.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
                          <td className="py-3 px-3 font-mono text-xs text-orange-600 dark:text-orange-400 tabular-nums whitespace-nowrap">
                            {inq.id}
                          </td>
                          <td className="py-3 px-3 font-medium text-zinc-900 dark:text-white whitespace-nowrap">
                            <div>{inq.customerName}</div>
                            {inq.company && (
                              <div className="text-xs text-zinc-500 dark:text-zinc-400">{inq.company}</div>
                            )}
                          </td>
                          <td className="py-3 px-3 font-mono text-xs text-zinc-700 dark:text-zinc-300 tabular-nums whitespace-nowrap" dir="ltr">
                            {inq.phone}
                          </td>
                          <td className="py-3 px-3 text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                            <div>{inq.serviceType}</div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400">{inq.material}</div>
                          </td>
                          <td className="py-3 px-3 font-mono tabular-nums text-zinc-900 dark:text-white">
                            {inq.quantity}
                          </td>
                          <td className="py-3 px-3 text-xs text-zinc-600 dark:text-zinc-300 max-w-xs">
                            {inq.details}
                          </td>
                          <td className="py-3 px-3">
                            <select
                              aria-label={`حالة الطلب ${inq.id}`}
                              value={inq.status}
                              onChange={(e) =>
                                handleInquiryStatusChange(inq.id, e.target.value as InquiryStatus)
                              }
                              className="bg-zinc-50 dark:bg-[#0B0D10] border border-zinc-300 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-orange-500"
                            >
                              {Object.entries(INQUIRY_STATUS_LABELS).map(([key, label]) => (
                                <option key={key} value={key}>
                                  {label}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3 px-3">
                            {confirmDeleteInqId === inq.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteInquiry(inq.id)}
                                  className="px-2 py-1 text-xs bg-red-600 text-white rounded cursor-pointer"
                                >
                                  حذف
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteInqId(null)}
                                  className="px-2 py-1 text-xs border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded cursor-pointer"
                                >
                                  إلغاء
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                aria-label={`حذف الطلب ${inq.id}`}
                                onClick={() => setConfirmDeleteInqId(inq.id)}
                                className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-lg cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" aria-hidden="true" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ) : (
            <section className="bg-white dark:bg-[#12151B] border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 max-w-3xl">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-5">
                إعدادات الورشة والواجهة الرئيسية
              </h2>
              {settings && (
                <form onSubmit={handleSaveSettings} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="set-siteName" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        اسم الورشة
                      </label>
                      <input
                        id="set-siteName"
                        type="text"
                        value={settings.siteName}
                        onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="set-heroSubtitle" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        العنوان الفرعي
                      </label>
                      <input
                        id="set-heroSubtitle"
                        type="text"
                        value={settings.heroSubtitle}
                        onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="set-heroTitle" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                      العنوان الرئيسي (Hero)
                    </label>
                    <input
                      id="set-heroTitle"
                      type="text"
                      value={settings.heroTitle}
                      onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="set-heroDesc" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                      الوصف التعريفي
                    </label>
                    <textarea
                      id="set-heroDesc"
                      rows={3}
                      value={settings.heroDesc}
                      onChange={(e) => setSettings({ ...settings, heroDesc: e.target.value })}
                      className={inputClass}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="set-phone" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        رقم الهاتف
                      </label>
                      <input
                        id="set-phone"
                        type="text"
                        dir="ltr"
                        value={settings.phone}
                        onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                        className={`${inputClass} text-left tabular-nums`}
                      />
                    </div>
                    <div>
                      <label htmlFor="set-whatsapp" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        رقم الواتساب (دولي بدون +)
                      </label>
                      <input
                        id="set-whatsapp"
                        type="text"
                        dir="ltr"
                        value={settings.whatsapp}
                        onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                        className={`${inputClass} text-left tabular-nums`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="set-address" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        العنوان
                      </label>
                      <input
                        id="set-address"
                        type="text"
                        value={settings.address}
                        onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="set-hours" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        مواعيد العمل
                      </label>
                      <input
                        id="set-hours"
                        type="text"
                        value={settings.workingHours}
                        onChange={(e) => setSettings({ ...settings, workingHours: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="set-footer" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                      نص حقوق النشر (Footer)
                    </label>
                    <input
                      id="set-footer"
                      type="text"
                      value={settings.footerText}
                      onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
                      className={inputClass}
                    />
                  </div>

                  {settingsError && (
                    <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                      {settingsError}
                    </p>
                  )}
                  {settingsMsg && (
                    <p className="text-sm text-emerald-600 dark:text-emerald-400">{settingsMsg}</p>
                  )}

                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="bg-orange-600 hover:bg-orange-500 disabled:opacity-60 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors cursor-pointer"
                  >
                    {savingSettings ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
                  </button>
                </form>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
