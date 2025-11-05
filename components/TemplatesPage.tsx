import React from 'react';
import { WidgetCard } from './WidgetCard';
import { TemplatesIcon } from './Icons';

export const TemplatesPage: React.FC = () => {
  return (
    <WidgetCard>
      <div className="flex flex-col items-center justify-center p-10 text-center">
        <TemplatesIcon className="w-16 h-16 text-accent mb-4" />
        <h2 className="text-2xl font-bold text-text-primary mb-2">Templates</h2>
        <p className="text-text-secondary">This section is currently under construction. Check back soon!</p>
      </div>
    </WidgetCard>
  );
};