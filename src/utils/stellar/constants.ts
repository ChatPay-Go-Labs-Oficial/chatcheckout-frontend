/**
 * Stellar Network Constants
 * Configurações para pagamento via Stellar USDC
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
 * Configuração do asset USDC na Stellar Network
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
} as const;

/**
 * XLM Asset Configuration (nativo)
 * Para uso futuro quando suportar XLM
 */
export const XLM_ASSET = {
  CODE: 'XLM',
  NATIVE: true,
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
