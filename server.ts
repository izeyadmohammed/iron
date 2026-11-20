import express from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  DEFAULT_SETTINGS,
  INITIAL_INQUIRIES,
  INITIAL_PROJECTS,
} from './src/shared/seedData';
import {
  CATEGORY_LABELS,
  normalizePhoneDigits,
  validateQuoteInput,
} from './src/shared/workshopLogic';
import type {
  InquiryStatus,
  Project,
  ProjectCategory,
  QuoteInquiry,
  WorkshopSettings,
} from './src/shared/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '.data');
const DATA_FILE = path.join(DATA_DIR, 'workshop.json');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

interface StoreState {
  settings: WorkshopSettings;
  projects: Project[];
  inquiries: QuoteInquiry[];
}

function loadStore(): StoreState {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<StoreState>;
      return {
        settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) },
        projects: Array.isArray(parsed.projects) ? parsed.projects : [...INITIAL_PROJECTS],
        inquiries: Array.isArray(parsed.inquiries) ? parsed.inquiries : [...INITIAL_INQUIRIES],
      };
    }
  } catch (err) {
    console.warn('[workshop-store] Failed to read .data/workshop.json, using seed data:', err);
  }
  return {
    settings: { ...DEFAULT_SETTINGS },
    projects: [...INITIAL_PROJECTS],
    inquiries: [...INITIAL_INQUIRIES],
  };
}

function saveStore(state: StoreState): void {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[workshop-store] Could not persist state to disk:', err);
  }
}

function saveBase64Image(dataUrl: string): string | null {
  const match = /^data:image\/(png|jpeg|jpg|webp);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!match) return null;
  const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
  const buffer = Buffer.from(match[2], 'base64');
  if (buffer.byteLength > 5 * 1024 * 1024) {
    throw new Error('حجم الصورة يتجاوز الحد الأقصى المسموح (5 ميجابايت).');
  }
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  const filename = `proj-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
  fs.writeFileSync(path.join(UPLOADS_DIR, filename), buffer);
  return `/uploads/${filename}`;
}

const store = loadStore();
const activeTokens = new Set<string>();
const ADMIN_PHONE = process.env.ADMIN_PHONE || '01126346329';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

function extractToken(req: express.Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  return null;
}

function requireAdmin(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void {
  const token = extractToken(req);
  if (!token || !activeTokens.has(token)) {
    res.status(401).json({ error: 'يجب تسجيل الدخول كمسؤول أولاً.' });
    return;
  }
  next();
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const HOST = '0.0.0.0';

  app.use(express.json({ limit: '8mb' }));
  app.use('/media', express.static(path.join(__dirname, 'src', 'assets', 'images')));
  app.use('/uploads', express.static(UPLOADS_DIR));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.get('/api/settings', (_req, res) => {
    res.json(store.settings);
  });

  app.put('/api/settings', requireAdmin, (req, res) => {
    const body = req.body as Partial<WorkshopSettings>;
    store.settings = {
      ...store.settings,
      siteName: typeof body.siteName === 'string' && body.siteName.trim() ? body.siteName.trim() : store.settings.siteName,
      heroTitle: typeof body.heroTitle === 'string' && body.heroTitle.trim() ? body.heroTitle.trim() : store.settings.heroTitle,
      heroSubtitle: typeof body.heroSubtitle === 'string' ? body.heroSubtitle.trim() : store.settings.heroSubtitle,
      heroDesc: typeof body.heroDesc === 'string' && body.heroDesc.trim() ? body.heroDesc.trim() : store.settings.heroDesc,
      phone: typeof body.phone === 'string' && body.phone.trim() ? body.phone.trim() : store.settings.phone,
      whatsapp: typeof body.whatsapp === 'string' && body.whatsapp.trim() ? body.whatsapp.trim() : store.settings.whatsapp,
      address: typeof body.address === 'string' ? body.address.trim() : store.settings.address,
      workingHours: typeof body.workingHours === 'string' ? body.workingHours.trim() : store.settings.workingHours,
      footerText: typeof body.footerText === 'string' && body.footerText.trim() ? body.footerText.trim() : store.settings.footerText,
    };
    saveStore(store);
    res.json(store.settings);
  });

  app.get('/api/projects', (_req, res) => {
    const sorted = [...store.projects].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    res.json(sorted);
  });

  app.post('/api/projects', requireAdmin, (req, res) => {
    try {
      const {
        title,
        category,
        material,
        tolerance,
        dimensions,
        year,
        sector,
        description,
        imageDataUrl,
        imageUrl,
        featured,
      } = req.body as Record<string, unknown>;

      if (typeof title !== 'string' || title.trim().length < 2) {
        res.status(400).json({ error: 'يرجى إدخال اسم المشروع.' });
        return;
      }

      const validCategory: ProjectCategory =
        category === 'cnc' ||
        category === 'gears' ||
        category === 'fabrication' ||
        category === 'spare_parts'
          ? category
          : 'cnc';

      let resolvedImageUrl = '/media/work_cnc_flange_1795175063002.jpg';
      if (typeof imageDataUrl === 'string' && imageDataUrl.startsWith('data:image/')) {
        const savedPath = saveBase64Image(imageDataUrl);
        if (savedPath) resolvedImageUrl = savedPath;
      } else if (typeof imageUrl === 'string' && imageUrl.trim()) {
        resolvedImageUrl = imageUrl.trim();
      }

      const newProject: Project = {
        id: `proj-${Date.now()}`,
        title: title.trim(),
        category: validCategory,
        categoryLabel: CATEGORY_LABELS[validCategory],
        material: typeof material === 'string' && material.trim() ? material.trim() : 'صلب كربوني',
        tolerance: typeof tolerance === 'string' && tolerance.trim() ? tolerance.trim() : '±0.020 مم',
        dimensions: typeof dimensions === 'string' && dimensions.trim() ? dimensions.trim() : 'حسب الطلب',
        year: typeof year === 'string' && year.trim() ? year.trim() : '2026',
        sector: typeof sector === 'string' && sector.trim() ? sector.trim() : 'التصنيع الصناعي',
        description:
          typeof description === 'string' && description.trim()
            ? description.trim()
            : 'قطعة معدنية مصنعة بدقة عالية وفق الرسومات الهندسية.',
        imageUrl: resolvedImageUrl,
        featured: Boolean(featured),
        createdAt: new Date().toISOString(),
      };

      store.projects.unshift(newProject);
      saveStore(store);
      res.status(201).json(newProject);
    } catch (err) {
      res.status(400).json({
        error: err instanceof Error ? err.message : 'تعذر حفظ المشروع.',
      });
    }
  });

  app.patch('/api/projects/:id', requireAdmin, (req, res) => {
    const project = store.projects.find((p) => p.id === req.params.id);
    if (!project) {
      res.status(404).json({ error: 'المشروع غير موجود.' });
      return;
    }
    const body = req.body as Partial<Project>;
    if (typeof body.featured === 'boolean') project.featured = body.featured;
    if (typeof body.title === 'string' && body.title.trim()) project.title = body.title.trim();
    if (typeof body.material === 'string' && body.material.trim()) project.material = body.material.trim();
    if (typeof body.tolerance === 'string' && body.tolerance.trim()) project.tolerance = body.tolerance.trim();
    if (typeof body.description === 'string' && body.description.trim()) project.description = body.description.trim();
    saveStore(store);
    res.json(project);
  });

  app.delete('/api/projects/:id', requireAdmin, (req, res) => {
    const idx = store.projects.findIndex((p) => p.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'المشروع غير موجود.' });
      return;
    }
    store.projects.splice(idx, 1);
    saveStore(store);
    res.json({ deleted: true });
  });

  app.get('/api/inquiries', requireAdmin, (_req, res) => {
    const sorted = [...store.inquiries].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    res.json(sorted);
  });

  app.post('/api/inquiries', (req, res) => {
    const body = req.body as Record<string, unknown>;
    const input = {
      customerName: String(body.customerName ?? ''),
      phone: String(body.phone ?? ''),
      company: body.company ? String(body.company) : '',
      serviceType: String(body.serviceType ?? ''),
      material: String(body.material ?? ''),
      quantity: Number(body.quantity ?? 1),
      details: String(body.details ?? ''),
    };
    const validation = validateQuoteInput(input);
    if (!validation.valid) {
      res.status(400).json({ error: 'يرجى مراجعة الحقول المطلوبة.', errors: validation.errors });
      return;
    }

    const inquiry: QuoteInquiry = {
      id: `INQ-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: input.customerName.trim(),
      phone: normalizePhoneDigits(input.phone),
      company: input.company.trim() || undefined,
      serviceType: input.serviceType.trim(),
      material: input.material.trim(),
      quantity: Math.round(input.quantity),
      details: input.details.trim(),
      status: 'new',
      createdAt: new Date().toISOString(),
    };

    store.inquiries.unshift(inquiry);
    saveStore(store);
    res.status(201).json(inquiry);
  });

  app.patch('/api/inquiries/:id', requireAdmin, (req, res) => {
    const inquiry = store.inquiries.find((i) => i.id === req.params.id);
    if (!inquiry) {
      res.status(404).json({ error: 'الطلب غير موجود.' });
      return;
    }
    const status = req.body?.status as InquiryStatus;
    if (
      status === 'new' ||
      status === 'reviewing' ||
      status === 'quoted' ||
      status === 'completed'
    ) {
      inquiry.status = status;
      saveStore(store);
      res.json(inquiry);
      return;
    }
    res.status(400).json({ error: 'حالة غير صالحة.' });
  });

  app.delete('/api/inquiries/:id', requireAdmin, (req, res) => {
    const idx = store.inquiries.findIndex((i) => i.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'الطلب غير موجود.' });
      return;
    }
    store.inquiries.splice(idx, 1);
    saveStore(store);
    res.json({ deleted: true });
  });

  app.post('/api/admin/login', (req, res) => {
    const phone = normalizePhoneDigits(String(req.body?.phone ?? '').trim());
    const password = String(req.body?.password ?? '');
    if (phone !== normalizePhoneDigits(ADMIN_PHONE) || password !== ADMIN_PASSWORD) {
      res.status(401).json({ error: 'رقم الموبايل أو كلمة المرور غير صحيحة.' });
      return;
    }
    const token = crypto.randomBytes(24).toString('hex');
    activeTokens.add(token);
    res.json({ token, phone });
  });

  app.get('/api/admin/session', (req, res) => {
    const token = extractToken(req);
    res.json({ authenticated: Boolean(token && activeTokens.has(token)) });
  });

  app.post('/api/admin/logout', (req, res) => {
    const token = extractToken(req);
    if (token) activeTokens.delete(token);
    res.json({ ok: true });
  });

  if (process.env.NODE_ENV === 'production') {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, HOST, () => {
    console.log(`Workshop server listening on http://${HOST}:${PORT}`);
  });
}

startServer();
