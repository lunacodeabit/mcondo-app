import { Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className, textColor = 'text-primary' }: { className?: string, textColor?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5 text-xl font-bold font-headline", textColor, className)}>
      <div className="bg-primary p-1.5 rounded-md">
        <Building2 className="h-6 w-6 text-primary-foreground" />
      </div>
      <span>MICONDO APP</span>
    </div>
  );
}
