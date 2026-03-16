'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { salesService } from '@/services/salesService';
import { SalesSortBy, SalesSortOrder } from '@/types/sales';
import { Filter, RefreshCcw, Search, Download } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/sales/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';

const PAGE_SIZE = 12;

export default function SalesPage() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SalesSortBy>('createdAt');
  const [sortOrder, setSortOrder] = useState<SalesSortOrder>('desc');

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['sales', page, sortBy, sortOrder],
    queryFn: () => salesService.getMySales({
      page,
      limit: PAGE_SIZE,
      sortBy,
      sortOrder,
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
    }).format(amount);
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Vendas</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie e acompanhe todo o seu histórico de transações.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 border-muted/60 bg-background hover:bg-muted/5">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
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

      {/* Filter Row */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
          <Input 
            placeholder="Buscar por produto ou ID..." 
            className="pl-9 h-10 border-muted/60 bg-background focus-visible:ring-primary/20 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-10 border-muted/60 bg-background px-3 font-medium hover:bg-muted/5">
            <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
            Filtros Avançados
          </Button>
        </div>
      </div>

      {/* Main Table Content */}
      <Card className="shadow-sm border-muted/60 overflow-hidden bg-background py-0 gap-0">
        <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30 px-6 py-4 rounded-none">
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
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow className="hover:bg-transparent border-muted/20">
                <TableHead className="w-[180px] text-[11px] uppercase font-bold tracking-wider text-muted-foreground/80 h-10 px-6">Data e Hora</TableHead>
                <TableHead className="text-[11px] uppercase font-bold tracking-wider text-muted-foreground/80 h-10 px-6">Produto</TableHead>
                <TableHead className="text-[11px] uppercase font-bold tracking-wider text-muted-foreground/80 h-10 px-6">Valor</TableHead>
                <TableHead className="text-[11px] uppercase font-bold tracking-wider text-muted-foreground/80 h-10 px-6 text-center">Status</TableHead>
                <TableHead className="text-[11px] uppercase font-bold tracking-wider text-muted-foreground/80 h-10 px-6 text-right">Método</TableHead>
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
                        <span className="text-[13px] font-semibold text-foreground truncate max-w-[200px]">
                          {sale.product?.name || 'Produto não encontrado'}
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
                        {sale.paymentMethod}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        <div className="flex items-center justify-between border-t bg-muted/20 px-6 py-3">
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
