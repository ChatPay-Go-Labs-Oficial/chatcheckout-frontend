'use client';

import { useEffect, useMemo, useState } from 'react';
import StellarCard from '@/components/dashboard/StellarCard';
import FaqCard from '@/components/dashboard/FaqCard';
import AbandonCard from '@/components/dashboard/AbandonCard';
import FunnelChart from '@/components/dashboard/FunnelChart';
import SalesBarChart from '@/components/dashboard/SalesBarChart';
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
    if (!summary) {
      return [
        { title: 'Receita Hoje', value: 'R$ 0,00', subtitle: '0 transações' },
        { title: 'Taxa de Conversão', value: '0%', subtitle: '0 sessões' },
        { title: 'Ticket Médio', value: 'R$ 0,00', subtitle: 'por transação' },
        {
          title: 'Net Revenue',
          value: 'R$ 0,00',
          subtitle: 'líquido após taxas',
        },
      ];
    }

    return [
      {
        title: 'Receita Total',
        value: centsToCurrency(summary.totalAmount),
        subtitle: `${summary.totalOrders} transações`,
      },
      {
        title: 'Taxa de Conversão',
        value: `${summary.conversionRate}%`,
        subtitle: `${summary.successfulCheckouts}/${summary.sessions} sessões → compras`,
      },
      {
        title: 'Ticket Médio',
        value: centsToCurrency(summary.avgTicket),
        subtitle: 'por transação',
      },
      {
        title: 'Receita Líquida',
        value: centsToCurrency(summary.netAmount),
        subtitle: `Taxas: ${centsToCurrency(summary.totalFeeAmount)}`,
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
    <main className="flex flex-col min-h-screen w-full bg-[#f7f8fa]">
      <div className="w-full h-full pt-0 pb-12 px-10">
        <h1 className="text-3xl font-bold mb-8 text-primary pt-8">Dashboard</h1>

        {state.error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.error}
          </div>
        )}

        {state.loading && (
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            Carregando dados reais do checkout...
          </div>
        )}

        <section className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {cards.map((card, idx) => (
            <DashboardCard key={idx} {...card} />
          ))}
        </section>

        <section className="w-full grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
          <SalesBarChart data={salesData} />
          <FunnelChart data={state.funnel} />
        </section>

        <section className="w-full grid grid-cols-1 md:grid-cols-3 gap-10">
          <StellarCard {...stellarStats} />
          <FaqCard
            faqs={state.paymentsBreakdown.map((row) => ({
              question: `Sucesso ${row.paymentMethod}`,
              count: row.success,
            }))}
          />
          <AbandonCard reasons={state.abandonment} />
        </section>
      </div>
    </main>
  );
}
