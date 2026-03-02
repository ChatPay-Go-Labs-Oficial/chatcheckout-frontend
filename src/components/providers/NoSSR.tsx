'use client';

import { useEffect, useState } from 'react';

/**
 * NoSSR Component
 *
 * Prevents children from rendering during SSR, only rendering after client-side hydration.
 * This is useful for components that should only run in the browser.
 */
export function NoSSR({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return <>{children}</>;
}
