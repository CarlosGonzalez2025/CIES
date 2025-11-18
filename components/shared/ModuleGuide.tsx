import React from 'react';
import { Info } from 'lucide-react';
import { Card } from '../ui/Card';

interface ModuleGuideProps {
  title: string;
  children: React.ReactNode;
}

export const ModuleGuide: React.FC<ModuleGuideProps> = ({ title, children }) => {
  return (
    <Card className="bg-blue-50 border border-blue-200">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">
          <Info className="h-6 w-6 text-blue-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-blue-800">{title}</h3>
          <div className="mt-2 text-sm text-blue-700 space-y-2">
            {children}
          </div>
        </div>
      </div>
    </Card>
  );
};
