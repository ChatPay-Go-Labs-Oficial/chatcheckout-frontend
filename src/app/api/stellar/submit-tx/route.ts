import { NextResponse } from 'next/server';
import { STELLAR_CONFIG } from '@/utils/stellar/constants';
import * as sdk from '@stellar/stellar-sdk';

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
 * POST /api/stellar/submit-tx
 *
 * Envia uma transação assinada para a rede Stellar via Soroban RPC
 *
 * Body:
 * - signedTxXDR: string (transação assinada em formato XDR)
 *
 * Returns:
 * - transactionHash: string
 * - status: string
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { signedTxXDR } = body;

    // Validate input
    if (!signedTxXDR) {
      return NextResponse.json({ error: 'signedTxXDR is required' }, { status: 400 });
    }

    console.log('[API /stellar/submit-tx] Submitting signed transaction');

    // Get correct Soroban RPC URL
    const rpcUrl = getSorobanRpcUrl();
    console.log('[API /stellar/submit-tx] RPC URL:', rpcUrl);

    // Submit transaction via Soroban JSON-RPC API
    // Format: sendTransaction takes an object with transaction field, not an array
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'sendTransaction',
        params: {
          transaction: signedTxXDR,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`RPC request failed: HTTP ${response.status}`);
    }

    const result = await response.json();

    console.log('[API /stellar/submit-tx] Transaction submitted:', result);

    // Extract sequence number from submitted transaction for debugging
    try {
      const parsedTx = sdk.TransactionBuilder.fromXDR(signedTxXDR, STELLAR_CONFIG.NETWORK_PASSPHRASE);
      
      let txSeqNum: string = 'unknown';
      let sourceAddress: string = 'unknown';

      if (parsedTx instanceof sdk.Transaction) {
        txSeqNum = parsedTx.sequence.toString();
        sourceAddress = parsedTx.source;
      } else if (parsedTx instanceof sdk.FeeBumpTransaction) {
        txSeqNum = parsedTx.innerTransaction.sequence.toString();
        sourceAddress = parsedTx.innerTransaction.source;
      }

      console.log('[API /stellar/submit-tx] Submitted transaction sequence number:', txSeqNum);
      console.log('[API /stellar/submit-tx] Source account:', sourceAddress);

      // Get current account sequence to compare
      try {
        const rpc = new sdk.rpc.Server(rpcUrl);
        const account = await rpc.getAccount(sourceAddress);
        const accountSeqNum = account.sequenceNumber().toString();
        console.log('[API /stellar/submit-tx] Account current sequence number:', accountSeqNum);
      } catch (err) {
        console.log('[API /stellar/submit-tx] Could not fetch account for sequence comparison:', err);
      }
    } catch (e) {
      console.log('[API /stellar/submit-tx] Could not extract sequence numbers for comparison:', e);
    }

    // Check if transaction was successful
    if (result.error) {
      // Transaction failed or has issues
      console.error('[API /stellar/submit-tx] Transaction failed:', result.error);

      return NextResponse.json(
        {
          error: 'Transaction failed',
          details: result.error,
        },
        { status: 400 },
      );
    }

    // Check if transaction status is ERROR (Soroban-specific)
    if (result.result && result.result.status === 'ERROR') {
      console.error('[API /stellar/submit-tx] Transaction execution failed:', result.result);

      // Decode the error to provide more details
      let errorMessage = 'Transaction execution failed';
      let resultCode = 'txFailed'; // Default error code
      let isRetryable = true; // Most errors are retryable
      let errorDetails = result.result;

      // Try to decode the XDR error result
      if (result.result.errorResultXdr) {
        console.log(
          '[API /stellar/submit-tx] errorResultXdr length:',
          result.result.errorResultXdr.length,
        );

        try {
          const txResult = sdk.xdr.TransactionResult.fromXDR(
            result.result.errorResultXdr,
            'base64',
          );
          const parsedResult = txResult.result().switch();
          resultCode = parsedResult.name;

          console.log('[API /stellar/submit-tx] Decoded resultCode:', resultCode);

          if (resultCode === 'txBadSeq') {
            errorMessage =
              'Número de sequência incorreto. Por favor, tente fazer o pagamento novamente.';
            isRetryable = true;
          } else if (resultCode === 'txFailed') {
            errorMessage =
              'A transação falhou durante a execução. Verifique se você tem saldo suficiente.';
            isRetryable = true; // Could be temporary network issue
          } else if (resultCode === 'txInsufficientFee') {
            errorMessage = 'Taxa insuficiente. A transação será recriada com taxas atualizadas.';
            isRetryable = true;
          } else if (resultCode === 'txInsufficientBalance') {
            errorMessage = 'Saldo insuficiente para completar a transação.';
            isRetryable = false;
          } else if (resultCode === 'txNoAccount') {
            errorMessage = 'Conta não encontrada na rede Stellar.';
            isRetryable = false;
          } else {
            errorMessage = `Erro na transação: ${resultCode}`;
            isRetryable = true;
          }

          errorDetails = {
            ...errorDetails,
            resultCode,
            friendlyMessage: errorMessage,
            isRetryable,
          };
        } catch (e) {
          // XDR decoding failed - likely truncated or malformed
          console.error('[API /stellar/submit-tx] Error decoding XDR result:', e);
          console.log(
            '[API /stellar/submit-tx] errorResultXdr (first 100 chars):',
            result.result.errorResultXdr.substring(0, 100),
          );

          // If XDR is very short, it might be a pre-execution failure
          if (result.result.errorResultXdr.length < 50) {
            errorMessage = 'Erro de validação na transação. Possível problema com sequence number.';
            resultCode = 'txValidationFailed';
            isRetryable = true;
          }

          errorDetails = {
            ...errorDetails,
            resultCode,
            friendlyMessage: errorMessage,
            isRetryable,
            decodeError: e instanceof Error ? e.message : 'Unknown decode error',
          };
        }
      }

      return NextResponse.json(
        {
          error: errorMessage,
          details: errorDetails,
        },
        { status: 400 },
      );
    }

    // Extract transaction hash from result
    // Format can be: { result: "hash" } or { result: { hash: "hash", ... } }
    let transactionHash: string;

    if (typeof result.result === 'string') {
      transactionHash = result.result;
    } else if (result.result && typeof result.result === 'object') {
      // Try different possible field names
      transactionHash =
        result.result.hash || result.result.transactionHash || result.result.id || '';
    } else {
      transactionHash = '';
    }

    if (!transactionHash) {
      console.error('[API /stellar/submit-tx] No transaction hash in response:', result);
      return NextResponse.json(
        {
          error: 'No transaction hash in response',
          details: result,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      transactionHash,
      status: 'SUCCESS',
    });
  } catch (error) {
    console.error('[API /stellar/submit-tx] Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to submit transaction',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
