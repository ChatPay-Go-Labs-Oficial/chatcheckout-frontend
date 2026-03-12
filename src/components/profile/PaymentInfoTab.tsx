'use client';

import { StripeConnectWrapper } from '@/components/stripe/StripeConnectWrapper';
import { StripeOnboarding } from '@/components/stripe/StripeOnboarding';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function PaymentInfoTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações de Pagamento</CardTitle>
        <CardDescription>Conta Stripe Connect</CardDescription>
      </CardHeader>
      <CardContent>
        <StripeConnectWrapper>
          <StripeOnboarding />
        </StripeConnectWrapper>
      </CardContent>
    </Card>
  );
}
