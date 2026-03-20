'use client';

import { Wallet, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface WalletHeaderProps {
  network: string;
}

export function WalletHeader({ network }: WalletHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Minha Carteira</h1>
        <p className="text-[13px] text-muted-foreground mt-1">
          Gerencie seu saldo Stellar, consulte ativos elegíveis e realize resgates com segurança.
        </p>
      </div>

      <div className="flex items-center gap-2.5 self-start md:self-center">
        {network === 'testnet' && (
          <Badge
            variant="outline"
            className="bg-amber-500/[0.03] text-amber-600 border-amber-200/50 gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider shadow-none"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Ambiente de Testes
          </Badge>
        )}
        <Badge
          variant="secondary"
          className="bg-muted text-muted-foreground border-muted px-3 py-1 text-[10px] font-bold uppercase tracking-wider shadow-none"
        >
          Stellar Network
        </Badge>
      </div>
    </div>
  );
}
