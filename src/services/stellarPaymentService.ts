/**
 * Stellar Payment Service
 *
 * Handles escrow contract interactions for USDC payments on Stellar network.
 * Integrates with the Soroban escrow contract and manages transaction lifecycle.
 */

import { Client } from './escrow';
import { Address } from '@stellar/stellar-sdk';
import { STELLAR_CONFIG, USDC_ASSET, USDC_CONTRACT, XLM_CONTRACT } from '@/utils/stellar/constants';

/**
 * Supported crypto assets for payment
 */
export type CryptoAssetType = 'USDC' | 'XLM';

/**
 * Escrow configuration constants
 */
const ESCROW_CONFIG = {
  CONTRACT_ID: 'CA7KSUEHPBPOY2Z253B5IFY6E6H6JYQ5VL5GEUXLIYRDTX4PTSFMSVKV',
  GUARANTEE_DAYS: 7,
  FEE_BPS: 100, // 1% fee
} as const;

/**
 * Parameters for creating escrow payment
 */
export interface CreateEscrowPaymentParams {
  buyerAddress: string;
  sellerAddress: string;
  amount: number; // Amount in the selected crypto (will be converted to smallest unit)
  asset: CryptoAssetType; // 'USDC' or 'XLM'
  productId: string;
}

/**
 * Result of escrow payment creation
 */
export interface EscrowPaymentResult {
  success: boolean;
  escrowId?: string;
  transactionHash?: string;
  error?: string;
}

/**
 * Stellar Payment Service
 */
class StellarPaymentService {
  private client: Client | null = null;

  /**
   * Initialize escrow contract client
   */
  private getClient(): Client {
    if (!this.client) {
      // Get RPC URL (replace horizon with rpc)
      const rpcUrl = STELLAR_CONFIG.HORIZON_URL.replace('horizon', 'rpc');

      this.client = new Client({
        contractId: ESCROW_CONFIG.CONTRACT_ID,
        rpcUrl: rpcUrl,
        networkPassphrase: STELLAR_CONFIG.NETWORK_PASSPHRASE,
      });
    }
    return this.client;
  }

  /**
   * Convert amount to smallest unit (i128)
   * Both USDC and XLM have 7 decimal places on Stellar
   */
  private convertToSmallestUnit(amount: number, asset: CryptoAssetType): bigint {
    const decimals = asset === 'XLM' ? XLM_CONTRACT.DECIMALS : USDC_CONTRACT.DECIMALS;
    return BigInt(Math.floor(amount * 10 ** decimals));
  }

  /**
   * Map Stellar SDK errors to user-friendly messages
   */
  private mapErrorToMessage(error: Error): string {
    const errorMap: Record<string, string> = {
      InsufficientBalance: 'Saldo insuficiente na carteira',
      'No wallet connected': 'Carteira não conectada',
      'Transaction rejected': 'Transação rejeitada',
      'Network error': 'Erro de rede. Tente novamente',
      timeout: 'Tempo de espera esgotado. Tente novamente',
    };

    for (const [key, message] of Object.entries(errorMap)) {
      if (error.message.includes(key)) {
        return message;
      }
    }

    return 'Erro ao processar pagamento. Tente novamente';
  }

  /**
   * Create escrow payment
   *
   * Flow:
   * 1. Initialize escrow contract client
   * 2. Call create_escrow() with parameters
   * 3. Sign transaction using StellarWalletContext
   * 4. Submit transaction to network
   * 5. Return escrow ID and transaction hash
   */
  async createEscrowPayment(params: CreateEscrowPaymentParams): Promise<EscrowPaymentResult> {
    try {
      // Validate inputs
      if (!params.buyerAddress || !params.sellerAddress) {
        throw new Error('Buyer and seller addresses are required');
      }

      if (params.amount <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      // Convert amount to smallest unit
      const amountInSmallestUnit = this.convertToSmallestUnit(params.amount, params.asset);

      // Get contract client
      const client = this.getClient();

      // Get the correct SAC address based on asset type
      // Both USDC and native XLM use SAC contracts in Soroban
      const assetAddress = params.asset === 'XLM' ? XLM_CONTRACT.ADDRESS : USDC_CONTRACT.ADDRESS;

      console.log('[StellarPaymentService] Creating escrow:', {
        asset: params.asset,
        assetAddress,
        amount: params.amount,
        network: STELLAR_CONFIG.NETWORK,
      });

      // Create escrow transaction
      const tx = await client.create_escrow({
        buyer: params.buyerAddress,
        seller: params.sellerAddress,
        amount: amountInSmallestUnit,
        asset: assetAddress,
        fee_bps: ESCROW_CONFIG.FEE_BPS,
        guarantee_days: ESCROW_CONFIG.GUARANTEE_DAYS,
        product_id: params.productId,
      });

      // Simulate transaction to get resource estimates
      const simulation = await tx.simulate();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((simulation as any).error) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        throw new Error(`Simulation failed: ${(simulation as any).error}`);
      }

      // Return the assembled transaction for signing
      // The caller (checkout actions) will use StellarWalletContext to sign and send
      const xdr = tx.toXDR();

      console.log('[StellarPaymentService] Escrow transaction created:', {
        amount: params.amount,
        amountInSmallestUnit: amountInSmallestUnit.toString(),
        asset: params.asset,
        assetAddress,
        escrowContract: ESCROW_CONFIG.CONTRACT_ID,
      });

      return {
        success: true,
        transactionHash: xdr,
      };
    } catch (error) {
      console.error('[StellarPaymentService] Error creating escrow:', error);
      return {
        success: false,
        error: this.mapErrorToMessage(error as Error),
      };
    }
  }

  /**
   * Get seller's wallet address from backend
   * TODO: Implement backend endpoint
   */
  async getSellerAddress(productId: string): Promise<string> {
    // Temporary: Use test address
    // In production, call backend API: GET /api/seller/wallet-address?productId={id}
    const TEST_SELLER_ADDRESS = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        console.warn('[StellarPaymentService] No API URL configured, using test address');
        return TEST_SELLER_ADDRESS;
      }

      const response = await fetch(`${apiUrl}/seller/wallet-address?productId=${productId}`);

      if (response.ok) {
        const data = await response.json();
        if (data.walletAddress) {
          console.log('[StellarPaymentService] Seller address fetched:', data.walletAddress);
          return data.walletAddress;
        }
      }
    } catch (error) {
      console.error('[StellarPaymentService] Error fetching seller address:', error);
    }

    console.warn('[StellarPaymentService] Using test seller address');
    return TEST_SELLER_ADDRESS;
  }

  /**
   * Monitor transaction status
   * Polls Stellar RPC for transaction confirmation
   */
  async monitorTransaction(transactionHash: string): Promise<boolean> {
    const maxAttempts = 30; // 30 attempts * 2 seconds = 1 minute timeout
    const pollInterval = 2000; // 2 seconds

    console.log('[StellarPaymentService] Starting transaction monitoring:', transactionHash);

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        // Query Stellar RPC for transaction status
        // TODO: Implement actual RPC call to check transaction status
        await new Promise((resolve) => setTimeout(resolve, pollInterval));

        console.log(`[StellarPaymentService] Poll attempt ${attempt + 1}/${maxAttempts}`);

        // For now, return true after a few attempts (simulated confirmation)
        // In production, check actual transaction status on the ledger
        if (attempt >= 3) {
          console.log('[StellarPaymentService] Transaction confirmed (simulated)');
          return true;
        }
      } catch (error) {
        console.error(`[StellarPaymentService] Poll attempt ${attempt + 1} failed:`, error);
      }
    }

    console.error('[StellarPaymentService] Transaction monitoring timeout');
    return false;
  }
}

// Export singleton instance
export const stellarPaymentService = new StellarPaymentService();
