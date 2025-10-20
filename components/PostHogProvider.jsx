// components/PostHogProvider.jsx - PostHog analytics provider component
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { initPostHog, trackPageView } from '@/lib/posthog';

/**
 * PostHog Provider Component
 * Initializes PostHog and tracks page views across the application
 */
export default function PostHogProvider({ children }) {
  const pathname = usePathname();

  // Initialize PostHog once on mount
  useEffect(() => {
    initPostHog();
  }, []);

  // Track page views on route changes
  useEffect(() => {
    if (pathname) {
      trackPageView(pathname);
    }
  }, [pathname]);

  return <>{children}</>;
}
