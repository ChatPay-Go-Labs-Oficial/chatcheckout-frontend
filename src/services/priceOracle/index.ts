import { PriceOracleService } from './PriceOracleService';
import { ReflectorPriceOracle } from './ReflectorPriceOracle';
import { CoinGeckoPriceOracle } from './CoinGeckoPriceOracle';

/**
 * Price Oracle with Automatic Fallback
 * Tenta Reflector Network primeiro, se falhar usa CoinGecko como fallback
 */
class PriceOracleWithFallback implements PriceOracleService {
  private primary: ReflectorPriceOracle;
  private fallback: CoinGeckoPriceOracle;

  constructor() {
    this.primary = new ReflectorPriceOracle();
    this.fallback = new CoinGeckoPriceOracle();
  }

  async getExchangeRate(from: string, to: string): Promise<number> {
    try {
      // Tentar Reflector primeiro
      return await this.primary.getExchangeRate(from, to);
    } catch (error) {
      console.warn('Reflector falhou, usando fallback CoinGecko:', error);
      // Usar CoinGecko como fallback
      return await this.fallback.getExchangeRate(from, to);
    }
  }

  async convertAmount(amount: number, from: string, to: string): Promise<number> {
    try {
      return await this.primary.convertAmount(amount, from, to);
    } catch (error) {
      console.warn('Reflector falhou, usando fallback CoinGecko:', error);
      return await this.fallback.convertAmount(amount, from, to);
    }
  }
}

/**
 * Factory para criar instância do Price Oracle
 * Facilita substituição de implementação no futuro
 */
export function createPriceOracle(): PriceOracleService {
  return new PriceOracleWithFallback();
}

/**
 * Instância singleton do Price Oracle
 */
export const priceOracle = createPriceOracle();

// Export types
export type { PriceOracleService } from './PriceOracleService';
