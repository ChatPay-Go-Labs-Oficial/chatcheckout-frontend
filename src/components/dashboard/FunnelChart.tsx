'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';

interface FunnelChartProps {
  data: { label: string; value: number }[];
}

export default function FunnelChart({ data }: FunnelChartProps) {
  const max = data.length > 0 ? Math.max(...data.map((d) => d.value)) : 0;
  const initialValue = data.length > 0 ? data[0].value : 0;

  return (
    <Card className="shadow-sm border-muted/60 bg-card h-full overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">
          Funil de Conversão
        </CardTitle>
        <CardDescription className="text-[11px] font-medium text-muted-foreground/60 leading-tight">
          Visualização das taxas de retenção por etapa do checkout
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4 px-6 pt-0">
        <div className="flex flex-col gap-3">
          {data.map((item, index) => {
            const percentage = max > 0 ? (item.value / max) * 100 : 0;
            const dropoff = initialValue > 0 ? ((item.value / initialValue) * 100).toFixed(1) : '0.0';

            return (
              <div key={item.label} className="group flex flex-col gap-1.5">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-tight group-hover:text-foreground transition-colors leading-none">
                    {item.label}
                  </span>
                  <div className="flex items-baseline gap-1.5 leading-none">
                    <span className="text-xs font-bold text-foreground">{item.value}</span>
                    <span className="text-[9px] font-bold text-primary/70">{dropoff}%</span>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-muted/40 rounded-full overflow-hidden border border-muted/10">
                  <div
                    className="h-full bg-primary/80 transition-all duration-700 ease-out"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
