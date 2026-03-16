'use client';

import { StripeConnectWrapper } from '@/components/stripe/StripeConnectWrapper';
import { StripeOnboarding } from '@/components/stripe/StripeOnboarding';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';

export default function PaymentInfoTab() {
  return (
    <div className="w-full max-w-4xl animate-in fade-in duration-300">
      <Card className="shadow-sm border-muted/60 overflow-hidden">
        <CardHeader className="py-2.5 px-5 border-b bg-muted/10">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-muted-foreground/80" />
            Informações de Pagamento
          </CardTitle>
          <CardDescription className="text-[12px] text-muted-foreground">
            Gerencie sua conta Stripe Connect e receba suas vendas.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full overflow-y-auto max-h-[380px] p-5 md:p-6">
            <div className="w-full">
              <StripeConnectWrapper>
                <StripeOnboarding />
              </StripeConnectWrapper>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
