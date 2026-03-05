import { PriceOracleService } from './PriceOracleService';

interface CoinGeckoResponse {
  [key: string]: {
    [currency: string]: number;
  };
}

/**
 * CoinGecko Price Oracle Implementation
 * Implementação de oráculo de preços usando CoinGecko API (gratuita)
 * Suporta: BRL ↔ USDC e BRL ↔ XLM
 */
export class CoinGeckoPriceOracle implements PriceOracleService {
  private cache = new Map<string, { rate: number; timestamp: number }>();
  private readonly cacheDuration = 5 * 60 * 1000; // 5 minutos

  async getExchangeRate(from: string, to: string): Promise<number> {
    // Validação de parâmetros - suporta BRL ↔ USDC e BRL ↔ XLM (ambas direções)
    const currencies = [from, to].sort().join('-');
    const supportedPairs = ['BRL-USDC', 'BRL-XLM'];
    if (!supportedPairs.includes(currencies)) {
      throw new Error(
        `Conversão não suportada: ${from} → ${to}. ` +
          `Apenas BRL ↔ USDC e BRL ↔ XLM são suportados.`,
      );
    }

    // Determinar cache key e moeda para buscar
    const currency = from === 'XLM' || to === 'XLM' ? 'XLM' : 'USDC';
    const cacheKey = currency === 'XLM' ? 'XLM-BRL' : 'USDC-BRL';
    const cached = this.cache.get(cacheKey);

    // Retornar cache se válido (5 minutos)
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      console.log(`[CoinGecko] Cache hit: 1 ${currency} = R$ ${cached.rate}`);
      // Retornar taxa apropriada baseado na direção
      if ((from === currency && to === 'BRL') || (from === 'BRL' && to !== currency)) {
        return cached.rate;
      } else {
        return 1 / cached.rate;
      }
    }

    // Buscar cotação atual
    console.log(`[CoinGecko] Cache miss, buscando cotação ${currency}...`);
    try {
      // Determinar ID da moeda na CoinGecko
      const coinId = currency === 'XLM' ? 'stellar' : 'usd-coin';

      // Usar proxy interno para evitar CORS
      const response = await fetch(`/api/price?oracle=coingecko&from=${coinId}&to=brl`);

      if (!response.ok) {
        throw new Error(`Erro ao buscar cotação no CoinGecko: HTTP ${response.status}`);
      }

      const data: CoinGeckoResponse = await response.json();
      const rate = data[coinId]['brl'];

      // VALIDAÇÕES CRÍTICAS
      if (!rate || rate <= 0 || !isFinite(rate)) {
        throw new Error(
          `Cotação inválida recebida: ${rate}. ` + `Valor deve ser um número finito > 0.`,
        );
      }

      // Validação específica por asset
      if (currency === 'XLM') {
        // XLM: 0.20 - 1.00 BRL (range mais amplo devido à volatilidade)
        if (rate < 0.2 || rate > 1.0) {
          console.warn(
            `[CoinGecko] Cotação XLM suspeita: 1 XLM = R$ ${rate}. ` +
              `Valor esperado: R$ 0.30-0.60`,
          );
        }
      } else {
        // USDC: 3 - 10 BRL (stablecoin deve estar próximo de 4-7 BRL)
        if (rate < 3 || rate > 10) {
          console.warn(
            `[CoinGecko] Cotação USDC suspeita: 1 USDC = R$ ${rate}. ` + `Valor esperado: R$ 4-7`,
          );
        }
      }

      // Salvar no cache
      this.cache.set(cacheKey, { rate, timestamp: Date.now() });
      console.log(`[CoinGecko] Nova cotação: 1 ${currency} = R$ ${rate}`);

      // Retornar taxa apropriada baseado na direção da conversão
      // Crypto → BRL: retorna a taxa direta (ex: 0.45 para XLM, 5.2 para USDC)
      // BRL → Crypto: retorna o inverso
      const isCryptoToBRL =
        (from === currency && to === 'BRL') || (from === 'BRL' && to !== currency);
      if (isCryptoToBRL) {
        return rate;
      } else {
        return 1 / rate;
      }
    } catch (error) {
      console.error('Erro ao buscar cotação no CoinGecko:', error);
      throw error;
    }
  }

  async convertAmount(amount: number, from: string, to: string): Promise<number> {
    // Validação de parâmetros - suporta BRL ↔ USDC e BRL ↔ XLM (ambas direções)
    const currencies = [from, to].sort().join('-');
    const supportedPairs = ['BRL-USDC', 'BRL-XLM'];
    if (!supportedPairs.includes(currencies)) {
      throw new Error(
        `Conversão não suportada: ${from} → ${to}. ` +
          `Apenas BRL ↔ USDC e BRL ↔ XLM são suportados.`,
      );
    }

    // getExchangeRate já retorna a taxa correta dependendo da direção
    const rate = await this.getExchangeRate(from, to);

    // Converter usando a taxa apropriada
    const converted = amount * rate;

    const currency = from === 'XLM' || to === 'XLM' ? 'XLM' : 'USDC';
    console.log(
      `[CoinGecko] Convertido: ${amount} ${from} → ${converted.toFixed(2)} ${to} (${currency}, taxa: ${rate})`,
    );

    return converted;
  }
}
