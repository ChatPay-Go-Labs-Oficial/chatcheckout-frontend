'use client';

import React from 'react';
import { StripeConnectWrapper } from '@/components/stripe/StripeConnectWrapper';
import { StripeOnboarding } from '@/components/stripe/StripeOnboarding';

export default function PaymentSetupPage() {
  return (
    <StripeConnectWrapper>
      <StripeOnboarding />
    </StripeConnectWrapper>
  );
}
