'use client';

import { Wallet, ArrowUpRight, RefreshCcw, Coins, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface WalletHeroProps {
    balance: string;
    accountId: string | null;
    isConnected: boolean;
    isReleasing: boolean;
    releasableCount: number;
    onRelease: () => void;
    onConnect: () => void;
}

export function WalletHero({
    balance,
    accountId,
    isConnected,
    isReleasing,
    releasableCount,
    onRelease,
    onConnect
}: WalletHeroProps) {

    const truncateAddress = (address: string | null) => {
        if (!address) return '';
        return `${address.slice(0, 8)}...${address.slice(-8)}`;
    };

    return (
        <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-10 text-primary-foreground shadow-2xl shadow-primary/20 transition-all duration-500 hover:shadow-primary/30 group">
            {/* Background Decorative Elements */}
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5 blur-3xl group-hover:bg-white/10 transition-colors duration-700" />
            <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-black/10 blur-3xl" />

            <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-6 flex-1">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md shadow-inner border border-white/10 transition-transform group-hover:scale-110 duration-500">
                            <Wallet className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-white/60">Saldo Disponível</span>
                                {isConnected && (
                                    <Badge variant="outline" className="h-5 border-white/20 bg-white/10 text-[9px] font-bold text-white uppercase tracking-tighter shadow-none px-1.5">
                                        <CheckCircle2 className="mr-1 h-3 w-3" /> Conectado
                                    </Badge>
                                )}
                            </div>
                            <div className="mt-1 flex items-baseline gap-2">
                                <span className="text-5xl font-black tracking-tighter sm:text-6xl">
                                    {isConnected ? balance : '---'}
                                </span>
                                <span className="text-xl font-bold opacity-60 uppercase">XLM</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        {isConnected ? (
                            <div className="flex items-center gap-2 rounded-full bg-black/10 px-4 py-2 backdrop-blur-md border border-white/5 transition-colors hover:bg-black/20">
                                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                                <span className="text-[11px] font-bold font-mono tracking-tight opacity-90">{truncateAddress(accountId)}</span>
                            </div>
                        ) : (
                            <Button
                                onClick={onConnect}
                                variant="outline"
                                className="h-10 rounded-full border-white/20 bg-white/10 px-6 font-bold text-white hover:bg-white hover:text-primary transition-all duration-300 shadow-lg hover:shadow-white/20"
                            >
                                Conectar Carteira
                            </Button>
                        )}

                        <div className="flex items-center gap-6 pl-2 border-l border-white/10">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/50">Recebíveis</span>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <ShieldCheck className="h-3.5 w-3.5 text-white/70" />
                                    <span className="text-sm font-bold">{releasableCount} eventos</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center md:items-end gap-3 self-center md:self-end">
                    <Button
                        size="lg"
                        onClick={onRelease}
                        disabled={!isConnected || isReleasing || releasableCount === 0}
                        className={cn(
                            "h-14 rounded-2xl px-10 font-black text-sm uppercase tracking-widest shadow-2xl transition-all duration-500",
                            "bg-white text-primary hover:bg-white/95 hover:-translate-y-1 hover:shadow-white/30",
                            "disabled:bg-white/20 disabled:text-white/40 disabled:shadow-none"
                        )}
                    >
                        {isReleasing ? (
                            <RefreshCcw className="mr-3 h-5 w-5 animate-spin" />
                        ) : (
                            <ArrowUpRight className="mr-3 h-5 w-5 stroke-[2.5]" />
                        )}
                        {isReleasing ? 'Processando...' : 'Solicitar Recebimento'}
                    </Button>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-tighter">
                        Processado com segurança via Stellar Network
                    </p>
                </div>
            </div>
        </div>
    );
}
