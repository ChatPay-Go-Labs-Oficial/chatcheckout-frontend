'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { salesService } from '@/services/salesService';
import { SalesPaymentType, SalesSortBy, SalesSortOrder } from '@/types/sales';

const PAGE_SIZE = 10;

function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(isoDate));
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format((cents || 0) / 100);
}

function getDefaultDateRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 30);

  const toInputDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return {
    startDate: toInputDate(start),
    endDate: toInputDate(end),
  };
}

function toIsoDateRange(startDate: string, endDate: string) {
  const toStartOfLocalDayIso = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day, 0, 0, 0, 0).toISOString();
  };

  const toEndOfLocalDayIso = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day, 23, 59, 59, 999).toISOString();
  };

  return {
    startDate: startDate ? toStartOfLocalDayIso(startDate) : undefined,
    endDate: endDate ? toEndOfLocalDayIso(endDate) : undefined,
  };
}

function getPaymentLabel(method: SalesPaymentType): string {
  if (method === 'PIX') return 'Pix';
  if (method === 'CARD') return 'Cartão';
  return 'Cripto';
}

function getStatusLabel(status: 'CREATED' | 'COMPLETED' | 'FAILED'): string {
  if (status === 'COMPLETED') return 'Concluído';
  if (status === 'FAILED') return 'Falhou';
  return 'Criado';
}

export default function SalesPage() {
  const defaultRange = useMemo(() => getDefaultDateRange(), []);

  const [draftPaymentType, setDraftPaymentType] = useState<SalesPaymentType | ''>('');
  const [draftStartDate, setDraftStartDate] = useState(defaultRange.startDate);
  const [draftEndDate, setDraftEndDate] = useState(defaultRange.endDate);

  const [paymentType, setPaymentType] = useState<SalesPaymentType | undefined>(undefined);
  const [startDate, setStartDate] = useState(defaultRange.startDate);
  const [endDate, setEndDate] = useState(defaultRange.endDate);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SalesSortBy>('createdAt');
  const [sortOrder, setSortOrder] = useState<SalesSortOrder>('desc');

  const dateRange = toIsoDateRange(startDate, endDate);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: [
      'my-sales',
      page,
      paymentType,
      dateRange.startDate,
      dateRange.endDate,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      salesService.getMySales({
        page,
        limit: PAGE_SIZE,
        paymentType,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        sortBy,
        sortOrder,
      }),
  });

  function handleApplyFilters() {
    setPaymentType(draftPaymentType || undefined);
    setStartDate(draftStartDate);
    setEndDate(draftEndDate);
    setPage(1);
  }

  function handleClearFilters() {
    const nextDefault = getDefaultDateRange();
    setDraftPaymentType('');
    setDraftStartDate(nextDefault.startDate);
    setDraftEndDate(nextDefault.endDate);

    setPaymentType(undefined);
    setStartDate(nextDefault.startDate);
    setEndDate(nextDefault.endDate);
    setPage(1);
  }

  function toggleSort(field: SalesSortBy) {
    if (sortBy === field) {
      setSortOrder((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortBy(field);
    setSortOrder('desc');
  }

  const sales = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#181b4a]">Vendas</h1>
        <p className="text-sm text-gray-500 mt-1">
          Filtre e acompanhe suas vendas por período e forma de pagamento
        </p>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="w-full lg:w-56">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Tipo de pagamento
            </label>
            <select
              value={draftPaymentType}
              onChange={(event) => setDraftPaymentType(event.target.value as SalesPaymentType | '')}
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-[#6f43d0] focus:ring-2 focus:ring-[#6f43d0]/20"
            >
              <option value="">Todos</option>
              <option value="PIX">Pix</option>
              <option value="CARD">Cartão</option>
              <option value="CRYPTO">Cripto</option>
            </select>
          </div>

          <div className="w-full lg:w-56">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Data inicial</label>
            <input
              type="date"
              value={draftStartDate}
              onChange={(event) => setDraftStartDate(event.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-[#6f43d0] focus:ring-2 focus:ring-[#6f43d0]/20"
            />
          </div>

          <div className="w-full lg:w-56">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Data final</label>
            <input
              type="date"
              value={draftEndDate}
              onChange={(event) => setDraftEndDate(event.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-[#6f43d0] focus:ring-2 focus:ring-[#6f43d0]/20"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleApplyFilters}
              className="rounded-xl bg-gradient-to-r from-[#6f43d0] to-[#6fdcff] px-4 py-2.5 text-sm font-semibold text-white shadow hover:opacity-95"
            >
              Aplicar
            </button>
            <button
              type="button"
              onClick={handleClearFilters}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Limpar
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-lg font-semibold text-[#181b4a]">Lista de vendas</h2>
          <span className="text-sm text-gray-500">
            {isFetching ? 'Atualizando...' : `${total} resultado(s)`}
          </span>
        </div>

        {error && (
          <div className="px-5 py-6 text-sm text-red-600">
            {(error as Error).message || 'Não foi possível carregar as vendas.'}
          </div>
        )}

        {!error && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1"
                      onClick={() => toggleSort('createdAt')}
                    >
                      Data
                      <span className="text-[10px]">
                        {sortBy === 'createdAt' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                      </span>
                    </button>
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Produto
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Método
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1"
                      onClick={() => toggleSort('totalAmount')}
                    >
                      Valor bruto
                      <span className="text-[10px]">
                        {sortBy === 'totalAmount' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                      </span>
                    </button>
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Taxa
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Líquido
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading && (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-500">
                      Carregando vendas...
                    </td>
                  </tr>
                )}

                {!isLoading && sales.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-500">
                      Nenhuma venda encontrada para os filtros selecionados.
                    </td>
                  </tr>
                )}

                {!isLoading &&
                  sales.map((sale) => (
                    <tr key={sale.orderId} className="hover:bg-gray-50/70">
                      <td className="whitespace-nowrap px-5 py-3 text-sm text-gray-700">
                        {formatDate(sale.createdAt)}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-700">{sale.productName}</td>
                      <td className="px-5 py-3 text-sm text-gray-700">
                        {getPaymentLabel(sale.paymentType)}
                      </td>
                      <td className="px-5 py-3 text-sm font-medium text-gray-800">
                        {formatCurrency(sale.totalAmount)}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-700">
                        {formatCurrency(sale.feeAmount)}
                      </td>
                      <td className="px-5 py-3 text-sm font-medium text-emerald-700">
                        {formatCurrency(sale.netAmount)}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-700">
                        {getStatusLabel(sale.status)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4">
          <span className="text-sm text-gray-500">
            Página {page} de {Math.max(totalPages, 1)}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={!canPrev}
              onClick={() => setPage((current) => current - 1)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              type="button"
              disabled={!canNext}
              onClick={() => setPage((current) => current + 1)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Próxima
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
