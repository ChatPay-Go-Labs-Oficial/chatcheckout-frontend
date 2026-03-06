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

export default function WalletSettingsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [releasableEscrows, setReleasableEscrows] = useState<ReleasableEscrow[]>([]);
  const [loadingEscrows, setLoadingEscrows] = useState(false);
  const [escrowsError, setEscrowsError] = useState<string | null>(null);
  const [isReleasing, setIsReleasing] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ done: number; total: number } | null>(null);

  const { user } = useAuth();
  const toast = useGlobalToast();
  const { isConnected, balance, accountId, getFeePayerAddress, releaseEscrowPayment } =
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
      const escrows = await stellarPayoutService.getReleasableEscrows(sellerAddress, sourceAddress);
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
        sourceAddress = passkeyFeePayerAddress;
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
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Configurações da Carteira</h1>
        <p className="text-gray-600 mt-2">
          Gerencie sua carteira Stellar para pagamentos com criptomoedas
        </p>
      </div>

      <div className="space-y-6">
        {/* Network Selection */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4">Rede Stellar</h2>
          <NetworkSwitcher />
          <p className="text-xs text-gray-500 mt-3">
            {isConnected
              ? 'Ao trocar de rede, você precisará reconectar sua carteira.'
              : 'Selecione a rede antes de conectar sua carteira.'}
          </p>
        </div>

        {/* Wallet Connection */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4">Carteira</h2>
          <WalletStatusIndicator onConnectClick={() => setIsModalOpen(true)} />
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-1">Receber Valores em Cripto</h2>
              <p className="text-sm text-gray-600">
                Libera em lote os escrows ativos que já passaram do período de garantia.
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Carteira de recebimento: {truncateAddress(sellerAddress)}
              </p>
            </div>

            <button
              onClick={handleReleaseBatch}
              disabled={loadingEscrows || isReleasing || releasableEscrows.length === 0}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#6f43d0] to-[#6fdcff] text-white font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isReleasing ? 'Processando recebimentos...' : 'Solicitar recebimento'}
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
              <p className="text-xs text-gray-500">Escrows elegíveis</p>
              <p className="text-xl font-bold text-gray-800">
                {loadingEscrows ? '...' : releasableEscrows.length}
              </p>
            </div>

            <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 sm:col-span-2">
              <p className="text-xs text-gray-500 mb-1">Total estimado por ativo</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {Object.keys(groupedByAsset).length === 0 ? (
                  <span className="text-sm text-gray-600">Sem valores elegíveis</span>
                ) : (
                  Object.entries(groupedByAsset).map(([assetAddress, amount]) => (
                    <span key={assetAddress} className="text-sm font-semibold text-gray-800">
                      {formatAssetAmount(amount.toString())} ({truncateAddress(assetAddress)})
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 text-xs text-gray-500">
            {batchProgress ? (
              <span>
                Processando lote: {batchProgress.done}/{batchProgress.total}
              </span>
            ) : (
              <span>
                Assinatura atual para envio: {truncateAddress(signerWallet.address || null)}.
              </span>
            )}
          </div>

          {escrowsError && <p className="mt-2 text-xs text-red-600">{escrowsError}</p>}
        </div>

        {/* Account Details */}
        {isConnected && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">Detalhes da Conta</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-600">Account ID</p>
                <p
                  className="text-sm text-gray-800 font-mono break-all"
                  title={accountId || undefined}
                >
                  {truncateAddress(accountId)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Saldo</p>
                <p className="text-lg font-semibold text-gray-800">{balance} XLM</p>
              </div>
            </div>
          </div>
        )}

        {/* Information Section */}
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">Sobre Passkeys</h3>
          <p className="text-sm text-blue-800 mb-3">
            Esta carteira utiliza a tecnologia WebAuthn para proteger seus ativos com biometria.
            Suas chaves privadas nunca saem do seu dispositivo e você pode autorizar transações
            usando impressão digital, Face ID, ou PIN do dispositivo.
          </p>
          <h3 className="font-semibold text-blue-900 mb-2 mt-4">Sobre Stellar</h3>
          <p className="text-sm text-blue-800">
            Stellar é uma rede blockchain projetada para facilitar pagamentos rápidos e de baixo
            custo. Com sua Smart Account, você pode enviar e receber XLM e outros ativos digitais
            com segurança.
          </p>
        </div>

        {/* Testnet Warning */}
        {isConnected && (
          <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-yellow-600 text-2xl">warning</span>
              <div>
                <h3 className="font-semibold text-yellow-900 mb-1">Modo Testnet Ativado</h3>
                <p className="text-sm text-yellow-800">
                  Você está conectado à rede de teste. Os tokens XLM na Testnet não têm valor real e
                  são usados apenas para fins de teste. Use a Mainnet para transações com valor
                  real.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <WalletConnectionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
