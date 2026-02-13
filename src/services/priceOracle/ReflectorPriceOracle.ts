import { PriceOracleService } from './PriceOracleService';
import { PRICE_ORACLE_CONFIG } from '@/utils/stellar/constants';

interface ReflectorAssetPrice {
  price: number;
  decimals: number;
  timestamp: number;
}

/**
 * Reflector Network Price Oracle Implementation
 * Oráculo descentralizado nativo da Stellar Network
 * Atualização a cada 5 minutos, gratuito e sem limitações
 */
export class ReflectorPriceOracle implements PriceOracleService {
  private readonly apiUrl = PRICE_ORACLE_CONFIG.REFLECTOR_API_URL;
  private cache = new Map<string, { rate: number; timestamp: number }>();
  private readonly cacheDuration = PRICE_ORACLE_CONFIG.CACHE_DURATION;

  // Mapeamento de símbolos para assets Reflector
  private readonly assetMapping: Record<string, string> = {
    BRL: 'BRL',
    USD: 'USD',
    USDC: 'USDC',
    XLM: 'XLM',
  };

  async getExchangeRate(from: string, to: string): Promise<number> {
    const cacheKey = `${from}-${to}`;
    const cached = this.cache.get(cacheKey);

    // Verificar cache
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.rate;
    }

    try {
      // USDC é sempre 1:1 com USD no Reflector
      if (to === 'USDC') {
        to = 'USD';
      }

      const fromAsset = this.assetMapping[from];
      const toAsset = this.assetMapping[to];

      if (!fromAsset || !toAsset) {
        throw new Error(`Moeda não suportada: ${from} ou ${to}`);
      }

      // Buscar preços via Reflector API
      const [fromPrice, toPrice] = await Promise.all([
        this.fetchAssetPrice(fromAsset),
        this.fetchAssetPrice(toAsset),
      ]);

      // Calcular taxa de conversão
      const rate = fromPrice / toPrice;

      // Salvar no cache
      this.cache.set(cacheKey, { rate, timestamp: Date.now() });

      return rate;
    } catch (error) {
      console.error('Erro ao buscar cotação no Reflector:', error);
      throw error;
    }
  }

  async convertAmount(amount: number, from: string, to: string): Promise<number> {
    const rate = await this.getExchangeRate(from, to);
    return amount / rate;
  }

  private async fetchAssetPrice(asset: string): Promise<number> {
    // TODO: Implementar chamada real à API Reflector quando disponível
    // Por enquanto, usar API REST genérica
    // Quando Reflector Client Bindings estiver disponível, usar:
    // import { ReflectorClient } from '@reflector/client';
    // const client = new ReflectorClient(contractAddress);
    // const price = await client.lastprice(asset);

    const response = await fetch(`${this.apiUrl}/price/${asset}`);

    if (!response.ok) {
      throw new Error(`Erro ao buscar preço de ${asset} no Reflector`);
    }

    const data = await response.json();

    // Reflector retorna preço como i128, precisa dividir por 10^decimals
    // const actualPrice = data.price / Math.pow(10, data.decimals);

    // Por enquanto, retornar o preço direto (ajustar quando API estiver confirmada)
    return data.price || 0;
  }
}
