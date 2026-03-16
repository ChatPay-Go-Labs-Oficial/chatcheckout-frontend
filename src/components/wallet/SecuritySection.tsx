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
        <Card className="shadow-sm border-muted/60 bg-card h-full">
            <CardHeader className="pb-3 px-5">
                <CardTitle className="text-sm font-medium">Identificador & Segurança</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pt-0 pb-4 h-[calc(100%-3rem)] flex flex-col justify-between">
                <div className="space-y-1.5 flex-1">
                    <p className="text-xs text-muted-foreground">Sua chave pública na rede Stellar.</p>
                    <div className="p-3 rounded-lg border bg-muted/10 font-mono text-[11px] flex items-center justify-between group overflow-hidden border-muted/60 transition-colors">
                        <span className="truncate text-foreground font-medium">{accountId || 'Não conectado'}</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10 hover:text-primary rounded-md flex-shrink-0"
                            onClick={() => accountId && window.open(`https://stellar.expert/explorer/testnet/account/${accountId}`, '_blank')}
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-2.5 pt-4">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-tight">Criptografia Local Ativa</p>
                </div>
            </CardContent>
        </Card>
    );
}
