/**
 * Stellar Network Configuration
 *
 * Defines network settings for both Testnet and Mainnet environments.
 * Uses OpenZeppelin pre-deployed Smart Account contracts for Testnet.
 */

export interface StellarNetworkConfig {
  networkPassphrase: string;
  rpcUrl: string;
  accountWasmHash: string;
  webauthnVerifierAddress: string;
  salt: number;
}

export const STELLAR_CONFIG: Record<'testnet' | 'mainnet', StellarNetworkConfig> = {
  testnet: {
    networkPassphrase: 'Test SDF Network ; September 2015',
    rpcUrl: 'https://soroban-testnet.stellar.org',
    // Smart Account WASM Hash from smart-account-kit demo (testnet)
    accountWasmHash:
      process.env.NEXT_PUBLIC_STELLAR_ACCOUNT_WASM_HASH ||
      'a12e8fa9621efd20315753bd4007d974390e31fbcb4a7ddc4dd0a0dec728bf2e',
    // WebAuthn Verifier from smart-account-kit demo (testnet)
    webauthnVerifierAddress:
      process.env.NEXT_PUBLIC_STELLAR_WEBAUTHN_VERIFIER ||
      'CBSHV66WG7UV6FQVUTB67P3DZUEJ2KJ5X6JKQH5MFRAAFNFJUAJVXJYV',
    salt: 0,
  },
  mainnet: {
    networkPassphrase: 'Public Global Stellar Network ; September 2015',
    rpcUrl: 'https://soroban.stellar.org',
    // TODO: Deploy your own Smart Account contract for Mainnet
    // Use Soroban CLI to deploy and update this address
    accountWasmHash: process.env.NEXT_PUBLIC_STELLAR_MAINNET_ACCOUNT_WASM_HASH || '',
    webauthnVerifierAddress: process.env.NEXT_PUBLIC_STELLAR_MAINNET_WEBAUTHN_VERIFIER || '',
    salt: 0,
  },
};

/**
 * Get current Stellar network configuration based on environment variable
 * @returns StellarNetworkConfig for the current network
 */
export function getStellarConfig(): StellarNetworkConfig {
  const network = (process.env.NEXT_PUBLIC_STELLAR_NETWORK as 'testnet' | 'mainnet') || 'testnet';
  const config = STELLAR_CONFIG[network];

  // Validate required fields
  if (!config.accountWasmHash) {
    throw new Error(`Missing STELLAR_ACCOUNT_WASM_HASH for ${network}`);
  }
  if (!config.webauthnVerifierAddress) {
    throw new Error(`Missing STELLAR_WEBAUTHN_VERIFIER for ${network}`);
  }

  return config;
}

/**
 * Get network type from environment
 * @returns 'testnet' or 'mainnet'
 */
export function getStellarNetworkType(): 'testnet' | 'mainnet' {
  return (process.env.NEXT_PUBLIC_STELLAR_NETWORK as 'testnet' | 'mainnet') || 'testnet';
}

/**
 * Validate if the provided network is valid
 * @param network Network to validate
 * @returns true if network is valid
 */
export function isValidNetwork(network: string): network is 'testnet' | 'mainnet' {
  return network === 'testnet' || network === 'mainnet';
}
