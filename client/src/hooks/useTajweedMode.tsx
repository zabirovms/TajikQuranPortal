import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface TajweedContextType {
  tajweedMode: boolean;
  toggleTajweedMode: () => void;
}

const TajweedContext = createContext<TajweedContextType>({
  tajweedMode: false,
  toggleTajweedMode: () => {}
});

interface TajweedProviderProps {
  children: ReactNode;
}

export function TajweedProvider({ children }: TajweedProviderProps) {
  // Get saved preference from localStorage or use default (false)
  const [tajweedMode, setTajweedMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tajweed-mode');
      return saved ? saved === 'true' : false;
    }
    return false;
  });

  // Toggle tajweed mode
  const toggleTajweedMode = () => {
    setTajweedMode(prev => !prev);
  };

  // Update localStorage when preference changes
  useEffect(() => {
    localStorage.setItem('tajweed-mode', tajweedMode.toString());
  }, [tajweedMode]);

  return (
    <TajweedContext.Provider value={{ tajweedMode, toggleTajweedMode }}>
      {children}
    </TajweedContext.Provider>
  );
}

export function useTajweedMode() {
  return useContext(TajweedContext);
}