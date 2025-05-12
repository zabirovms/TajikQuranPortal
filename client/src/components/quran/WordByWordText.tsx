import { useState, useCallback, useEffect } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { getArabicFontClass } from '@/lib/fonts';
import { useQuery } from '@tanstack/react-query';

import { cn } from '@/lib/utils';


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
  // Add a state for the active word (hovered or clicked) - MUST BE BEFORE ANY CONDITIONALS
  const [activeWordPos, setActiveWordPos] = useState<number | null>(null);

  // Function to handle word interaction
  const handleWordInteraction = (position: number) => {
    setActiveWordPos(position);
  };
  
  // Fetch word analysis data
  const { data: wordAnalysis, isLoading, error } = useQuery({
    queryKey: ['/api/word-analysis', surahNumber, verseNumber],
    queryFn: async () => {
      const response = await fetch(`/api/word-analysis/${surahNumber}/${verseNumber}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
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
        <TooltipProvider delayDuration={100}>
          {Array.isArray(wordAnalysis) && wordAnalysis.map((word: any) => (
            <span 
              key={word.word_position} 
              className="inline-block relative"
              onMouseEnter={() => handleWordInteraction(word.word_position)}
              onMouseLeave={() => setActiveWordPos(null)}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <span 
                    className={cn(
                      "px-0.5 cursor-pointer transition-colors duration-200",
                      activeWordPos === word.word_position 
                        ? "text-primary dark:text-accent bg-primary/5 dark:bg-accent/10 rounded" 
                        : "hover:text-primary dark:hover:text-accent"
                    )}
                  >
                    {word.word_text}
                  </span>
                </TooltipTrigger>
                <TooltipContent 
                  side="bottom" 
                  align="center"
                  className="bg-white dark:bg-gray-800 z-50 max-w-xs shadow-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="text-center p-2">
                    <div className="font-medium mb-1 text-gray-800 dark:text-gray-200">
                      {word.word_text}
                    </div>
                    
                    <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                      <span className="italic">{word.transliteration || "талаффуз"}</span>
                    </div>
                    
                    <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                      {word.translation || "тарҷума"}
                    </div>
                    
                    <div className="text-xs text-muted-foreground mt-1 border-t border-gray-100 dark:border-gray-700 pt-1">
                      Калимаи {word.word_position}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </span>
          ))}
        </TooltipProvider>
      </div>
    </div>
  );
}