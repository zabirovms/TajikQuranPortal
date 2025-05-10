import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Define available translators
export interface Translator {
  id: string;
  name: string;
  description: string;
}

export const availableTranslators: Translator[] = [
  {
    id: 'default',
    name: 'Ҳидоят',
    description: 'Тарҷумаи расмии Раёсати Мусалмонони Тоҷикистон'
  },
  {
    id: 'mubin',
    name: 'Мубин',
    description: 'Тарҷумаи муассисаи Мубин'
  },
  {
    id: 'sadoi_islom',
    name: 'Садои Ислом',
    description: 'Тарҷумаи нашрияи Садои Ислом'
  }
];

// Context type
interface TranslationContextType {
  translatorId: string;
  setTranslatorId: (id: string) => void;
  currentTranslator: Translator;
}

// Create context with default values
const TranslationContext = createContext<TranslationContextType>({
  translatorId: 'default',
  setTranslatorId: () => {},
  currentTranslator: availableTranslators[0]
});

// Context provider props
interface TranslationProviderProps {
  children: ReactNode;
}

export function TranslationProvider({ children }: TranslationProviderProps) {
  // Get saved preference from localStorage or use default
  const [translatorId, setTranslatorId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('translator-preference');
      return saved ? saved : 'default';
    }
    return 'default';
  });

  // Find the current translator object and memoize it
  const currentTranslator = React.useMemo(() => {
    return availableTranslators.find(t => t.id === translatorId) || availableTranslators[0];
  }, [translatorId]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(() => {
    return { 
      translatorId, 
      setTranslatorId: (id: string) => {
        setTranslatorId(id);
        if (typeof window !== 'undefined') {
          localStorage.setItem('translator-preference', id);
        }
      }, 
      currentTranslator 
    };
  }, [translatorId, currentTranslator]);

  return (
    <TranslationContext.Provider value={contextValue}>
      {children}
    </TranslationContext.Provider>
  );
}

// Custom hook to use translation context
export function useTranslation() {
  return useContext(TranslationContext);
}