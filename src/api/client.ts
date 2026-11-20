import {
  DEFAULT_SETTINGS,
  INITIAL_INQUIRIES,
  INITIAL_PROJECTS,
} from '../shared/seedData';
import type {
  InquiryStatus,
  Project,
  ProjectCategory,
  QuoteInput,
  QuoteInquiry,
  WorkshopSettings,
} from '../shared/types';
import {
  CATEGORY_LABELS,
  normalizePhoneDigits,
  validateQuoteInput,
} from '../shared/workshopLogic';

const TOKEN_KEY = 'workshop_admin_token';
const STATIC_SETTINGS_KEY = 'workshop_static_settings';
const STATIC_PROJECTS_KEY = 'workshop_static_projects';
const STATIC_INQUIRIES_KEY = 'workshop_static_inquiries';
const STATIC_TOKEN = 'static-local-admin-token';

export function getStoredToken(): string | null {
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) {
      window.localStorage.setItem(TOKEN_KEY, token);
    } else {
      window.localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // Ignore storage errors in restricted environments
  }
}

function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeLocal<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage errors
  }
}

let staticHostDetected = false;

export function isStaticHostMode(): boolean {
  if (staticHostDetected) return true;
  try {
    return (
      window.location.hostname.endsWith('github.io') ||
      window.location.protocol === 'file:'
    );
  } catch {
    return false;
  }
}

class StaticBackendUnavailableError extends Error {}

async function requestJson<T>(
  url: string,
  options: RequestInit = {},
  withAuth = false
): Promise<T> {
  if (isStaticHostMode()) {
    throw new StaticBackendUnavailableError('Static host mode');
  }

  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (withAuth) {
    const token = getStoredToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  let res: Response;
  try {
    res = await fetch(url, { ...options, headers });
  } catch {
    staticHostDetected = true;
    throw new StaticBackendUnavailableError('Static host mode');
  }

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    staticHostDetected = true;
    throw new StaticBackendUnavailableError('Static host mode');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data?.error || 'حدث خطأ غير متوقع في الاتصال بالخادم.') as Error & {
      fieldErrors?: Record<string, string>;
      status?: number;
    };
    error.fieldErrors = data?.errors;
    error.status = res.status;
    throw error;
  }
  return data as T;
}

export async function fetchSettings(): Promise<WorkshopSettings> {
  try {
    return await requestJson<WorkshopSettings>('./api/settings');
  } catch (err) {
    if (err instanceof StaticBackendUnavailableError) {
      return readLocal<WorkshopSettings>(STATIC_SETTINGS_KEY, DEFAULT_SETTINGS);
    }
    throw err;
  }
}

export async function updateSettings(
  settings: Partial<WorkshopSettings>
): Promise<WorkshopSettings> {
  try {
    return await requestJson<WorkshopSettings>(
      './api/settings',
      { method: 'PUT', body: JSON.stringify(settings) },
      true
    );
  } catch (err) {
    if (err instanceof StaticBackendUnavailableError) {
      const current = readLocal<WorkshopSettings>(STATIC_SETTINGS_KEY, DEFAULT_SETTINGS);
      const updated = { ...current, ...settings };
      writeLocal(STATIC_SETTINGS_KEY, updated);
      return updated;
    }
    throw err;
  }
}

export async function fetchProjects(): Promise<Project[]> {
  try {
    return await requestJson<Project[]>('./api/projects');
  } catch (err) {
    if (err instanceof StaticBackendUnavailableError) {
      return readLocal<Project[]>(STATIC_PROJECTS_KEY, INITIAL_PROJECTS);
    }
    throw err;
  }
}

export async function createProject(payload: {
  title: string;
  category: string;
  material: string;
  tolerance: string;
  dimensions: string;
  year: string;
  sector: string;
  description: string;
  imageDataUrl?: string;
  imageUrl?: string;
  featured: boolean;
}): Promise<Project> {
  try {
    return await requestJson<Project>(
      './api/projects',
      { method: 'POST', body: JSON.stringify(payload) },
      true
    );
  } catch (err) {
    if (err instanceof StaticBackendUnavailableError) {
      const list = readLocal<Project[]>(STATIC_PROJECTS_KEY, INITIAL_PROJECTS);
      const validCat: ProjectCategory =
        payload.category === 'cnc' ||
        payload.category === 'gears' ||
        payload.category === 'fabrication' ||
        payload.category === 'spare_parts'
          ? payload.category
          : 'cnc';
      const created: Project = {
        id: `proj-${Date.now()}`,
        title: payload.title.trim(),
        category: validCat,
        categoryLabel: CATEGORY_LABELS[validCat],
        material: payload.material.trim() || 'صلب كربوني',
        tolerance: payload.tolerance.trim() || '±0.020 مم',
        dimensions: payload.dimensions.trim() || 'حسب الطلب',
        year: payload.year.trim() || '2026',
        sector: payload.sector.trim() || 'التصنيع الصناعي',
        description: payload.description.trim() || 'قطعة معدنية مصنعة بدقة عالية.',
        imageUrl: payload.imageDataUrl || payload.imageUrl || './media/work_cnc_flange_1795175063002.jpg',
        featured: Boolean(payload.featured),
        createdAt: new Date().toISOString(),
      };
      const next = [created, ...list];
      writeLocal(STATIC_PROJECTS_KEY, next);
      return created;
    }
    throw err;
  }
}

export async function updateProject(id: string, patch: Partial<Project>): Promise<Project> {
  try {
    return await requestJson<Project>(
      `./api/projects/${encodeURIComponent(id)}`,
      { method: 'PATCH', body: JSON.stringify(patch) },
      true
    );
  } catch (err) {
    if (err instanceof StaticBackendUnavailableError) {
      const list = readLocal<Project[]>(STATIC_PROJECTS_KEY, INITIAL_PROJECTS);
      const next = list.map((p) => (p.id === id ? { ...p, ...patch } : p));
      writeLocal(STATIC_PROJECTS_KEY, next);
      const found = next.find((p) => p.id === id);
      if (!found) throw new Error('المشروع غير موجود.');
      return found;
    }
    throw err;
  }
}

export async function deleteProject(id: string): Promise<{ deleted: boolean }> {
  try {
    return await requestJson<{ deleted: boolean }>(
      `./api/projects/${encodeURIComponent(id)}`,
      { method: 'DELETE' },
      true
    );
  } catch (err) {
    if (err instanceof StaticBackendUnavailableError) {
      const list = readLocal<Project[]>(STATIC_PROJECTS_KEY, INITIAL_PROJECTS);
      writeLocal(
        STATIC_PROJECTS_KEY,
        list.filter((p) => p.id !== id)
      );
      return { deleted: true };
    }
    throw err;
  }
}

export async function submitQuoteInquiry(input: QuoteInput): Promise<QuoteInquiry> {
  try {
    return await requestJson<QuoteInquiry>('./api/inquiries', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  } catch (err) {
    if (err instanceof StaticBackendUnavailableError) {
      const validation = validateQuoteInput(input);
      if (!validation.valid) {
        const valErr = new Error('يرجى مراجعة الحقول المطلوبة.') as Error & {
          fieldErrors?: Record<string, string>;
        };
        valErr.fieldErrors = validation.errors;
        throw valErr;
      }
      const list = readLocal<QuoteInquiry[]>(STATIC_INQUIRIES_KEY, INITIAL_INQUIRIES);
      const inquiry: QuoteInquiry = {
        id: `INQ-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName: input.customerName.trim(),
        phone: normalizePhoneDigits(input.phone),
        company: input.company?.trim() || undefined,
        serviceType: input.serviceType.trim(),
        material: input.material.trim(),
        quantity: Math.round(Number(input.quantity)),
        details: input.details.trim(),
        status: 'new',
        createdAt: new Date().toISOString(),
      };
      writeLocal(STATIC_INQUIRIES_KEY, [inquiry, ...list]);
      return inquiry;
    }
    throw err;
  }
}

export async function fetchInquiries(): Promise<QuoteInquiry[]> {
  try {
    return await requestJson<QuoteInquiry[]>('./api/inquiries', {}, true);
  } catch (err) {
    if (err instanceof StaticBackendUnavailableError) {
      return readLocal<QuoteInquiry[]>(STATIC_INQUIRIES_KEY, INITIAL_INQUIRIES);
    }
    throw err;
  }
}

export async function updateInquiryStatus(
  id: string,
  status: InquiryStatus
): Promise<QuoteInquiry> {
  try {
    return await requestJson<QuoteInquiry>(
      `./api/inquiries/${encodeURIComponent(id)}`,
      { method: 'PATCH', body: JSON.stringify({ status }) },
      true
    );
  } catch (err) {
    if (err instanceof StaticBackendUnavailableError) {
      const list = readLocal<QuoteInquiry[]>(STATIC_INQUIRIES_KEY, INITIAL_INQUIRIES);
      const next = list.map((i) => (i.id === id ? { ...i, status } : i));
      writeLocal(STATIC_INQUIRIES_KEY, next);
      const found = next.find((i) => i.id === id);
      if (!found) throw new Error('الطلب غير موجود.');
      return found;
    }
    throw err;
  }
}

export async function deleteInquiry(id: string): Promise<{ deleted: boolean }> {
  try {
    return await requestJson<{ deleted: boolean }>(
      `./api/inquiries/${encodeURIComponent(id)}`,
      { method: 'DELETE' },
      true
    );
  } catch (err) {
    if (err instanceof StaticBackendUnavailableError) {
      const list = readLocal<QuoteInquiry[]>(STATIC_INQUIRIES_KEY, INITIAL_INQUIRIES);
      writeLocal(
        STATIC_INQUIRIES_KEY,
        list.filter((i) => i.id !== id)
      );
      return { deleted: true };
    }
    throw err;
  }
}

export async function loginAdmin(
  phone: string,
  password: string
): Promise<{ token: string; phone: string }> {
  try {
    const result = await requestJson<{ token: string; phone: string }>(
      './api/admin/login',
      { method: 'POST', body: JSON.stringify({ phone, password }) }
    );
    setStoredToken(result.token);
    return result;
  } catch (err) {
    if (err instanceof StaticBackendUnavailableError) {
      if (normalizePhoneDigits(phone) === '01126346329' && password === 'admin123') {
        setStoredToken(STATIC_TOKEN);
        return { token: STATIC_TOKEN, phone: '01126346329' };
      }
      throw new Error('رقم الموبايل أو كلمة المرور غير صحيحة.');
    }
    throw err;
  }
}

export async function checkAdminSession(): Promise<boolean> {
  const token = getStoredToken();
  if (!token) return false;
  try {
    const res = await requestJson<{ authenticated: boolean }>('./api/admin/session', {}, true);
    if (!res.authenticated) setStoredToken(null);
    return res.authenticated;
  } catch (err) {
    if (err instanceof StaticBackendUnavailableError) {
      return token === STATIC_TOKEN;
    }
    setStoredToken(null);
    return false;
  }
}

export async function logoutAdmin(): Promise<void> {
  await requestJson<{ ok: boolean }>('./api/admin/logout', { method: 'POST' }, true).catch(
    () => undefined
  );
  setStoredToken(null);
}
