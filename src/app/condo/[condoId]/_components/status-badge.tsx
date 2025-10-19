import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'Pendiente' | 'Pagada' | 'Vencida' | 'abierto' | 'en_progreso' | 'resuelto' | 'cerrado' | string;
  className?: string;
}

const statusColors: { [key: string]: string } = {
  // Invoice statuses
  'Pendiente': 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800',
  'Pagada': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800',
  'Vencida': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800',
  
  // Incident statuses
  'abierto': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800',
  'en_progreso': 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-800',
  'resuelto': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800',
  'cerrado': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge className={cn('font-normal', statusColors[status] || 'bg-gray-100 text-gray-800', className)}>
      {status}
    </Badge>
  );
}
