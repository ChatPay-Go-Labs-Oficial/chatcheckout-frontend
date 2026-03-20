'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, ArrowUpRight, RefreshCcw, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface AssetsListProps {
    groupedByAsset: Record<string, bigint>;
    loading: boolean;
    isReleasing: boolean;
    onRelease: () => void;
    onRefresh: () => void;
    formatAmount: (amount: string) => string;
    truncateAddress: (address: string) => string;
}

export function AssetsList({
    groupedByAsset,
    loading,
    isReleasing,
    onRelease,
    onRefresh,
    formatAmount,
    truncateAddress
}: AssetsListProps) {
    const assetEntries = Object.entries(groupedByAsset);

    return (
        <Card className="shadow-sm border-muted/60 bg-card overflow-hidden">
            <CardHeader className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 pb-6 px-6 pt-6">
                <div className="space-y-1">
                    <CardTitle className="text-lg font-bold">Ativos & Payouts</CardTitle>
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Status:</span>
                        <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest bg-primary/5 text-primary border-primary/20">
                            {assetEntries.length} Resgates Disponíveis
                        </Badge>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Button 
                        variant="outline"
                        size="icon"
                        onClick={onRefresh}
                        className="h-10 w-10 flex-shrink-0"
                        title="Atualizar lista"
                    >
                        <RefreshCcw className="h-4 w-4" />
                    </Button>
                    <Button 
                        onClick={onRelease}
                        disabled={loading || isReleasing || assetEntries.length === 0}
                        className="h-10 px-4 font-bold shadow-sm"
                    >
                        <ArrowUpRight className="w-4 h-4 mr-2" />
                        Solicitar Recebimento
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="p-0 overflow-x-auto w-full max-w-[calc(100vw-2rem)] md:max-w-none">
                <Table className="min-w-[650px]">
                    <TableHeader className="bg-muted/10">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="w-[300px] text-[10px] font-bold uppercase tracking-widest px-6 h-9">Ativo / Identificador</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase tracking-widest px-6 h-9">Status Blockchain</TableHead>
                            <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest px-6 h-9">Volume Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <TableRow key={i} className="border-muted/30">
                                    <TableCell className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <Skeleton className="h-9 w-9 rounded-lg" />
                                            <div className="space-y-2">
                                                <Skeleton className="h-3 w-24" />
                                                <Skeleton className="h-2 w-16" />
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6"><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                                    <TableCell className="px-6 text-right"><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : assetEntries.length === 0 ? (
                            <TableRow className="hover:bg-transparent border-none">
                                <TableCell colSpan={3} className="h-32 text-center px-6">
                                    <div className="flex flex-col items-center justify-center space-y-2 opacity-60">
                                        <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground/40 border-2 border-dashed border-muted-foreground/20">
                                            <Coins className="w-5 h-5" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-xs font-bold text-foreground">Aguardando Liberações</p>
                                            <p className="text-[10px] text-muted-foreground font-medium max-w-[280px]">Os ativos aparecerão aqui assim que o período de garantia expirar.</p>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            assetEntries.map(([assetAddress, amount]) => (
                                <TableRow key={assetAddress} className="group border-muted/30 hover:bg-muted/[0.02] transition-colors">
                                    <TableCell className="px-6 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center border border-muted/60 shadow-sm group-hover:bg-background transition-colors text-muted-foreground/60 group-hover:text-primary">
                                                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-foreground font-mono tracking-tight">
                                                    {truncateAddress(assetAddress)}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5 opacity-70">Ativo Nativo</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6">
                                        <Badge variant="outline" className="text-[9px] h-5 font-bold border-emerald-500/30 bg-emerald-500/[0.05] text-emerald-600 px-2 uppercase tracking-tight shadow-none rounded-md">
                                            Livre para Resgate
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="px-6 text-right">
                                        <div className="flex flex-col items-end gap-0.5">
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-sm font-bold text-primary tracking-tight">
                                                    {formatAmount(amount.toString())}
                                                </span>
                                                <span className="text-[10px] font-bold text-primary uppercase">XLM</span>
                                            </div>
                                            <span className="text-[9px] font-bold text-muted-foreground/50 uppercase">Disponível</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
