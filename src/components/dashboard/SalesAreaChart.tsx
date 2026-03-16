'use client';

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import React, { useMemo } from 'react';
import { formatCurrencyCompact } from '@/utils/validations/formatters';

interface SalesData {
  day: string;
  value: number;
}

interface SalesAreaChartProps {
  data: SalesData[];
  previousWeekTotal?: number;
}

const chartConfig = {
  value: {
    label: 'Vendas',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

interface SalesAreaChartProps {
  data: { day: string; value: number }[];
}

export default function SalesAreaChart({ data }: SalesAreaChartProps) {
  const total = React.useMemo(
    () => data.reduce((acc, curr) => acc + curr.value, 0),
    [data]
  );

  return (
    <Card className="shadow-sm border-muted/60 bg-card h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">
          Vendas da Semana
        </CardTitle>
        <CardDescription className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-foreground">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(total)}
          </span>
          <span className="text-[11px] font-medium text-muted-foreground/60">
            acumulado nos últimos 7 dias
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pb-2">
        <ChartContainer config={chartConfig} className="h-[180px] w-full">
          <AreaChart
            data={data}
            margin={{
              left: 12,
              right: 12,
              top: 10,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="fillSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.15} />
                <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.1)" />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value}
              className="text-[10px] font-medium text-muted-foreground/50"
            />
            <ChartTooltip
              cursor={{ stroke: 'hsl(var(--muted-foreground) / 0.2)', strokeWidth: 1 }}
              content={<ChartTooltipContent hideLabel />}
            />
            <Area
              dataKey="value"
              stroke="var(--color-vendas)"
              strokeWidth={2}
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
