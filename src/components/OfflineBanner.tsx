/**
 * OfflineBanner - Shows a persistent, non-intrusive offline status indicator.
 * Displays pending sync count and syncing state.
 * Follows iKan design tokens and accessibility guidelines.
 */
import React from 'react';
import { WifiOff, RefreshCw, Check } from 'lucide-react';
import { cn } from './ui/utils';

interface OfflineBannerProps {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  onSyncNow?: () => void;
}

export function OfflineBanner({ isOnline, pendingCount, isSyncing, onSyncNow }: OfflineBannerProps) {
  // Don't render when online with nothing pending
  if (isOnline && pendingCount === 0 && !isSyncing) return null;

  // Just came back online and syncing
  if (isOnline && isSyncing) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="fixed top-0 left-0 right-0 z-[60] flex items-center justify-center gap-2 py-2 px-4 text-sm"
        style={{
          backgroundColor: 'var(--color-status-info)',
          color: 'var(--color-text-inverse)',
          fontFamily: 'var(--font-family-base)',
          fontWeight: 'var(--font-weight-medium)',
          fontSize: 'var(--text-sm)',
        }}
      >
        <RefreshCw size={14} className="animate-spin" aria-hidden="true" />
        <span>Syncing {pendingCount} pending {pendingCount === 1 ? 'item' : 'items'}...</span>
      </div>
    );
  }

  // Online with pending items (sync failed or waiting)
  if (isOnline && pendingCount > 0) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="fixed top-0 left-0 right-0 z-[60] flex items-center justify-center gap-2 py-2 px-4 text-sm"
        style={{
          backgroundColor: 'var(--color-status-warning)',
          color: 'var(--color-text-primary)',
          fontFamily: 'var(--font-family-base)',
          fontWeight: 'var(--font-weight-medium)',
          fontSize: 'var(--text-sm)',
        }}
      >
        <RefreshCw size={14} aria-hidden="true" />
        <span>{pendingCount} unsaved {pendingCount === 1 ? 'change' : 'changes'}</span>
        {onSyncNow && (
          <button
            onClick={onSyncNow}
            className="ml-2 underline focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded px-1"
            style={{ minHeight: 'var(--ikan-touch-target-min)' }}
            aria-label={`Sync ${pendingCount} pending changes now`}
          >
            Sync now
          </button>
        )}
      </div>
    );
  }

  // Offline
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed top-0 left-0 right-0 z-[60] flex items-center justify-center gap-2 py-2 px-4 text-sm"
      style={{
        backgroundColor: 'var(--color-text-muted)',
        color: 'var(--color-text-inverse)',
        fontFamily: 'var(--font-family-base)',
        fontWeight: 'var(--font-weight-medium)',
        fontSize: 'var(--text-sm)',
      }}
    >
      <WifiOff size={14} aria-hidden="true" />
      <span>You're offline. Changes will sync when you reconnect.</span>
      {pendingCount > 0 && (
        <span className="opacity-80">({pendingCount} pending)</span>
      )}
    </div>
  );
}
