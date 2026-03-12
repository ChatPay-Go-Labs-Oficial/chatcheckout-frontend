'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';

interface FunnelChartProps {
  data: { label: string; value: number }[];
}

export default function FunnelChart({ data }: FunnelChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Funil de Conversão</CardTitle>
        <CardDescription>Visualização das taxas de queda</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex flex-col gap-4">
          {data.map((step, idx) => (
            <div key={step.label} className="flex items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground w-1/3 truncate">
                {step.label}
              </span>
              <div className="flex-1 h-3 bg-secondary/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${(step.value / maxValue) * 100}%` }}
                />
              </div>
              <span className="text-sm font-semibold w-8 text-right text-foreground">
                {step.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
