import { useEffect, useRef } from 'react';
import { RenpyScript } from '../types/renpy';

const AUTOSAVE_KEY = 'renpy-editor-autosave';
const AUTOSAVE_INTERVAL = 30000; // 30 seconds

export function useAutoSave(script: RenpyScript, enabled: boolean = true) {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSaveRef = useRef<string>('');

  useEffect(() => {
    if (!enabled) return;

    const saveToLocalStorage = () => {
      const scriptString = JSON.stringify(script);
      
      // Only save if content has changed
      if (scriptString !== lastSaveRef.current) {
        localStorage.setItem(AUTOSAVE_KEY, scriptString);
        localStorage.setItem(`${AUTOSAVE_KEY}-timestamp`, new Date().toISOString());
        lastSaveRef.current = scriptString;
        console.log('Auto-saved at', new Date().toLocaleTimeString());
      }
    };

    // Save immediately when script changes
    saveToLocalStorage();

    // Set up interval for periodic saves
    timeoutRef.current = setInterval(saveToLocalStorage, AUTOSAVE_INTERVAL);

    return () => {
      if (timeoutRef.current) {
        clearInterval(timeoutRef.current);
      }
    };
  }, [script, enabled]);

  const loadAutoSave = (): RenpyScript | null => {
    const saved = localStorage.getItem(AUTOSAVE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('Failed to load autosave:', error);
      }
    }
    return null;
  };

  const getAutoSaveTimestamp = (): Date | null => {
    const timestamp = localStorage.getItem(`${AUTOSAVE_KEY}-timestamp`);
    return timestamp ? new Date(timestamp) : null;
  };

  const clearAutoSave = () => {
    localStorage.removeItem(AUTOSAVE_KEY);
    localStorage.removeItem(`${AUTOSAVE_KEY}-timestamp`);
  };

  return {
    loadAutoSave,
    getAutoSaveTimestamp,
    clearAutoSave
  };
}