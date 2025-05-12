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
        <h2 className="text-lg font-bold text-primary dark:text-accent">Қуръони Карим</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Popular Surahs Section */}
      <div className="mb-4">
        <h3 className="text-md font-medium mb-2 text-primary dark:text-accent">
          Сураҳои маъмул
        </h3>
        <div className="grid grid-cols-2 gap-2 mb-2">
          {/* Al-Fatiha */}
          <Link
            href="/surah/1"
            className="px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 text-center"
            onClick={onClose}
          >
            <div className="font-medium text-sm">Ал-Фотиҳа</div>
            <div className={`${getArabicFontClass('sm')} text-gray-600 dark:text-gray-400`}>الفاتحة</div>
          </Link>
          
          {/* Al-Baqarah */}
          <Link
            href="/surah/2"
            className="px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 text-center"
            onClick={onClose}
          >
            <div className="font-medium text-sm">Ал-Бақара</div>
            <div className={`${getArabicFontClass('sm')} text-gray-600 dark:text-gray-400`}>البقرة</div>
          </Link>
          
          {/* Ya-Sin */}
          <Link
            href="/surah/36"
            className="px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 text-center"
            onClick={onClose}
          >
            <div className="font-medium text-sm">Ё-Син</div>
            <div className={`${getArabicFontClass('sm')} text-gray-600 dark:text-gray-400`}>يس</div>
          </Link>
          
          {/* Al-Ikhlas */}
          <Link
            href="/surah/112"
            className="px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 text-center"
            onClick={onClose}
          >
            <div className="font-medium text-sm">Ал-Ихлос</div>
            <div className={`${getArabicFontClass('sm')} text-gray-600 dark:text-gray-400`}>الإخلاص</div>
          </Link>
        </div>
      </div>
      
      {/* Last Read Position */}
      {localStorage.getItem('lastReadPosition') && (
        <div className="mb-4 bg-gradient-to-r from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 rounded-lg p-3">
          <h3 className="text-sm font-medium text-primary dark:text-accent mb-1">
            Саҳифаи охирон хондашуда
          </h3>
          <Link 
            href={`/surah/${JSON.parse(localStorage.getItem('lastReadPosition') || '{}').surahNumber || 1}`}
            className="flex items-center justify-between bg-white dark:bg-gray-800 px-3 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/80"
            onClick={onClose}
          >
            <div className="text-sm">
              {JSON.parse(localStorage.getItem('lastReadPosition') || '{}').surahName || 'Al-Fatiha'}
            </div>
            <div className="text-xs bg-primary/10 dark:bg-accent/10 text-primary dark:text-accent px-2 py-0.5 rounded">
              Оят {JSON.parse(localStorage.getItem('lastReadPosition') || '{}').verseNumber || 1}
            </div>
          </Link>
        </div>
      )}
      
      {/* All Surahs */}
      <h3 className="text-md font-medium mb-2 text-primary dark:text-accent">
        Ҳамаи сураҳо
      </h3>
      <ScrollArea className="h-[50vh]">
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
        <div className="sticky top-32 overflow-auto max-h-[calc(100vh-8rem)] space-y-4">
          {/* Popular Surahs Section - Moved to top */}
          <div className="rounded-lg bg-white dark:bg-gray-800 shadow-md p-4">
            <h2 className="text-lg font-bold mb-3 text-primary dark:text-accent">
              Сураҳои маъмул
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {/* Al-Fatiha */}
              <Link
                href="/surah/1"
                className="px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 text-center"
              >
                <div className="font-medium text-sm">Ал-Фотиҳа</div>
                <div className={`${getArabicFontClass('sm')} text-gray-600 dark:text-gray-400`}>الفاتحة</div>
              </Link>
              
              {/* Al-Baqarah */}
              <Link
                href="/surah/2"
                className="px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 text-center"
              >
                <div className="font-medium text-sm">Ал-Бақара</div>
                <div className={`${getArabicFontClass('sm')} text-gray-600 dark:text-gray-400`}>البقرة</div>
              </Link>
              
              {/* Ya-Sin */}
              <Link
                href="/surah/36"
                className="px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 text-center"
              >
                <div className="font-medium text-sm">Ё-Син</div>
                <div className={`${getArabicFontClass('sm')} text-gray-600 dark:text-gray-400`}>يس</div>
              </Link>
              
              {/* Ar-Rahman */}
              <Link
                href="/surah/55"
                className="px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 text-center"
              >
                <div className="font-medium text-sm">Ар-Раҳмон</div>
                <div className={`${getArabicFontClass('sm')} text-gray-600 dark:text-gray-400`}>الرحمن</div>
              </Link>
              
              {/* Al-Mulk */}
              <Link
                href="/surah/67"
                className="px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 text-center"
              >
                <div className="font-medium text-sm">Ал-Мулк</div>
                <div className={`${getArabicFontClass('sm')} text-gray-600 dark:text-gray-400`}>الملك</div>
              </Link>
              
              {/* Al-Ikhlas */}
              <Link
                href="/surah/112"
                className="px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 text-center"
              >
                <div className="font-medium text-sm">Ал-Ихлос</div>
                <div className={`${getArabicFontClass('sm')} text-gray-600 dark:text-gray-400`}>الإخلاص</div>
              </Link>
            </div>
          </div>
          
          {/* Last Read Position - as a pill in the sidebar */}
          {localStorage.getItem('lastReadPosition') && (
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 rounded-lg p-3 shadow-sm">
              <h3 className="text-sm font-medium text-primary dark:text-accent mb-1">
                Саҳифаи охирон хондашуда
              </h3>
              <Link 
                href={`/surah/${JSON.parse(localStorage.getItem('lastReadPosition') || '{}').surahNumber || 1}`}
                className="flex items-center justify-between bg-white dark:bg-gray-800 px-3 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/80"
              >
                <div className="text-sm">
                  {JSON.parse(localStorage.getItem('lastReadPosition') || '{}').surahName || 'Al-Fatiha'}
                </div>
                <div className="text-xs bg-primary/10 dark:bg-accent/10 text-primary dark:text-accent px-2 py-0.5 rounded">
                  Оят {JSON.parse(localStorage.getItem('lastReadPosition') || '{}').verseNumber || 1}
                </div>
              </Link>
            </div>
          )}
          
          {/* All Surahs */}
          <div className="rounded-lg bg-white dark:bg-gray-800 shadow-md p-4 custom-scrollbar">
            <h2 className="text-lg font-bold mb-4 text-primary dark:text-accent border-b border-gray-200 dark:border-gray-700 pb-2">Рӯйхати сураҳо</h2>
            
            <ScrollArea className="h-[calc(100vh-18rem)]">
              <div className="pr-3 space-y-1">
                {surahs.map(surah => renderSurahLink(surah))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </aside>
    </>
  );
}