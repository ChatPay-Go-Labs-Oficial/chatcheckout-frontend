'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { salesService } from '@/services/salesService';
import { SalesSortBy, SalesSortOrder } from '@/types/sales';
import { RefreshCcw, Filter, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';


import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/sales/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';

const PAGE_SIZE = 12;

export default function SalesPage() {
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SalesSortBy>('createdAt');
  const [sortOrder, setSortOrder] = useState<SalesSortOrder>('desc');
  const [paymentType, setPaymentType] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const [appliedPaymentType, setAppliedPaymentType] = useState<string>('ALL');
  const [appliedStartDate, setAppliedStartDate] = useState<string>('');
  const [appliedEndDate, setAppliedEndDate] = useState<string>('');

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleApplyFilters = () => {
    setAppliedPaymentType(paymentType);
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setPage(1);
    setIsFilterOpen(false);
  };

  const handleClearFilters = () => {
    setPaymentType('ALL');
    setStartDate('');
    setEndDate('');
    setAppliedPaymentType('ALL');
    setAppliedStartDate('');
    setAppliedEndDate('');
    setPage(1);
    setIsFilterOpen(false);
  };

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['sales', page, sortBy, sortOrder, appliedPaymentType, appliedStartDate, appliedEndDate],
    queryFn: () => salesService.getMySales({
      page,
      limit: PAGE_SIZE,
      sortBy,
      sortOrder,
      ...(appliedPaymentType !== 'ALL' ? { paymentType: appliedPaymentType as any } : {}),
      ...(appliedStartDate ? { startDate: appliedStartDate } : {}),
      ...(appliedEndDate ? { endDate: appliedEndDate } : {}),
    }),
  });

  const sales = data?.data || [];
  const totalPages = data?.totalPages || 1;

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMM, yyyy • HH:mm", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount / 100);
  };

  return (
    <div className="w-full p-8 pt-4 mx-auto pb-6 min-w-0 max-w-[100vw]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Vendas</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Gerencie e acompanhe todo o seu histórico de transações.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 border-muted/60 bg-background hover:bg-muted/5">
                <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                Filtros Avançados
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[calc(100vw-2rem)] sm:w-80 p-4 shadow-lg border-muted/60" align="end">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium leading-none mb-1.5">Filtros Avançados</h4>
                  <p className="text-sm text-muted-foreground">
                    Refine sua busca pelas vendas.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Método de pagamento</Label>
                    <Select value={paymentType} onValueChange={(val) => setPaymentType(val)}>
                      <SelectTrigger className="w-full h-9">
                        <SelectValue placeholder="Selecione o método" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">Todos os métodos</SelectItem>
                        <SelectItem value="PIX">Pix</SelectItem>
                        <SelectItem value="CARD">Cartão de Crédito</SelectItem>
                        <SelectItem value="CRYPTO">Criptomoedas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 flex flex-col">
                    <Label>Data inicial</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-9 justify-start text-left font-normal",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(new Date(startDate + 'T12:00:00'), "dd 'de' MMM, yyyy", { locale: ptBR }) : <span>Selecione uma data</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate ? new Date(startDate + 'T12:00:00') : undefined}
                          onSelect={(date) => setStartDate(date ? format(date, 'yyyy-MM-dd') : '')}
                          initialFocus
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2 flex flex-col">
                    <Label>Data final</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-9 justify-start text-left font-normal",
                            !endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(new Date(endDate + 'T12:00:00'), "dd 'de' MMM, yyyy", { locale: ptBR }) : <span>Selecione uma data</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={endDate ? new Date(endDate + 'T12:00:00') : undefined}
                          onSelect={(date) => setEndDate(date ? format(date, 'yyyy-MM-dd') : '')}
                          initialFocus
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="pt-2 flex flex-col gap-2">
                  <Button 
                    variant="default" 
                    className="w-full"
                    onClick={handleApplyFilters}
                  >
                    Aplicar filtros
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleClearFilters}
                  >
                    Limpar filtros
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <Button
            variant="default"
            size="sm"
            className="h-9 shadow-sm"
            onClick={() => refetch()}
          >
            <RefreshCcw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Main Table Content */}
      <Card className="shadow-sm border-muted/60 overflow-hidden bg-background py-0 gap-0 w-full max-w-[calc(100vw-2rem)] sm:max-w-full">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b bg-muted/30 p-4 sm:px-6 sm:py-4 rounded-none">
          <div className="space-y-0.5">
            <CardTitle className="text-base font-semibold">Histórico de Pedidos</CardTitle>
            <CardDescription className="text-xs">
              Exibindo as vendas mais recentes da sua conta.
            </CardDescription>
          </div>
          <div className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded">
            Total de {data?.total || 0} registros
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto w-full">
          <Table className="min-w-[800px]">
            <TableHeader className="bg-muted/10">
              <TableRow className="hover:bg-transparent border-muted/20">
                <TableHead className="w-[140px] text-[11px] uppercase font-bold tracking-wider text-muted-foreground/80 h-10 px-6">Data e Hora</TableHead>
                <TableHead className="w-[250px] text-[11px] uppercase font-bold tracking-wider text-muted-foreground/80 h-10 px-6">Produto</TableHead>
                <TableHead className="w-[140px] text-[11px] uppercase font-bold tracking-wider text-muted-foreground/80 h-10 px-6">Valor</TableHead>
                <TableHead className="w-[140px] text-[11px] uppercase font-bold tracking-wider text-muted-foreground/80 h-10 px-6 text-center">Status</TableHead>
                <TableHead className="w-[140px] text-[11px] uppercase font-bold tracking-wider text-muted-foreground/80 h-10 px-6 text-right">Método</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-muted/10">
                    <TableCell className="px-6 py-4"><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell className="px-6 py-4"><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell className="px-6 py-4"><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell className="px-6 py-4"><div className="flex justify-center"><Skeleton className="h-6 w-24 rounded-full" /></div></TableCell>
                    <TableCell className="px-6 py-4 text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-destructive font-medium">
                    Ocorreu um erro ao carregar as vendas.
                  </TableCell>
                </TableRow>
              ) : sales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    Nenhuma venda encontrada no período selecionado.
                  </TableCell>
                </TableRow>
              ) : (
                sales.map((sale) => (
                  <TableRow key={sale.orderId} className="group border-muted/10 hover:bg-muted/5 transition-colors">
                    <TableCell className="text-[12px] font-medium text-foreground py-3 px-6">
                      {formatDate(sale.createdAt)}
                    </TableCell>
                    <TableCell className="py-3 px-6">
                      <div className="flex flex-col">
                        <span className="text-[13px] font-semibold text-foreground truncate">
                          {sale.productName || 'Produto não encontrado'}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          ID: {sale.orderId.substring(0, 8)}...
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-[13px] font-bold text-foreground py-3 px-6">
                      {formatCurrency(sale.totalAmount)}
                    </TableCell>
                    <TableCell className="py-3 px-6">
                      <div className="flex justify-center items-center">
                        <StatusBadge status={sale.status} />
                      </div>
                    </TableCell>
                    <TableCell className="text-right py-3 px-6">
                      <span className="text-[11px] font-bold text-muted-foreground/80 bg-muted/30 px-2 py-0.5 rounded border border-muted/20 uppercase">
                        {sale.paymentType}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t bg-muted/20 p-4 sm:px-6 sm:py-3">
          <p className="text-[11px] font-medium text-muted-foreground">
            Página {page} de {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-[11px] font-semibold border-muted/60 bg-background hover:bg-muted/5 disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-[11px] font-semibold border-muted/60 bg-background hover:bg-muted/5 disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Próximo
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
