import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Define text size options
export type TextSizeType = 'small' | 'medium' | 'large' | 'extra-large';
export type ContentViewType = 'compact' | 'comfortable' | 'expanded';

// Define translation type
export type TranslationType = 'tajik' | 'alternative'; 

interface DisplayContextType {
  // Existing display modes
  tajweedMode: boolean;
  toggleTajweedMode: () => void;
  wordByWordMode: boolean;
  toggleWordByWordMode: () => void;
  showTransliteration: boolean;
  toggleTransliteration: () => void;
  
  // Simplified text size control - one size for all text
  textSize: TextSizeType;
  setTextSize: (size: TextSizeType) => void;
  
  // Translation selection
  translationType: TranslationType;
  setTranslationType: (type: TranslationType) => void;
  
  // Content view mode
  contentViewMode: ContentViewType;
  setContentViewMode: (mode: ContentViewType) => void;
  
  // Line spacing
  lineSpacing: number; // 1-2 range representing line height multiplier
  setLineSpacing: (spacing: number) => void;
}

// Create context with default values
const DisplayContext = createContext<DisplayContextType>({
  tajweedMode: false,
  toggleTajweedMode: () => {},
  wordByWordMode: false,
  toggleWordByWordMode: () => {},
  showTransliteration: true,
  toggleTransliteration: () => {},
  
  textSize: 'medium',
  setTextSize: () => {},
  
  translationType: 'tajik',
  setTranslationType: () => {},
  
  contentViewMode: 'comfortable',
  setContentViewMode: () => {},
  
  lineSpacing: 1.5,
  setLineSpacing: () => {},
});

// Function to load settings from localStorage
const loadFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) as T : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

// Function to save settings to localStorage
const saveToLocalStorage = <T,>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

// Provider component
interface DisplayProviderProps {
  children: ReactNode;
}

export function DisplayProvider({ children }: DisplayProviderProps) {
  // Display modes
  const [tajweedMode, setTajweedMode] = useState(() => 
    loadFromLocalStorage('tajweedMode', false));
  const [wordByWordMode, setWordByWordMode] = useState(() => 
    loadFromLocalStorage('wordByWordMode', false));
  const [showTransliteration, setShowTransliteration] = useState(() => 
    loadFromLocalStorage('showTransliteration', true));
  
  // Simplified text size - one setting for all text
  const [textSize, setTextSize] = useState<TextSizeType>(() => 
    loadFromLocalStorage('textSize', 'medium'));
  
  // Translation selection
  const [translationType, setTranslationType] = useState<TranslationType>(() => 
    loadFromLocalStorage('translationType', 'tajik'));
  
  // Content view mode
  const [contentViewMode, setContentViewMode] = useState<ContentViewType>(() => 
    loadFromLocalStorage('contentViewMode', 'comfortable'));
  
  // Line spacing
  const [lineSpacing, setLineSpacing] = useState<number>(() => 
    loadFromLocalStorage('lineSpacing', 1.5));

  // Save settings to localStorage when they change
  // Using a single effect to manage all localStorage saves to avoid potential update loops
  useEffect(() => {
    const saveAll = () => {
      saveToLocalStorage('tajweedMode', tajweedMode);
      saveToLocalStorage('wordByWordMode', wordByWordMode);
      saveToLocalStorage('showTransliteration', showTransliteration);
      saveToLocalStorage('textSize', textSize);
      saveToLocalStorage('translationType', translationType);
      saveToLocalStorage('contentViewMode', contentViewMode);
      saveToLocalStorage('lineSpacing', lineSpacing);
    };
    
    saveAll();
  }, [
    tajweedMode, 
    wordByWordMode, 
    showTransliteration, 
    textSize,
    translationType,
    contentViewMode, 
    lineSpacing
  ]);

  // Toggle functions
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
        toggleTransliteration,
        
        textSize,
        setTextSize,
        
        translationType,
        setTranslationType,
        
        contentViewMode,
        setContentViewMode,
        
        lineSpacing,
        setLineSpacing
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