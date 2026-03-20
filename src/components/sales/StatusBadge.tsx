import { Badge } from '@/components/ui/badge';
import { SalesOrderStatus } from '@/types/sales';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

interface StatusBadgeProps {
  status: SalesOrderStatus;
}

const statusConfig = {
  COMPLETED: {
    label: 'Concluído',
    variant: 'success' as const,
    icon: CheckCircle2,
    className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20',
  },
  FAILED: {
    label: 'Falhou',
    variant: 'destructive' as const,
    icon: XCircle,
    className: 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20',
  },
  CREATED: {
    label: 'Criado',
    variant: 'secondary' as const,
    icon: Clock,
    className: 'bg-muted/50 text-muted-foreground border-muted-foreground/20 hover:bg-muted/60',
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status || 'CREATED'];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`flex w-fit items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-all duration-200 ${config.className}`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
