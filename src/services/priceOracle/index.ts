import { PriceOracleService } from './PriceOracleService';
import { CoinGeckoPriceOracle } from './CoinGeckoPriceOracle';

/**
 * Price Oracle Manager
 *
 * NOTA: Reflector Network API está inoperante (endpoint REST não existe)
 * Usando apenas CoinGecko como oráculo de preços.
 *
 * TODO: Reavaliar Reflector quando:
 * - Documentação pública estiver disponível
 * - Endpoint REST for confirmado e estável
 * - SDK TypeScript for disponibilizado
 *
 * Verificado em: 2026-03-01
 * Status: Reflector retorna HTTP 000 (falha de conexão)
 */
class PriceOracleManager implements PriceOracleService {
  private oracle: CoinGeckoPriceOracle;

  constructor() {
    this.oracle = new CoinGeckoPriceOracle();
  }

  async getExchangeRate(from: string, to: string): Promise<number> {
    return await this.oracle.getExchangeRate(from, to);
  }

  async convertAmount(amount: number, from: string, to: string): Promise<number> {
    return await this.oracle.convertAmount(amount, from, to);
  }
}

/**
 * Factory para criar instância do Price Oracle
 * Facilita substituição de implementação no futuro
 */
export function createPriceOracle(): PriceOracleService {
  return new PriceOracleManager();
}

/**
 * Instância singleton do Price Oracle
 */
export const priceOracle = createPriceOracle();

// Export types
export type { PriceOracleService } from './PriceOracleService';
