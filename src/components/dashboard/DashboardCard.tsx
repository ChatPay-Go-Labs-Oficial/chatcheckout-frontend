import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DashboardCardProps {
  title: string;
  value: string;
  subtitle?: string;
  percent?: string;
  percentColor?: string;
  score?: string;
}

export default function DashboardCard({
  title,
  value,
  subtitle,
  percent,
  percentColor = 'text-green-500',
  score,
}: DashboardCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {percent && <p className={`text-xs font-semibold ${percentColor} mt-1`}>{percent}</p>}
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        {score && <p className="text-xs text-primary mt-1">{score}</p>}
      </CardContent>
    </Card>
  );
}
