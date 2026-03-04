/**
 * Tipos para o fluxo de checkout conversacional
 */

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
  cryptoPaymentsEnabled: boolean;
}

/**
 * Dados do cliente coletados durante o checkout
 */
export interface CustomerData {
  name: string;
  email: string;
  whatsapp: string;
  cpf: string;
  phone?: string;
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
  | 'wallet-connection' // Conexão de carteira Stellar
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
  | 'wallet-connection' // Conexão de carteira Stellar
  | 'crypto-asset-selection' // Seleção de moeda crypto (USDC/XLM)
  | 'payment-review' // Card de revisão da compra
  | 'stellar-payment-review' // Card de revisão para pagamentos Stellar
  | 'transaction-pending' // Status de transação pendente
  | 'qr-code' // Tela de pagamento Pix
  | 'card-payment' // Tela de pagamento com cartão
  | 'success' // Tela de confirmação
  | 'loading' // Status de carregamento/processamento
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
  cryptoAsset?: string; // USDC ou XLM, se crypto
  onConfirm?: () => void;
  onEditData?: () => void;
  onChangePayment?: () => void;

  // Para 'qr-code'
  qrCodeUrl?: string;
  pixCode?: string;
  expiresIn?: string;

  // Para 'card-payment'
  clientSecret?: string;
  onPaymentSuccess?: () => void;

  // Para 'success'
  downloadUrl?: string;

  // Para 'transaction-pending'
  transactionHash?: string;
  escrowId?: string;
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
 * Tipo de ativo crypto suportado
 */
export type CryptoAsset = 'USDC' | 'XLM';

/**
 * Estado do checkout
 */
export interface CheckoutState {
  currentStep: CheckoutStep;
  product: ProductInfo | null;
  loading: boolean;
  error: string | null;
  cryptoAsset: CryptoAsset | null; // Ativo crypto selecionado
  walletAddress: string | null; // Endereço da wallet Stellar conectada

  // Fluxo
  mode: ChatMode;
  checkoutStep: CheckoutStep | null;
  savedStep: CheckoutStep | null; // Para voltar após Q&A

  // Chat
  messages: Message[];
  customerData: CustomerData | null;
  paymentMethod: PaymentMethod | null;
  sellerInfo: InfoproducerInfo | null; // Assuming SellerInfo is InfoproducerInfo

  // Controle de UI
  showMessageInput: boolean;
  isAiTyping: boolean;
  aiTypingMessage: string;
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
