'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CreditCard, Smartphone, Wallet2, Table2 } from 'lucide-react';

interface PaymentsBreakdownCardProps {
  data: {
    paymentMethod: 'PIX' | 'CARD' | 'CRYPTO';
    count: number;
  }[];
}

export default function PaymentsBreakdownCard({ data }: PaymentsBreakdownCardProps) {
  return (
    <Card className="flex flex-col shadow-sm border-muted/60 bg-card h-full">
      <CardHeader className="flex flex-row items-center gap-2 pb-6">
        <CreditCard className="h-4 w-4 text-muted-foreground/60" />
        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">
          Sucesso por Método
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 mt-2">
          {data.map((item) => (
            <div
              key={item.paymentMethod}
              className="flex justify-between items-center group"
            >
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-tight group-hover:text-foreground transition-colors">
                {item.paymentMethod}
              </span>
              <span className="text-xs font-bold text-foreground">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
