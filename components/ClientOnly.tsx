'use client';

import { useEffect, useState, ReactNode } from 'react';

/**
 * ClientOnly
 * Wrap any component that uses browser-only APIs (localStorage,
 * Zustand selectors, emoji icons in buttons, etc.) to prevent
 * Next.js hydration mismatches.
 *
 * Usage:
 *   <ClientOnly fallback={<span className="w-5 h-5" />}>
 *     <CartBadge />
 *   </ClientOnly>
 */
export default function ClientOnly({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <>{fallback}</>;
  return <>{children}</>;
}
