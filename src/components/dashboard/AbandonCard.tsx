import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Search } from 'lucide-react';

interface AbandonCardProps {
  reasons: { reason: string; count: number }[];
}

export default function AbandonCard({ reasons }: AbandonCardProps) {
  return (
    <Card className="flex flex-col min-w-[220px]">
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <Search className="w-5 h-5 text-muted-foreground" />
        <CardTitle className="text-base">Análise de Abandono</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-2 mt-2">
          {reasons.map((item) => (
            <li
              key={item.reason}
              className="flex justify-between items-center text-sm"
            >
              <span className="text-muted-foreground">{item.reason}</span>
              <span className="font-semibold text-destructive">{item.count}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
