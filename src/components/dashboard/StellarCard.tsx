import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

interface StellarCardProps {
  transacoes: number;
  volume: number;
  taxa: number;
  settlement: string;
}

export default function StellarCard({ transacoes, volume, taxa, settlement }: StellarCardProps) {
  return (
    <Card className="flex flex-col min-w-[220px]">
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <Star className="w-5 h-5 text-yellow-500" />
        <CardTitle className="text-base">Stellar Network</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-1 mt-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Transações Hoje</span>
            <span className="font-semibold text-foreground">{transacoes}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Volume USDC</span>
            <span className="font-semibold text-foreground">{volume}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Taxa de Rede</span>
            <span className="font-semibold text-foreground">${taxa}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Settlement Médio</span>
            <span className="font-semibold text-foreground">{settlement}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
