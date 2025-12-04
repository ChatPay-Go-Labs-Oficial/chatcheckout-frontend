export interface AccountSessionResponse {
  clientSecret: string;
}

export interface CreatePaymentIntentPayload {
  productId: string;
}

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  orderId: string;
}
