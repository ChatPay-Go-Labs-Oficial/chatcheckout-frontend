/**
 * Step de Conexão de Wallet Stellar
 * Componente inline para permitir usuário conectar sua wallet Stellar
 */

'use client';

import { useState } from 'react';
import { useStellarWallet } from '@/hooks/useStellarWallet';
import { MessageComponentData } from '@/types/checkout';
import { UseCheckoutReturn } from '@/types/checkout-hook';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, ShieldCheck, Info, MapPin, RefreshCcw, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WalletConnectionStepProps {
  data: MessageComponentData;
  checkout: UseCheckoutReturn;
}

export function WalletConnectionStep({ checkout }: WalletConnectionStepProps) {
  const { address, isConnected, isConnecting, error, connect } = useStellarWallet();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConnect = async () => {
    console.log('[WalletConnectionStep] handleConnect chamado', {
      isConnected,
      address,
      hasHandleWalletConnected: !!checkout.handleWalletConnected,
    });

    try {
      // Se já estiver conectado, apenas prosseguir
      if (isConnected && address) {
        setIsProcessing(true);
        console.log('[WalletConnectionStep] Chamando handleWalletConnected com:', address);

        if (!checkout.handleWalletConnected) {
          console.error('[WalletConnectionStep] handleWalletConnected não existe no checkout!');
          setIsProcessing(false);
          return;
        }

        await checkout.handleWalletConnected(address);
        console.log('[WalletConnectionStep] handleWalletConnected completado');
        return;
      }

      // Conectar wallet
      console.log('[WalletConnectionStep] Conectando wallet...');
      setIsProcessing(true);
      const connectedAddress = await connect();
      console.log('[WalletConnectionStep] Wallet conectada:', connectedAddress);

      if (connectedAddress) {
        // Chamar o hook do checkout para notificar que a wallet foi conectada
        await checkout.handleWalletConnected?.(connectedAddress);
      }
    } catch (err) {
      console.error('[WalletConnectionStep] Erro ao conectar wallet:', err);
      setIsProcessing(false);
    }
  };

  return (
    <Card className="shadow-sm border-muted/60 mt-3 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
      <CardContent className="p-6">
        {/* Header com ícone */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary border border-primary/20 shadow-sm">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Conectar Carteira Stellar</h3>
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Pague com Cripto (XLM ou USDC)</p>
          </div>
        </div>

        {/* Descrição */}
        <div className="mb-6 space-y-4">
          <p className="text-[13px] text-muted-foreground leading-relaxed font-medium">
            Para finalizar seu pagamento utilizando <strong className="text-foreground">Cripto</strong>, é necessário realizar a conexão com sua carteira Stellar ativa.
          </p>

          {/* Carteiras suportadas */}
          <div className="bg-muted/30 rounded-xl p-4 border border-muted/60 flex items-start gap-3">
            <div className="p-1 bg-background border rounded text-muted-foreground mt-0.5">
              <Info className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-foreground uppercase tracking-wider mb-2">Carteiras recomendadas:</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    <strong className="text-foreground">Freighter</strong> — Navegador (Chrome/Firefox)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    <strong className="text-foreground">Lobstr</strong> — Mobile App & Web Wallet
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-5 p-3.5 bg-destructive/10 border border-destructive/20 rounded-xl animate-in shake duration-300">
            <p className="text-xs font-bold text-destructive flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>
          </div>
        )}

        {/* Botão de Conexão */}
        <Button
          onClick={handleConnect}
          disabled={isConnecting || isProcessing}
          className="w-full h-12 flex items-center justify-center gap-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-md transition-all duration-200 group"
        >
          {isConnecting || isProcessing ? (
            <RefreshCcw className="w-4 h-4 animate-spin" />
          ) : isConnected ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <Wallet className="w-4 h-4 group-hover:scale-110 transition-transform" />
          )}
          <span className="text-sm">
            {isProcessing
              ? 'Preparando Transação...'
              : isConnecting
                ? 'Conectando...'
                : isConnected
                  ? 'Continuar com Carteira'
                  : 'Conectar Carteira Stellar'}
          </span>
        </Button>

        {/* Mensagem se já estiver conectado */}
        {isConnected && address && (
          <div className="mt-4 flex flex-col items-center gap-2 pt-4 border-t border-muted/30 animate-in fade-in duration-500">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium">
              <MapPin className="w-3 h-3 text-emerald-500" />
              Conectado: <span className="font-mono font-bold text-foreground tracking-tight">{address.slice(0, 8)}...{address.slice(-8)}</span>
            </div>
            <button
              onClick={() => connect()}
              className="text-[10px] text-primary font-bold uppercase tracking-widest hover:underline transition-all"
            >
              Trocar Carteira
            </button>
          </div>
        )}

        {/* Security badges */}
        <div className="mt-6 flex items-center justify-center gap-6 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Infra Segura</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Nativo Stellar</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
