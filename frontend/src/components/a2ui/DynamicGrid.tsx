import React from 'react';
import { cn } from '@/lib/utils';

interface DynamicGridProps {
  children: React.ReactNode;
  columns?: number;
  className?: string;
}

export default function DynamicGrid({ children, columns = 2, className }: DynamicGridProps) {
  const childArray = React.Children.toArray(children).filter(Boolean);
  return (
    <div
      className={cn('grid gap-4', className)}
      style={{ gridTemplateColumns: `repeat(${Math.min(columns, childArray.length)}, 1fr)` }}
    >
      {childArray}
    </div>
  );
}
