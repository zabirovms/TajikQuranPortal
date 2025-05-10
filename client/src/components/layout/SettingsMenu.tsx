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

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Settings"
        >
          <Settings className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Танзимот</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={handleOpenBookmarks}
          className="flex items-center cursor-pointer"
        >
          <BookmarkIcon className="h-4 w-4 mr-2" />
          <span>Хатчӯбҳо</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem
          className="flex justify-between items-center cursor-pointer"
          onSelect={(e) => e.preventDefault()} // Prevent auto-closing
        >
          <div className="flex items-center">
            <Book className="h-4 w-4 mr-2" />
            <span>Таҷвид</span>
          </div>
          <Switch 
            checked={tajweedMode} 
            onCheckedChange={handleTajweedToggle}
            aria-label="Toggle Tajweed mode"
          />
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="flex items-center">
          <Languages className="h-4 w-4 mr-2" />
          <span>Тарҷумаҳо</span>
        </DropdownMenuLabel>
        
        {availableTranslators.map(translator => (
          <DropdownMenuItem 
            key={translator.id}
            className="flex justify-between items-center cursor-pointer pl-6"
            onClick={() => handleSelectTranslator(translator.id)}
          >
            <div className="flex items-center">
              <span>{translator.name}</span>
            </div>
            {translatorId === translator.id && (
              <div className="h-2 w-2 bg-primary rounded-full"></div>
            )}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          className="flex justify-between items-center cursor-pointer" 
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
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}