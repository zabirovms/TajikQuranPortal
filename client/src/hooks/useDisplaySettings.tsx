import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Define text size options
export type TextSizeType = 'small' | 'medium' | 'large' | 'extra-large';
export type ContentViewType = 'compact' | 'comfortable' | 'expanded';

interface DisplayContextType {
  // Existing display modes
  tajweedMode: boolean;
  toggleTajweedMode: () => void;
  wordByWordMode: boolean;
  toggleWordByWordMode: () => void;
  showTransliteration: boolean;
  toggleTransliteration: () => void;
  
  // New text size controls
  arabicTextSize: TextSizeType;
  setArabicTextSize: (size: TextSizeType) => void;
  translationTextSize: TextSizeType;
  setTranslationTextSize: (size: TextSizeType) => void;
  tafsirTextSize: TextSizeType;
  setTafsirTextSize: (size: TextSizeType) => void;
  
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
  
  arabicTextSize: 'medium',
  setArabicTextSize: () => {},
  translationTextSize: 'medium',
  setTranslationTextSize: () => {},
  tafsirTextSize: 'medium',
  setTafsirTextSize: () => {},
  
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
  
  // Text sizes
  const [arabicTextSize, setArabicTextSize] = useState<TextSizeType>(() => 
    loadFromLocalStorage('arabicTextSize', 'medium'));
  const [translationTextSize, setTranslationTextSize] = useState<TextSizeType>(() => 
    loadFromLocalStorage('translationTextSize', 'medium'));
  const [tafsirTextSize, setTafsirTextSize] = useState<TextSizeType>(() => 
    loadFromLocalStorage('tafsirTextSize', 'medium'));
  
  // Content view mode
  const [contentViewMode, setContentViewMode] = useState<ContentViewType>(() => 
    loadFromLocalStorage('contentViewMode', 'comfortable'));
  
  // Line spacing
  const [lineSpacing, setLineSpacing] = useState<number>(() => 
    loadFromLocalStorage('lineSpacing', 1.5));

  // Save settings to localStorage when they change
  useEffect(() => {
    saveToLocalStorage('tajweedMode', tajweedMode);
  }, [tajweedMode]);
  
  useEffect(() => {
    saveToLocalStorage('wordByWordMode', wordByWordMode);
  }, [wordByWordMode]);
  
  useEffect(() => {
    saveToLocalStorage('showTransliteration', showTransliteration);
  }, [showTransliteration]);
  
  useEffect(() => {
    saveToLocalStorage('arabicTextSize', arabicTextSize);
  }, [arabicTextSize]);
  
  useEffect(() => {
    saveToLocalStorage('translationTextSize', translationTextSize);
  }, [translationTextSize]);
  
  useEffect(() => {
    saveToLocalStorage('tafsirTextSize', tafsirTextSize);
  }, [tafsirTextSize]);
  
  useEffect(() => {
    saveToLocalStorage('contentViewMode', contentViewMode);
  }, [contentViewMode]);
  
  useEffect(() => {
    saveToLocalStorage('lineSpacing', lineSpacing);
  }, [lineSpacing]);

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
        
        arabicTextSize,
        setArabicTextSize,
        translationTextSize,
        setTranslationTextSize,
        tafsirTextSize,
        setTafsirTextSize,
        
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