import { useEffect, useState } from 'react';
import { useTajweedMode } from '@/hooks/useTajweedMode';
import { fetchTajweedAyah, parseTajweed } from '@/lib/tajweed';
import { cn } from '@/lib/utils';
import { getArabicFontClass } from '@/lib/fonts';

interface TajweedTextProps {
  verseKey: string;
  surahNumber: number;
  verseNumber: number;
  plainText: string;
  className?: string;
}

export default function TajweedText({ 
  verseKey, 
  surahNumber, 
  verseNumber, 
  plainText, 
  className 
}: TajweedTextProps) {
  const { tajweedMode } = useTajweedMode();
  const [tajweedHtml, setTajweedHtml] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTajweedText() {
      if (!tajweedMode) {
        setTajweedHtml('');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const tajweedText = await fetchTajweedAyah(surahNumber, verseNumber);
        const parsedHtml = parseTajweed(tajweedText);
        setTajweedHtml(parsedHtml);
      } catch (err) {
        console.error('Error loading tajweed text:', err);
        setError('Хатои боркунии матни таҷвид');
        setTajweedHtml('');
      } finally {
        setIsLoading(false);
      }
    }

    loadTajweedText();
  }, [surahNumber, verseNumber, tajweedMode]);

  if (error) {
    return (
      <div className={cn("tajweed-text", getArabicFontClass('lg'), className)}>
        {plainText}
      </div>
    );
  }

  if (!tajweedMode || isLoading || !tajweedHtml) {
    return (
      <div className={cn("text-arabic", getArabicFontClass('lg'), className)}>
        {plainText}
      </div>
    );
  }

  return (
    <div 
      className={cn("tajweed-text", getArabicFontClass('lg'), className)}
      dangerouslySetInnerHTML={{ __html: tajweedHtml }}
    />
  );
}