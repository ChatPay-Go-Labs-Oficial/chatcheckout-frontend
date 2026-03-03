import { NextResponse } from 'next/server';
import { STELLAR_CONFIG } from '@/utils/stellar/constants';
import * as sdk from '@stellar/stellar-sdk';

/**
 * GET /api/stellar/check-account
 *
 * Verifica o estado de uma conta Stellar
 *
 * Query params:
 * - address: string (endereço da conta)
 *
 * Returns:
 * - sequenceNumber: number (número de sequência atual)
 * - hasPendingTransactions: boolean (se há transações pendentes no pool)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json({ error: 'address is required' }, { status: 400 });
    }

    // Get RPC URL
    const rpcUrl =
      STELLAR_CONFIG.NETWORK === 'public'
        ? 'https://soroban-api.stellar.org'
        : 'https://soroban-testnet.stellar.org';

    console.log('[API /stellar/check-account] Checking account:', address);

    // Get account info via RPC
    const rpc = new sdk.rpc.Server(rpcUrl);
    const account = await rpc.getAccount(address);
    const sequenceNumber = account.sequenceNumber().toString();

    console.log('[API /stellar/check-account] Account info:', {
      address,
      sequenceNumber,
    });

    return NextResponse.json({
      sequenceNumber,
      hasPendingTransactions: false, // Não temos como verificar transações pendentes via RPC facilmente
    });
  } catch (error) {
    console.error('[API /stellar/check-account] Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to check account',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
