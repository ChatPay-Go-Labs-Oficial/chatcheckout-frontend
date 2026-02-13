import { PriceOracleService } from './PriceOracleService';

interface CoinGeckoResponse {
  [key: string]: {
    [currency: string]: number;
  };
}

/**
 * CoinGecko Price Oracle Implementation
 * Implementação de oráculo de preços usando CoinGecko API (gratuita)
 */
export class CoinGeckoPriceOracle implements PriceOracleService {
  private readonly baseUrl = 'https://api.coingecko.com/api/v3';
  private cache = new Map<string, { rate: number; timestamp: number }>();
  private readonly cacheDuration = 5 * 60 * 1000; // 5 minutos

  private readonly coinIds: Record<string, string> = {
    BRL: 'brazilian-real',
    USD: 'usd',
    USDC: 'usd-coin',
    XLM: 'stellar',
  };

  async getExchangeRate(from: string, to: string): Promise<number> {
    const cacheKey = `${from}-${to}`;
    const cached = this.cache.get(cacheKey);

    // Verificar cache
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.rate;
    }

    try {
      // USDC é sempre 1:1 com USD
      if (to === 'USDC') {
        to = 'USD';
      }

      const fromId = this.coinIds[from];
      const toId = this.coinIds[to];

      if (!fromId || !toId) {
        throw new Error(`Moeda não suportada: ${from} ou ${to}`);
      }

      const response = await fetch(
        `${this.baseUrl}/simple/price?ids=${fromId}&vs_currencies=${toId.toLowerCase()}`
      );

      if (!response.ok) {
        throw new Error('Erro ao buscar cotação no CoinGecko');
      }

      const data: CoinGeckoResponse = await response.json();
      const rate = 1 / data[fromId][toId.toLowerCase()];

      // Salvar no cache
      this.cache.set(cacheKey, { rate, timestamp: Date.now() });

      return rate;
    } catch (error) {
      console.error('Erro ao buscar cotação no CoinGecko:', error);
      throw error;
    }
  }

  async convertAmount(amount: number, from: string, to: string): Promise<number> {
    const rate = await this.getExchangeRate(from, to);
    return amount / rate;
  }
}
