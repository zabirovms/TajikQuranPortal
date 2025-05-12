import { createContext, useContext, useState, ReactNode } from 'react';

interface DisplayContextType {
  tajweedMode: boolean;
  toggleTajweedMode: () => void;
  wordByWordMode: boolean;
  toggleWordByWordMode: () => void;
  showTransliteration: boolean;
  toggleTransliteration: () => void;
}

// Create context with default values
const DisplayContext = createContext<DisplayContextType>({
  tajweedMode: false,
  toggleTajweedMode: () => {},
  wordByWordMode: false,
  toggleWordByWordMode: () => {},
  showTransliteration: true,
  toggleTransliteration: () => {},
});

// Provider component
interface DisplayProviderProps {
  children: ReactNode;
}

export function DisplayProvider({ children }: DisplayProviderProps) {
  const [tajweedMode, setTajweedMode] = useState(false);
  const [wordByWordMode, setWordByWordMode] = useState(false);
  const [showTransliteration, setShowTransliteration] = useState(true);

  const toggleTajweedMode = () => {
    setTajweedMode(prev => !prev);
  };

  const toggleWordByWordMode = () => {
    setWordByWordMode(prev => !prev);
  };

  const toggleTransliteration = () => {
    setShowTransliteration(prev => !prev);
  };

  return (
    <DisplayContext.Provider 
      value={{ 
        tajweedMode, 
        toggleTajweedMode, 
        wordByWordMode, 
        toggleWordByWordMode,
        showTransliteration,
        toggleTransliteration
      }}
    >
      {children}
    </DisplayContext.Provider>
  );
}

// Hook to use the context
export function useDisplaySettings() {
  const context = useContext(DisplayContext);
  if (context === undefined) {
    throw new Error('useDisplaySettings must be used within a DisplayProvider');
  }
  return context;
}