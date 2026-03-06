import { NextResponse } from 'next/server';
import { Client, type EscrowData } from '@/services/escrow';
import { STELLAR_CONFIG } from '@/utils/stellar/constants';

type EscrowStatusTag = 'Active' | 'Released' | 'Refunded' | 'Disputed';

const ESCROW_CONTRACT_ID = 'CA7KSUEHPBPOY2Z253B5IFY6E6H6JYQ5VL5GEUXLIYRDTX4PTSFMSVKV';

function getSorobanRpcUrl(network: string): string {
  return network === 'public'
    ? 'https://soroban-api.stellar.org'
    : 'https://soroban-testnet.stellar.org';
}

function toBigInt(value: unknown): bigint {
  if (typeof value === 'bigint') return value;
  if (typeof value === 'number') return BigInt(Math.trunc(value));
  if (typeof value === 'string') return BigInt(value);
  throw new Error('Invalid numeric value from contract');
}

function toNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'bigint') return Number(value);
  if (typeof value === 'string') return Number.parseInt(value, 10);
  return Number.NaN;
}

function getEscrowStatus(status: EscrowData['status']): EscrowStatusTag {
  return status.tag;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sellerAddress = searchParams.get('sellerAddress');
    const sourceAddress = searchParams.get('sourceAddress');
    const network = searchParams.get('network') || STELLAR_CONFIG.NETWORK;

    if (!sellerAddress) {
      return NextResponse.json({ error: 'sellerAddress is required' }, { status: 400 });
    }

    if (network !== 'testnet' && network !== 'public') {
      return NextResponse.json({ error: 'network must be testnet or public' }, { status: 400 });
    }

    const rpcUrl = getSorobanRpcUrl(network);
    const sourceAccount = sourceAddress || (sellerAddress.startsWith('G') ? sellerAddress : null);

    if (!sourceAccount) {
      return NextResponse.json(
        {
          error: 'sourceAddress is required when sellerAddress is a contract address (C...)',
        },
        { status: 400 },
      );
    }

    const client = new Client({
      contractId: ESCROW_CONTRACT_ID,
      rpcUrl,
      networkPassphrase: STELLAR_CONFIG.NETWORK_PASSPHRASE,
      publicKey: sourceAccount,
    });

    const sellerEscrowsTx = await client.get_seller_escrows(
      { seller: sellerAddress },
      { simulate: true },
    );

    const escrowIds = (sellerEscrowsTx.result || []).map((id) => Number(toBigInt(id)));

    const now = Math.floor(Date.now() / 1000);

    const entries = await Promise.all(
      escrowIds.map(async (escrowId) => {
        const escrowTx = await client.get_escrow(
          { escrow_id: BigInt(escrowId) },
          { simulate: true },
        );

        const escrow = escrowTx.result;

        if (!escrow) {
          return null;
        }

        const releaseAt = toNumber(escrow.release_at);
        const status = getEscrowStatus(escrow.status);

        const isEligible = status === 'Active' && Number.isFinite(releaseAt) && releaseAt <= now;

        if (!isEligible) {
          return null;
        }

        return {
          escrowId,
          asset: escrow.asset,
          amount: toBigInt(escrow.amount).toString(),
          releaseAt: new Date(releaseAt * 1000).toISOString(),
          status,
        };
      }),
    );

    const escrows = entries.filter((entry) => entry !== null);

    return NextResponse.json({
      escrows,
      total: escrows.length,
    });
  } catch (error) {
    console.error('[API /stellar/releasable-escrows] Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to load releasable escrows',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
