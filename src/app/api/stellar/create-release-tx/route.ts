import { NextResponse } from 'next/server';
import { Client } from '@/services/escrow';
import { STELLAR_CONFIG } from '@/utils/stellar/constants';
import * as sdk from '@stellar/stellar-sdk';

const ESCROW_CONTRACT_ID = 'CA7KSUEHPBPOY2Z253B5IFY6E6H6JYQ5VL5GEUXLIYRDTX4PTSFMSVKV';

function getSorobanRpcUrl(network: string): string {
  return network === 'public'
    ? 'https://soroban-api.stellar.org'
    : 'https://soroban-testnet.stellar.org';
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const escrowId = Number(body.escrowId);
    const sourceAddress = String(body.sourceAddress || '');
    const network = String(body.network || STELLAR_CONFIG.NETWORK);

    if (!Number.isFinite(escrowId) || escrowId <= 0) {
      return NextResponse.json({ error: 'escrowId must be a positive number' }, { status: 400 });
    }

    if (!sourceAddress) {
      return NextResponse.json({ error: 'sourceAddress is required' }, { status: 400 });
    }

    if (network !== 'testnet' && network !== 'public') {
      return NextResponse.json({ error: 'network must be testnet or public' }, { status: 400 });
    }

    const rpcUrl = getSorobanRpcUrl(network);

    const client = new Client({
      contractId: ESCROW_CONTRACT_ID,
      rpcUrl,
      networkPassphrase: STELLAR_CONFIG.NETWORK_PASSPHRASE,
      publicKey: sourceAddress,
    });

    // Defensive validation: ensure escrow is still active and already releasable.
    // This avoids creating a tx for an escrow that became ineligible between list and click.
    const escrowTx = await client.get_escrow({ escrow_id: BigInt(escrowId) }, { simulate: true });
    const escrow = escrowTx.result;

    if (!escrow) {
      return NextResponse.json({ error: 'Escrow not found' }, { status: 404 });
    }

    const status = escrow.status.tag;
    const releaseAtRaw = escrow.release_at;
    const releaseAt =
      typeof releaseAtRaw === 'bigint'
        ? Number(releaseAtRaw)
        : typeof releaseAtRaw === 'number'
          ? releaseAtRaw
          : Number.parseInt(String(releaseAtRaw), 10);

    const now = Math.floor(Date.now() / 1000);

    if (status !== 'Active') {
      return NextResponse.json(
        { error: `Escrow is not active (status: ${status})` },
        { status: 400 },
      );
    }

    if (!Number.isFinite(releaseAt) || releaseAt > now) {
      return NextResponse.json(
        { error: 'Escrow guarantee period has not expired yet' },
        { status: 400 },
      );
    }

    const tx = await client.release_payment(
      {
        escrow_id: BigInt(escrowId),
      },
      {
        simulate: true,
      },
    );

    const transactionXDR = tx.toXDR();

    try {
      const parsedTx = sdk.TransactionBuilder.fromXDR(
        transactionXDR,
        STELLAR_CONFIG.NETWORK_PASSPHRASE,
      );

      const sequence =
        parsedTx instanceof sdk.Transaction
          ? parsedTx.sequence.toString()
          : parsedTx.innerTransaction.sequence.toString();

      console.log('[API /stellar/create-release-tx] Release transaction created:', {
        escrowId,
        sourceAddress,
        sequence,
      });
    } catch (error) {
      console.log('[API /stellar/create-release-tx] Could not parse XDR sequence:', error);
    }

    return NextResponse.json({
      transactionXDR,
      escrowId,
      contractId: ESCROW_CONTRACT_ID,
    });
  } catch (error) {
    console.error('[API /stellar/create-release-tx] Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to create release transaction',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
