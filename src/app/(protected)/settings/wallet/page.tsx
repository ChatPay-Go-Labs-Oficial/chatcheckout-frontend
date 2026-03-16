'use client';

/**
 * Wallet Settings Page
 *
 * Page for managing Stellar wallet settings.
 * Users can connect/create wallets, switch networks, and view account details.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useStellarWallet as usePasskeyWallet } from '@/contexts/StellarWalletContext';
import { useStellarWallet as useSignerWallet } from '@/hooks/useStellarWallet';
import { useAuth } from '@/hooks/useAuth';
import { useGlobalToast } from '@/contexts/ToastContext';
import { WalletStatusIndicator } from '@/components/stellar/WalletStatusIndicator';
import { WalletConnectionModal } from '@/components/stellar/WalletConnectionModal';
import { NetworkSwitcher } from '@/components/stellar/NetworkSwitcher';
import { stellarPayoutService, type ReleasableEscrow } from '@/services/stellarPayoutService';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Wallet, 
  RefreshCcw, 
  Coins, 
  Info, 
  AlertTriangle, 
  Fingerprint, 
  Layers, 
  ArrowUpRight 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function WalletSettingsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [releasableEscrows, setReleasableEscrows] = useState<ReleasableEscrow[]>([]);
  const [loadingEscrows, setLoadingEscrows] = useState(false);
  const [escrowsError, setEscrowsError] = useState<string | null>(null);
  const [isReleasing, setIsReleasing] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ done: number; total: number } | null>(null);

  const { user } = useAuth();
  const toast = useGlobalToast();
  const { isConnected, balance, accountId, getFeePayerAddress, releaseEscrowPayment, network } =
    usePasskeyWallet();
  const signerWallet = useSignerWallet();

  const sellerAddress = user?.cryptoWalletAddress || accountId || null;
  const passkeyFeePayerAddress = getFeePayerAddress();

  // Truncate address for display
  const truncateAddress = (address: string | null) => {
    if (!address) return 'N/A';
    if (address.length <= 20) return address;
    return `${address.slice(0, 10)}...${address.slice(-10)}`;
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

  const groupedByAsset = useMemo(() => {
    return releasableEscrows.reduce<Record<string, bigint>>((acc, escrow) => {
      const current = acc[escrow.asset] || 0n;
      try {
        acc[escrow.asset] = current + BigInt(escrow.amount);
      } catch {
        acc[escrow.asset] = current;
      }
      return acc;
    }, {});
  }, [releasableEscrows]);

  const refreshReleasableEscrows = useCallback(async () => {
    if (!sellerAddress) {
      setReleasableEscrows([]);
      setEscrowsError('Configure sua carteira de recebimento para visualizar escrows.');
      return;
    }

    const requiresSource = sellerAddress.startsWith('C');
    const sourceAddress = signerWallet.address || passkeyFeePayerAddress;

    if (requiresSource && !sourceAddress) {
      setReleasableEscrows([]);
      setEscrowsError(
        'Conecte uma carteira de assinatura para consultar escrows vinculados a endereço C...',
      );
      return;
    }

    try {
      setLoadingEscrows(true);
      setEscrowsError(null);
      const escrows = await stellarPayoutService.getReleasableEscrows(
        sellerAddress,
        sourceAddress ?? undefined,
      );
      setReleasableEscrows(escrows);
    } catch (error) {
      setEscrowsError(
        error instanceof Error ? error.message : 'Erro ao carregar escrows elegíveis',
      );
    } finally {
      setLoadingEscrows(false);
    }
  }, [passkeyFeePayerAddress, sellerAddress, signerWallet.address]);

  useEffect(() => {
    void refreshReleasableEscrows();
  }, [refreshReleasableEscrows]);

  const handleReleaseBatch = useCallback(async () => {
    if (!sellerAddress) {
      toast.error('Configure um endereço de carteira para o vendedor antes de liberar valores.');
      return;
    }

    if (releasableEscrows.length === 0) {
      toast.info('Não há valores elegíveis para recebimento neste momento.');
      return;
    }

    try {
      setIsReleasing(true);
      setBatchProgress({ done: 0, total: releasableEscrows.length });

      let sourceAddress = signerWallet.address;
      if (!sourceAddress) {
        sourceAddress = passkeyFeePayerAddress ?? undefined;
      }

      if (!sourceAddress) {
        sourceAddress = await signerWallet.connect();
      }

      if (!sourceAddress) {
        throw new Error('Não foi possível obter uma carteira para assinatura/envio.');
      }

      const canUsePasskeyPath = isConnected && sourceAddress === passkeyFeePayerAddress;

      if (canUsePasskeyPath) {
        let success = 0;
        let failed = 0;

        for (let index = 0; index < releasableEscrows.length; index++) {
          const escrow = releasableEscrows[index];
          const txResult = await releaseEscrowPayment(escrow.escrowId);

          if (txResult.success) {
            success += 1;
          } else {
            failed += 1;
          }

          setBatchProgress({ done: index + 1, total: releasableEscrows.length });
        }

        if (failed === 0) {
          toast.success(`${success} recebimento(s) processado(s) com smart account.`);
        } else if (success > 0) {
          toast.warning(`${success} recebido(s) e ${failed} falha(s) no fluxo smart account.`);
        } else {
          toast.error('Nenhum recebimento foi processado via smart account.');
        }

        await refreshReleasableEscrows();
        return;
      }

      const result = await stellarPayoutService.releaseEscrowsBatch({
        escrowIds: releasableEscrows.map((escrow) => escrow.escrowId),
        sourceAddress,
        signTransactionFn: signerWallet.signTransaction,
        onProgress: (done, total) => setBatchProgress({ done, total }),
      });

      if (result.failed === 0) {
        toast.success(`${result.success} recebimento(s) processado(s) com sucesso.`);
      } else if (result.success > 0) {
        toast.warning(
          `${result.success} recebido(s) com sucesso e ${result.failed} falha(s). Verifique o histórico.`,
        );
      } else {
        toast.error('Nenhum recebimento foi processado. Tente novamente.');
      }

      await refreshReleasableEscrows();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao solicitar recebimento');
    } finally {
      setIsReleasing(false);
      setBatchProgress(null);
    }
  }, [
    isConnected,
    passkeyFeePayerAddress,
    releasableEscrows,
    refreshReleasableEscrows,
    releaseEscrowPayment,
    sellerAddress,
    signerWallet,
    toast,
  ]);

  return (
    <div className="w-full p-8 pt-4 mx-auto pb-6 animate-in fade-in duration-500">
      <div className="flex flex-col mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Configurações da Carteira</h1>
        <p className="text-[13px] text-muted-foreground mt-1">
          Gerencie sua carteira Stellar e receba seus pagamentos em criptomoedas.
        </p>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Network Selection & Status Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-sm border-muted/60">
            <CardHeader className="py-2.5 px-5 border-b bg-muted/10">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Layers className="w-4 h-4 text-muted-foreground/80" />
                Rede Stellar
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <NetworkSwitcher />
              <p className="text-[11px] text-muted-foreground font-medium mt-3 px-1 leading-relaxed">
                {isConnected
                  ? 'Ao trocar de rede, sua carteira será desconectada automaticamente por segurança.'
                  : 'Certifique-se de selecionar a rede correta antes de realizar a conexão.'}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-muted/60">
            <CardHeader className="py-2.5 px-5 border-b bg-muted/10">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Wallet className="w-4 h-4 text-muted-foreground/80" />
                Conexão
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <WalletStatusIndicator onConnectClick={() => setIsModalOpen(true)} />
            </CardContent>
          </Card>
        </div>

        {/* Payout Management Section */}
        <Card className="shadow-sm border-muted/60">
          <CardHeader className="py-3 px-5 border-b bg-muted/10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Coins className="w-4 h-4 text-muted-foreground/80" />
                  Receber Valores em Cripto
                </CardTitle>
                <CardDescription className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                  Liberação de Escrows Elegíveis (Pós-Garantia)
                </CardDescription>
              </div>
              <Button
                onClick={handleReleaseBatch}
                disabled={loadingEscrows || isReleasing || releasableEscrows.length === 0}
                className="h-10 px-6 bg-primary hover:bg-primary/90 text-white font-bold shadow-md transition-all sm:w-fit"
              >
                {isReleasing ? (
                  <span className="flex items-center gap-2">
                    <RefreshCcw className="w-4 h-4 animate-spin" />
                    Processando...
                  </span>
                ) : (
                  'Solicitar Recebimento'
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 mb-5">
              <div className="sm:col-span-5 space-y-4">
                <div className="p-4 rounded-xl bg-muted/30 border border-muted/60 flex flex-col justify-center gap-1">
                  <p className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-widest">Escrows Elegíveis</p>
                  <p className="text-2xl font-bold text-foreground">
                    {loadingEscrows ? '...' : releasableEscrows.length}
                  </p>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block px-1">Carteira de Recebimento</label>
                  <div className="flex items-center gap-2 px-3 py-2 bg-muted/20 border border-muted/40 rounded-lg group">
                    <div className="p-1 rounded bg-background border flex-shrink-0">
                      <ArrowUpRight className="w-3 h-3 text-muted-foreground/60" />
                    </div>
                    <p className="text-[12px] font-mono font-medium text-foreground truncate" title={sellerAddress || undefined}>
                      {truncateAddress(sellerAddress)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="sm:col-span-7">
                <div className="h-full p-4 rounded-xl bg-muted/30 border border-muted/60">
                  <p className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-widest mb-3">Total Estimado por Ativo</p>
                  <div className="space-y-2 max-h-[140px] overflow-y-auto pr-2 custom-scrollbar">
                    {Object.keys(groupedByAsset).length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-4 text-center">
                        <Info className="w-5 h-5 text-muted-foreground/20 mb-1" />
                        <span className="text-xs text-muted-foreground/60 font-medium italic">Sem valores elegíveis no momento</span>
                      </div>
                    ) : (
                      Object.entries(groupedByAsset).map(([assetAddress, amount]) => (
                        <div key={assetAddress} className="flex items-center justify-between p-2.5 bg-background border rounded-lg shadow-sm">
                          <span className="text-xs font-bold text-foreground font-mono">
                            {truncateAddress(assetAddress)}
                          </span>
                          <span className="text-sm font-bold text-primary">
                            {formatAssetAmount(amount.toString())}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-muted/30">
              <div className="flex items-center gap-2">
                {batchProgress ? (
                  <div className="flex items-center gap-2 text-[11px] font-bold text-primary animate-pulse">
                    <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                    <span>Lote: {batchProgress.done}/{batchProgress.total} processados</span>
                  </div>
                ) : (
                  <div className="text-[11px] text-muted-foreground font-medium flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                    Assinatura: {truncateAddress(signerWallet.address || null)}
                  </div>
                )}
              </div>
              {escrowsError && (
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-destructive">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {escrowsError}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Account Details & Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isConnected && (
            <Card className="shadow-sm border-muted/60">
              <CardHeader className="py-2.5 px-5 border-b bg-muted/10">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Info className="w-4 h-4 text-muted-foreground/80" />
                  Detalhes da Conta
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest px-1">Account ID</p>
                  <p className="text-[12px] font-mono text-foreground bg-muted/20 border border-muted/40 p-2 rounded-lg break-all">
                    {accountId}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest px-1">Saldo Atual</p>
                  <div className="flex items-center gap-2">
                    <div className="p-1 px-3 bg-primary/10 border border-primary/20 rounded-lg">
                      <span className="text-lg font-bold text-primary">{balance} XLM</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className={cn("shadow-sm border-muted/60", !isConnected && "md:col-span-2")}>
            <CardHeader className="py-2.5 px-5 border-b bg-muted/10">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-muted-foreground/80" />
                Segurança Passkeys
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <p className="text-[12px] text-muted-foreground leading-relaxed font-medium">
                Esta carteira utiliza biometria do seu dispositivo (<strong className="text-foreground">WebAuthn</strong>) para proteger seus ativos. Suas chaves privadas nunca saem do seu hardware, garantindo segurança máxima contra ataques de rede.
              </p>
              <div className="mt-4 pt-4 border-t border-muted/30">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">Sobre a Rede Stellar</p>
                <p className="text-[12px] text-muted-foreground leading-relaxed font-medium">
                  Stellar é focada em pagamentos rápidos e eficientes. Com sua <strong className="text-foreground">Smart Account</strong>, você gerencia XLM e outros ativos digitais com taxas mínimas.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Warning Section */}
        {network === 'testnet' && (
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-700">Modo Testnet Ativado</h4>
              <p className="text-[12px] text-amber-700/80 leading-relaxed font-medium mt-1">
                Você esta operando na rede de testes da Stellar. Os tokens <strong className="text-amber-800">XLM</strong> exibidos são fictícios e não possuem valor real. Alterne para a <strong className="text-amber-800">Mainnet</strong> para transações oficiais.
              </p>
            </div>
          </div>
        )}
      </div>

      <WalletConnectionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
