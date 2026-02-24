import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Check, Shield, Activity } from 'lucide-react';

interface GoogleFitConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function GoogleFitConsentModal({ isOpen, onClose, onConfirm }: GoogleFitConsentModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative z-10"
          style={{ backgroundColor: 'var(--color-bg-card)' }}
        >
          {/* Header Image/Icon */}
          <div 
            className="p-8 flex flex-col items-center justify-center text-white space-y-4 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, var(--color-status-info), var(--color-primary-default))' }}
          >
             <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
             <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2" />
             
             <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30">
               <Activity size={32} strokeWidth={2.5} />
             </div>
             <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-medium)' }} className="text-center">Connect Fitness Tracker</h2>
          </div>

          <div className="p-8 space-y-6">
            <div className="space-y-4">
              <p className="leading-relaxed text-center" style={{ color: 'var(--color-text-muted)' }}>
                Syncing your activity data helps us provide more personalized wellness insights and updates your Wellness Score.
              </p>

              <div 
                className="rounded-2xl p-5 space-y-4"
                style={{ 
                  backgroundColor: 'var(--color-bg-muted)',
                  border: '1px solid var(--color-border-default)'
                }}
              >
                <div className="flex items-start gap-3">
                   <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: 'var(--color-status-success-light)' }}>
                     <Check size={14} style={{ color: 'var(--color-status-success)' }} strokeWidth={3} />
                   </div>
                   <div>
                     <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>What We Pull (Read-Only)</h4>
                     <p className="mt-1 leading-relaxed" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                       Steps, sleep duration & stages, active minutes, calories, distance, heart rate, and heart points.
                     </p>
                   </div>
                </div>

                <div className="flex items-start gap-3">
                   <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: 'var(--color-status-danger-light)' }}>
                     <Shield size={14} style={{ color: 'var(--color-status-danger)' }} />
                   </div>
                   <div>
                     <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>What We NEVER Pull</h4>
                     <p className="mt-1 leading-relaxed" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                       GPS/Location, specific workouts, medical diagnoses, weight, or raw data.
                     </p>
                   </div>
                </div>
              </div>

              <div 
                className="p-4 rounded-xl flex gap-3 items-start"
                style={{ 
                  backgroundColor: 'var(--color-status-info-light)', 
                  color: 'var(--color-status-info)',
                  fontSize: 'var(--text-xs)'
                }}
              >
                <Shield className="w-4 h-4 mt-0.5 shrink-0" />
                <p>
                  Your data is stored securely and used <strong>only</strong> for trend overlays. It never affects your clinical scoring or diagnosis.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={onConfirm}
                className="w-full rounded-xl text-base shadow-lg"
                style={{ 
                  height: 'var(--ikan-component-button-height, 56px)',
                  backgroundColor: 'var(--color-primary-default)',
                  color: 'var(--color-text-inverse)',
                  fontWeight: 'var(--font-weight-medium)'
                }}
              >
                Allow Access
              </Button>
              <Button 
                onClick={onClose}
                variant="ghost"
                className="w-full h-12"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
