'use client';

import { useEffect, useState } from 'react';

export function useNetworkStatus(): boolean {
  // Always start with true to match the server-rendered HTML and avoid hydration mismatch.
  // The useEffect below immediately corrects the value on the client after hydration.
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    // Sync with the real value after hydration
    setIsOnline(navigator.onLine);

    function handleOnline() {
      setIsOnline(true);
    }

    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
