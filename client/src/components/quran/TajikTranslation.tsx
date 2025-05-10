import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface TajikTranslationProps {
  verseKey: string;
  surahNumber: number;
  verseNumber: number;
  defaultText: string;
  translatorId: string;
}

/**
 * Placeholder translations for different translators.
 * This will be replaced with real API data when the endpoint is working
 */
const PLACEHOLDER_STYLES = {
  'mubin': {
    fontStyle: 'italic'
  },
  'sadoi_islom': {
    fontWeight: 'bold'
  }
};

export default function TajikTranslation({
  verseKey,
  surahNumber,
  verseNumber,
  defaultText,
  translatorId,
}: TajikTranslationProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // State to hold the final text to display
  const [translationText, setTranslationText] = useState(defaultText);
  
  // Simulate different translations by applying different styles
  // This is temporary until the API works
  useEffect(() => {
    if (translatorId === 'default') {
      setTranslationText(defaultText);
      return;
    }
    
    // Simulate API loading
    setIsLoading(true);
    
    // Simulate a network request
    const timer = setTimeout(() => {
      setIsLoading(false);
      
      // For demo purposes, we'll use the default text but add a note
      // about which translator would be used
      setTranslationText(`${defaultText} (${translatorId})`);
      
      // Show toast that this is a simulated translation
      if (translatorId !== 'default') {
        toast({
          title: "API Connection Issue",
          description: "Using simulated translation data. The Quran Foundation API is currently unavailable.",
          variant: "destructive",
        });
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [defaultText, translatorId, toast]);

  // Loading state
  if (isLoading) {
    return <Skeleton className="h-16 w-full" />;
  }
  
  // Apply different styles based on the translator
  const style = PLACEHOLDER_STYLES[translatorId as keyof typeof PLACEHOLDER_STYLES] || {};
  
  // Render the translation with appropriate style
  return <p style={style}>{translationText}</p>;
}