import { useEffect, useRef, useCallback } from 'react';
import { useNotifications } from '../contexts/NotificationContext';

interface AutosaveOptions {
  delay?: number; // Debounce delay in milliseconds
  onSave: (data: any) => Promise<void>;
  enabled?: boolean;
  showNotification?: boolean;
}

export function useAutosave<T>(
  data: T,
  options: AutosaveOptions
) {
  const { 
    delay = 2000, 
    onSave, 
    enabled = true,
    showNotification = true 
  } = options;
  
  const { showToast } = useNotifications();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousDataRef = useRef<T>(data);
  const isSavingRef = useRef(false);

  const save = useCallback(async (dataToSave: T) => {
    if (isSavingRef.current) return;

    try {
      isSavingRef.current = true;
      await onSave(dataToSave);
      
      if (showNotification) {
        showToast('success', 'Autosaved', 'Changes saved automatically');
      }
      
      previousDataRef.current = dataToSave;
    } catch (error) {
      console.error('Autosave failed:', error);
      if (showNotification) {
        showToast('error', 'Autosave Failed', 'Could not save changes automatically');
      }
    } finally {
      isSavingRef.current = false;
    }
  }, [onSave, showNotification, showToast]);

  useEffect(() => {
    if (!enabled) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Check if data has changed
    const hasChanged = JSON.stringify(data) !== JSON.stringify(previousDataRef.current);
    
    if (hasChanged) {
      // Set new timeout for autosave
      timeoutRef.current = setTimeout(() => {
        save(data);
      }, delay);
    }

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, delay, enabled, save]);

  // Manual save function
  const saveNow = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    return save(data);
  }, [data, save]);

  return { saveNow };
}
