import { Link, useLocation } from 'wouter';
import { Surah } from '@shared/schema';
import { getArabicFontClass } from '@/lib/fonts';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useEffect, useState } from 'react';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Menu, ChevronRight, X } from 'lucide-react';

interface SidebarProps {
  surahs: Surah[];
  isLoading: boolean;
  currentSurahNumber?: number;
}

// Define surah categories (Juz)
interface SurahGroup {
  id: string;
  name: string;
  range: [number, number]; // [start, end] surah numbers
}

const surahGroups: SurahGroup[] = [
  { id: 'group-1', name: 'Ҷузъи 1-5 (Сураҳо 1-6)', range: [1, 6] },
  { id: 'group-2', name: 'Ҷузъи 6-10 (Сураҳо 7-9)', range: [7, 9] },
  { id: 'group-3', name: 'Ҷузъи 11-15 (Сураҳо 10-20)', range: [10, 20] },
  { id: 'group-4', name: 'Ҷузъи 16-20 (Сураҳо 21-37)', range: [21, 37] },
  { id: 'group-5', name: 'Ҷузъи 21-25 (Сураҳо 38-51)', range: [38, 51] },
  { id: 'group-6', name: 'Ҷузъи 26-30 (Сураҳо 52-114)', range: [52, 114] },
];

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  surahs: Surah[];
  currentSurahNumber?: number;
  isLoading: boolean;
}

function MobileSidebar({ isOpen, onClose, surahs, currentSurahNumber, isLoading }: MobileSidebarProps) {
  const [openGroups, setOpenGroups] = useState<string[]>([]);
  
  // Automatically open group with current surah
  useEffect(() => {
    if (currentSurahNumber) {
      const groupWithCurrentSurah = surahGroups.find(
        group => currentSurahNumber >= group.range[0] && currentSurahNumber <= group.range[1]
      );
      
      if (groupWithCurrentSurah && !openGroups.includes(groupWithCurrentSurah.id)) {
        setOpenGroups(prev => [...prev, groupWithCurrentSurah.id]);
      }
    }
  }, [currentSurahNumber, openGroups]);
  
  // Render a single surah link item for mobile
  const renderSurahLink = (surah: Surah) => {
    const isActive = currentSurahNumber === surah.number;
    const baseLinkClass = "block p-2 rounded-md";
    const activeLinkClass = `${baseLinkClass} bg-gray-100 dark:bg-gray-700 text-primary dark:text-accent`;
    const inactiveLinkClass = `${baseLinkClass} hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300`;
    
    return (
      <Link 
        key={surah.id} 
        href={`/surah/${surah.number}`}
        className={isActive ? activeLinkClass : inactiveLinkClass}
        onClick={onClose} // Close drawer on click
      >
        <div className="flex justify-between items-center">
          <div>
            <span className="font-medium">{surah.number}. {surah.name_tajik}</span>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {surah.name_english} • {surah.verses_count} Оятҳо
            </p>
          </div>
          <span className={getArabicFontClass('sm')}>{surah.name_arabic}</span>
        </div>
      </Link>
    );
  };
  
  if (isLoading) {
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-primary dark:text-accent">Рӯйхати сураҳо</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-2">
              <div className="flex justify-between items-center">
                <div>
                  <Skeleton className="h-5 w-32 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-12" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-primary dark:text-accent">Рӯйхати сураҳо</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <ScrollArea className="h-[70vh]">
        <div className="pr-3">
          <Accordion
            type="multiple"
            value={openGroups}
            onValueChange={setOpenGroups}
            className="w-full"
          >
            {surahGroups.map(group => {
              // Filter surahs that belong to this group
              const groupSurahs = surahs.filter(
                s => s.number >= group.range[0] && s.number <= group.range[1]
              );
              
              // Check if any surah in this group is currently active
              const isGroupActive = currentSurahNumber 
                ? currentSurahNumber >= group.range[0] && currentSurahNumber <= group.range[1]
                : false;
              
              return (
                <AccordionItem 
                  key={group.id} 
                  value={group.id}
                  className={`border-b ${isGroupActive ? 'bg-gray-50 dark:bg-gray-900/20 rounded-md' : ''}`}
                >
                  <AccordionTrigger 
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700 px-2 py-1 rounded-md ${
                      isGroupActive ? 'text-primary dark:text-accent font-medium' : ''
                    }`}
                  >
                    <span className="text-sm">{group.name}</span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-1 pl-2">
                    {groupSurahs.map(surah => renderSurahLink(surah))}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </ScrollArea>
    </div>
  );
}

export default function Sidebar({ surahs, isLoading, currentSurahNumber }: SidebarProps) {
  const [location] = useLocation();
  const [openGroups, setOpenGroups] = useState<string[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Determine which group the current surah belongs to and open that group
  useEffect(() => {
    if (currentSurahNumber) {
      const groupWithCurrentSurah = surahGroups.find(
        group => currentSurahNumber >= group.range[0] && currentSurahNumber <= group.range[1]
      );
      
      if (groupWithCurrentSurah && !openGroups.includes(groupWithCurrentSurah.id)) {
        setOpenGroups(prev => [...prev, groupWithCurrentSurah.id]);
      }
    }
  }, [currentSurahNumber, openGroups]);
  
  if (isLoading) {
    return (
      <aside className="md:w-72 md:pr-6 hidden md:block">
        <div className="sticky top-32 overflow-auto max-h-[calc(100vh-8rem)] rounded-lg bg-white dark:bg-gray-800 shadow-md p-4 custom-scrollbar">
          <h2 className="text-lg font-bold mb-4 text-primary dark:text-accent border-b border-gray-200 dark:border-gray-700 pb-2">Рӯйхати сураҳо</h2>
          
          <div className="space-y-1">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="p-2">
                <div className="flex justify-between items-center">
                  <div>
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-6 w-12" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    );
  }
  
  // Render a single surah link item
  const renderSurahLink = (surah: Surah) => {
    const isActive = currentSurahNumber === surah.number;
    const baseLinkClass = "block p-2 rounded-md";
    const activeLinkClass = `${baseLinkClass} bg-gray-100 dark:bg-gray-700 text-primary dark:text-accent`;
    const inactiveLinkClass = `${baseLinkClass} hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300`;
    
    return (
      <Link 
        key={surah.id} 
        href={`/surah/${surah.number}`}
        className={isActive ? activeLinkClass : inactiveLinkClass}
      >
        <div className="flex justify-between items-center">
          <div>
            <span className="font-medium">{surah.number}. {surah.name_tajik}</span>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {surah.name_english} • {surah.verses_count} Оятҳо
            </p>
          </div>
          <span className={getArabicFontClass('sm')}>{surah.name_arabic}</span>
        </div>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile sidebar drawer */}
      <div className="block md:hidden">
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="fixed bottom-5 left-5 z-30 rounded-full bg-primary dark:bg-accent text-white shadow-lg"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </DrawerTrigger>
          <DrawerContent className="h-[85vh] px-0 pt-0 pb-0 bg-white dark:bg-gray-800">
            <MobileSidebar 
              isOpen={isDrawerOpen} 
              onClose={() => setIsDrawerOpen(false)} 
              surahs={surahs} 
              currentSurahNumber={currentSurahNumber} 
              isLoading={isLoading} 
            />
          </DrawerContent>
        </Drawer>
      </div>
      
      {/* Desktop sidebar */}
      <aside className="md:w-72 md:pr-6 hidden md:block">
        <div className="sticky top-32 overflow-auto max-h-[calc(100vh-8rem)] rounded-lg bg-white dark:bg-gray-800 shadow-md p-4 custom-scrollbar">
          <h2 className="text-lg font-bold mb-4 text-primary dark:text-accent border-b border-gray-200 dark:border-gray-700 pb-2">Рӯйхати сураҳо</h2>
          
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="pr-3">
              <Accordion
                type="multiple"
                value={openGroups}
                onValueChange={setOpenGroups}
                className="w-full"
              >
                {surahGroups.map(group => {
                  // Filter surahs that belong to this group
                  const groupSurahs = surahs.filter(
                    s => s.number >= group.range[0] && s.number <= group.range[1]
                  );
                  
                  // Check if any surah in this group is currently active
                  const isGroupActive = currentSurahNumber 
                    ? currentSurahNumber >= group.range[0] && currentSurahNumber <= group.range[1]
                    : false;
                  
                  return (
                    <AccordionItem 
                      key={group.id} 
                      value={group.id}
                      className={`border-b ${isGroupActive ? 'bg-gray-50 dark:bg-gray-900/20 rounded-md' : ''}`}
                    >
                      <AccordionTrigger 
                        className={`hover:bg-gray-50 dark:hover:bg-gray-700 px-2 py-1 rounded-md ${
                          isGroupActive ? 'text-primary dark:text-accent font-medium' : ''
                        }`}
                      >
                        <span className="text-sm">{group.name}</span>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-1 pl-2">
                        {groupSurahs.map(surah => renderSurahLink(surah))}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </div>
          </ScrollArea>
        </div>
      </aside>
    </>
  );
}
