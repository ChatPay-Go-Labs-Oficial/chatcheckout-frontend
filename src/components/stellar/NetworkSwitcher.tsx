'use client';

/**
 * Network Switcher
 *
 * Component for switching between Stellar Testnet and Mainnet.
 * Shows the current network and allows switching with visual feedback.
 */

import { useStellarWallet } from '@/contexts/StellarWalletContext';
import { Button } from '@/components/ui/button';
import { Globe2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function NetworkSwitcher() {
  const { network, switchNetwork, isLoading } = useStellarWallet();

  const handleNetworkChange = async (newNetwork: 'testnet' | 'mainnet') => {
    if (newNetwork !== network && !isLoading) {
      await switchNetwork(newNetwork);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-muted/30 border border-muted/60 rounded-xl">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-background border flex items-center justify-center text-muted-foreground/80">
          <Globe2 className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">Rede de Operação</p>
          <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
            Stellar {network === 'mainnet' ? 'Main Network' : 'Test Network'}
          </p>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-muted/40 rounded-lg border">
        <Button
          variant={network === 'testnet' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleNetworkChange('testnet')}
          disabled={isLoading}
          className={cn(
            "h-7 px-4 text-[11px] font-bold uppercase tracking-wide transition-all",
            network === 'testnet' && "shadow-sm bg-primary hover:bg-primary/90"
          )}
        >
          Testnet
        </Button>
        <Button
          variant={network === 'mainnet' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleNetworkChange('mainnet')}
          disabled={isLoading}
          className={cn(
            "h-7 px-4 text-[11px] font-bold uppercase tracking-wide transition-all",
            network === 'mainnet' && "shadow-sm bg-primary hover:bg-primary/90"
          )}
        >
          Mainnet
        </Button>
      </div>
    </div>
  );
}
