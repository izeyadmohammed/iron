export type ProjectCategory =
  | 'cnc'
  | 'gears'
  | 'fabrication'
  | 'spare_parts';

export interface Project {
  id: string;
  title: string;
  category: ProjectCategory;
  categoryLabel: string;
  material: string;
  tolerance: string;
  dimensions: string;
  year: string;
  sector: string;
  description: string;
  imageUrl: string;
  featured: boolean;
  createdAt: string;
}

export interface WorkshopSettings {
  siteName: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDesc: string;
  phone: string;
  whatsapp: string;
  address: string;
  workingHours: string;
  footerText: string;
}

export type InquiryStatus = 'new' | 'reviewing' | 'quoted' | 'completed';

export interface QuoteInquiry {
  id: string;
  customerName: string;
  phone: string;
  company?: string;
  serviceType: string;
  material: string;
  quantity: number;
  details: string;
  status: InquiryStatus;
  createdAt: string;
}

export interface QuoteInput {
  customerName: string;
  phone: string;
  company?: string;
  serviceType: string;
  material: string;
  quantity: number | string;
  details: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof QuoteInput, string>>;
}

export interface DashboardMetrics {
  totalProjects: number;
  featuredProjects: number;
  totalInquiries: number;
  newInquiries: number;
  quotedInquiries: number;
}
