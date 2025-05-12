import { useState, useEffect, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

interface FloatingHeaderProps {
  children: ReactNode;
  className?: string;
}

export function FloatingHeader({ children, className }: FloatingHeaderProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Make the header visible when scrolling up and we're a bit down the page
      if (currentScrollY < lastScrollY && currentScrollY > 100) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY || currentScrollY <= 50) {
        // Hide when scrolling down or at the top
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={cn(
            "fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 shadow-md py-2 px-4",
            className
          )}
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}