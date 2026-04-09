import { cn } from './ui/utils';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, MessageCircle, ShieldCheck, Video, Phone } from 'lucide-react';

interface ActionBlocksProps {
  onNavigate?: (route: string) => void;
}

// ─── Professional Support Block ──────────────────────────────────
function ConsultantBlock({ onNavigate }: { onNavigate?: (route: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      onClick={() => onNavigate?.('/consultation')}
      style={{
        backgroundColor: 'var(--color-bg-card)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--color-border-default)',
        overflow: 'hidden',
        cursor: 'pointer',
      }}
    >
      {/* Main content area */}
      <div style={{ padding: '20px 20px 16px' }}>
        <div className="flex items-start" style={{ gap: 16 }}>
          {/* Gradient icon circle */}
          <div style={{
            width: 52, height: 52, borderRadius: 16, flexShrink: 0,
            background: 'linear-gradient(135deg, #E0F7EE 0%, #D1FAE5 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <MessageCircle size={24} style={{ color: '#059669' }} />
          </div>

          {/* Text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{
              fontSize: 'var(--text-base)',
              fontWeight: 500,
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-family-base)',
              margin: 0,
              lineHeight: 1.3,
            }}>
              Speak with a professional
            </h3>
            <p style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 400,
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-family-base)',
              margin: '6px 0 0',
              lineHeight: 1.5,
            }}>
              Book a confidential session with a licensed counsellor — online or in person.
            </p>
          </div>

          {/* Arrow */}
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            backgroundColor: 'var(--color-primary-default)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, marginTop: 4,
          }}>
            <ArrowRight size={16} style={{ color: 'var(--color-text-inverse)' }} />
          </div>
        </div>
      </div>

      {/* Trust badges row */}
      <div className="flex items-center" style={{
        padding: '10px 20px',
        borderTop: '1px solid var(--color-border-default)',
        backgroundColor: 'var(--color-bg-muted)',
        gap: 16,
      }}>
        {[
          { icon: ShieldCheck, label: 'Licensed' },
          { icon: Video, label: 'Online' },
          { icon: Phone, label: 'In-person' },
        ].map(({ icon: Icon, label }) => (
          <span key={label} className="flex items-center" style={{
            gap: 5,
            fontSize: 'var(--text-xs)',
            fontWeight: 400,
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-family-base)',
          }}>
            <Icon size={12} style={{ opacity: 0.7 }} />
            {label}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Combined ─────────────────────────────────────────────────
export function DashboardActionBlocks({ onNavigate }: ActionBlocksProps) {
  return (
    <div className="flex flex-col" style={{ gap: 16 }}>
      <ConsultantBlock onNavigate={onNavigate} />
    </div>
  );
}
