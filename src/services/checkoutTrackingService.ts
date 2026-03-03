import { NEXT_PUBLIC_API_URL } from '@/utils/env';

export type TrackingEventType =
  | 'CHECKOUT_SESSION_STARTED'
  | 'CHECKOUT_QA_STARTED'
  | 'CHECKOUT_STARTED'
  | 'CUSTOMER_DATA_SUBMITTED'
  | 'PAYMENT_METHOD_SELECTED'
  | 'WALLET_CONNECTED'
  | 'CRYPTO_ASSET_SELECTED'
  | 'PAYMENT_CONFIRM_CLICKED'
  | 'PAYMENT_INTENT_CREATED'
  | 'PIX_PRESENTED'
  | 'CARD_FORM_PRESENTED'
  | 'CARD_PAYMENT_CONFIRMED'
  | 'CRYPTO_ESCROW_CREATED'
  | 'CRYPTO_TX_SIGNED'
  | 'CRYPTO_TX_SUBMITTED'
  | 'CRYPTO_TX_CONFIRMED'
  | 'PAYMENT_FAILED'
  | 'PAYMENT_SUCCEEDED'
  | 'CHECKOUT_ABANDONED';

export type TrackingStep =
  | 'WELCOME'
  | 'QA'
  | 'CHECKOUT_STARTED'
  | 'CUSTOMER_DATA'
  | 'PAYMENT_METHOD'
  | 'WALLET_CONNECTION'
  | 'PAYMENT_REVIEW'
  | 'PAYMENT'
  | 'CONFIRMATION';

export type TrackingPaymentMethod = 'PIX' | 'CARD' | 'CRYPTO';

interface StartSessionResponse {
  sessionId: string;
  trackingToken: string;
  expiresAt: string;
}

interface StoredTrackingSession {
  sessionId: string;
  trackingToken: string;
  expiresAt: string;
  productHash: string;
}

const STORAGE_KEY = 'checkout_tracking_session';

function getStoredSession(): StoredTrackingSession | null {
  if (typeof window === 'undefined') return null;

  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as StoredTrackingSession;
    if (!parsed.sessionId || !parsed.trackingToken || !parsed.expiresAt || !parsed.productHash) {
      return null;
    }
    if (new Date(parsed.expiresAt) < new Date()) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function storeSession(session: StoredTrackingSession): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

async function startSession(productHash: string): Promise<StoredTrackingSession> {
  const response = await fetch(`${NEXT_PUBLIC_API_URL}/checkout-tracking/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productHash }),
  });

  if (!response.ok) {
    throw new Error('Failed to start checkout tracking session');
  }

  const data = (await response.json()) as StartSessionResponse;
  const session: StoredTrackingSession = {
    sessionId: data.sessionId,
    trackingToken: data.trackingToken,
    expiresAt: data.expiresAt,
    productHash,
  };
  storeSession(session);
  return session;
}

async function ensureSession(productHash: string): Promise<StoredTrackingSession> {
  const session = getStoredSession();
  if (session && session.productHash === productHash) {
    return session;
  }

  return startSession(productHash);
}

export async function trackCheckoutEvent(params: {
  productHash: string;
  eventType: TrackingEventType;
  step?: TrackingStep;
  paymentMethod?: TrackingPaymentMethod;
  orderId?: string;
  status?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    const session = await ensureSession(params.productHash);

    await fetch(`${NEXT_PUBLIC_API_URL}/checkout-tracking/event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.trackingToken}`,
      },
      body: JSON.stringify({
        sessionId: session.sessionId,
        eventType: params.eventType,
        step: params.step,
        paymentMethod: params.paymentMethod,
        orderId: params.orderId,
        status: params.status,
        metadata: params.metadata,
        occurredAt: new Date().toISOString(),
      }),
    });
  } catch (error) {
    console.warn('[checkoutTracking] Failed to track event:', error);
  }
}

export async function sendCheckoutHeartbeat(productHash: string): Promise<void> {
  try {
    const session = await ensureSession(productHash);
    await fetch(`${NEXT_PUBLIC_API_URL}/checkout-tracking/heartbeat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.trackingToken}`,
      },
      body: JSON.stringify({ sessionId: session.sessionId }),
    });
  } catch (error) {
    console.warn('[checkoutTracking] Failed to send heartbeat:', error);
  }
}

export async function abandonCheckout(productHash: string, metadata?: Record<string, unknown>) {
  await trackCheckoutEvent({
    productHash,
    eventType: 'CHECKOUT_ABANDONED',
    step: 'PAYMENT',
    metadata,
  });
}

export const checkoutTrackingService = {
  ensureSession,
  trackCheckoutEvent,
  sendCheckoutHeartbeat,
  abandonCheckout,
};
