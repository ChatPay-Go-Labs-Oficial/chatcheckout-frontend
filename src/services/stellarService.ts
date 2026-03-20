/**
 * Stellar Wallet Service
 *
 * Core service for managing Stellar smart accounts using smart-account-kit.
 * Handles wallet creation, connection, transactions, and network switching.
 *
 * This service encapsulates the SmartAccountKit SDK and provides a clean
 * interface for wallet operations throughout the application.
 */

import { SmartAccountKit, IndexedDBStorage } from 'smart-account-kit';
import * as sdk from '@stellar/stellar-sdk';
import { getStellarConfig } from '@/config/stellar.config';
import { Client as EscrowClient } from '@/services/escrow';
import { STELLAR_CONFIG as PAYMENT_STELLAR_CONFIG } from '@/utils/stellar/constants';
import type {
  StellarTransaction,
  StellarTransactionResult,
  CreateWalletResult,
  ConnectWalletResult,
  StellarNetwork,
} from '@/types/stellar';
import { XLM_CONTRACT, USDC_CONTRACT } from '@/utils/stellar/constants';

const ESCROW_CONTRACT_ID = 'CA7KSUEHPBPOY2Z253B5IFY6E6H6JYQ5VL5GEUXLIYRDTX4PTSFMSVKV';

function getSorobanRpcUrl(network: string): string {
  return network === 'public'
    ? 'https://soroban-api.stellar.org'
    : 'https://soroban-testnet.stellar.org';
}

class StellarService {
  private kit: SmartAccountKit | null = null;
  private currentNetwork: StellarNetwork = 'testnet';
  private accountId: string | null = null;
  private credentialId: string | null = null;

  /**
   * Initialize the SmartAccountKit and check for existing session
   * @returns true if a session was restored, false otherwise
   */
  async initializeWallet(): Promise<boolean> {
    try {
      this.currentNetwork = this.getStoredNetwork();
      const config = getStellarConfig();

      // Initialize SmartAccountKit with IndexedDB storage
      this.kit = new SmartAccountKit({
        rpcUrl: config.rpcUrl,
        networkPassphrase: config.networkPassphrase,
        accountWasmHash: config.accountWasmHash,
        webauthnVerifierAddress: config.webauthnVerifierAddress,
        storage: new IndexedDBStorage(),
      });

      // Try to restore existing session silently
      const result = await this.kit.connectWallet({ fresh: false });

      if (result) {
        this.accountId = result.contractId;
        this.credentialId = result.credentialId;
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to initialize Stellar wallet:', error);
      return false;
    }
  }

  /**
   * Create a new Stellar smart wallet with passkey authentication
   * @param username Optional username to associate with the wallet
   * @returns CreateWalletResult with account details
   */
  async createWallet(username?: string): Promise<CreateWalletResult> {
    if (!this.kit) {
      await this.initializeWallet();
    }

    if (!this.kit) {
      throw new Error('Failed to initialize SmartAccountKit');
    }

    try {
      const appName = 'ChatCheckout';
      const userName = username || `user_${Date.now()}`;

      // Create new wallet with passkey
      const result = await this.kit.createWallet(appName, userName, {
        autoSubmit: true,
      });

      this.accountId = result.contractId;
      this.credentialId = result.credentialId;

      return {
        accountId: result.contractId,
        publicKey: result.contractId, // Smart account ID serves as public identifier
        credentialId: result.credentialId,
      };
    } catch (error) {
      throw new Error(`Failed to create wallet: ${(error as Error).message}`);
    }
  }

  /**
   * Connect to an existing Stellar wallet using passkey
   * @param prompt If true, always prompt for passkey. If false, try silent restore first.
   * @returns ConnectWalletResult with account details
   */
  async connectWallet(prompt: boolean = true): Promise<ConnectWalletResult> {
    if (!this.kit) {
      await this.initializeWallet();
    }

    if (!this.kit) {
      throw new Error('Failed to initialize SmartAccountKit');
    }

    try {
      // Connect with passkey authentication
      const result = await this.kit.connectWallet({
        prompt,
      });

      if (!result) {
        throw new Error('No wallet connected. Please create a new wallet.');
      }

      this.accountId = result.contractId;
      this.credentialId = result.credentialId;

      return {
        accountId: result.contractId,
        publicKey: result.contractId,
        credentialId: result.credentialId,
      };
    } catch (error) {
      throw new Error(`Failed to connect wallet: ${(error as Error).message}`);
    }
  }

  /**
   * Disconnect the current wallet and clear session
   */
  disconnectWallet(): void {
    if (this.kit) {
      this.kit.disconnect();
      this.kit = null;
    }
    this.accountId = null;
    this.credentialId = null;
  }

  /**
   * Switch between Testnet and Mainnet
   * @param network Network to switch to
   */
  async switchNetwork(network: StellarNetwork): Promise<void> {
    if (network === this.currentNetwork) {
      return; // Already on this network
    }

    // Disconnect current wallet
    this.disconnectWallet();

    // Store new network preference
    this.storeNetwork(network);
    this.currentNetwork = network;

    // Reinitialize with new network
    await this.initializeWallet();
  }

  /**
   * Send a transaction using the connected wallet
   * @param transaction Transaction parameters
   * @returns Transaction result with hash and status
   */
  async sendTransaction(transaction: StellarTransaction): Promise<StellarTransactionResult> {
    if (!this.kit || !this.accountId) {
      throw new Error('Wallet not connected');
    }

    try {
      // Note: smart-account-kit's transfer method expects specific parameters
      // This is a placeholder implementation - actual implementation depends on
      // the smart-account-kit API and may need adjustment
      const result = await this.kit.transfer(
        transaction.to,
        transaction.amount.toString(),
        transaction.memo ? Number(transaction.memo) : 0,
      );

      return {
        hash: result.hash || '',
        success: true,
      };
    } catch (error) {
      return {
        hash: '',
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Get the balances of the connected wallet for multiple assets
   * @returns Object with XLM and USDC balances as strings
   */
  async getBalances(): Promise<{ XLM: string; USDC: string }> {
    if (!this.kit || !this.accountId) {
      return { XLM: '0', USDC: '0' };
    }

    try {
      const config = getStellarConfig();
      const rpc = new sdk.rpc.Server(config.rpcUrl);

      const isMainnet = this.currentNetwork === 'mainnet';
      const xlmContractId = isMainnet ? XLM_CONTRACT.ADDRESS_PUBLIC : XLM_CONTRACT.ADDRESS_TESTNET;
      const usdcContractId = isMainnet
        ? USDC_CONTRACT.ADDRESS_PUBLIC
        : USDC_CONTRACT.ADDRESS_TESTNET;

      const addressParam = sdk.nativeToScVal(this.accountId, { type: 'address' });

      const fetchBalance = async (contractId: string) => {
        try {
          const simulation = await rpc.simulateTransaction(
            new sdk.TransactionBuilder(
              new sdk.Account('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF', '0'),
              { fee: '100', networkPassphrase: config.networkPassphrase },
            )
              .addOperation(
                sdk.Operation.invokeHostFunction({
                  func: sdk.xdr.HostFunction.hostFunctionTypeInvokeContract(
                    new sdk.xdr.InvokeContractArgs({
                      contractAddress: sdk.Address.fromString(contractId).toScAddress(),
                      functionName: 'balance',
                      args: [addressParam],
                    }),
                  ),
                  auth: [],
                }),
              )
              .setTimeout(0)
              .build(),
          );

          if (sdk.rpc.Api.isSimulationSuccess(simulation)) {
            const resultVal = simulation.result?.retval;
            if (resultVal) {
              const amountStroops = sdk.scValToBigInt(resultVal);
              return (Number(amountStroops) / 10_000_000).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 7,
                useGrouping: false,
              });
            }
          }
        } catch (e) {
          console.error(`Error fetching balance for ${contractId}:`, e);
        }
        return '0';
      };

      const [xlmBalance, usdcBalance] = await Promise.all([
        fetchBalance(xlmContractId),
        fetchBalance(usdcContractId),
      ]);

      return { XLM: xlmBalance, USDC: usdcBalance };
    } catch (error) {
      console.error('Error in getBalances:', error);
      return { XLM: '0', USDC: '0' };
    }
  }

  /**
   * Get the balance of the connected wallet (Backward compatibility - returns XLM)
   * @returns Balance as string
   */
  async getBalance(): Promise<string> {
    const balances = await this.getBalances();
    return balances.XLM;
  }

  /**
   * Get the current account ID
   * @returns Account ID or null if not connected
   */
  getAccountId(): string | null {
    return this.accountId;
  }

  /**
   * Get the current credential ID
   * @returns Credential ID or null if not connected
   */
  getCredentialId(): string | null {
    return this.credentialId;
  }

  /**
   * Check if wallet is connected
   * @returns true if connected
   */
  isConnected(): boolean {
    return this.kit !== null && this.accountId !== null;
  }

  /**
   * Get current network type
   * @returns Current network ('testnet' or 'mainnet')
   */
  getNetwork(): StellarNetwork {
    return this.currentNetwork;
  }

  /**
   * Returns the fee payer (deployer) G-address used by smart-account-kit.
   * This account can be used as transaction source for escrow reads/releases.
   */
  getFeePayerAddress(): string | null {
    if (!this.kit) return null;
    return this.kit.deployerPublicKey || null;
  }

  /**
   * Releases an escrow payment using the connected smart account context.
   * Uses smart-account-kit's signAndSubmit flow.
   */
  async releaseEscrowPayment(escrowId: number): Promise<StellarTransactionResult> {
    if (!this.kit) {
      await this.initializeWallet();
    }

    if (!this.kit || !this.kit.isConnected) {
      return {
        hash: '',
        success: false,
        error: 'Wallet not connected',
      };
    }

    try {
      const sourcePublicKey = this.kit.deployerPublicKey;
      const rpcUrl = getSorobanRpcUrl(PAYMENT_STELLAR_CONFIG.NETWORK);

      const client = new EscrowClient({
        contractId: ESCROW_CONTRACT_ID,
        rpcUrl,
        networkPassphrase: PAYMENT_STELLAR_CONFIG.NETWORK_PASSPHRASE,
        publicKey: sourcePublicKey,
      });

      const tx = await client.release_payment({ escrow_id: BigInt(escrowId) }, { simulate: true });

      const result = await this.kit.signAndSubmit(tx);

      return {
        hash: result.hash || '',
        success: !!result.success,
        error: result.error,
      };
    } catch (error) {
      return {
        hash: '',
        success: false,
        error: error instanceof Error ? error.message : 'Failed to release escrow',
      };
    }
  }

  /**
   * Store network preference in localStorage
   * @param network Network to store
   */
  private storeNetwork(network: StellarNetwork): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('stellar_network', network);
    }
  }

  /**
   * Get stored network preference from localStorage
   * @returns Stored network or 'testnet' as default
   */
  private getStoredNetwork(): StellarNetwork {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('stellar_network');
      if (stored === 'testnet' || stored === 'mainnet') {
        return stored;
      }
    }
    return 'testnet';
  }
}

// Export singleton instance
export const stellarService = new StellarService();
