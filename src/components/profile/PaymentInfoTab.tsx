'use client';

import { StripeConnectWrapper } from '@/components/stripe/StripeConnectWrapper';
import { StripeOnboarding } from '@/components/stripe/StripeOnboarding';

export default function PaymentInfoTab() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Informações de Pagamento</h3>
        <p className="mt-1 text-sm text-gray-600">Conecte sua conta para começar a receber pagamentos.</p>
      </div>
      <div className="mt-4">
        <StripeConnectWrapper>
          <StripeOnboarding />
        </StripeConnectWrapper>
      </div>
    </div>
  );
}
