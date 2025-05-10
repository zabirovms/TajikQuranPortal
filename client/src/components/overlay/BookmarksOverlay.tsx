import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getArabicFontClass } from '@/lib/fonts';
import { useBookmarks, useRemoveBookmark } from '@/hooks/useBookmarks';
import { useToast } from '@/hooks/use-toast';
import { X, Trash2, BookmarkIcon } from 'lucide-react';
import { useLocation } from 'wouter';
import { format } from 'date-fns';

interface BookmarksOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BookmarksOverlay({ isOpen, onClose }: BookmarksOverlayProps) {
  const { data: bookmarks, isLoading } = useBookmarks();
  const removeBookmark = useRemoveBookmark();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Navigate to a bookmarked verse
  const navigateToVerse = (verseKey: string) => {
    const [surahNum, verseNum] = verseKey.split(':');
    navigate(`/surah/${surahNum}#verse-${verseKey.replace(':', '-')}`);
    onClose();
  };
  
  // Handle bookmark deletion
  const handleDeleteBookmark = (bookmarkId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when clicking delete
    
    removeBookmark.mutate(bookmarkId, {
      onSuccess: () => {
        toast({
          title: "Bookmark removed",
          description: "Verse removed from bookmarks.",
        });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to remove bookmark.",
          variant: "destructive"
        });
      }
    });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl" onInteractOutside={onClose}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">Захирагоҳи шумо</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </Button>
        </div>
        
        <div className="p-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-gray-500 dark:text-gray-400">Дар ҳоли боргирӣ...</p>
            </div>
          ) : !bookmarks || bookmarks.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <BookmarkIcon className="h-8 w-8 mx-auto mb-2" />
              <p>Шумо ҳоло ягон захира надоред</p>
              <p className="text-sm mt-2">Барои илова кардани захира, дар вақти хондани Қуръон тугмаи захираро пахш кунед</p>
            </div>
          ) : (
            <ScrollArea className="max-h-96 overflow-y-auto custom-scrollbar pr-2">
              {bookmarks.map(({ bookmark, verse }) => (
                <div 
                  key={bookmark.id} 
                  className="border-b border-gray-200 dark:border-gray-700 last:border-b-0 py-3 cursor-pointer"
                  onClick={() => navigateToVerse(verse.unique_key)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center mb-1">
                        <span className="bg-primary dark:bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mr-2">
                          {verse.unique_key.split(':')[0]}
                        </span>
                        <span className="text-sm font-medium">
                          Сураи {verse.unique_key.split(':')[0]}, ояти {verse.verse_number}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Илова шуда дар {format(new Date(bookmark.created_at), 'MMM d, yyyy')}
                      </p>
                      <div className={`${getArabicFontClass('sm')} text-right text-base mb-1 line-clamp-1`}>
                        {verse.arabic_text}
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-red-500 hover:text-red-700"
                      onClick={(e) => handleDeleteBookmark(bookmark.id, e)}
                      disabled={removeBookmark.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-2 flex">
                    <Button 
                      variant="link" 
                      className="text-primary dark:text-accent text-sm p-0 h-auto"
                    >
                      Гузаштан ба оят
                    </Button>
                  </div>
                </div>
              ))}
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
