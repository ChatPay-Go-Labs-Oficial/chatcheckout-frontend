'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  type TooltipProps,
} from 'recharts';
import {
  formatCurrency,
  formatTrend,
  formatCurrencyCompact,
  type TrendFormatResult,
} from '@/utils/validations/formatters';

interface SalesData {
  day: string;
  value: number;
}

interface SalesBarChartProps {
  data: SalesData[];
  previousWeekTotal?: number;
}

/**
 * Componente de gráfico de barras para vendas semanais
 * Exibe total da semana, tendência de variação e gráfico interativo
 */
export default function SalesBarChart({ data, previousWeekTotal }: SalesBarChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calcula métricas derivadas
  const metrics = useMemo(() => {
    const currentTotal = data.reduce((sum, item) => sum + item.value, 0);
    const average = currentTotal / data.length;
    const maxValue = Math.max(...data.map((d) => d.value));

    let trend: TrendFormatResult | null = null;
    if (previousWeekTotal !== undefined && previousWeekTotal > 0) {
      const percentage = ((currentTotal - previousWeekTotal) / previousWeekTotal) * 100;
      trend = formatTrend(percentage);
    }

    return { currentTotal, average, maxValue, trend };
  }, [data, previousWeekTotal]);

  // Skeleton de carregamento
  if (!mounted) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6 w-full h-80 flex flex-col animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded-lg" />
            <div className="h-5 w-32 bg-gray-200 rounded" />
          </div>
          <div className="h-7 w-24 bg-gray-200 rounded" />
        </div>
        <div className="flex-1 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 w-full h-80 flex flex-col">
      {/* Header com título, total e tendência */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {/* Ícone de gráfico */}
          <svg
            className="w-8 h-8 text-[#6f43d0]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <h3 className="text-base font-semibold text-[#181b4a]">Vendas da Semana</h3>
        </div>

        <div className="flex items-center gap-3">
          {metrics.trend && (
            <div className={`flex items-center gap-1 text-sm font-medium ${metrics.trend.color}`}>
              <span>{metrics.trend.icon}</span>
              <span>{metrics.trend.text}</span>
              <span className="text-gray-400 text-xs ml-1">vs sem. anterior</span>
            </div>
          )}
        </div>
      </div>

      {/* Total da semana em destaque */}
      <div className="mb-4">
        <p className="text-3xl font-bold text-[#181b4a]">
          {formatCurrencyCompact(metrics.currentTotal)}
        </p>
        <p className="text-xs text-gray-400 mt-1">Total da semana</p>
      </div>

      {/* Gráfico de barras */}
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
            {/* Definição do gradiente */}
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6f43d0" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#6fdcff" stopOpacity={0.7} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }}
              dy={10}
            />
            <YAxis hide />

            {/* Tooltip customizado com formatação de moeda */}
            <Tooltip
              content={(props: TooltipProps<number, string>) => {
                const { active, payload } = props;
                if (active && payload && payload.length > 0) {
                  return (
                    <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg">
                      <p className="text-sm font-medium">{payload[0].payload.day}</p>
                      <p className="text-lg font-bold">
                        {formatCurrency(payload[0].value as number)}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
              cursor={{ fill: 'rgba(111, 67, 208, 0.1)' }}
            />

            {/* Linha de referência da média */}
            <ReferenceLine
              y={metrics.average}
              stroke="#e5e7eb"
              strokeDasharray="4 4"
              strokeDashoffset={4}
              strokeWidth={1}
            />

            {/* Barras com gradiente e labels */}
            <Bar
              dataKey="value"
              fill="url(#barGradient)"
              radius={[6, 6, 0, 0]}
              barSize={28}
              animationBegin={0}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legenda dos valores abaixo do gráfico */}
      <div className="flex justify-between mt-2 px-1">
        {data.map((item) => (
          <div key={item.day} className="text-center flex-1">
            <p className="text-xs font-semibold text-[#181b4a]">
              {formatCurrencyCompact(item.value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
