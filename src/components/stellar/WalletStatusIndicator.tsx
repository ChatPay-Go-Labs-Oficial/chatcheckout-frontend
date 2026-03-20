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
      <div className="flex items-center gap-4 transition-colors">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-foreground">Carteira Conectada</p>
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
          </div>
          <div className="flex gap-2 items-center mt-1">
            <p
              className="text-[11px] text-muted-foreground font-mono truncate"
              title={publicKey || undefined}
            >
              {truncateAddress(publicKey)}
            </p>
            <div className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-bold text-foreground shrink-0">
              {balance} XLM
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={disconnectWallet}
          className="h-7 w-7 hover:text-destructive hover:bg-destructive/5 shrink-0"
        >
          <LogOut className="w-3 h-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="py-2 flex flex-col gap-3">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">Carteira Desconectada</p>
        <p className="text-[11px] text-muted-foreground">
          Conecte sua carteira Stellar para gerenciar ativos e resgates.
        </p>
      </div>
      <Button onClick={onConnectClick} className="h-9 w-full font-bold shadow-sm">
        <WalletCards className="w-4 h-4 mr-2" />
        Conectar Carteira
      </Button>
    </div>
  );
}
