import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon?: LucideIcon;
}

export default function DashboardCard({ title, value, subtitle, icon: Icon }: DashboardCardProps) {
  return (
    <Card className="shadow-sm border-muted/60 bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
          {title}
        </CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground/50" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight text-foreground">{value}</div>
        <p className="text-[10px] text-muted-foreground font-medium mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
