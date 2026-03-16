'use client';

import { useState } from 'react';
import { useStellarWallet } from '@/contexts/StellarWalletContext';
import { useWalletManagement } from '@/hooks/useWalletManagement';
import { WalletConnectionModal } from '@/components/stellar/WalletConnectionModal';
import { RefreshCcw } from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { History, Settings2 } from 'lucide-react';

// Modular Components
import { WalletHeader } from '@/components/wallet/WalletHeader';
import { WalletHero } from '@/components/wallet/WalletHero';
import { AssetsList } from '@/components/wallet/AssetsList';
import { NetworkConfig } from '@/components/wallet/NetworkConfig';
import { SecuritySection } from '@/components/wallet/SecuritySection';

export default function WalletSettingsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isConnected, balance, accountId, network } = useStellarWallet();

  const {
    loadingEscrows,
    isReleasing,
    batchProgress,
    groupedByAsset,
    refreshReleasableEscrows,
    handleReleaseBatch,
  } = useWalletManagement();

  const truncateAddress = (address: string | null) => {
    if (!address) return 'Não conectado';
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  const formatAssetAmount = (stroopsAmount: string) => {
    try {
      const value = BigInt(stroopsAmount);
      const whole = value / 10000000n;
      const fraction = (value % 10000000n).toString().padStart(7, '0').replace(/0+$/, '');
      return fraction ? `${whole.toString()}.${fraction}` : whole.toString();
    } catch {
      return '0';
    }
  };

  return (
    <div className="w-full min-h-screen p-8 pt-6 space-y-10 animate-in fade-in duration-700 bg-background/30">
      {/* Top Header Section */}
      <WalletHeader network={network} />

      {/* Hero Financial Area */}
      <WalletHero
        balance={balance}
        accountId={accountId}
        isConnected={isConnected}
        isReleasing={isReleasing}
        releasableCount={Object.keys(groupedByAsset).length}
        onRelease={handleReleaseBatch}
        onConnect={() => setIsModalOpen(true)}
      />

      {/* Professional Information Architecture with Tabs */}
      <Tabs defaultValue="activity" className="w-full space-y-8">
        <div className="flex items-center justify-between border-b border-muted/30 pb-1">
          <TabsList className="bg-transparent h-fit p-0 gap-8">
            <TabsTrigger
              value="activity"
              className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 text-sm font-bold uppercase tracking-widest gap-2 transition-all px-2"
            >
              <History className="w-4 h-4" />
              Minhas Atividades
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 text-sm font-bold uppercase tracking-widest gap-2 transition-all px-2"
            >
              <Settings2 className="w-4 h-4" />
              Configurações & Rede
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="activity" className="space-y-8 outline-none mt-0">
          <div className="relative group">
            <AssetsList
              groupedByAsset={groupedByAsset}
              loading={loadingEscrows}
              isReleasing={isReleasing}
              onRelease={handleReleaseBatch}
              onRefresh={() => void refreshReleasableEscrows()}
              formatAmount={formatAssetAmount}
              truncateAddress={truncateAddress}
            />

            {/* Batch Progress Overlay */}
            {batchProgress && (
              <div className="absolute inset-x-0 -bottom-6 px-12 z-20">
                <div className="bg-primary px-6 py-3 rounded-2xl shadow-2xl border border-white/10 flex items-center justify-between animate-in slide-in-from-bottom-4 duration-500 ring-4 ring-background">
                  <div className="flex items-center gap-3 text-primary-foreground">
                    <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                    <span className="text-xs font-black uppercase tracking-[0.15em]">
                      Liberação em Lote em Andamento
                    </span>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="w-48 h-2 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white transition-all duration-700 ease-out shadow-[0_0_12px_rgba(255,255,255,0.4)]"
                        style={{ width: `${(batchProgress.done / batchProgress.total) * 100}%` }}
                      />
                    </div>
                    <span className="text-[13px] font-black text-white tabular-nums">
                      {batchProgress.done} <span className="opacity-40">/</span> {batchProgress.total}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="outline-none mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            <NetworkConfig onConnectClick={() => setIsModalOpen(true)} />
            <SecuritySection
              accountId={accountId}
              truncateAddress={truncateAddress}
            />
          </div>
        </TabsContent>
      </Tabs>

      <WalletConnectionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

