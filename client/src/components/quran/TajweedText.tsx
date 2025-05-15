import { useEffect, useState } from 'react';
import { parseTajweed, fetchTajweedAyah } from '@/lib/tajweed';
import { getArabicFontClass } from '@/lib/fonts';
import { useTajweedMode } from '@/hooks/useTajweedMode';
import { useDisplaySettings } from '@/hooks/useDisplaySettings';
import { cn } from '@/lib/utils';
import '@/styles/tajweed.css';

interface TajweedTextProps {
  surahNumber: number;
  verseNumber: number;
  plainText?: string;  // Plain Arabic text to use as fallback
  className?: string;
  showLoader?: boolean;
}

export default function TajweedText({ 
  surahNumber, 
  verseNumber, 
  plainText = "",
  className = "", 
  showLoader = true 
}: TajweedTextProps) {
  const { tajweedMode } = useTajweedMode();
  const { arabicTextSize } = useDisplaySettings();
  const [text, setText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(tajweedMode);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch the Tajweed text if Tajweed mode is enabled
    if (tajweedMode) {
      const loadTajweedText = async () => {
        try {
          setIsLoading(true);
          setError(null);
          
          const tajweedText = await fetchTajweedAyah(surahNumber, verseNumber);
          setText(tajweedText);
        } catch (error) {
          console.error('Error loading tajweed text:', error);
          setError('Could not load tajweed text');
        } finally {
          setIsLoading(false);
        }
      };

      loadTajweedText();
    } else {
      // If Tajweed mode is not enabled, clear any previously loaded Tajweed text
      setText('');
      setIsLoading(false);
      setError(null);
    }
  }, [surahNumber, verseNumber, tajweedMode]);

  if (isLoading && showLoader) {
    return (
      <div className={`${getArabicFontClass('md')} animate-pulse flex justify-center p-4 ${className}`}>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      </div>
    );
  }

  // If tajweed mode is not enabled, simply display the plain text
  if (!tajweedMode) {
    return (
      <div className={cn(
        getArabicFontClass('md'),
        'arabic-text',
        `arabic-text-${arabicTextSize}`,
        className
      )}>
        {plainText}
      </div>
    );
  }

  // If there's an error loading tajweed and tajweed mode is enabled
  if (error) {
    return (
      <div className={cn(
        getArabicFontClass('md'),
        'arabic-text',
        `arabic-text-${arabicTextSize}`,
        className
      )}>
        {plainText || `﴾الآية ${verseNumber} من سورة ${surahNumber}﴿`}
      </div>
    );
  }

  // Parse the tajweed text to convert it to HTML 
  const parsedText = parseTajweed(text);

  return (
    <div 
      className={cn(
        getArabicFontClass('md'),
        'arabic-text',
        `arabic-text-${arabicTextSize}`,
        className
      )}
      dangerouslySetInnerHTML={{ __html: parsedText }}
    />
  );
}