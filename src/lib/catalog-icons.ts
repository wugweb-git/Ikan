/**
 * The catalog's icon registry — kebab-case name → lucide component.
 *
 * **One source, extracted 2026-09-08.** All 60 `category:` rows carry an `icon`
 * string (`book-open`, `pen-tool`, `sliders-horizontal`…) and this map is how it
 * becomes something you can render. It lived inside `AdminCategoryManager`, so
 * the Block Type Viewer could not reach it and had grown its own
 * `INTERACTION_ICON_MAP` — thirteen hardcoded entries restating what the
 * catalog already said, and only for interactions. Block types and activities
 * rendered no icon at all despite every row carrying one.
 *
 * That is the same pattern this module has removed three times: a second copy
 * of catalog data, kept by hand, drifting quietly. The registry moves here so
 * both screens read one map.
 *
 * Not to be confused with `src/lib/icon-mapping.ts`, which maps *design-system*
 * keys (`home-roundedOutline`) to lucide NAMES for the `<Icon>` component. This
 * maps catalog icon names to COMPONENTS.
 */
import type { LucideIcon } from 'lucide-react';
import {
  Tag, Tags, Folder, FolderOpen, FileText, FileCheck, Filter, Type, Sparkles,
  Shield, ShieldCheck, ShieldAlert,
  Heart, HeartHandshake, HeartPulse,
  Brain, Activity, Zap, Flame, Sun, Moon, Cloud, CloudLightning,
  Target, Compass, Scale,
  Smile, Frown, Meh, Angry,
  Eye,
  User, Users, UserCheck, Baby, GraduationCap,
  Briefcase,
  Stethoscope, Thermometer,
  Globe, MapPin,
  Video, Phone, MessageSquare, MessageCircle,
  Mic, Headphones,
  Book, BookOpen, Notebook, Library,
  Image as ImageIcon, Film,
  Clipboard, ClipboardList, ClipboardCheck,
  List, ListChecks, CircleCheck, CheckSquare,
  SlidersHorizontal, ToggleLeft,
  MousePointerClick,
  LayoutGrid, Blocks,
  Signal, BarChart, TrendingUp,
  Link,
  AlertTriangle, CircleAlert,
  RefreshCw, Repeat,
  Wrench, Settings,
  Palette, PenTool, Calendar,
  Flag,
  Apple,
  Hash, Table, Hammer,
} from 'lucide-react';

export const ICON_MAP: Record<string, LucideIcon> = {
  'folder': Folder, 'folder-open': FolderOpen, 'file-text': FileText, 'file': FileText, 'file-check': FileCheck,
  'tag': Tag, 'tags': Tags, 'filter': Filter, 'type': Type, 'sparkles': Sparkles,
  'shield': Shield, 'shield-check': ShieldCheck, 'shield-alert': ShieldAlert,
  'heart': Heart, 'heart-handshake': HeartHandshake, 'heart-pulse': HeartPulse,
  'brain': Brain, 'activity': Activity, 'zap': Zap, 'flame': Flame, 'sun': Sun, 'moon': Moon, 'cloud': Cloud, 'cloud-lightning': CloudLightning,
  'target': Target, 'compass': Compass, 'scale': Scale,
  'smile': Smile, 'frown': Frown, 'meh': Meh, 'angry': Angry,
  'eye': Eye,
  'user': User, 'users': Users, 'user-check': UserCheck, 'baby': Baby, 'graduation-cap': GraduationCap,
  'briefcase': Briefcase,
  'stethoscope': Stethoscope, 'thermometer': Thermometer,
  'globe': Globe, 'map-pin': MapPin,
  'video': Video, 'phone': Phone, 'message-square': MessageSquare, 'message-circle': MessageCircle,
  'mic': Mic, 'headphones': Headphones,
  'book': Book, 'book-open': BookOpen, 'notebook': Notebook, 'library': Library,
  'image': ImageIcon, 'film': Film,
  'clipboard': Clipboard, 'clipboard-list': ClipboardList, 'clipboard-check': ClipboardCheck,
  'list': List, 'list-checks': ListChecks, 'circle-check': CircleCheck,
  'sliders-horizontal': SlidersHorizontal, 'toggle-left': ToggleLeft,
  'mouse-pointer-click': MousePointerClick,
  'layout-grid': LayoutGrid, 'blocks': Blocks,
  'signal': Signal, 'bar-chart': BarChart, 'trending-up': TrendingUp,
  'link': Link,
  'alert-triangle': AlertTriangle, 'alert-circle': CircleAlert,
  'refresh-cw': RefreshCw, 'repeat': Repeat,
  'tool': Wrench, 'wrench': Wrench, 'settings': Settings,
  'palette': Palette, 'pen-tool': PenTool, 'calendar': Calendar,
  'flag': Flag,
  'apple': Apple,
  /*
    Added 2026-09-08. These four are carried by live catalog rows and had no
    entry, so they resolved to the generic Tag and no reader could tell the
    difference between "this row chose Tag" and "this map has a hole".
    Counted, live: `hash` (2), `table` (1), `hammer` (1), `check-square` (1).
  */
  'hash': Hash, 'table': Table, 'hammer': Hammer, 'check-square': CheckSquare,
};

/** Does the registry know this icon name? Used to report holes rather than hide them. */
export function iconResolves(iconKey?: string): boolean {
  return !!iconKey && !!ICON_MAP[iconKey];
}

/**
 * Catalog icon name → component.
 *
 * `fallback` is what an unresolved name gets. Callers that want a hole to be
 * VISIBLE should pass nothing and check `iconResolves` first; the default is
 * `Tag`, which is indistinguishable from a row that genuinely chose `tag`.
 */
export function getIconComponent(iconKey?: string, typeDefault?: string): LucideIcon {
  if (iconKey && ICON_MAP[iconKey]) return ICON_MAP[iconKey];
  if (typeDefault && ICON_MAP[typeDefault]) return ICON_MAP[typeDefault];
  return Tag;
}
