import { useEffect, useState, useCallback } from 'react';

export function useUnsavedChanges() {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);

  // Mark as having unsaved changes
  const markAsUnsaved = useCallback(() => {
    setHasUnsavedChanges(true);
  }, []);

  // Mark as saved (clear unsaved changes)
  const markAsSaved = useCallback(() => {
    setHasUnsavedChanges(false);
  }, []);

  // Warn before closing/refreshing the browser
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = ''; // Chrome requires returnValue to be set
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  // Warn before navigating within the app
  const confirmNavigation = useCallback((callback: () => void) => {
    if (hasUnsavedChanges) {
      setShowWarning(true);
      setPendingNavigation(() => callback);
      return false; // Prevent immediate navigation
    }
    callback();
    return true;
  }, [hasUnsavedChanges]);

  const proceedWithNavigation = useCallback(() => {
    if (pendingNavigation) {
      pendingNavigation();
      setPendingNavigation(null);
    }
    setHasUnsavedChanges(false);
    setShowWarning(false);
  }, [pendingNavigation]);

  const cancelNavigation = useCallback(() => {
    setPendingNavigation(null);
    setShowWarning(false);
  }, []);

  return {
    hasUnsavedChanges,
    markAsUnsaved,
    markAsSaved,
    showWarning,
    setShowWarning,
    confirmNavigation,
    proceedWithNavigation,
    cancelNavigation
  };
}
