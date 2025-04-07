import React from 'react';
import { Button } from '@/components/ui/button';
import { HelpCircle, Image } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Image className="h-8 w-8 text-primary-600" />
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            IT News <span className="text-primary-600">Post Creator</span>
          </h1>
        </div>
        <nav>
          <Button variant="default">
            Help
            <HelpCircle className="ml-2 h-4 w-4" />
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
