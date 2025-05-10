import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Verse } from '@shared/schema';
import { getArabicFontClass, formatArabicNumber } from '@/lib/fonts';
import { 
  Play, Copy, Share, BookmarkIcon, Image as ImageIcon
} from 'lucide-react';
import { useAudioPlayer } from '@/hooks/useAudio';
import { useToast } from '@/hooks/use-toast';
import { useIsVerseBookmarked, useAddBookmark, useRemoveBookmark } from '@/hooks/useBookmarks';
import { useTranslation } from '@/hooks/useTranslation';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import TajweedText from './TajweedText';

interface VerseItemProps {
  verse: Verse;
  surahName: string;
  isLoading?: boolean;
}

export default function VerseItem({ verse, surahName, isLoading = false }: VerseItemProps) {
  const { playAudio } = useAudioPlayer();
  const { toast } = useToast();
  const { translatorId, currentTranslator } = useTranslation();
  
  const { isBookmarked, bookmarkId, isLoading: isBookmarkLoading } = useIsVerseBookmarked(verse.id);
  const addBookmark = useAddBookmark();
  const removeBookmark = useRemoveBookmark();
  
  // Generate verse image URL from Islamic Network CDN
  const getVerseImageUrl = (highRes = false) => {
    // Extract surah number from the unique key (format: surah:verse)
    const [surahNumber, verseNumber] = verse.unique_key.split(':');
    return highRes
      ? `https://cdn.islamic.network/quran/images/high-resolution/${surahNumber}_${verseNumber}.png`
      : `https://cdn.islamic.network/quran/images/${surahNumber}_${verseNumber}.png`;
  };
  
  // Handle playing audio for this verse
  const handlePlayAudio = () => {
    // Use verse key directly with AlQuran Cloud API
    playAudio(verse.unique_key, {
      surahName: surahName,
      verseNumber: verse.verse_number
    });
  };
  
  // Handle copying verse text
  const handleCopyVerse = () => {
    const textToCopy = `${verse.arabic_text}\n\n${verse.tajik_text}\n\n(${verse.unique_key})`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      toast({
        title: "Copied to clipboard",
        description: "Verse text copied to clipboard.",
      });
    });
  };
  
  // Handle sharing verse
  const handleShareVerse = () => {
    if (navigator.share) {
      navigator.share({
        title: `Quran - ${verse.unique_key}`,
        text: `${verse.arabic_text}\n\n${verse.tajik_text}`,
        url: `${window.location.href.split('#')[0]}#verse-${verse.unique_key.replace(':', '-')}`
      }).catch(() => {
        // Fallback if share fails
        handleCopyVerse();
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      handleCopyVerse();
    }
  };
  
  // Handle bookmark toggle
  const toggleBookmark = () => {
    if (isBookmarked && bookmarkId) {
      removeBookmark.mutate(bookmarkId);
      toast({
        title: "Bookmark removed",
        description: "Verse removed from bookmarks."
      });
    } else {
      addBookmark.mutate(verse.id);
      toast({
        title: "Bookmark added", 
        description: "Verse added to bookmarks."
      });
    }
  };
  
  if (isLoading) {
    return (
      <Card className="mb-6 overflow-hidden">
        <div className="border-b border-gray-100 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
          <div className="flex items-center">
            <Skeleton className="w-8 h-8 rounded-full mr-2" />
            <Skeleton className="w-12 h-4" />
          </div>
          
          <div className="flex items-center space-x-2">
            <Skeleton className="w-6 h-6 rounded-full" />
            <Skeleton className="w-6 h-6 rounded-full" />
            <Skeleton className="w-6 h-6 rounded-full" />
            <Skeleton className="w-6 h-6 rounded-full" />
            <Skeleton className="w-6 h-6 rounded-full" />
          </div>
        </div>
        
        <CardContent className="p-4 md:p-6">
          <Skeleton className="w-full h-12 mb-4" />
          <Skeleton className="w-full h-4 mb-1" />
          <Skeleton className="w-3/4 h-4" />
        </CardContent>
      </Card>
    );
  }
  
  const verseId = `verse-${verse.unique_key.replace(':', '-')}`;
  const isBookmarkPending = addBookmark.isPending || removeBookmark.isPending;
  
  return (
    <Card 
      id={verseId} 
      className={`mb-6 overflow-hidden ${isBookmarked ? 'ring-2 ring-accent' : ''}`}
      data-verse={verse.unique_key}
    >
      <div className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
        {/* Mobile header - stacked */}
        <div className="md:hidden">
          <div className="p-3 flex justify-between items-center">
            <div className="flex items-center">
              <span className="ayah-number bg-primary dark:bg-accent text-white text-sm">
                {formatArabicNumber(verse.verse_number)}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">{verse.unique_key}</span>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className={isBookmarked ? "text-accent" : "text-gray-400 hover:text-accent"}
              onClick={toggleBookmark}
              disabled={isBookmarkPending || isBookmarkLoading}
              title={isBookmarked ? "Remove Bookmark" : "Add Bookmark"}
            >
              <BookmarkIcon className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
            </Button>
          </div>
          
          <div className="px-3 pb-3 flex justify-between items-center">
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-400 hover:text-primary dark:hover:text-accent"
                onClick={handlePlayAudio}
                title="Play Audio"
              >
                <Play className="h-4 w-4" />
              </Button>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-primary dark:hover:text-accent"
                    title="View Verse Image"
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[90vw] sm:max-w-[700px]">
                  <DialogTitle className="text-center">Quran Verse {verse.unique_key}</DialogTitle>
                  <div className="pt-4 px-4">
                    <AspectRatio ratio={16/9} className="bg-white rounded-lg p-6">
                      <img 
                        src={getVerseImageUrl(true)} 
                        alt={`Quran verse ${verse.unique_key}`}
                        className="object-contain h-full w-full"
                        onError={(e) => {
                          // If high-res image fails, try standard resolution
                          const target = e.target as HTMLImageElement;
                          if (target.src.includes('high-resolution')) {
                            target.src = getVerseImageUrl(false);
                          }
                        }}
                      />
                    </AspectRatio>
                    <div className="mt-4 text-center text-sm text-muted-foreground">
                      Surah {surahName}, Verse {verse.verse_number}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-400 hover:text-primary dark:hover:text-accent"
                onClick={handleCopyVerse}
                title="Copy Verse"
              >
                <Copy className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-400 hover:text-primary dark:hover:text-accent"
                onClick={handleShareVerse}
                title="Share Verse"
              >
                <Share className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Desktop header - one row */}
        <div className="hidden md:flex md:justify-between md:items-center md:p-3">
          <div className="flex items-center">
            <span className="ayah-number bg-primary dark:bg-accent text-white text-sm">
              {formatArabicNumber(verse.verse_number)}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">{verse.unique_key}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-primary dark:hover:text-accent"
              onClick={handlePlayAudio}
              title="Play Audio"
            >
              <Play className="h-4 w-4" />
            </Button>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-primary dark:hover:text-accent"
                  title="View Verse Image"
                >
                  <ImageIcon className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px]">
                <DialogTitle className="text-center">Quran Verse {verse.unique_key}</DialogTitle>
                <div className="pt-4 px-4">
                  <AspectRatio ratio={16/9} className="bg-white rounded-lg p-6">
                    <img 
                      src={getVerseImageUrl(true)} 
                      alt={`Quran verse ${verse.unique_key}`}
                      className="object-contain h-full w-full"
                      onError={(e) => {
                        // If high-res image fails, try standard resolution
                        const target = e.target as HTMLImageElement;
                        if (target.src.includes('high-resolution')) {
                          target.src = getVerseImageUrl(false);
                        }
                      }}
                    />
                  </AspectRatio>
                  <div className="mt-4 text-center text-sm text-muted-foreground">
                    Surah {surahName}, Verse {verse.verse_number}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-primary dark:hover:text-accent"
              onClick={handleCopyVerse}
              title="Copy Verse"
            >
              <Copy className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-primary dark:hover:text-accent"
              onClick={handleShareVerse}
              title="Share Verse"
            >
              <Share className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className={isBookmarked ? "text-accent" : "text-gray-400 hover:text-accent"}
              onClick={toggleBookmark}
              disabled={isBookmarkPending || isBookmarkLoading}
              title={isBookmarked ? "Remove Bookmark" : "Add Bookmark"}
            >
              <BookmarkIcon className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
            </Button>
          </div>
        </div>
      </div>
      
      <CardContent className="p-4 md:p-6">
        {/* Arabic Text with Tajweed support */}
        <TajweedText 
          surahNumber={parseInt(verse.unique_key.split(':')[0])}
          verseNumber={verse.verse_number}
          plainText={verse.arabic_text}
          className="text-right mb-4"
        />
        
        <div className="border-t border-gray-100 dark:border-gray-700 pt-4 text-gray-800 dark:text-gray-200">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">Тарҷумаи тоҷикӣ:</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">{currentTranslator.name}</p>
          </div>
          <p>{
            // For now, always show the default translation until API integration is complete
            translatorId === 'default' 
              ? verse.tajik_text
              : verse.tajik_text // This will be replaced with API-sourced translations
          }</p>
        </div>
      </CardContent>
    </Card>
  );
}
