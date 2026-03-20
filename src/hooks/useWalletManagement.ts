'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useStellarWallet } from '@/contexts/StellarWalletContext';
import { useStellarWallet as useSignerWallet } from '@/hooks/useStellarWallet';
import { useAuth } from '@/hooks/useAuth';
import { useGlobalToast } from '@/contexts/ToastContext';
import { stellarPayoutService, type ReleasableEscrow } from '@/services/stellarPayoutService';

export function useWalletManagement() {
  const [releasableEscrows, setReleasableEscrows] = useState<ReleasableEscrow[]>([]);
  const [loadingEscrows, setLoadingEscrows] = useState(false);
  const [escrowsError, setEscrowsError] = useState<string | null>(null);
  const [isReleasing, setIsReleasing] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ done: number; total: number } | null>(null);

  const { user } = useAuth();
  const toast = useGlobalToast();
  const passkeyWallet = useStellarWallet();
  const signerWallet = useSignerWallet();

  const sellerAddress = user?.cryptoWalletAddress || passkeyWallet.accountId || null;
  const passkeyFeePayerAddress = passkeyWallet.getFeePayerAddress();

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
      return;
    }

    const requiresSource = sellerAddress.startsWith('C');
    const sourceAddress = signerWallet.address || passkeyFeePayerAddress;

    if (requiresSource && !sourceAddress) {
      setReleasableEscrows([]);
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
      setEscrowsError(error instanceof Error ? error.message : 'Erro ao carregar escrows');
    } finally {
      setLoadingEscrows(false);
    }
  }, [passkeyFeePayerAddress, sellerAddress, signerWallet.address]);

  useEffect(() => {
    void refreshReleasableEscrows();
  }, [refreshReleasableEscrows]);

  const handleReleaseBatch = useCallback(async () => {
    if (!sellerAddress) {
      toast.error('Configure um endereço de carteira primeiro.');
      return;
    }

    if (releasableEscrows.length === 0) {
      toast.info('Não há valores elegíveis no momento.');
      return;
    }

    try {
      setIsReleasing(true);
      setBatchProgress({ done: 0, total: releasableEscrows.length });

      let sourceAddress = signerWallet.address;
      if (!sourceAddress) sourceAddress = passkeyFeePayerAddress ?? undefined;
      if (!sourceAddress) sourceAddress = await signerWallet.connect();

      if (!sourceAddress) throw new Error('Cateria não conectada.');

      const canUsePasskeyPath =
        passkeyWallet.isConnected && sourceAddress === passkeyFeePayerAddress;
      toast.info(
        releasableEscrows.length > 1
          ? `Processando ${releasableEscrows.length} resgates...`
          : 'Processando resgate...',
      );

      if (canUsePasskeyPath) {
        let successCount = 0;
        let failedCount = 0;

        for (let index = 0; index < releasableEscrows.length; index++) {
          const escrow = releasableEscrows[index];
          const txResult = await passkeyWallet.releaseEscrowPayment(escrow.escrowId);
          if (txResult.success) {
            successCount += 1;
            if (releasableEscrows.length === 1) toast.success('Recebimento realizado com sucesso!');
          } else {
            failedCount += 1;
            toast.error(`Erro no resgate ${escrow.escrowId}: ${txResult.error}`);
          }
          setBatchProgress({ done: index + 1, total: releasableEscrows.length });
        }

        if (releasableEscrows.length > 1) {
          if (failedCount === 0) toast.success(`${successCount} processados com sucesso.`);
          else toast.warning(`${successCount} sucessos, ${failedCount} falhas.`);
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
        toast.success(
          result.success === 1 ? 'Recebimento realizado!' : `${result.success} processados.`,
        );
      } else {
        toast.warning(`${result.success} sucessos, ${result.failed} falhas.`);
      }

      await passkeyWallet.getBalance();
      await refreshReleasableEscrows();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao solicitar recebimento');
    } finally {
      setIsReleasing(false);
      setBatchProgress(null);
    }
  }, [
    passkeyWallet,
    passkeyFeePayerAddress,
    releasableEscrows,
    refreshReleasableEscrows,
    sellerAddress,
    signerWallet,
    toast,
  ]);

  return {
    releasableEscrows,
    loadingEscrows,
    escrowsError,
    isReleasing,
    batchProgress,
    groupedByAsset,
    refreshReleasableEscrows,
    handleReleaseBatch,
  };
}
