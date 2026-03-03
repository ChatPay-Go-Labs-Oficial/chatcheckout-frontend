import { NextResponse } from 'next/server';
import { Client } from '@/services/escrow';
import { STELLAR_CONFIG, USDC_CONTRACT, XLM_CONTRACT } from '@/utils/stellar/constants';
import * as sdk from '@stellar/stellar-sdk';

/**
 * Escrow configuration constants
 */
const ESCROW_CONFIG = {
  CONTRACT_ID: 'CA7KSUEHPBPOY2Z253B5IFY6E6H6JYQ5VL5GEUXLIYRDTX4PTSFMSVKV',
  GUARANTEE_DAYS: 7,
  FEE_BPS: 100, // 1% fee
} as const;

/**
 * Get correct Soroban RPC URL for the network
 */
function getSorobanRpcUrl(): string {
  // Use proper Soroban RPC endpoints
  if (STELLAR_CONFIG.NETWORK === 'public') {
    return 'https://soroban-api.stellar.org';
  }
  return 'https://soroban-testnet.stellar.org';
}

/**
 * Get seller's wallet address
 * TODO: Implement backend endpoint to fetch seller address by product ID
 */
async function getSellerAddress(productId: string): Promise<string> {
  // Temporary: Use test address
  // In production, call backend API or database
  const TEST_SELLER_ADDRESS = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    console.warn('[API /stellar/create-escrow] No API URL configured, using test address');
    return TEST_SELLER_ADDRESS;
  }

  try {
    const response = await fetch(`${apiUrl}/seller/wallet-address?productId=${productId}`);

    if (response.ok) {
      const data = await response.json();
      if (data.walletAddress) {
        console.log('[API /stellar/create-escrow] Seller address fetched:', data.walletAddress);
        return data.walletAddress;
      }
    }
  } catch (error) {
    console.error('[API /stellar/create-escrow] Error fetching seller address:', error);
  }

  console.warn('[API /stellar/create-escrow] Using test seller address');
  return TEST_SELLER_ADDRESS;
}

/**
 * POST /api/stellar/create-escrow
 *
 * Cria uma transação de escrow no servidor (sem CORS)
 *
 * Body:
 * - buyerAddress: string
 * - amountCrypto: number (valor em XLM ou USDC)
 * - asset: string ('XLM' ou 'USDC')
 * - productId: string
 *
 * Returns:
 * - transactionXDR: string (transação montada, não assinada)
 * - asset: string (asset usado na transação)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { buyerAddress, amountCrypto, asset, productId } = body;

    // Validate inputs
    if (!buyerAddress) {
      return NextResponse.json({ error: 'Buyer address is required' }, { status: 400 });
    }

    if (!amountCrypto || amountCrypto <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 });
    }

    if (!asset || !['XLM', 'USDC'].includes(asset)) {
      return NextResponse.json({ error: 'Asset must be XLM or USDC' }, { status: 400 });
    }

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Get seller address
    const sellerAddress = await getSellerAddress(productId);

    // Convert amount to smallest unit (7 decimals for both XLM and USDC)
    const amountInSmallestUnit = BigInt(Math.floor(amountCrypto * 10 ** 7));

    console.log('[API /stellar/create-escrow] Creating escrow transaction:', {
      buyer: buyerAddress,
      seller: sellerAddress,
      amount: amountCrypto,
      asset: asset,
      amountInSmallestUnit: amountInSmallestUnit.toString(),
      productId,
    });

    // Initialize escrow contract client (server-side, using proper Soroban RPC)
    const rpcUrl = getSorobanRpcUrl();

    const client = new Client({
      contractId: ESCROW_CONFIG.CONTRACT_ID,
      rpcUrl: rpcUrl,
      networkPassphrase: STELLAR_CONFIG.NETWORK_PASSPHRASE,
      publicKey: buyerAddress,
    });

    // Determine asset address based on asset type
    // Both XLM and USDC use their Stellar Asset Contract (SAC) addresses in Soroban
    const assetContractAddress = asset === 'XLM' ? XLM_CONTRACT.ADDRESS : USDC_CONTRACT.ADDRESS;

    console.log('[API /stellar/create-escrow] Using asset:', asset, '→', assetContractAddress);

    // Construct create_escrow transaction
    // We use simulate: true to get resource fees and transaction structure
    // Note: This fixes the sequence number at creation time
    // The retry logic on the client handles sequence number mismatches
    console.log('[API /stellar/create-escrow] Simulating transaction...');
    const tx = await client.create_escrow(
      {
        buyer: buyerAddress,
        seller: sellerAddress,
        amount: amountInSmallestUnit,
        asset: assetContractAddress,
        fee_bps: ESCROW_CONFIG.FEE_BPS,
        guarantee_days: ESCROW_CONFIG.GUARANTEE_DAYS,
        product_id: productId,
      },
      {
        simulate: true, // Simulate to get correct fees and transaction structure
      },
    );

    console.log('[API /stellar/create-escrow] Simulation successful');

    // Convert transaction to XDR string for frontend to sign
    const transactionXDR = tx.toXDR();

    // Extract sequence number from the transaction for debugging
    try {
      const parsedTxEnvelope = sdk.TransactionBuilder.fromXDR(
        transactionXDR,
        STELLAR_CONFIG.NETWORK_PASSPHRASE,
      );

      let txSeqNum: string = 'unknown';

      if (parsedTxEnvelope instanceof sdk.Transaction) {
        txSeqNum = parsedTxEnvelope.sequence.toString();
      } else if (parsedTxEnvelope instanceof sdk.FeeBumpTransaction) {
        txSeqNum = parsedTxEnvelope.innerTransaction.sequence.toString();
      }

      console.log('[API /stellar/create-escrow] Transaction sequence number:', txSeqNum);
    } catch (e) {
      console.log('[API /stellar/create-escrow] Could not extract sequence number from XDR:', e);
    }

    console.log('[API /stellar/create-escrow] Transaction created:', {
      transactionXDR: transactionXDR.substring(0, 50) + '...',
    });

    return NextResponse.json({
      transactionXDR,
      escrowContract: ESCROW_CONFIG.CONTRACT_ID,
      asset,
    });
  } catch (error) {
    console.error('[API /stellar/create-escrow] Detailed Error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error
    });

    return NextResponse.json(
      {
        error: 'Failed to create escrow transaction',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
