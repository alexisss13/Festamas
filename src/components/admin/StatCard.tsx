import type { LucideIcon } from 'lucide-react';

interface Props {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description: string;
}

export function StatCard({ title, value, icon: Icon, description }: Props) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs sm:text-sm font-semibold text-slate-600 leading-tight">{title}</span>
        <div className="p-2 sm:p-2.5 rounded-full bg-primary/10 shrink-0">
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        </div>
      </div>
      <div className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">{value}</div>
      <p className="text-[10px] sm:text-xs text-slate-500 mt-1.5 font-medium leading-tight">{description}</p>
    </div>
  );
}
