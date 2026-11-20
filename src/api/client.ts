import type {
  InquiryStatus,
  Project,
  QuoteInput,
  QuoteInquiry,
  WorkshopSettings,
} from '../shared/types';

const TOKEN_KEY = 'workshop_admin_token';

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

async function requestJson<T>(
  url: string,
  options: RequestInit = {},
  withAuth = false
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (withAuth) {
    const token = getStoredToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(url, { ...options, headers });
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

export function fetchSettings(): Promise<WorkshopSettings> {
  return requestJson<WorkshopSettings>('/api/settings');
}

export function updateSettings(settings: Partial<WorkshopSettings>): Promise<WorkshopSettings> {
  return requestJson<WorkshopSettings>(
    '/api/settings',
    { method: 'PUT', body: JSON.stringify(settings) },
    true
  );
}

export function fetchProjects(): Promise<Project[]> {
  return requestJson<Project[]>('/api/projects');
}

export function createProject(payload: {
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
  return requestJson<Project>(
    '/api/projects',
    { method: 'POST', body: JSON.stringify(payload) },
    true
  );
}

export function updateProject(id: string, patch: Partial<Project>): Promise<Project> {
  return requestJson<Project>(
    `/api/projects/${encodeURIComponent(id)}`,
    { method: 'PATCH', body: JSON.stringify(patch) },
    true
  );
}

export function deleteProject(id: string): Promise<{ deleted: boolean }> {
  return requestJson<{ deleted: boolean }>(
    `/api/projects/${encodeURIComponent(id)}`,
    { method: 'DELETE' },
    true
  );
}

export function submitQuoteInquiry(input: QuoteInput): Promise<QuoteInquiry> {
  return requestJson<QuoteInquiry>('/api/inquiries', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function fetchInquiries(): Promise<QuoteInquiry[]> {
  return requestJson<QuoteInquiry[]>('/api/inquiries', {}, true);
}

export function updateInquiryStatus(
  id: string,
  status: InquiryStatus
): Promise<QuoteInquiry> {
  return requestJson<QuoteInquiry>(
    `/api/inquiries/${encodeURIComponent(id)}`,
    { method: 'PATCH', body: JSON.stringify({ status }) },
    true
  );
}

export function deleteInquiry(id: string): Promise<{ deleted: boolean }> {
  return requestJson<{ deleted: boolean }>(
    `/api/inquiries/${encodeURIComponent(id)}`,
    { method: 'DELETE' },
    true
  );
}

export async function loginAdmin(
  phone: string,
  password: string
): Promise<{ token: string; phone: string }> {
  const result = await requestJson<{ token: string; phone: string }>(
    '/api/admin/login',
    { method: 'POST', body: JSON.stringify({ phone, password }) }
  );
  setStoredToken(result.token);
  return result;
}

export async function checkAdminSession(): Promise<boolean> {
  const token = getStoredToken();
  if (!token) return false;
  const res = await requestJson<{ authenticated: boolean }>('/api/admin/session', {}, true);
  if (!res.authenticated) setStoredToken(null);
  return res.authenticated;
}

export async function logoutAdmin(): Promise<void> {
  await requestJson<{ ok: boolean }>('/api/admin/logout', { method: 'POST' }, true).catch(
    () => undefined
  );
  setStoredToken(null);
}
