/**
 * Tipo auxiliar para o retorno do hook useCheckout
 * Usado nos componentes de checkout para evitar duplicação
 */

import { Message, CustomerData, PaymentMethod, ProductInfo } from '@/types/checkout';

export interface UseCheckoutReturn {
  // Estado
  loading: boolean;
  error: string | null;
  product: ProductInfo | null;
  mode: string;
  checkoutStep: string | null;
  customerData: CustomerData | null;
  paymentMethod: PaymentMethod | null;
  messages: Message[];
  aiTyping: boolean;
  showMessageInput: boolean;

  // Ações
  startQA: () => Promise<void>;
  startCheckout: () => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
  continueCheckout: () => Promise<void>;
  submitCustomerData: (data: CustomerData) => Promise<void>;
  selectPaymentMethod: (method: PaymentMethod) => Promise<void>;
  confirmPayment: () => Promise<void>;
  confirmPaymentSuccess: () => Promise<void>;
  editCustomerData: () => Promise<void>;
  changePaymentMethod: () => Promise<void>;
  askQuestion: () => Promise<void>;
}
