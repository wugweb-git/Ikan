import { useEffect } from 'react';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean; // Command key on Mac
  callback: (event: KeyboardEvent) => void;
  preventDefault?: boolean;
}

// Type for object-based shortcuts like { 'ctrl+s': callback, 'escape': callback }
type ShortcutMap = Record<string, (event: KeyboardEvent) => void>;

// Overloaded function signatures
export function useKeyboardShortcuts(shortcuts: ShortcutConfig[], dependencies?: any[]): void;
export function useKeyboardShortcuts(shortcuts: ShortcutMap, dependencies?: any[]): void;

export function useKeyboardShortcuts(
  shortcuts: ShortcutConfig[] | ShortcutMap, 
  dependencies: any[] = []
) {
  useEffect(() => {
    // Convert object-based shortcuts to array format
    let shortcutArray: ShortcutConfig[] = [];
    
    if (Array.isArray(shortcuts)) {
      shortcutArray = shortcuts;
    } else {
      // Parse object-based shortcuts like { 'ctrl+s': callback, 'escape': callback }
      shortcutArray = Object.entries(shortcuts).map(([key, callback]) => {
        const parts = key.toLowerCase().split('+');
        const actualKey = parts[parts.length - 1];
        
        return {
          key: actualKey,
          ctrl: parts.includes('ctrl') || parts.includes('control'),
          shift: parts.includes('shift'),
          alt: parts.includes('alt'),
          meta: parts.includes('meta') || parts.includes('cmd') || parts.includes('command'),
          callback,
          preventDefault: parts.includes('ctrl') || parts.includes('meta') // Auto-prevent default for modifier shortcuts
        };
      });
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      shortcutArray.forEach((shortcut) => {
        // Check if modifiers match exactly
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey : !event.ctrlKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;
        const metaMatch = shortcut.meta ? event.metaKey : !event.metaKey;
        
        const isModifierMatch = ctrlMatch && shiftMatch && altMatch && metaMatch;
        const isKeyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (isModifierMatch && isKeyMatch) {
          if (shortcut.preventDefault) {
            event.preventDefault();
          }
          shortcut.callback(event);
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(Object.keys(shortcuts || {})), ...dependencies]);
}

// Common shortcuts helper
export const commonShortcuts = {
  save: (callback: () => void): ShortcutConfig => ({
    key: 's',
    ctrl: true,
    callback,
    preventDefault: true
  }),
  
  cancel: (callback: () => void): ShortcutConfig => ({
    key: 'Escape',
    callback,
    preventDefault: false
  }),

  submit: (callback: () => void): ShortcutConfig => ({
    key: 'Enter',
    ctrl: true,
    callback,
    preventDefault: true
  }),

  delete: (callback: () => void): ShortcutConfig => ({
    key: 'Delete',
    callback,
    preventDefault: false
  })
};