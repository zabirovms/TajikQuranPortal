import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Surah from "@/pages/surah";
import { useState } from "react";
import SearchOverlay from "./components/overlay/SearchOverlay";
import BookmarksOverlay from "./components/overlay/BookmarksOverlay";

// Global context for overlays
export type GlobalOverlayType = 'search' | 'bookmarks' | null;

function Router() {
  const [activeOverlay, setActiveOverlay] = useState<GlobalOverlayType>(null);

  const closeOverlay = () => setActiveOverlay(null);
  const openOverlay = (type: GlobalOverlayType) => setActiveOverlay(type);

  return (
    <div className="min-h-screen flex flex-col">
      <SearchOverlay 
        isOpen={activeOverlay === 'search'} 
        onClose={closeOverlay} 
      />
      
      <BookmarksOverlay 
        isOpen={activeOverlay === 'bookmarks'} 
        onClose={closeOverlay} 
      />
      
      <Switch>
        <Route path="/" component={() => <Home onOpenOverlay={openOverlay} />} />
        <Route path="/surah/:number">
          {(params) => <Surah surahNumber={Number(params.number)} onOpenOverlay={openOverlay} />}
        </Route>
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <TooltipProvider>
      <Router />
    </TooltipProvider>
  );
}

export default App;
