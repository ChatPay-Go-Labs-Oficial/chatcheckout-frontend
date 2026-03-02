import { NextResponse } from 'next/server';

/**
 * API Route para Price Oracle
 *
 * NOTA: Reflector Network API está inoperante (endpoint REST não existe)
 * Apenas CoinGecko é suportado atualmente.
 *
 * Endpoint: /api/price?oracle=coingecko&from=usd-coin&to=brl
 * Retorna: {"usd-coin":{"brl":5.13}}
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const oracle = searchParams.get('oracle');

  const headers = {
    'User-Agent': 'ChatCheckout/1.0',
  };

  // Apenas CoinGecko é suportado
  if (oracle === 'coingecko' && from && to) {
    try {
      console.log(`[API /price] Fetching CoinGecko: ${from} → ${to}`);

      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${from}&vs_currencies=${to.toLowerCase()}`,
        { headers },
      );

      if (!response.ok) {
        console.error(`[API /price] CoinGecko error: ${response.status}`);
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();
      console.log(`[API /price] Success: ${JSON.stringify(data)}`);

      return NextResponse.json(data);
    } catch (error) {
      console.error(`[API /price] Error:`, error);
      return NextResponse.json(
        { error: 'Failed to fetch from CoinGecko', details: (error as Error).message },
        { status: 500 },
      );
    }
  }

  return NextResponse.json(
    {
      error: 'Invalid parameters',
      message: 'Use: /api/price?oracle=coingecko&from=usd-coin&to=brl',
    },
    { status: 400 },
  );
}
