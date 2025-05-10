import { Link, useLocation } from 'wouter';
import { Surah } from '@shared/schema';
import { getArabicFontClass } from '@/lib/fonts';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

interface SidebarProps {
  surahs: Surah[];
  isLoading: boolean;
  currentSurahNumber?: number;
}

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  surahs: Surah[];
  currentSurahNumber?: number;
  isLoading: boolean;
}

function MobileSidebar({ isOpen, onClose, surahs, currentSurahNumber, isLoading }: MobileSidebarProps) {  
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
        <div className="pr-3 space-y-1">
          {surahs.map(surah => renderSurahLink(surah))}
        </div>
      </ScrollArea>
    </div>
  );
}

export default function Sidebar({ surahs, isLoading, currentSurahNumber }: SidebarProps) {
  const [location] = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
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
      
      {/* Desktop sidebar */}
      <aside className="md:w-72 md:pr-6 hidden md:block">
        <div className="sticky top-32 overflow-auto max-h-[calc(100vh-8rem)] rounded-lg bg-white dark:bg-gray-800 shadow-md p-4 custom-scrollbar">
          <h2 className="text-lg font-bold mb-4 text-primary dark:text-accent border-b border-gray-200 dark:border-gray-700 pb-2">Рӯйхати сураҳо</h2>
          
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="pr-3 space-y-1">
              {surahs.map(surah => renderSurahLink(surah))}
            </div>
          </ScrollArea>
        </div>
      </aside>
    </>
  );
}