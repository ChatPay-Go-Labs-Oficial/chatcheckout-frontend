'use client';

import { Fingerprint, ExternalLink, Info, ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface SecuritySectionProps {
    accountId: string | null;
    truncateAddress: (address: string | null) => string;
}

export function SecuritySection({ accountId, truncateAddress }: SecuritySectionProps) {
    return (
        <Card className="shadow-sm border-muted ring-0 bg-card/50 backdrop-blur-sm overflow-hidden h-full flex flex-col">
            <CardHeader className="py-3 px-6 border-b bg-muted/5 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-bold flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Fingerprint className="w-4 h-4" />
                    </div>
                    Segurança Digital
                </CardTitle>
            </CardHeader>
            <CardContent className="px-6 py-6 flex-1 flex flex-col">
                <div className="p-4 rounded-xl bg-emerald-500/[0.03] border border-emerald-500/10 mb-6 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 flex-shrink-0">
                        <ShieldCheck className="w-4 h-4" />
                    </div>
                    <p className="text-[11px] leading-relaxed font-semibold text-emerald-800/80">
                        Sua conta está protegida via <strong className="font-bold text-emerald-900">Passkeys</strong>.
                        Todas as chaves permanecem seguras no hardware do seu dispositivo.
                    </p>
                </div>

                <div className="space-y-5 flex-1">
                    <div className="space-y-2">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest px-1">Identificador da Carteira</span>
                        <div className="p-3 rounded-xl border bg-muted/20 font-mono text-[11px] flex items-center justify-between group overflow-hidden border-muted/40 hover:border-primary/20 transition-colors">
                            <span className="truncate text-foreground/80 font-bold">{accountId || 'Não disponível'}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10 hover:text-primary"
                                onClick={() => window.open(`https://stellar.expert/explorer/testnet/account/${accountId}`, '_blank')}
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl border border-dashed border-muted-foreground/20 bg-muted/[0.02] mt-auto">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center flex-shrink-0 text-primary/60">
                                <Info className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="text-[11px] font-bold text-foreground">Taxas Operacionais</h4>
                                <p className="text-[11px] text-muted-foreground leading-relaxed mt-1 font-medium">
                                    Operações de resgate na blockchain Stellar consomem frações mínimas de XLM para processamento da rede.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
