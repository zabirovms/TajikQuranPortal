import React, { useState } from 'react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import { useTajweedMode } from '@/hooks/useTajweedMode';
import { useTranslation, availableTranslators } from '@/hooks/useTranslation';
import { GlobalOverlayType } from '@/App';
import { 
  Sun, Moon, BookmarkIcon, Settings, Book, Languages
} from 'lucide-react';

interface SettingsMenuProps {
  onOpenOverlay: (type: GlobalOverlayType) => void;
}

export default function SettingsMenu({ onOpenOverlay }: SettingsMenuProps) {
  const { theme, setTheme } = useTheme();
  const { tajweedMode, toggleTajweedMode } = useTajweedMode();
  const { translatorId, setTranslatorId, currentTranslator } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const handleThemeToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
    setIsOpen(false);
  };

  const handleOpenBookmarks = () => {
    onOpenOverlay('bookmarks');
    setIsOpen(false);
  };

  const handleTajweedToggle = (checked: boolean) => {
    toggleTajweedMode();
    // Don't close the menu on tajweed toggle
  };

  const handleSelectTranslator = (id: string) => {
    setTranslatorId(id);
    setIsOpen(false);
  };

  // We'll completely replace the dropdown approach since it's causing issues
  // and use a simpler dialog approach
  const [menuOpen, setMenuOpen] = React.useState(false);
  
  if (!menuOpen) {
    return (
      <Button
        variant="ghost"
        size="icon"
        aria-label="Settings"
        onClick={() => setMenuOpen(true)}
      >
        <Settings className="h-5 w-5 text-gray-600 dark:text-gray-300" />
      </Button>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setMenuOpen(false)}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 w-[90%] max-w-[300px]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">Танзимот</h3>
          <Button variant="ghost" size="sm" onClick={() => setMenuOpen(false)}>×</Button>
        </div>
        
        <div className="space-y-3">
          {/* Bookmarks */}
          <div 
            className="flex items-center cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            onClick={() => {
              handleOpenBookmarks();
              setMenuOpen(false);
            }}
          >
            <BookmarkIcon className="h-4 w-4 mr-2" />
            <span>Хатчӯбҳо</span>
          </div>
          
          {/* Tajweed Toggle */}
          <div className="flex justify-between items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <div className="flex items-center">
              <Book className="h-4 w-4 mr-2" />
              <span>Таҷвид</span>
            </div>
            <Switch 
              checked={tajweedMode} 
              onCheckedChange={handleTajweedToggle}
              aria-label="Toggle Tajweed mode"
            />
          </div>
          
          {/* Theme Toggle */}
          <div 
            className="flex justify-between items-center cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            onClick={handleThemeToggle}
          >
            <div className="flex items-center">
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 mr-2 text-yellow-300" />
              ) : (
                <Moon className="h-4 w-4 mr-2" />
              )}
              <span>{theme === 'dark' ? 'Равшан' : 'Торик'}</span>
            </div>
          </div>
          
          {/* Translations Heading */}
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-2 px-2">
              <Languages className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Тарҷумаҳо</span>
            </div>
            
            {/* Translation Options */}
            <div className="space-y-1 ml-2">
              {availableTranslators.map(translator => (
                <div 
                  key={translator.id}
                  className="flex justify-between items-center cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  onClick={() => handleSelectTranslator(translator.id)}
                >
                  <span>{translator.name}</span>
                  {translatorId === translator.id && (
                    <div className="h-3 w-3 bg-primary rounded-full"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}