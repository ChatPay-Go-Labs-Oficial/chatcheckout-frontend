export interface AccountSessionResponse {
  clientSecret: string;
}

export interface CreatePaymentIntentPayload {
  productId: string;
  paymentMethod: 'pix' | 'card' | 'crypto';
  customerData: {
    name: string;
    email: string;
    cpf: string;
    phone: string;
  };
}

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  orderId: string;
  qrCode?: string;
  pixCode?: string;
}
