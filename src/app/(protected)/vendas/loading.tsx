import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function VendasLoading() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Vendas</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie e acompanhe todo o seu histórico de transações.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-[150px]" />
          <Skeleton className="h-9 w-[100px]" />
        </div>
      </div>

      <Card className="shadow-sm border-muted/60 overflow-hidden bg-background py-0 gap-0">
        <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30 px-6 py-4 rounded-none">
          <div className="space-y-0.5">
            <CardTitle className="text-base font-semibold">Histórico de Pedidos</CardTitle>
            <CardDescription className="text-xs">
              Exibindo as vendas mais recentes da sua conta.
            </CardDescription>
          </div>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="p-0">
          <Table>
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
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-muted/10">
                  <TableCell className="px-6 py-4"><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell className="px-6 py-4"><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell className="px-6 py-4"><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell className="px-6 py-4"><div className="flex justify-center"><Skeleton className="h-6 w-24 rounded-full" /></div></TableCell>
                  <TableCell className="px-6 py-4 text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <div className="flex items-center justify-between border-t bg-muted/20 px-6 py-3">
          <Skeleton className="h-4 w-24" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </Card>
    </div>
  );
}
