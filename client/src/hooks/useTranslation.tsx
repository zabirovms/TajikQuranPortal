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
  const [translatorId, setTranslatorIdState] = useState<string>('default');

  // Load from localStorage on initial mount only
  useEffect(() => {
    try {
      const saved = localStorage.getItem('translator-preference');
      if (saved) {
        setTranslatorIdState(saved);
      }
    } catch (error) {
      console.error('Error reading from localStorage:', error);
    }
  }, []);

  // Handler for updating the translator
  const setTranslatorId = (id: string) => {
    setTranslatorIdState(id);
    try {
      localStorage.setItem('translator-preference', id);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  // Find the current translator object and memoize it
  const currentTranslator = availableTranslators.find(t => t.id === translatorId) || availableTranslators[0];

  // Create context value
  const contextValue = {
    translatorId,
    setTranslatorId,
    currentTranslator
  };

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