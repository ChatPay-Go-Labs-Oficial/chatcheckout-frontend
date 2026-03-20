'use client';

/**
 * Wallet Connection Modal
 *
 * Modal component for creating or connecting to a Stellar wallet.
 * Provides options to create a new wallet with passkey or connect to an existing one.
 */

import { useState } from 'react';
import { useStellarWallet } from '@/contexts/StellarWalletContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Wallet, Plus, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface WalletConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletConnectionModal({ isOpen, onClose }: WalletConnectionModalProps) {
  const { connectWallet, createWallet, isLoading } = useStellarWallet();
  const [isCreating, setIsCreating] = useState(false);

  const handleConnect = async () => {
    try {
      await connectWallet();
      onClose();
    } catch (error) {
      console.error('Connection error:', error);
    }
  };

  const handleCreate = async () => {
    try {
      setIsCreating(true);
      await createWallet();
      onClose();
    } catch (error) {
      console.error('Creation error:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-muted/60 shadow-2xl">
        <div className="relative h-32 bg-primary flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 -left-4 w-24 h-24 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 -right-4 w-32 h-32 bg-white rounded-full blur-3xl" />
          </div>
          <div className="relative w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-center shadow-inner">
            <Wallet className="w-8 h-8 text-white" />
          </div>
        </div>

        <div className="p-6 pt-4">
          <DialogHeader className="text-center space-y-2 mb-6">
            <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
              Conectar Carteira Stellar
            </DialogTitle>
            <DialogDescription className="text-[13px] text-muted-foreground leading-relaxed px-4">
              Escolha como você deseja acessar seus ativos digitais e gerenciar seus pagamentos.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Button
              onClick={handleCreate}
              disabled={isLoading || isCreating}
              className="w-full h-12 flex items-center justify-between px-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-md transition-all duration-200 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-sm">
                  {isCreating ? 'Criando carteira...' : 'Criar Nova Carteira'}
                </span>
              </div>
              <Sparkles className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
            </Button>

            <Button
              variant="outline"
              onClick={handleConnect}
              disabled={isLoading || isCreating}
              className="w-full h-12 flex items-center justify-between px-4 border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 text-primary font-bold rounded-xl transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <ArrowRight className="w-4 h-4" />
                </div>
                <span className="text-sm">
                  {isLoading ? 'Conectando...' : 'Conectar Carteira Existente'}
                </span>
              </div>
            </Button>

            <Button
              variant="ghost"
              onClick={onClose}
              className="w-full h-10 text-muted-foreground font-semibold hover:text-foreground mt-2"
            >
              Cancelar
            </Button>
          </div>

          <div className="mt-6 p-4 bg-muted/30 border border-muted/60 rounded-xl flex items-start gap-3">
            <div className="p-1 bg-primary/10 rounded text-primary mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
              <strong className="text-foreground font-bold italic">Segurança Biométrica:</strong>{' '}
              Usamos WebAuthn para garantir que suas chaves privadas nunca saiam do seu dispositivo.
              Sua biometria é o acesso.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
