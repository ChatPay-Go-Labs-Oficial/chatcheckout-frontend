'use client';

import { useEffect, useMemo, useState } from 'react';
import { 
  DollarSign, 
  Activity, 
  CreditCard, 
  TrendingUp, 
  PieChart,
  Zap
} from 'lucide-react';
import StellarCard from '@/components/dashboard/StellarCard';
import PaymentsBreakdownCard from '@/components/dashboard/PaymentsBreakdownCard';
import AbandonCard from '@/components/dashboard/AbandonCard';
import FunnelChart from '@/components/dashboard/FunnelChart';
import SalesAreaChart from '@/components/dashboard/SalesAreaChart';
import DashboardCard from '@/components/dashboard/DashboardCard';
import { dashboardService } from '@/services/dashboardService';

interface DashboardState {
  loading: boolean;
  error: string | null;
  summary: {
    sessions: number;
    successfulCheckouts: number;
    conversionRate: number;
    totalOrders: number;
    totalAmount: number;
    totalFeeAmount: number;
    netAmount: number;
    avgTicket: number;
  } | null;
  funnel: Array<{ label: string; value: number }>;
  abandonment: Array<{ reason: string; count: number }>;
  paymentsBreakdown: Array<{
    paymentMethod: 'PIX' | 'CARD' | 'CRYPTO';
    attempts: number;
    success: number;
    failed: number;
    successRate: number;
  }>;
  dailySales: Array<{ day: string; value: number }>;
}

function centsToCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format((cents || 0) / 100);
}

function formatShortDay(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  return days[date.getDay()] || dateStr;
}

export default function DashboardPage() {
  const [state, setState] = useState<DashboardState>({
    loading: true,
    error: null,
    summary: null,
    funnel: [],
    abandonment: [],
    paymentsBreakdown: [],
    dailySales: [],
  });

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const [summary, funnel, abandonment, paymentsBreakdown, dailySales] = await Promise.all([
          dashboardService.getCheckoutSummary(),
          dashboardService.getCheckoutFunnel(),
          dashboardService.getCheckoutAbandonment(),
          dashboardService.getPaymentsBreakdown(),
          dashboardService.getDailySales(),
        ]);

        if (!isMounted) return;

        setState({
          loading: false,
          error: null,
          summary,
          funnel: funnel.stages,
          abandonment: abandonment.byStep.map((item) => ({
            reason: item.step,
            count: item.count,
          })),
          paymentsBreakdown: paymentsBreakdown.breakdown,
          dailySales: dailySales.data,
        });
      } catch (error) {
        if (!isMounted) return;

        setState((prev) => ({
          ...prev,
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : 'Não foi possível carregar os dados do dashboard',
        }));
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  const cards = useMemo(() => {
    const summary = state.summary;
    if (!summary) return [];

    return [
      {
        title: 'Receita Total',
        value: centsToCurrency(summary.totalAmount),
        subtitle: `${summary.totalOrders} transações finalizadas`,
        icon: DollarSign,
      },
      {
        title: 'Taxa de Conversão',
        value: `${
          summary.sessions > 0
            ? (
                (Math.min(summary.successfulCheckouts, summary.sessions) / summary.sessions) *
                100
              ).toFixed(1)
            : '0.0'
        }%`,
        subtitle: `${summary.successfulCheckouts}/${summary.sessions} sessões convertidas`,
        icon: Activity,
      },
      {
        title: 'Ticket Médio',
        value: centsToCurrency(summary.avgTicket),
        subtitle: 'valor médio por venda',
        icon: CreditCard,
      },
      {
        title: 'Receita Líquida',
        value: centsToCurrency(summary.netAmount),
        subtitle: `Taxas descontadas: ${centsToCurrency(summary.totalFeeAmount)}`,
        icon: Zap,
      },
    ];
  }, [state.summary]);

  const stellarStats = useMemo(() => {
    const crypto = state.paymentsBreakdown.find((item) => item.paymentMethod === 'CRYPTO');
    return {
      transacoes: crypto?.success ?? 0,
      volume: (state.summary?.totalAmount ?? 0) / 100,
      taxa: 0,
      settlement: 'N/A',
    };
  }, [state.paymentsBreakdown, state.summary]);

  const salesData = useMemo(() => {
    if (!state.dailySales.length) {
      return [
        { day: 'Seg', value: 0 },
        { day: 'Ter', value: 0 },
        { day: 'Qua', value: 0 },
        { day: 'Qui', value: 0 },
        { day: 'Sex', value: 0 },
        { day: 'Sáb', value: 0 },
        { day: 'Dom', value: 0 },
      ];
    }

    return state.dailySales.map((item) => ({
      day: formatShortDay(item.day),
      value: Math.round(item.value / 100),
    }));
  }, [state.dailySales]);

  return (
    <div className="w-full p-8 pt-4 mx-auto pb-6 bg-background min-w-0 max-w-[100vw]">
      {/* Page Header */}
      <div className="flex flex-col mb-6 text-left">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">
          Visão geral do desempenho e métricas em tempo real.
        </p>
      </div>

      {state.error && (
        <div className="mb-4 rounded border border-destructive/20 bg-destructive/5 px-3 py-2 text-[10px] font-bold text-destructive uppercase tracking-wide">
          Status: {state.error}
        </div>
      )}

      {state.loading && (
        <div className="mb-4 rounded border border-muted/60 bg-muted/20 px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-pulse" />
          Sincronizando dados...
        </div>
      )}

      {/* Main Metrics Row */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {cards.map((card, idx) => (
          <DashboardCard key={idx} {...card} />
        ))}
      </div>

      {/* Charts Visualization Row */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-12 mb-6 items-stretch min-h-[250px]">
        <div className="lg:col-span-8">
          <SalesAreaChart data={salesData} />
        </div>
        <div className="lg:col-span-4 h-full">
          <FunnelChart data={state.funnel} />
        </div>
      </div>

      {/* Details Row */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <StellarCard {...stellarStats} />
        <PaymentsBreakdownCard 
          data={state.paymentsBreakdown.map((row) => ({
            paymentMethod: row.paymentMethod,
            count: row.success,
          }))}
        />
        <AbandonCard reasons={state.abandonment} />
      </div>
    </div>
  );
}
