
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PriorityBadgeProps {
  priority: 'baja' | 'media' | 'alta' | string;
  className?: string;
}

const priorityColors: { [key: string]: string } = {
  'baja': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600',
  'media': 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800',
  'alta': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800',
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const priorityText = {
    'baja': 'Baja',
    'media': 'Media',
    'alta': 'Alta',
  }[priority] || priority;
  
  return (
    <Badge className={cn('font-normal', priorityColors[priority] || 'bg-gray-100 text-gray-800', className)}>
      {priorityText}
    </Badge>
  );
}
