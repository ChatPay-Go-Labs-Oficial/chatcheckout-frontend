'use client';

import { Layers } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { NetworkSwitcher } from '@/components/stellar/NetworkSwitcher';
import { WalletStatusIndicator } from '@/components/stellar/WalletStatusIndicator';

interface NetworkConfigProps {
    onConnectClick: () => void;
}

export function NetworkConfig({ onConnectClick }: NetworkConfigProps) {
    return (
        <Card className="shadow-sm border-muted ring-0 bg-card/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="py-3 px-6 border-b bg-muted/5 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-bold flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Layers className="w-4 h-4" />
                    </div>
                    Rede & Conexão
                </CardTitle>
            </CardHeader>
            <CardContent className="px-6 py-5 space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Selecione a Rede</label>
                    <NetworkSwitcher />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Status da Carteira</label>
                    <WalletStatusIndicator onConnectClick={onConnectClick} />
                </div>
            </CardContent>
        </Card>
    );
}
