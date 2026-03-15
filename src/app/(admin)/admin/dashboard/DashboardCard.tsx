import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface Props {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
}

export function DashboardCard({ title, value, icon: Icon, description }: Props) {
  return (
    <Card className="border-slate-200 shadow-sm transition-all hover:shadow-md hover:border-primary/20 bg-white">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-xs sm:text-sm font-semibold text-slate-600 leading-tight">
          {title}
        </CardTitle>
        <div className="p-2 sm:p-2.5 rounded-full bg-primary/10 shrink-0">
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-xl sm:text-2xl font-bold text-slate-900 truncate">{value}</div>
        {description && (
          <p className="text-[10px] sm:text-xs text-slate-500 mt-1 font-medium line-clamp-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}