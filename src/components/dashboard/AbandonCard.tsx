import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface AbandonCardProps {
  reasons: { reason: string; count: number }[];
}

export default function AbandonCard({ reasons }: AbandonCardProps) {
  return (
    <Card className="flex flex-col shadow-sm border-muted/60 bg-card h-full">
      <CardHeader className="flex flex-row items-center gap-2 pb-6">
        <AlertCircle className="h-4 w-4 text-muted-foreground/60" />
        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">
          Análise de Abandono
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 mt-2">
          {reasons.length > 0 ? (
            reasons.map((item) => (
              <div key={item.reason} className="flex justify-between items-center group">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-tight group-hover:text-foreground transition-colors">
                  {item.reason}
                </span>
                <span className="text-xs font-bold text-foreground">{item.count}</span>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center py-4 text-center">
              <span className="text-[10px] font-medium text-muted-foreground uppercase">
                Nenhum abandono registrado
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
