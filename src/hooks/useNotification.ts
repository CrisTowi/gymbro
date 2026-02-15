'use client';

import { useCallback, useEffect, useState } from 'react';

export function useNotification() {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied' as NotificationPermission;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  const sendNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (
        typeof window === 'undefined' ||
        !('Notification' in window) ||
        permission !== 'granted'
      ) {
        return null;
      }

      try {
        const notification = new Notification(title, {
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-192x192.png',
          ...options,
        });
        return notification;
      } catch {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'SHOW_NOTIFICATION',
            title,
            options: {
              icon: '/icons/icon-192x192.png',
              ...options,
            },
          });
        }
        return null;
      }
    },
    [permission]
  );

  return { permission, requestPermission, sendNotification };
}
