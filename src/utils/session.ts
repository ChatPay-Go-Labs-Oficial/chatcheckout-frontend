export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return ''; // SSR fallback
  const key = 'chat_session_id';
  let sessionId = sessionStorage.getItem(key);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(key, sessionId);
  }
  return sessionId;
}
