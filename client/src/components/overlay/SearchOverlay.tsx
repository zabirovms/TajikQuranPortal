import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getArabicFontClass } from '@/lib/fonts';
import { useSurahs } from '@/hooks/useQuran';
import { useSearchVerses } from '@/hooks/useQuran';
import { Search, X, AlertCircle } from 'lucide-react';
import { useLocation } from 'wouter';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState<'arabic' | 'tajik' | 'both'>('both');
  const [selectedSurah, setSelectedSurah] = useState<string | undefined>(undefined);
  const [searchActive, setSearchActive] = useState(false);
  const [, navigate] = useLocation();
  
  // Get list of surahs for the dropdown
  const { data: surahs, isLoading: isSurahsLoading } = useSurahs();
  
  // Only search when user has typed something and pressed Enter or clicked Search
  const { data: searchResults, isLoading: isSearching } = useSearchVerses(
    searchActive ? query : '', 
    language,
    selectedSurah ? parseInt(selectedSurah) : undefined
  );
  
  // Reset search state when closing the overlay
  useEffect(() => {
    if (!isOpen) {
      setSearchActive(false);
    }
  }, [isOpen]);
  
  // Handle search submission
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (query.trim()) {
      setSearchActive(true);
    }
  };
  
  // Handle navigation to a verse
  const navigateToVerse = (verseKey: string) => {
    const [surahNum, verseNum] = verseKey.split(':');
    navigate(`/surah/${surahNum}#verse-${verseKey.replace(':', '-')}`);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl" onInteractOutside={onClose}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">Ҷустуҷӯи Қуръон</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </Button>
        </div>
        
        <div className="p-4">
          <form onSubmit={handleSearch}>
            <div className="relative mb-4">
              <Input 
                type="text" 
                placeholder="Матн ё рақами оятро ҷустуҷӯ кунед (масалан, 2:255)" 
                className="pl-10 pr-4 py-2"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                <Search className="h-4 w-4" />
              </div>
              <Button 
                type="submit" 
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 px-2"
                disabled={!query.trim()}
              >
                Ҷустуҷӯ
              </Button>
            </div>
          
            <div className="flex gap-2 mb-4">
              <div className="flex-1">
                <Label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Забон</Label>
                <Select 
                  value={language} 
                  onValueChange={(value) => setLanguage(value as 'arabic' | 'tajik' | 'both')}
                >
                  <SelectTrigger className="w-full bg-gray-100 dark:bg-gray-700">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="arabic">Арабӣ</SelectItem>
                    <SelectItem value="tajik">Тоҷикӣ</SelectItem>
                    <SelectItem value="both">Ҳарду</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1">
                <Label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Сура</Label>
                <Select 
                  value={selectedSurah} 
                  onValueChange={setSelectedSurah}
                >
                  <SelectTrigger className="w-full bg-gray-100 dark:bg-gray-700">
                    <SelectValue placeholder="Ҳамаи сураҳо" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Ҳамаи сураҳо</SelectItem>
                    {surahs?.map(surah => (
                      <SelectItem key={surah.id} value={surah.number.toString()}>
                        {surah.number}. {surah.name_tajik}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </form>
          
          <Card className="max-h-60 overflow-y-auto custom-scrollbar bg-gray-50 dark:bg-gray-900 p-0">
            <ScrollArea className="h-60 rounded-md">
              {!searchActive && (
                <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                  <Search className="h-8 w-8 mx-auto mb-2" />
                  <p>Барои оғози ҷустуҷӯ матнро ворид кунед</p>
                </div>
              )}
              
              {searchActive && isSearching && (
                <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p>Ҷустуҷӯ...</p>
                </div>
              )}
              
              {searchActive && !isSearching && searchResults?.length === 0 && (
                <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>Ягон натиҷа ёфт нашуд</p>
                </div>
              )}
              
              {searchActive && !isSearching && searchResults && searchResults.length > 0 && (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {searchResults.map(verse => (
                    <div 
                      key={verse.id} 
                      className="p-4 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                      onClick={() => navigateToVerse(verse.unique_key)}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-primary dark:text-accent">
                          {verse.unique_key}
                        </span>
                      </div>
                      <div className={`${getArabicFontClass('sm')} mb-2 line-clamp-1`}>
                        {verse.arabic_text}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {verse.tajik_text}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
