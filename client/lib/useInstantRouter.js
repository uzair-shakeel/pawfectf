"use client";
import { useRouter as useNextRouter } from 'next/navigation';
import { useTransition, useCallback } from 'react';

/**
 * Custom router hook that makes navigation instant by using React transitions
 * This prevents the UI from blocking during data fetches
 */
export function useInstantRouter() {
  const router = useNextRouter();
  const [isPending, startTransition] = useTransition();

  const push = useCallback((href, options) => {
    startTransition(() => {
      router.push(href, options);
    });
  }, [router]);

  const replace = useCallback((href, options) => {
    startTransition(() => {
      router.replace(href, options);
    });
  }, [router]);

  return {
    ...router,
    push,
    replace,
    isPending,
  };
}
