import { lazy } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Table,
  BookOpen,
  Tag,
  Smile,
  Settings,
  MessageSquare,
  Search,
  Stethoscope,
  Image,
  Sparkles,
  CreditCard,
  Zap,
  Inbox,
  Blocks,
  Calculator,
  BarChart3,
} from 'lucide-react';

/**
 * The admin section registry — the ONE list of admin screens.
 *
 * It drives: the section id type (`AdminSectionId`), the side-nav groups, the
 * header search, the screen switch in AdminDashboard, and the admin entries in
 * App.tsx's route allow-list (`ADMIN_ROUTE_PATHS`). Add a section here and it
 * is routable, searchable and (unless `hidden`) in the nav.
 *
 * Every screen is lazy: only the one the admin opens is downloaded.
 */

/** Props every section screen receives from the shell. */
export interface AdminSectionProps {
  onNavigate: (path: string) => void;
}

export type AdminSectionGroup = 'overview' | 'content' | 'configuration' | 'system';

/** Nav heading and the shorter label the search dropdown shows. */
export const ADMIN_SECTION_GROUPS: Record<AdminSectionGroup, { title: string; searchLabel: string }> = {
  overview: { title: 'Overview', searchLabel: 'Overview' },
  content: { title: 'Content Management', searchLabel: 'Content' },
  configuration: { title: 'Configuration', searchLabel: 'Config' },
  system: { title: 'System & Logs', searchLabel: 'System' },
};

export interface AdminSectionDef {
  id: string;
  /** Nav label. */
  label: string;
  /** Search-result label when it differs from the nav label. */
  searchLabel?: string;
  icon: ComponentType<{ color?: string; size?: number | string; className?: string }>;
  group: AdminSectionGroup;
  /** Extra search terms (space separated). */
  keywords: string;
  path: string;
  component: LazyExoticComponent<ComponentType<AdminSectionProps>>;
  /** Routable but not in the nav or search (reached from inside another screen). */
  hidden?: boolean;
}

// `lazy` of a named export, typed as a section screen.
function screen<M>(load: () => Promise<M>, pick: (m: M) => ComponentType<any>) {
  return lazy(() => load().then((m) => ({ default: pick(m) as ComponentType<AdminSectionProps> })));
}

export const ADMIN_SECTIONS = [
  // ── Overview ──
  { id: 'dashboard', label: 'Reporting', icon: LayoutDashboard, group: 'overview', path: '/admin/reporting',
    keywords: 'home overview reporting analytics charts graphs stats metrics',
    component: screen(() => import('./ReportingHome'), (m) => m.ReportingHome) },
  { id: 'users', label: 'Users & Accounts', icon: Users, group: 'overview', path: '/admin/users',
    keywords: 'user account member role admin',
    component: screen(() => import('../users/AdminUserManager'), (m) => m.AdminUserManager) },

  // ── Content ──
  { id: 'equip', label: 'Equip Programs', icon: BookOpen, group: 'content', path: '/admin/equip',
    keywords: 'program course equip module day block',
    component: screen(() => import('../programs/EquipAdminDashboard'), (m) => m.EquipAdminDashboard) },
  { id: 'assessments', label: 'Assessments', icon: ClipboardList, group: 'content', path: '/admin/assessments',
    keywords: 'assessment quiz test survey',
    component: screen(() => import('../assessments/AdminAssessmentManager'), (m) => m.AdminAssessmentManager) },
  { id: 'resources', label: 'Resources', icon: Table, group: 'content', path: '/admin/resources',
    keywords: 'resource article blog library',
    component: screen(() => import('../resources/AdminResourceManager'), (m) => m.AdminResourceManager) },
  { id: 'checkin-builder', label: 'Check-in Builder', icon: Smile, group: 'content', path: '/admin/checkin-builder',
    keywords: 'checkin check-in template builder mood',
    component: screen(() => import('../check-ins/AdminCheckinTemplateBuilder'), (m) => m.AdminCheckinTemplateBuilder) },
  { id: 'consultants', label: 'Consultants', icon: Stethoscope, group: 'content', path: '/admin/consultants',
    keywords: 'consultant therapist professional doctor',
    component: screen(() => import('../consultations/AdminConsultationManager'), (m) => m.AdminConsultationManager) },
  { id: 'media', label: 'Media Library', icon: Image, group: 'content', path: '/admin/media',
    keywords: 'media image upload file photo',
    component: screen(() => import('../media/AdminMediaManager'), (m) => m.AdminMediaManager) },

  // ── Configuration ──
  { id: 'categories', label: 'Meta Manager', icon: Tag, group: 'configuration', path: '/admin/categories',
    keywords: 'category tag label metadata type mood',
    component: screen(() => import('../catalog/AdminCategoryManager'), (m) => m.AdminCategoryManager) },
  { id: 'checkin-scales', label: 'Check-in Scales', icon: Zap, group: 'configuration', path: '/admin/checkin-scales',
    keywords: 'scale checkin energy stress sleep',
    component: screen(() => import('../check-ins/AdminCheckinScalesManager'), (m) => m.AdminCheckinScalesManager) },
  { id: 'recommendations', label: 'Recommendation Rules', searchLabel: 'Recommendations', icon: Sparkles, group: 'configuration', path: '/admin/recommendations',
    keywords: 'recommendation rule engine severity rules',
    component: screen(() => import('../recommendations/RecommendationRulesManager'), (m) => m.RecommendationRulesManager) },
  { id: 'scoring-engine', label: 'Scoring Engine', icon: Calculator, group: 'configuration', path: '/admin/scoring-engine',
    keywords: 'scoring engine',
    component: screen(() => import('../assessments/AdminScoringEngine'), (m) => m.AdminScoringEngine) },
  { id: 'block-type-viewer', label: 'Block Types', icon: Blocks, group: 'configuration', path: '/admin/block-type-viewer',
    keywords: 'block type viewer',
    component: screen(() => import('../block-types/BlockTypeViewer'), (m) => m.AdminBlockTypeViewer) },
  { id: 'block-gallery', label: 'Block Gallery', icon: Blocks, group: 'configuration', path: '/admin/block-gallery',
    keywords: 'block gallery preview render every activity',
    component: screen(() => import('../block-types/BlockGallery'), (m) => m.AdminBlockGallery) },
  { id: 'settings', label: 'Global Settings', icon: Settings, group: 'configuration', path: '/admin/settings',
    keywords: 'settings config configuration',
    component: screen(() => import('../settings/AdminSettingsManager'), (m) => m.AdminSettingsManager) },

  // ── System ──
  { id: 'communication', label: 'Communication', icon: MessageSquare, group: 'system', path: '/admin/communication',
    keywords: 'email notification message brevo',
    component: screen(() => import('../communication/AdminCommunication'), (m) => m.AdminCommunication) },
  { id: 'contact-newsletter', label: 'Contact & Newsletter', icon: Inbox, group: 'system', path: '/admin/contact-newsletter',
    keywords: 'contact newsletter subscription',
    component: screen(() => import('../communication/AdminContactSubmissions'), (m) => m.AdminContactSubmissions) },
  { id: 'payment-gateway', label: 'Payments', icon: CreditCard, group: 'system', path: '/admin/payment-gateway',
    keywords: 'payment razorpay gateway transaction',
    component: screen(() => import('../payments/AdminPaymentGateway'), (m) => m.AdminPaymentGateway) },
  { id: 'kv-audit', label: 'KV Audit', icon: Search, group: 'system', path: '/admin/kv-audit',
    keywords: 'kv audit database key value prefix',
    component: screen(() => import('../system/AdminKVAudit'), (m) => m.AdminKVAudit) },

  // ── Hidden but routable ──
  { id: 'equip-analytics', label: 'Equip Analytics', icon: BarChart3, group: 'content', path: '/admin/equip-analytics',
    keywords: 'equip analytics', hidden: true,
    component: screen(() => import('../analytics/AdminEquipAnalytics'), (m) => m.AdminEquipAnalytics) },
] as const satisfies readonly AdminSectionDef[];

export type AdminSectionId = (typeof ADMIN_SECTIONS)[number]['id'];

const BY_ID = new Map<string, AdminSectionDef>(ADMIN_SECTIONS.map((s) => [s.id, s]));
const BY_PATH = new Map<string, AdminSectionDef>(ADMIN_SECTIONS.map((s) => [s.path, s]));

export function getAdminSection(id: string): AdminSectionDef | undefined {
  return BY_ID.get(id);
}

export function isAdminSectionId(id: string): id is AdminSectionId {
  return BY_ID.has(id);
}

/** '/admin' and '/admin/reporting' → 'dashboard'; '/admin/<id>' → '<id>'. */
export function adminSectionForPath(path: string): AdminSectionId | undefined {
  if (path === '/admin') return 'dashboard';
  return BY_PATH.get(path)?.id as AdminSectionId | undefined;
}

/** Every admin URL App.tsx must accept (bare /admin, login, and each section). */
export const ADMIN_ROUTE_PATHS: readonly string[] = ['/admin', '/admin/login', ...ADMIN_SECTIONS.map((s) => s.path)];
