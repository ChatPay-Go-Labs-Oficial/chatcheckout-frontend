import { STELLAR_CONFIG } from '@/utils/stellar/constants';

export interface ReleasableEscrow {
  escrowId: number;
  asset: string;
  amount: string;
  releaseAt: string;
  status: string;
}

export interface BatchReleaseFailure {
  escrowId: number;
  error: string;
}

export interface BatchReleaseSuccess {
  escrowId: number;
  transactionHash: string;
}

export interface BatchReleaseResult {
  processed: number;
  success: number;
  failed: number;
  successes: BatchReleaseSuccess[];
  failures: BatchReleaseFailure[];
}

interface ReleaseSingleResult {
  ok: boolean;
  hash?: string;
  error?: string;
  retryable?: boolean;
}

const MAX_RELEASE_RETRIES = 3;

function isRetryableError(errorMessage: string): boolean {
  const normalized = errorMessage.toLowerCase();

  return (
    normalized.includes('txbadseq') ||
    normalized.includes('sequence') ||
    normalized.includes('txinsufficientfee') ||
    normalized.includes('insufficient fee') ||
    normalized.includes('timeout') ||
    normalized.includes('temporarily')
  );
}

async function parseErrorMessage(response: Response): Promise<string> {
  const data = await response.json().catch(() => null);

  if (typeof data === 'object' && data !== null) {
    if ('error' in data && typeof data.error === 'string') {
      return data.error;
    }

    if ('details' in data && typeof data.details === 'string') {
      return data.details;
    }

    if (
      'details' in data &&
      typeof data.details === 'object' &&
      data.details !== null &&
      'friendlyMessage' in data.details &&
      typeof data.details.friendlyMessage === 'string'
    ) {
      return data.details.friendlyMessage;
    }
  }

  return `Request failed with status ${response.status}`;
}

export const stellarPayoutService = {
  async getReleasableEscrows(
    sellerAddress: string,
    sourceAddress?: string,
  ): Promise<ReleasableEscrow[]> {
    const params = new URLSearchParams({
      sellerAddress,
      network: STELLAR_CONFIG.NETWORK,
    });
    if (sourceAddress) {
      params.set('sourceAddress', sourceAddress);
    }

    const response = await fetch(`/api/stellar/releasable-escrows?${params.toString()}`);

    if (!response.ok) {
      const message = await parseErrorMessage(response);
      throw new Error(message);
    }

    const data = (await response.json()) as { escrows?: ReleasableEscrow[] };
    return data.escrows ?? [];
  },

  async createReleaseTransaction(escrowId: number, sourceAddress: string): Promise<string> {
    const response = await fetch('/api/stellar/create-release-tx', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        escrowId,
        sourceAddress,
        network: STELLAR_CONFIG.NETWORK,
      }),
    });

    if (!response.ok) {
      const message = await parseErrorMessage(response);
      throw new Error(message);
    }

    const data = (await response.json()) as { transactionXDR?: string };

    if (!data.transactionXDR) {
      throw new Error('Release transaction was not generated');
    }

    return data.transactionXDR;
  },

  async submitSignedTransaction(signedTxXDR: string): Promise<string> {
    const response = await fetch('/api/stellar/submit-tx', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ signedTxXDR }),
    });

    if (!response.ok) {
      const message = await parseErrorMessage(response);
      throw new Error(message);
    }

    const data = (await response.json()) as { transactionHash?: string };
    if (!data.transactionHash) {
      throw new Error('No transaction hash returned by submit endpoint');
    }

    return data.transactionHash;
  },

  async releaseEscrowsBatch(params: {
    escrowIds: number[];
    sourceAddress: string;
    signTransactionFn: (txXdr: string) => Promise<string>;
    onProgress?: (done: number, total: number) => void;
  }): Promise<BatchReleaseResult> {
    const successes: BatchReleaseSuccess[] = [];
    const failures: BatchReleaseFailure[] = [];

    for (let index = 0; index < params.escrowIds.length; index++) {
      const escrowId = params.escrowIds[index];
      let attempt = 0;
      let finalResult: ReleaseSingleResult = {
        ok: false,
        error: 'Unknown error',
      };

      while (attempt < MAX_RELEASE_RETRIES) {
        attempt += 1;

        try {
          const transactionXDR = await this.createReleaseTransaction(
            escrowId,
            params.sourceAddress,
          );
          const signedTxXDR = await params.signTransactionFn(transactionXDR);
          const transactionHash = await this.submitSignedTransaction(signedTxXDR);

          finalResult = {
            ok: true,
            hash: transactionHash,
          };

          break;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to release escrow';
          const retryable = isRetryableError(message);

          finalResult = {
            ok: false,
            error: message,
            retryable,
          };

          if (!retryable || attempt >= MAX_RELEASE_RETRIES) {
            break;
          }

          await new Promise((resolve) => setTimeout(resolve, attempt * 1200));
        }
      }

      if (finalResult.ok && finalResult.hash) {
        successes.push({
          escrowId,
          transactionHash: finalResult.hash,
        });
      } else {
        failures.push({
          escrowId,
          error: finalResult.error || 'Failed to release escrow',
        });
      }

      if (params.onProgress) {
        params.onProgress(index + 1, params.escrowIds.length);
      }
    }

    return {
      processed: params.escrowIds.length,
      success: successes.length,
      failed: failures.length,
      successes,
      failures,
    };
  },
};
