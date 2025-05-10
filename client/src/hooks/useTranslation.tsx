import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Define the available translators
export interface Translator {
  id: string;
  name: string;
  description: string;
}

export const availableTranslators: Translator[] = [
  {
    id: 'default',
    name: 'Тарҷумаи Тоҷикӣ',
    description: 'Тарҷумаи асосии Қуръон ба забони тоҷикӣ'
  },
  {
    id: 'quran_foundation',
    name: 'Quran Foundation',
    description: 'Тарҷумаи Quran Foundation ба забони тоҷикӣ'
  },
  // Add more translators as they become available
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

// Provider component
interface TranslationProviderProps {
  children: ReactNode;
}

export function TranslationProvider({ children }: TranslationProviderProps) {
  // Get saved preference from localStorage or use default
  const [translatorId, setTranslatorId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('preferred_translator');
      return saved || 'default';
    }
    return 'default';
  });

  // Get the current translator object
  const currentTranslator = availableTranslators.find(t => t.id === translatorId) || availableTranslators[0];

  // Save preference to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred_translator', translatorId);
    }
  }, [translatorId]);

  return (
    <TranslationContext.Provider value={{ translatorId, setTranslatorId, currentTranslator }}>
      {children}
    </TranslationContext.Provider>
  );
}

// Hook to use the context
export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}