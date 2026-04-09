import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Icon } from '../Icon';

interface ReassessmentPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ReassessmentPrompt({ isOpen, onClose, onConfirm }: ReassessmentPromptProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center pointer-events-none">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto"
        />

        {/* Modal */}
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full sm:max-w-md p-8 pb-10 shadow-2xl pointer-events-auto relative m-4"
          style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-xl)' }}
        >
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <Icon name="x" size={24} />
          </button>

          <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: 'var(--color-status-info-light)', color: 'var(--color-status-info)' }}>
              <Icon name="activity" size={32} />
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-medium text-[var(--color-text-primary)]">
                Want to check where you are now?
              </h2>
              <p className="text-[var(--color-text-muted)] leading-relaxed text-lg">
                You’ve made some changes since your last check. Retaking this assessment can help us understand what’s helping and what to adjust.
              </p>
            </div>

            <div className="flex flex-col w-full gap-3 pt-4">
              <Button 
                onClick={onConfirm}
                className="w-full h-14 text-lg bg-[var(--color-primary-default)] hover:bg-[var(--color-primary-dark)] text-white rounded-2xl shadow-lg shadow-indigo-200"
              >
                Retake assessment
              </Button>
              <Button 
                onClick={onClose}
                variant="ghost"
                className="w-full h-12 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-transparent"
              >
                Not now
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}