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
        <Card className="shadow-sm border-muted ring-0 overflow-hidden bg-card/50 backdrop-blur-sm">
            <CardHeader className="py-4 px-6 border-b bg-muted/5 flex flex-row items-center justify-between space-y-0">
                <div className="space-y-1">
                    <CardTitle className="text-base font-bold flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <Zap className="w-4 h-4" />
                        </div>
                        Valores Disponíveis
                    </CardTitle>
                    <CardDescription className="text-[11px] font-medium uppercase tracking-wider pl-10.5">
                        Ativos processados e prontos para resgate na blockchain.
                    </CardDescription>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        onClick={onRelease}
                        disabled={loading || isReleasing || assetEntries.length === 0}
                        className="h-10 px-5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-md transition-all gap-2"
                    >
                        {isReleasing ? (
                            <RefreshCcw className="w-4 h-4 animate-spin" />
                        ) : (
                            <ArrowUpRight className="w-4 h-4" />
                        )}
                        {isReleasing ? 'Resgatando...' : 'Solicitar Recebimento'}
                    </Button>

                    <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 text-muted-foreground hover:text-primary transition-colors border-muted bg-background"
                        onClick={onRefresh}
                        disabled={loading}
                    >
                        <RefreshCcw className={cn("w-4 h-4", loading && "animate-spin")} />
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-muted/5">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="w-[300px] text-[10px] font-bold uppercase tracking-widest px-6 h-10">Ativo / Contrato</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase tracking-widest px-6 h-10">Status</TableHead>
                            <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest px-6 h-10">Montante Total</TableHead>
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
                                <TableCell colSpan={3} className="h-64 text-center">
                                    <div className="flex flex-col items-center justify-center space-y-3 opacity-60">
                                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground/40">
                                            <Coins className="w-8 h-8" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-foreground">Nenhum ativo encontrado</p>
                                            <p className="text-[11px] text-muted-foreground font-medium">Os ativos aparecerão aqui assim que o período de garantia expirar.</p>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            assetEntries.map(([assetAddress, amount]) => (
                                <TableRow key={assetAddress} className="group border-muted/30 hover:bg-muted/[0.02] transition-colors">
                                    <TableCell className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-muted/20 border border-muted/60 flex items-center justify-center shadow-sm group-hover:bg-background transition-colors text-muted-foreground/60 group-hover:text-primary">
                                                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                                            </div>
                                            <div>
                                                <p className="text-[13px] font-bold text-foreground font-mono">
                                                    {truncateAddress(assetAddress)}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5 opacity-70">Native Token</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6">
                                        <Badge variant="outline" className="text-[9px] h-5 font-bold border-emerald-500/20 bg-emerald-500/[0.03] text-emerald-600 px-2 uppercase tracking-tight shadow-none">
                                            Elegível para Resgate
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="px-6 text-right">
                                        <div className="flex flex-col items-end gap-0.5">
                                            <div className="flex items-baseline gap-1.5">
                                                <span className="text-base font-bold text-primary tracking-tight">
                                                    {formatAmount(amount.toString())}
                                                </span>
                                                <span className="text-[10px] font-bold text-primary uppercase">XLM</span>
                                            </div>
                                            <span className="text-[9px] font-bold text-muted-foreground/50 uppercase">Valor Líquido</span>
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
