/**
 * Stellar Wallet Types
 *
 * Type definitions for Stellar wallet operations using smart-account-kit
 */

export type StellarNetwork = 'testnet' | 'mainnet';

/**
 * State of the Stellar wallet connection
 */
export interface StellarWalletState {
  isConnected: boolean;
  accountId: string | null;
  publicKey: string | null;
  balance: string; // Keep for backward compatibility (defaults to XLM)
  balances: {
    XLM: string;
    USDC: string;
  };
  network: StellarNetwork;
  isLoading: boolean;
  error: string | null;
}

/**
 * Stellar transaction parameters
 */
export interface StellarTransaction {
  to: string;
  amount: string | bigint;
  memo?: string;
}

/**
 * Result of a Stellar transaction
 */
export interface StellarTransactionResult {
  hash: string;
  success: boolean;
  error?: string;
}

/**
 * Wallet creation result
 */
export interface CreateWalletResult {
  accountId: string;
  publicKey: string;
  credentialId: string;
}

/**
 * Wallet connection result
 */
export interface ConnectWalletResult {
  accountId: string;
  publicKey: string;
  credentialId: string;
}

/**
 * Network configuration from environment
 */
export interface StellarEnvConfig {
  network: StellarNetwork;
  accountId: string;
  rpcUrl: string;
  networkPassphrase: string;
  salt: string;
}

// ============ Payment Types ============

/**
 * Stellar Payment Intent Response from Backend
 */
export interface StellarPaymentIntent {
  /** ID do pedido */
  orderId: string;
  /** Endereço do Smart Contract para receber pagamento */
  contractAddress: string;
  /** Valor em USDC */
  amount: string;
  /** Memo da transação (para identificar o pedido) */
  memo: string;
  /** Asset USDC (code + issuer) */
  asset: {
    code: string;
    issuer: string;
  };
}

/**
 * Price Conversion Details
 */
export interface PriceConversion {
  /** Valor original em BRL */
  amountBRL: number;
  /** Valor convertido em crypto */
  amountCrypto: number;
  /** Asset selecionado (XLM ou USDC) */
  asset: 'XLM' | 'USDC';
  /** Taxa de conversão (1 asset = X BRL) */
  exchangeRate: number;
  /** Timestamp da cotação */
  timestamp: number;
}

/**
 * Stellar Payment Fees
 */
export interface StellarPaymentFees {
  /** Taxa da rede Stellar (em XLM) */
  networkFee: number;
  /** Spread aplicado (percentual) */
  spreadPercent: number;
  /** Valor do spread (no asset selecionado) */
  spreadAmount: number;
  /** Total de taxas */
  totalFees: number;
  /** Valor total a pagar (amount + fees) */
  totalAmount: number;
}

/**
 * Stellar Payment Summary
 */
export interface StellarPaymentSummary {
  /** Informações do produto */
  product: {
    id: string;
    name: string;
    priceBRL: number;
  };
  /** Asset selecionado */
  asset: 'XLM' | 'USDC';
  /** Conversão de preço */
  conversion: PriceConversion;
  /** Taxas aplicadas */
  fees: StellarPaymentFees;
  /** Endereço da wallet conectada */
  walletAddress: string;
}
