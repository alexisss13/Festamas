import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  cta?: string;
  className?: string;
}

export const EmptyState = ({ icon: Icon, title, description, action, cta, className }: EmptyStateProps) => (
  <div className={cn('flex flex-col items-center gap-2 py-12 text-center', className)}>
    <Icon className="w-10 h-10 text-slate-300" strokeWidth={1.25} />
    <p className="font-semibold text-sm text-slate-500">{title}</p>
    {description && <p className="text-xs text-slate-400 max-w-xs">{description}</p>}
    {cta && (
      <p className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg">{cta}</p>
    )}
    {action && (
      <button
        onClick={action.onClick}
        className="mt-1 text-xs font-semibold text-slate-700 underline underline-offset-2 hover:text-slate-500"
      >
        {action.label}
      </button>
    )}
  </div>
);
