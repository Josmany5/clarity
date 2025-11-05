
import React from 'react';

interface WidgetCardProps {
  children: React.ReactNode;
  className?: string;
}

export const WidgetCard: React.FC<WidgetCardProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`bg-card-bg backdrop-blur-xl rounded-2xl p-5 shadow-glass border border-card-border ${className}`}
    >
      {children}
    </div>
  );
};