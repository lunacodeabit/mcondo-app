import React from 'react';
import { cn } from '@/lib/utils';
import { SidebarTrigger } from '@/components/ui/sidebar';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
  return (
    <header className={cn("bg-card border-b p-4 flex flex-wrap items-center justify-between gap-4", className)}>
      <div className="flex items-center gap-4">
        <div className="md:hidden">
            <SidebarTrigger />
        </div>
        <div>
            <h1 className="text-2xl font-bold font-headline">{title}</h1>
            {description && <p className="text-muted-foreground mt-1">{description}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {children}
      </div>
    </header>
  );
}
