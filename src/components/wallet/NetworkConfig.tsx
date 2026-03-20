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
    <Card className="shadow-sm border-muted/60 bg-card overflow-hidden h-full">
      <CardHeader className="pb-3 px-5">
        <CardTitle className="text-sm font-medium">Conexão & Rede</CardTitle>
      </CardHeader>
      <CardContent className="px-5 pt-0 pb-4 flex flex-col justify-between h-[calc(100%-3rem)] min-h-[140px]">
        {/* Connection Status & Action - Primary */}
        <div className="pb-3 borber-b border-muted/30">
          <WalletStatusIndicator onConnectClick={onConnectClick} />
        </div>

        {/* Network Selection - Secondary */}
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Rede
          </p>
          <NetworkSwitcher />
        </div>
      </CardContent>
    </Card>
  );
}
