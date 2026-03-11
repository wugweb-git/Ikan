import { cn } from './ui/utils';
import { motion } from 'motion/react';
import { ArrowRight, Calendar, MessageCircle } from 'lucide-react';

interface ActionBlocksProps {
  onNavigate?: (route: string) => void;
}

// ─── Consultant Block ─────────────────────────────────────────
function ConsultantBlock({ onNavigate }: { onNavigate?: (route: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      style={{
        backgroundColor: 'var(--color-bg-card)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
      }}
    >
      <div className="flex items-start" style={{ padding: 20, gap: 16 }}>
        {/* Icon */}
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          backgroundColor: 'var(--color-status-success-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <MessageCircle size={22} style={{ color: 'var(--color-status-success)' }} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            fontSize: 'var(--text-base)',
            fontWeight: 500,
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-family-base)',
            margin: 0,
          }}>
            Talk to a professional
          </h3>
          <p style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 400,
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-family-base)',
            margin: '4px 0 0',
            lineHeight: 1.5,
          }}>
            Book a confidential session with a licensed counsellor.
          </p>

          {/* CTA */}
          <button
            onClick={() => onNavigate?.('/consultation')}
            className="flex items-center"
            style={{
              marginTop: 12,
              padding: '10px 20px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'var(--color-primary-default)',
              color: 'var(--color-primary-on)',
              border: 'none',
              cursor: 'pointer',
              gap: 6,
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              fontFamily: 'var(--font-family-base)',
            }}
          >
            <Calendar size={14} />
            Book a session
          </button>
        </div>
      </div>

      {/* Trust row */}
      <div className="flex items-center" style={{
        padding: '10px 20px',
        borderTop: '1px solid var(--color-border-default)',
        gap: 20,
      }}>
        {['Licensed', 'Confidential', 'Online & in-person'].map((item) => (
          <span key={item} style={{
            fontSize: 11,
            fontWeight: 400,
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-family-base)',
          }}>
            {item}
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