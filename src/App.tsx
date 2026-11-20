import { useCallback, useEffect, useState } from 'react';
import { fetchProjects, fetchSettings } from './api/client';
import { AdminPage } from './components/AdminPage';
import { CapabilitiesBento } from './components/CapabilitiesBento';
import { Footer } from './components/Footer';
import { HeroSection } from './components/HeroSection';
import { Navbar } from './components/Navbar';
import { ProjectDetailModal } from './components/ProjectDetailModal';
import { QuoteSection } from './components/QuoteSection';
import { WorksGallery } from './components/WorksGallery';
import { DEFAULT_SETTINGS, INITIAL_PROJECTS } from './shared/seedData';
import type { Project, WorkshopSettings } from './shared/types';
import {
  resolveInitialTheme,
  toggleThemeMode,
  type ThemeMode,
} from './shared/workshopLogic';

const THEME_STORAGE_KEY = 'workshop_theme';

function isAdminPath(pathname: string): boolean {
  return pathname === '/admin' || pathname === '/admin.html' || pathname.startsWith('/admin/');
}

function getInitialTheme(): ThemeMode {
  try {
    return resolveInitialTheme(window.localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return 'dark';
  }
}

export function App() {
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
  const [routeIsAdmin, setRouteIsAdmin] = useState(() =>
    isAdminPath(window.location.pathname)
  );
  const [settings, setSettings] = useState<WorkshopSettings>(DEFAULT_SETTINGS);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [prefilledQuote, setPrefilledQuote] = useState<{
    serviceType: string;
    material: string;
    title: string;
  } | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage errors
    }
  }, [theme]);

  const handleToggleTheme = useCallback(() => {
    setTheme((prev) => toggleThemeMode(prev));
  }, []);

  const loadPublicData = useCallback(async () => {
    setLoadingProjects(true);
    try {
      const [fetchedSettings, fetchedProjects] = await Promise.all([
        fetchSettings(),
        fetchProjects(),
      ]);
      setSettings(fetchedSettings);
      setProjects(fetchedProjects);
    } catch {
      // Keep fallback seed data if network request fails
    } finally {
      setLoadingProjects(false);
    }
  }, []);

  useEffect(() => {
    loadPublicData();
  }, [loadPublicData]);

  useEffect(() => {
    const onPopState = () => {
      setRouteIsAdmin(isAdminPath(window.location.pathname));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigateTo = (path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setRouteIsAdmin(isAdminPath(path));
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const scrollToQuote = () => {
    const el = document.getElementById('quote');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleRequestSimilar = (project: Project) => {
    setPrefilledQuote({
      serviceType: project.categoryLabel,
      material: project.material,
      title: project.title,
    });
    setSelectedProject(null);
    setTimeout(scrollToQuote, 60);
  };

  if (routeIsAdmin) {
    return (
      <AdminPage
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onNavigateHome={() => navigateTo('/')}
        onDataUpdated={loadPublicData}
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0B0D10] text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      <Navbar siteName={settings.siteName} onRequestQuote={scrollToQuote} />
      <main>
        <HeroSection
          settings={settings}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onRequestQuote={scrollToQuote}
        />
        <CapabilitiesBento />
        <WorksGallery
          projects={projects}
          loading={loadingProjects}
          onSelectProject={setSelectedProject}
        />
        <QuoteSection settings={settings} prefilledProject={prefilledQuote} />
      </main>
      <Footer
        settings={settings}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onNavigateAdmin={() => navigateTo('/admin')}
      />
      <ProjectDetailModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onRequestSimilar={handleRequestSimilar}
      />
    </div>
  );
}

export default App;
