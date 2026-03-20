'use client';

import { useState } from 'react';
import { useStellarWallet } from '@/contexts/StellarWalletContext';
import { useWalletManagement } from '@/hooks/useWalletManagement';
import { WalletConnectionModal } from '@/components/stellar/WalletConnectionModal';
// Modular Components
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Copy, Check, LogOut, Wallet2, Network, RefreshCcw } from 'lucide-react';
import { AssetsList } from '@/components/wallet/AssetsList';
import { NetworkSwitcher } from '@/components/stellar/NetworkSwitcher';
import { XlmIcon } from '@/components/icons/XlmIcon';
import { UsdcIcon } from '@/components/icons/UsdcIcon';

export default function WalletSettingsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { isConnected, balance, balances, accountId, network, disconnectWallet, isFetchingBalance } = useStellarWallet();

  const {
    loadingEscrows,
    isReleasing,
    batchProgress,
    groupedByAsset,
    refreshReleasableEscrows,
    handleReleaseBatch,
  } = useWalletManagement();

  const handleCopyAddress = async () => {
    if (accountId) {
      await navigator.clipboard.writeText(accountId);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

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
    <div className="w-full p-8 pt-4 mx-auto pb-6 min-w-0 max-w-[100vw]">
      {/* Page Header - Standard Pattern */}
      <div className="flex flex-col mb-6 text-left">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Minha Carteira</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">
          Gerencie seu saldo Stellar, consulte ativos elegíveis e realize resgates com segurança.
        </p>
      </div>

      {/* Wallet Hub - Unified Management Card */}
      <div className="mb-8">
        {!isConnected ? (
          <Card className="shadow-sm border-dashed border-muted/80 bg-muted/5">
            <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Wallet2 className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-lg font-bold">Conecte sua Carteira</CardTitle>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Acesse seu saldo e gerencie seus ativos Stellar conectando sua carteira com segurança.
                </p>
              </div>
              <Button 
                onClick={() => setIsModalOpen(true)}
                className="font-bold px-8"
              >
                Conectar Agora
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-sm border-muted/60 bg-card/60 backdrop-blur-sm overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-muted/10">
              {/* Hub Left: Main Info (Stacked Balance & Identity) */}
              <div className="lg:col-span-6 p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-12 sm:gap-16">
                  {/* XLM Balance */}
                  <div className="flex items-center gap-4 group">
                    <div className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-muted/20 border border-muted/40 shadow-sm transition-transform group-hover:scale-105 duration-300">
                      <XlmIcon size={24} className="text-foreground" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Saldo XLM</p>
                      <div className="flex items-baseline gap-1.5">
                        {isFetchingBalance ? (
                          <Skeleton className="h-8 w-24 bg-muted/30" />
                        ) : (
                          <>
                            <span className="text-2xl font-bold tracking-tight text-foreground">{balances.XLM}</span>
                            <span className="text-[10px] font-bold text-muted-foreground/40 uppercase">XLM</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* USDC Balance */}
                  <div className="flex items-center gap-4 group">
                    <div className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-white shadow-md border border-muted/20 transition-transform group-hover:scale-105 duration-300 overflow-hidden">
                      <UsdcIcon size={48} />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Saldo USDC</p>
                      <div className="flex items-baseline gap-1.5">
                        {isFetchingBalance ? (
                          <Skeleton className="h-8 w-24 bg-muted/30" />
                        ) : (
                          <>
                            <span className="text-2xl font-bold tracking-tight text-foreground">{balances.USDC}</span>
                            <span className="text-[10px] font-bold text-muted-foreground/40 uppercase">USDC</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 max-w-md">
                   <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Identificador (Public Key)</p>
                   <div className="flex items-center gap-2 group">
                      <div className="flex-1 p-2 rounded-lg border bg-muted/20 font-mono text-[11px] truncate text-foreground/70 border-muted/60">
                         {accountId}
                      </div>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 flex-shrink-0 transition-all active:scale-95"
                        onClick={handleCopyAddress}
                      >
                        {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      </Button>
                   </div>
                </div>
              </div>

              {/* Hub Right: Actions and Settings */}
              <div className="lg:col-span-6 p-6 flex flex-col justify-between space-y-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Rede Ativa</p>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 w-fit rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      <div className="h-1 w-1 rounded-full bg-emerald-500" />
                      <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-tighter">{network}</span>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 font-bold gap-1.5 h-8"
                    onClick={() => disconnectWallet()}
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Desconectar carteira
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Trocar Ambiente de Operação</p>
                    <NetworkSwitcher />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Main Content Area - Only shown when connected */}
      {isConnected && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
          {/* Primary: Assets */}
          <div className="lg:col-span-12">
            <AssetsList
              groupedByAsset={groupedByAsset}
              loading={loadingEscrows}
              isReleasing={isReleasing}
              onRelease={handleReleaseBatch}
              onRefresh={() => void refreshReleasableEscrows()}
              formatAmount={formatAssetAmount}
              truncateAddress={truncateAddress}
            />
          </div>
        </div>
      )}

      {/* Batch Progress Overlay */}
      {batchProgress && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-primary px-6 py-3 rounded-full shadow-2xl border border-white/10 flex items-center gap-6 animate-in slide-in-from-bottom-4">
            <div className="flex items-center gap-2 text-primary-foreground">
              <RefreshCcw className="size-3.5 animate-spin" />
              <span className="text-xs font-bold uppercase tracking-widest">Processando Lote</span>
            </div>
            <div className="w-32 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-700"
                style={{ width: `${(batchProgress.done / batchProgress.total) * 100}%` }}
              />
            </div>
            <span className="text-[11px] font-bold text-white uppercase tracking-tighter">
              {batchProgress.done} / {batchProgress.total}
            </span>
          </div>
        </div>
      )}

      <WalletConnectionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

