import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Network } from 'lucide-react';

interface StellarCardProps {
  transacoes: number;
  volume: number;
  taxa: number;
  settlement: string;
}

export default function StellarCard({
  transacoes,
  volume,
  taxa,
  settlement,
}: StellarCardProps) {
  const stats = [
    { label: 'Transações Hoje', value: transacoes },
    { label: 'Volume USDC', value: volume.toFixed(2) },
    { label: 'Taxa de Rede', value: `$${taxa.toFixed(2)}` },
    { label: 'Settlement Médio', value: settlement },
  ];

  return (
    <Card className="flex flex-col shadow-sm border-muted/60 bg-card h-full">
      <CardHeader className="flex flex-row items-center gap-2 pb-6">
        <Network className="h-4 w-4 text-muted-foreground/60" />
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
          Stellar Network
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 mt-1">
          {stats.map((item) => (
            <div
              key={item.label}
              className="flex justify-between items-center"
            >
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                {item.label}
              </span>
              <span className="text-xs font-bold text-foreground">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
