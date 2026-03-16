'use client';

/**
 * Wallet Status Indicator
 *
 * Component that displays the current connection status of the Stellar wallet.
 * Shows connection details when connected and a connect button when disconnected.
 */

import { useStellarWallet } from '@/contexts/StellarWalletContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Wallet, LogOut, CheckCircle2, WalletCards } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WalletStatusIndicatorProps {
  onConnectClick: () => void;
}

export function WalletStatusIndicator({ onConnectClick }: WalletStatusIndicatorProps) {
  const { isConnected, publicKey, balance, disconnectWallet, network } = useStellarWallet();

  // Truncate address for display (e.g., "CDLZ...QLFO")
  const truncateAddress = (address: string | null) => {
    if (!address) return '';
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  if (isConnected) {
    return (
      <Card className="shadow-sm border-muted/60 bg-muted/30">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0 text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-foreground">Carteira Conectada</p>
              <span className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                Ativa
              </span>
            </div>
            <p className="text-[12px] text-muted-foreground font-mono truncate mt-0.5" title={publicKey || undefined}>
              {truncateAddress(publicKey)}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <p className="text-[11px] font-bold text-foreground bg-muted/50 px-2 py-0.5 rounded border border-muted/60">
                {balance} XLM
              </p>
              <span className="text-xs text-muted-foreground/40">•</span>
              <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-tight">{network}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={disconnectWallet}
            className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="Desconectar carteira"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Button
      onClick={onConnectClick}
      className="w-full h-14 flex items-center justify-center gap-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-md transition-all duration-200 group"
    >
      <WalletCards className="w-5 h-5 transition-transform group-hover:scale-110" />
      <span className="text-sm tracking-tight">Conectar Carteira Stellar</span>
    </Button>
  );
}
