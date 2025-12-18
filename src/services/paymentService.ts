import { apiClient } from '@/utils/api-client';
import {
  AccountSessionResponse,
  CreatePaymentIntentPayload,
  CreatePaymentIntentResponse,
} from '@/types/payment';

export const paymentService = {
  async createAccountSession(): Promise<AccountSessionResponse> {
    return apiClient.post<AccountSessionResponse>('/payment/account-session', {});
  },

  async createPaymentIntent(
    payload: CreatePaymentIntentPayload,
  ): Promise<CreatePaymentIntentResponse> {
    return apiClient.post<CreatePaymentIntentResponse>('/payment/create-intent', payload);
  },
};
