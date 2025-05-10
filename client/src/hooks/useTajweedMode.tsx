import { createContext, useContext, useState, ReactNode } from 'react';

interface TajweedContextType {
  tajweedMode: boolean;
  toggleTajweedMode: () => void;
}

// Create context with default values
const TajweedContext = createContext<TajweedContextType>({
  tajweedMode: false,
  toggleTajweedMode: () => {},
});

// Provider component
interface TajweedProviderProps {
  children: ReactNode;
}

export function TajweedProvider({ children }: TajweedProviderProps) {
  const [tajweedMode, setTajweedMode] = useState(false);

  const toggleTajweedMode = () => {
    setTajweedMode(prev => !prev);
  };

  return (
    <TajweedContext.Provider value={{ tajweedMode, toggleTajweedMode }}>
      {children}
    </TajweedContext.Provider>
  );
}

// Hook to use the context
export function useTajweedMode() {
  const context = useContext(TajweedContext);
  if (context === undefined) {
    throw new Error('useTajweedMode must be used within a TajweedProvider');
  }
  return context;
}