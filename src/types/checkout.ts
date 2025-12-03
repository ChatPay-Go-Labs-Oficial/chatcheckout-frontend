/**
 * Tipos para o fluxo de checkout conversacional
 */

import { ReactNode } from 'react';

/**
 * Informações do infoprodutor/vendedor
 */
export interface InfoproducerInfo {
  id: string;
  firstName: string;
  lastName: string;
  companyName?: string;
}

/**
 * Dados completos do produto decodificado
 */
export interface ProductInfo {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  salesPageUrl: string;
  imageUrl?: string;
  promptAi?: string;
  productHash: string | null;
  infoproducer: InfoproducerInfo;
}

/**
 * Dados do cliente coletados durante o checkout
 */
export interface CustomerData {
  name: string;
  email: string;
  whatsapp: string;
  cpf: string;
}

/**
 * Métodos de pagamento disponíveis
 */
export type PaymentMethod = 'pix' | 'card' | 'crypto';

/**
 * Etapas do fluxo de checkout
 */
export type CheckoutStep =
  | 'welcome' // Tela inicial com 2 botões
  | 'customer-data' // Formulário de dados
  | 'payment-method' // Seleção de pagamento
  | 'payment-review' // Revisão antes de pagar
  | 'payment' // Tela de pagamento (QR Code, etc)
  | 'confirmation'; // Sucesso

/**
 * Modo de operação do chat
 */
export type ChatMode =
  | 'initial' // Aguardando escolha inicial
  | 'qa' // Modo perguntas e respostas
  | 'checkout' // Modo checkout (pode ser interrompido)
  | 'interrupted'; // Checkout pausado para Q&A

/**
 * Tipos de componentes que podem aparecer inline nas mensagens
 */
export type MessageComponentType =
  | 'buttons' // Botões de ação (Finalizar/Tirar dúvidas)
  | 'form' // Formulário de dados do cliente
  | 'payment-options' // Botões de seleção de pagamento
  | 'payment-review' // Card de revisão da compra
  | 'qr-code' // Tela de pagamento Pix
  | 'success' // Tela de confirmação
  | null; // Mensagem simples de texto

/**
 * Dados para renderizar componentes inline
 */
export interface MessageComponentData {
  // Para 'buttons'
  buttons?: Array<{
    label: string;
    action: string;
    variant?: 'primary' | 'secondary';
  }>;

  // Para 'form'
  formType?: 'customer-data';
  onSubmit?: (data: CustomerData) => void;

  // Para 'payment-options'
  onSelectPayment?: (method: PaymentMethod) => void;

  // Para 'payment-review'
  customerData?: CustomerData;
  paymentMethod?: PaymentMethod;
  onConfirm?: () => void;
  onEditData?: () => void;
  onChangePayment?: () => void;

  // Para 'qr-code'
  qrCodeUrl?: string;
  pixCode?: string;
  expiresIn?: string;

  // Para 'success'
  downloadUrl?: string;
}

/**
 * Estrutura de uma mensagem no chat
 */
export interface Message {
  id: string;
  role: 'ai' | 'user';
  content: string;
  timestamp: Date;
  componentType?: MessageComponentType;
  componentData?: MessageComponentData;
  isTypingComplete?: boolean; // Flag para controlar quando mostrar componentes
}

/**
 * Estado global do checkout
 */
export interface CheckoutState {
  // Produto
  product: ProductInfo | null;
  loading: boolean;
  error: string | null;

  // Fluxo
  mode: ChatMode;
  checkoutStep: CheckoutStep | null;
  savedStep: CheckoutStep | null; // Para voltar após Q&A

  // Controle de UI
  showMessageInput: boolean;
  isAiTyping: boolean;

  // Dados coletados
  customerData: CustomerData | null;
  paymentMethod: PaymentMethod | null;

  // Chat
  messages: Message[];
}

/**
 * Ações disponíveis no useCheckout
 */
export interface CheckoutActions {
  // Escolha inicial
  startQA: () => void;
  startCheckout: () => void;

  // Chat
  sendMessage: (message: string) => Promise<void>;
  continueCheckout: () => void;

  // Checkout
  submitCustomerData: (data: CustomerData) => void;
  selectPaymentMethod: (method: PaymentMethod) => void;
  confirmPayment: () => void;
  confirmPaymentSuccess: () => void; // Confirma pagamento após webhook/polling
  editCustomerData: () => void;
  changePaymentMethod: () => void;

  // Q&A durante checkout
  askQuestion: () => void; // Pausa checkout e vai para Q&A
}

/**
 * Response da API de chat
 */
export interface ChatAiResponse {
  response: string;
  // Adicione outros campos se a API retornar mais informações
}
