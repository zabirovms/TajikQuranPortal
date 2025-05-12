import { useDisplaySettings } from './useDisplaySettings';

// This is just a wrapper for backward compatibility
export function useTajweedMode() {
  const { tajweedMode, toggleTajweedMode } = useDisplaySettings();
  return { tajweedMode, toggleTajweedMode };
}

// Re-export DisplayProvider as TajweedProvider for backward compatibility
export { DisplayProvider as TajweedProvider } from './useDisplaySettings';