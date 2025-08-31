import { useEffect } from 'react';

interface ShortcutHandlers {
  onSave?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onDelete?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onSelectAll?: () => void;
  onEscape?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

      // Ctrl/Cmd + S - Save
      if (ctrlKey && e.key === 's') {
        e.preventDefault();
        handlers.onSave?.();
      }
      
      // Ctrl/Cmd + Z - Undo
      else if (ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handlers.onUndo?.();
      }
      
      // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y - Redo
      else if ((ctrlKey && e.shiftKey && e.key === 'z') || (ctrlKey && e.key === 'y')) {
        e.preventDefault();
        handlers.onRedo?.();
      }
      
      // Delete or Backspace - Delete
      else if ((e.key === 'Delete' || e.key === 'Backspace') && !e.target) {
        e.preventDefault();
        handlers.onDelete?.();
      }
      
      // Ctrl/Cmd + C - Copy
      else if (ctrlKey && e.key === 'c') {
        handlers.onCopy?.();
      }
      
      // Ctrl/Cmd + V - Paste
      else if (ctrlKey && e.key === 'v') {
        handlers.onPaste?.();
      }
      
      // Ctrl/Cmd + A - Select All
      else if (ctrlKey && e.key === 'a') {
        e.preventDefault();
        handlers.onSelectAll?.();
      }
      
      // Escape
      else if (e.key === 'Escape') {
        handlers.onEscape?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}