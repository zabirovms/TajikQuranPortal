import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import SeoHead from '@/components/shared/SeoHead';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <SeoHead
        title="Саҳифа ёфт нашуд"
        description="Саҳифаи дархост кардаатон ёфт нашуд. Лутфан ба саҳифаи асосӣ баргардед."
      />
      
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md text-center">
        <h1 className="text-6xl font-bold text-primary dark:text-accent mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-6">Саҳифа ёфт нашуд</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Саҳифаи дархост кардаатон ёфт нашуд ё ҳазф шудааст.
        </p>
        
        <Link href="/">
          <Button className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            <span>Ба саҳифаи асосӣ</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}