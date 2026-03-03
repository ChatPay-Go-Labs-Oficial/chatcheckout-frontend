/**
 * Stellar Network Constants
 * Configurações para pagamento via Stellar (XLM nativo e USDC)
 */

export const STELLAR_CONFIG = {
  /**
   * Network padrão (testnet para desenvolvimento, public para produção)
   */
  NETWORK: (process.env.NEXT_PUBLIC_STELLAR_NETWORK as 'testnet' | 'public') || 'testnet',

  /**
   * Endereço do Smart Contract da empresa
   */
  CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_STELLAR_CONTRACT_ADDRESS || '',

  /**
   * URL da API Horizon Stellar
   */
  HORIZON_URL:
    process.env.NEXT_PUBLIC_STELLAR_NETWORK === 'public'
      ? 'https://horizon.stellar.org'
      : 'https://horizon-testnet.stellar.org',

  /**
   * Network passphrase para assinatura de transações
   */
  NETWORK_PASSPHRASE:
    process.env.NEXT_PUBLIC_STELLAR_NETWORK === 'public'
      ? 'Public Global Stellar Network ; September 2015'
      : 'Test SDF Network ; September 2015',
} as const;

/**
 * USDC Asset Configuration
 * Configuração do asset USDC na Stellar Network (opcional, secundário)
 */
export const USDC_ASSET = {
  /**
   * Asset Code
   */
  CODE: 'USDC',

  /**
   * Issuer na Testnet
   * Endereço oficial do USDC na testnet Stellar
   */
  ISSUER_TESTNET: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',

  /**
   * Issuer na Public Network (Mainnet)
   * Endereço oficial do USDC na mainnet Stellar
   */
  ISSUER_PUBLIC: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',

  /**
   * Get issuer based on current network
   */
  get ISSUER() {
    return STELLAR_CONFIG.NETWORK === 'public' ? this.ISSUER_PUBLIC : this.ISSUER_TESTNET;
  },

  /**
   * USDC has 7 decimal places on Stellar
   */
  DECIMALS: 7,

  /**
   * USDC is secondary option
   */
  IS_PRIMARY: false,
} as const;

/**
 * USDC Stellar Asset Contract (SAC) Configuration
 * Contrato tokenizado USDC na Stellar (Soroban)
 */
export const USDC_CONTRACT = {
  /**
   * USDC Stellar Asset Contract address on testnet
   * Fonte: https://developers.stellar.org/docs/tokens/polygon-bridge#testnet
   */
  ADDRESS_TESTNET:
    process.env.NEXT_PUBLIC_USDC_CONTRACT_TESTNET ||
    'CB3TLW74NBIOT3BUWOZ3TUM6RFDF6A4GVIRUQRQZABG5KPOUL4JJOV2F',

  /**
   * USDC Stellar Asset Contract address on public network
   * Fonte: https://www.circle.com/usdc#stellar
   */
  ADDRESS_PUBLIC:
    process.env.NEXT_PUBLIC_USDC_CONTRACT_PUBLIC ||
    'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAP5DIA3M363UZD',

  /**
   * Get address based on current network
   */
  get ADDRESS() {
    return STELLAR_CONFIG.NETWORK === 'public' ? this.ADDRESS_PUBLIC : this.ADDRESS_TESTNET;
  },

  /**
   * USDC has 7 decimal places on Stellar
   */
  DECIMALS: 7,
} as const;

/**
 * XLM Asset Configuration (nativo)
 * Asset primário para pagamentos
 */
export const XLM_ASSET = {
  CODE: 'XLM',
  NATIVE: true,
  DECIMALS: 7,
  IS_PRIMARY: true,
} as const;

/**
 * XLM Stellar Asset Contract (SAC) Configuration
 * Contrato SAC nativo para XLM na Soroban (CAP-67)
 * Fonte: Asset.native().contractId(Networks.PUBLIC/TESTNET)
 */
export const XLM_CONTRACT = {
  /**
   * XLM Stellar Asset Contract address on testnet
   * Reserved contract address for native XLM on Soroban testnet
   */
  ADDRESS_TESTNET: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',

  /**
   * XLM Stellar Asset Contract address on public network
   * Reserved contract address for native XLM on Soroban mainnet
   */
  ADDRESS_PUBLIC: 'CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA',

  /**
   * Get address based on current network
   */
  get ADDRESS() {
    return STELLAR_CONFIG.NETWORK === 'public' ? this.ADDRESS_PUBLIC : this.ADDRESS_TESTNET;
  },

  /**
   * XLM has 7 decimal places on Stellar
   */
  DECIMALS: 7,
} as const;

/**
 * Taxas da Rede Stellar
 */
export const STELLAR_FEES = {
  /**
   * Taxa base de transação em stroops (0.00001 XLM)
   * 1 XLM = 10,000,000 stroops
   */
  BASE_FEE_STROOPS: 100,

  /**
   * Taxa base em XLM
   */
  BASE_FEE_XLM: 0.00001,

  /**
   * Spread percentual aplicado (1%)
   */
  SPREAD_PERCENT: 0.01,
} as const;

/**
 * Price Oracle Configuration
 */
export const PRICE_ORACLE_CONFIG = {
  /**
   * URL da API Reflector Network
   */
  REFLECTOR_API_URL: process.env.NEXT_PUBLIC_REFLECTOR_API_URL || 'https://api.reflector.network',

  /**
   * Duração do cache de preços (5 minutos em ms)
   */
  CACHE_DURATION: 5 * 60 * 1000,
} as const;

/**
 * Stellar Wallets Kit Configuration
 */
export const STELLAR_WALLETS_CONFIG = {
  /**
   * Timeout para conexão de wallet (30 segundos)
   */
  CONNECTION_TIMEOUT: 30000,

  /**
   * Timeout para assinatura de transação (60 segundos)
   */
  SIGNATURE_TIMEOUT: 60000,
} as const;
