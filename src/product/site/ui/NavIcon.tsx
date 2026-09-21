import {
  House, Info, Mail, ClipboardCheck, BookOpen, Stethoscope, UserCircle,
  CircleHelp, Shield, FileText, Ban, RotateCcw,
} from 'lucide-react';

/** Icons for the keys used in content/nav.ts. Unknown keys fall back to a page icon. */
const ICONS = {
  house: House,
  info: Info,
  mail: Mail,
  'clipboard-check': ClipboardCheck,
  'book-open': BookOpen,
  stethoscope: Stethoscope,
  'user-circle': UserCircle,
  'circle-help': CircleHelp,
  shield: Shield,
  'file-text': FileText,
  ban: Ban,
  'rotate-ccw': RotateCcw,
} as const;

export function NavIcon({ name, size = 18, style }: { name?: string; size?: number; style?: React.CSSProperties }) {
  const Glyph = (name && ICONS[name as keyof typeof ICONS]) || FileText;
  return <Glyph size={size} style={style} aria-hidden="true" />;
}
