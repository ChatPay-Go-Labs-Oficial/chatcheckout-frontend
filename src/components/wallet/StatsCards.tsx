'use client';

import { Coins, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface StatsCardsProps {
    balance: string;
    releasableCount: number;
    loading: boolean;
}

export function StatsCards({ balance, releasableCount, loading }: StatsCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-sm border-muted ring-0 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary/40" />
                <CardContent className="px-6 py-6 flex flex-col justify-between h-full">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-2 group-hover:text-primary transition-colors">
                        <Coins className="w-4 h-4" /> Saldo em Carteira
                    </span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold tracking-tight text-foreground">
                            {balance}
                        </span>
                        <span className="text-xs font-bold text-muted-foreground/60 uppercase">XLM</span>
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-sm border-muted ring-0 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/40" />
                <CardContent className="px-6 py-6 flex flex-col justify-between h-full">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-2 group-hover:text-emerald-600 transition-colors">
                        <ShieldCheck className="w-4 h-4" /> Resgates Elegíveis
                    </span>
                    <div className="flex items-baseline gap-2">
                        {loading ? (
                            <Skeleton className="h-9 w-12 rounded bg-muted/40" />
                        ) : (
                            <span className="text-3xl font-bold tracking-tight text-foreground">
                                {releasableCount}
                            </span>
                        )}
                        <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tighter">Eventos Pendentes</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
