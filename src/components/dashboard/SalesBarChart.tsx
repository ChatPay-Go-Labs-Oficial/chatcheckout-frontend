'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useMemo } from 'react';
import { formatCurrencyCompact } from '@/utils/validations/formatters';

interface SalesData {
  day: string;
  value: number;
}

interface SalesBarChartProps {
  data: SalesData[];
  previousWeekTotal?: number;
}

const chartConfig = {
  vendas: {
    label: 'Vendas',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export default function SalesBarChart({ data, previousWeekTotal }: SalesBarChartProps) {
  const metrics = useMemo(() => {
    const currentTotal = data.reduce((sum, item) => sum + item.value, 0);
    let trend = 0;
    if (previousWeekTotal !== undefined && previousWeekTotal > 0) {
      trend = ((currentTotal - previousWeekTotal) / previousWeekTotal) * 100;
    }
    return { currentTotal, trend };
  }, [data, previousWeekTotal]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendas da Semana</CardTitle>
        <CardDescription>
          {formatCurrencyCompact(metrics.currentTotal)} faturado esta semana
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
          <BarChart accessibilityLayer data={data} margin={{ left: -20, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickCount={5}
              tickFormatter={(value) => `$${value}`}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="value" fill="var(--color-vendas)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
