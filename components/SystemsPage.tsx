import React from 'react';
import { WidgetCard } from './WidgetCard';
import { SystemsIcon } from './Icons';

export const SystemsPage: React.FC = () => {
  return (
    <WidgetCard>
      <div className="flex flex-col items-center justify-center p-10 text-center">
        <SystemsIcon className="w-16 h-16 text-accent mb-4" />
        <h2 className="text-2xl font-bold text-text-primary mb-2">Systems</h2>
        <p className="text-text-secondary">This section is currently under construction. Check back soon!</p>
      </div>
    </WidgetCard>
  );
};