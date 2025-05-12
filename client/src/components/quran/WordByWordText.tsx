import { useState, useCallback, useEffect } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { getArabicFontClass } from '@/lib/fonts';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { cn } from '@/lib/utils';
import { WordAnalysis } from '@shared/schema';

// Types
interface WordByWordTextProps {
  surahNumber: number;
  verseNumber: number;
  plainText: string;
  className?: string;
}

interface WordData {
  id: number;
  verse_id: number;
  word_position: number;
  word_text: string;
  translation: string | null;
  transliteration: string | null;
  root: string | null;
  part_of_speech: string | null;
}

/**
 * Displays Arabic text with word-by-word translation on hover
 */
export default function WordByWordText({
  surahNumber,
  verseNumber,
  plainText,
  className
}: WordByWordTextProps) {
  // Fetch word analysis data
  const { data: wordAnalysis, isLoading, error } = useQuery({
    queryKey: ['/api/word-analysis', surahNumber, verseNumber],
    queryFn: () => apiRequest<WordData[]>(`/api/word-analysis/${surahNumber}/${verseNumber}`),
    enabled: !!surahNumber && !!verseNumber,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  const arabicFontClass = getArabicFontClass('lg');
  
  // If loading, return skeleton
  if (isLoading) {
    return (
      <div className={cn("text-right", className)}>
        <div className={arabicFontClass}>
          <Skeleton className="h-10 w-full mb-2" />
          <Skeleton className="h-10 w-3/4 mb-2" />
        </div>
      </div>
    );
  }
  
  // If error, or if API not ready yet, fall back to plain text
  if (error || !wordAnalysis) {
    return (
      <div className={cn("text-right", className)}>
        <div className={arabicFontClass}>
          {plainText}
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn("text-right", className)}>
      <div className={arabicFontClass}>
        <TooltipProvider>
          {wordAnalysis.map((word) => (
            <span key={word.word_position} className="inline-block">
              {word.translation || word.transliteration ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="hover:text-primary dark:hover:text-accent cursor-pointer px-0.5">
                      {word.word_text}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-white dark:bg-gray-800 z-50 max-w-xs">
                    <div className="text-center">
                      {word.transliteration && (
                        <div className="font-medium mb-1 text-gray-700 dark:text-gray-300">
                          {word.transliteration}
                        </div>
                      )}
                      {word.translation && (
                        <div className="text-sm">
                          {word.translation}
                        </div>
                      )}
                      {word.root && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          Корен: {word.root}
                        </div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <span className="px-0.5">{word.word_text}</span>
              )}
            </span>
          ))}
        </TooltipProvider>
      </div>
    </div>
  );
}