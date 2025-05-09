import { useEffect, useState } from 'react';
import { parseTajweed, fetchTajweedAyah } from '@/lib/tajweed';
import { getArabicFontClass } from '@/lib/fonts';
import '@/styles/tajweed.css';

interface TajweedTextProps {
  surahNumber: number;
  verseNumber: number;
  className?: string;
  showLoader?: boolean;
}

export default function TajweedText({ 
  surahNumber, 
  verseNumber, 
  className = "", 
  showLoader = true 
}: TajweedTextProps) {
  const [text, setText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
  }, [surahNumber, verseNumber]);

  if (isLoading && showLoader) {
    return (
      <div className={`${getArabicFontClass('md')} animate-pulse flex justify-center p-4 ${className}`}>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${getArabicFontClass('md')} text-gray-500 ${className}`}>
        {/* Fallback to regular text if tajweed is not available */}
        {/* This would need to be replaced with actual Arabic text from the database */}
        ﴾الآية {verseNumber} من سورة {surahNumber}﴿
      </div>
    );
  }

  // Parse the tajweed text to convert it to HTML
  const parsedText = parseTajweed(text);

  return (
    <div 
      className={`${getArabicFontClass('md')} leading-loose ${className}`}
      dangerouslySetInnerHTML={{ __html: parsedText }}
    />
  );
}