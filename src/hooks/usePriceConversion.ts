'use client';

import { useState, useEffect } from 'react';
import { priceOracle } from '@/services/priceOracle';

/**
 * usePriceConversion Hook Return Type
 */
interface UsePriceConversionReturn {
  /** Valor convertido em moeda de destino */
  convertedAmount: number;
  /** Taxa de conversão (1 'to' = X 'from') */
  exchangeRate: number;
  /** Estado de carregamento */
  isLoading: boolean;
  /** Erro durante conversão */
  error: string | null;
  /** Timestamp da última conversão */
  timestamp: number;
}

/**
 * usePriceConversion
 * Hook para converter preços entre moedas usando Price Oracle
 *
 * @param amount Valor a converter
 * @param from Moeda de origem (ex: 'BRL')
 * @param to Moeda de destino (ex: 'USDC')
 *
 * @example
 * ```ts
 * const { convertedAmount, exchangeRate, isLoading } = usePriceConversion(100, 'BRL', 'USDC');
 * // convertedAmount = 18.18 USDC (exemplo)
 * // exchangeRate = 5.50 (1 USDC = 5.50 BRL)
 * ```
 */
export function usePriceConversion(
  amount: number,
  from: string,
  to: string
): UsePriceConversionReturn {
  const [convertedAmount, setConvertedAmount] = useState(0);
  const [exchangeRate, setExchangeRate] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timestamp, setTimestamp] = useState(Date.now());

  useEffect(() => {
    let isActive = true;

    async function fetchConversion() {
      try {
        setIsLoading(true);
        setError(null);

        // Buscar taxa de conversão e converter valor
        const [rate, converted] = await Promise.all([
          priceOracle.getExchangeRate(from, to),
          priceOracle.convertAmount(amount, from, to),
        ]);

        if (isActive) {
          setExchangeRate(rate);
          setConvertedAmount(converted);
          setTimestamp(Date.now());
        }
      } catch (err) {
        if (isActive) {
          const errorMessage =
            err instanceof Error ? err.message : 'Erro ao converter preço';
          setError(errorMessage);
          console.error('[usePriceConversion] Error:', err);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    fetchConversion();

    return () => {
      isActive = false;
    };
  }, [amount, from, to]);

  return {
    convertedAmount,
    exchangeRate,
    isLoading,
    error,
    timestamp,
  };
}
