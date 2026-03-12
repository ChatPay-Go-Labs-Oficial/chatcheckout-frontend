'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { salesService } from '@/services/salesService';
import { SalesPaymentType, SalesSortBy, SalesSortOrder } from '@/types/sales';
import { ChevronUp, ChevronDown } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

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

  const [draftPaymentType, setDraftPaymentType] = useState<SalesPaymentType | 'ALL'>('ALL');
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
    setPaymentType(draftPaymentType === 'ALL' ? undefined : (draftPaymentType as SalesPaymentType));
    setStartDate(draftStartDate);
    setEndDate(draftEndDate);
    setPage(1);
  }

  function handleClearFilters() {
    const nextDefault = getDefaultDateRange();
    setDraftPaymentType('ALL');
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
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Vendas</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Filtre e acompanhe suas vendas por período e forma de pagamento
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="w-full lg:w-56 space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Tipo de pagamento
              </label>
              <Select
                value={draftPaymentType}
                onValueChange={(val) => setDraftPaymentType(val as SalesPaymentType | 'ALL')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  <SelectItem value="PIX">Pix</SelectItem>
                  <SelectItem value="CARD">Cartão</SelectItem>
                  <SelectItem value="CRYPTO">Cripto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full lg:w-56 space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Data inicial
              </label>
              <Input
                type="date"
                value={draftStartDate}
                onChange={(e) => setDraftStartDate(e.target.value)}
              />
            </div>

            <div className="w-full lg:w-56 space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Data final
              </label>
              <Input
                type="date"
                value={draftEndDate}
                onChange={(e) => setDraftEndDate(e.target.value)}
              />
            </div>

            <div className="flex gap-2 w-full lg:w-auto mt-4 lg:mt-0">
              <Button onClick={handleApplyFilters} className="w-full lg:w-auto">
                Aplicar
              </Button>
              <Button variant="outline" onClick={handleClearFilters} className="w-full lg:w-auto">
                Limpar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-lg">Lista de vendas</CardTitle>
            <CardDescription>
              {isFetching ? 'Atualizando...' : `${total} resultado(s)`}
            </CardDescription>
          </div>
        </CardHeader>

        {error ? (
          <div className="p-6 text-sm text-destructive">
            {(error as Error).message || 'Não foi possível carregar as vendas.'}
          </div>
        ) : (
          <div className="border-b">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <button
                      className="flex items-center gap-1 hover:text-foreground"
                      onClick={() => toggleSort('createdAt')}
                    >
                      Data
                      {sortBy === 'createdAt' && (sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                    </button>
                  </TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>
                    <button
                      className="flex items-center gap-1 hover:text-foreground"
                      onClick={() => toggleSort('totalAmount')}
                    >
                      Valor bruto
                      {sortBy === 'totalAmount' && (sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                    </button>
                  </TableHead>
                  <TableHead>Taxa</TableHead>
                  <TableHead>Líquido</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Carregando vendas...
                    </TableCell>
                  </TableRow>
                ) : sales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Nenhuma venda encontrada para os filtros selecionados.
                    </TableCell>
                  </TableRow>
                ) : (
                  sales.map((sale) => (
                    <TableRow key={sale.orderId}>
                      <TableCell className="font-medium">{formatDate(sale.createdAt)}</TableCell>
                      <TableCell>{sale.productName}</TableCell>
                      <TableCell className="text-muted-foreground">{getPaymentLabel(sale.paymentType)}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(sale.totalAmount)}</TableCell>
                      <TableCell className="text-muted-foreground">{formatCurrency(sale.feeAmount)}</TableCell>
                      <TableCell className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(sale.netAmount)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{getStatusLabel(sale.status)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Paginação */}
        <div className="flex items-center justify-between p-4">
          <span className="text-sm text-muted-foreground">
            Página {page} de {Math.max(totalPages, 1)}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!canPrev}
              onClick={() => setPage((current) => current - 1)}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!canNext}
              onClick={() => setPage((current) => current + 1)}
            >
              Próxima
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
