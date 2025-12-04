'use client';

import React from 'react';
import { ConnectAccountOnboarding } from '@stripe/react-connect-js';

export const StripeOnboarding = () => {
  return (
    <div className="w-full">
      <div className="min-h-[500px]">
        <ConnectAccountOnboarding onExit={() => console.log('Onboarding finished or exited')} />
      </div>
    </div>
  );
};
