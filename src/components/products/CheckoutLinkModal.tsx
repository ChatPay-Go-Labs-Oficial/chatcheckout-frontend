'use client';

import React, { useState } from 'react';
import { Product } from '@/types/product';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  ExternalLink, 
  Check,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { useGlobalToast } from '@/contexts/ToastContext';
import { cn } from '@/lib/utils';

type ModalMode = 'create' | 'update';

interface CheckoutLinkModalProps {
  product: Product;
  checkoutUrl: string;
  isOpen: boolean;
  onClose: () => void;
  mode?: ModalMode;
  hashChanged?: boolean;
}

/**
 * Modal exibido após criação/edição do produto
 * Refatorado para usar Shadcn UI e Lucide Icons
 */
export function CheckoutLinkModal({
  product,
  checkoutUrl,
  isOpen,
  onClose,
  mode = 'create',
  hashChanged = false,
}: CheckoutLinkModalProps) {
  const [copied, setCopied] = useState(false);
  const toast = useGlobalToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(checkoutUrl);
    setCopied(true);
    toast.success('Link copiado com sucesso!');
    setTimeout(() => setCopied(false), 3000);
  };

  const isCreate = mode === 'create';
  const title = isCreate ? 'Produto Criado!' : (hashChanged ? 'Link Atualizado!' : 'Produto Atualizado!');
  const subtitle = isCreate 
    ? `Seu produto "${product.name}" está pronto para vender.`
    : (hashChanged 
        ? 'O link de checkout foi alterado devido às novas configurações.' 
        : `As alterações em "${product.name}" foram salvas.`);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px] p-0 border-none shadow-2xl flex flex-col max-h-[95vh]">
        <div className="p-8 pb-8 flex-1 overflow-y-auto space-y-8 min-h-0">
          {/* Header with Icon and Title */}
          <DialogHeader className="text-left space-y-4">
            <div className="flex items-start gap-4">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-muted/50",
                isCreate ? "bg-green-50 text-green-600" : (hashChanged ? "bg-amber-50 text-amber-600" : "bg-primary/10 text-primary")
              )}>
                {hashChanged ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
              </div>
              <div className="space-y-1.5 pt-0.5 min-w-0 flex-1">
                <DialogTitle className="text-xl font-bold tracking-tight text-foreground leading-tight truncate-none">
                  {title}
                </DialogTitle>
                <DialogDescription className="text-[14px] text-muted-foreground font-medium leading-relaxed">
                  {subtitle}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Alert for Hash change (Now using a more refined Shadcn-like style) */}
          {hashChanged && (
            <div className="p-3.5 bg-amber-50/50 border border-amber-200/50 rounded-lg flex items-start gap-3">
              <div className="mt-0.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Atenção Necessária</p>
                <p className="text-[12.5px] text-amber-800/80 leading-relaxed">
                  A alteração na URL ou no prompt de IA gerou um novo link. Certifique-se de atualizar seus anúncios e páginas externas.
                </p>
              </div>
            </div>
          )}

          {/* Product Mini-Card (Standardized with muted background) */}
          <div className="flex items-center gap-4 p-4 bg-muted/40 border border-muted/60 rounded-2xl w-full">
            <div className="h-16 w-16 rounded-xl bg-background border shadow-sm overflow-hidden shrink-0 flex items-center justify-center ring-1 ring-muted/50">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold text-lg">{product.name.charAt(0).toUpperCase()}</span>
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1 py-1">
              <h4 className="text-[14px] font-bold text-foreground truncate">{product.name}</h4>
              <p className="text-[12px] text-muted-foreground line-clamp-2 leading-relaxed mt-1">
                {product.description || 'Nenhuma descrição técnica informada.'}
              </p>
            </div>
          </div>

          {/* Link Section */}
          <div className="space-y-2.5">
            <h5 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Link de Checkout</h5>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 group">
                <Input 
                  readOnly 
                  value={checkoutUrl}
                  className="bg-muted/30 h-10 pr-10 font-mono text-[11px] focus-visible:ring-1 border-muted/60 group-hover:border-primary/20 transition-colors"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                   <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-40 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <Button 
                variant={copied ? "default" : "secondary"}
                size="sm"
                className={cn("h-10 px-4 font-bold text-xs shrink-0 transition-all", copied && "bg-green-600 hover:bg-green-600 shadow-lg shadow-green-500/20")}
                onClick={handleCopy}
              >
                {copied ? <Check className="w-3.5 h-3.5 mr-2" /> : <Copy className="w-3.5 h-3.5 mr-2" />}
                {copied ? 'Copiado' : 'Copiar'}
              </Button>
            </div>
          </div>

          {/* Next Steps List */}
          <div className="pt-2">
             <h5 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider ml-1 mb-3">Próximos Passos</h5>
             <div className="grid grid-cols-1 gap-2">
                {[
                  "Adicione o link ao botão de compra na sua página de vendas",
                  "Configure sua IA para atendimento automático",
                  "Acompanhe as vendas no seu Dashboard Real-time"
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-[12.5px] text-muted-foreground group">
                    <div className="w-5 h-5 rounded-full bg-primary/5 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                      <ChevronRight className="w-3 h-3 text-primary/60" />
                    </div>
                    <span>{step}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>

        <DialogFooter className="bg-muted/30 p-6 px-8 border-t border-muted/20 mt-auto shrink-0">
          <Button className="w-full h-11 font-bold text-[14px] shadow-sm active:scale-95 transition-all" onClick={onClose}>
            Continuar
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
