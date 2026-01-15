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
  balance: string;
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
