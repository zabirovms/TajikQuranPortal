// Helper functions for working with fonts

// Get the Arabic font class
export const getArabicFontClass = (size: 'sm' | 'md' | 'lg' = 'md') => {
  const baseClass = 'font-arabic arabic-text';
  
  switch (size) {
    case 'sm':
      return `${baseClass} text-xl leading-loose`;
    case 'md':
      return `${baseClass} text-2xl leading-loose`;
    case 'lg':
      return `${baseClass} text-3xl leading-loose`;
    default:
      return baseClass;
  }
};

// Get the Tajik font class
export const getTajikFontClass = (size: 'sm' | 'md' | 'lg' = 'md') => {
  switch (size) {
    case 'sm':
      return 'text-sm';
    case 'md':
      return 'text-base';
    case 'lg':
      return 'text-lg';
    default:
      return 'text-base';
  }
};

// Format ayah (verse) number in Arabic numerals
export const formatArabicNumber = (num: number): string => {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().split('').map(d => arabicNumerals[parseInt(d)]).join('');
};

// Format verse key (e.g., "2:255")
export const formatVerseKey = (surahNumber: number, verseNumber: number): string => {
  return `${surahNumber}:${verseNumber}`;
};
