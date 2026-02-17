'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const PUBLIC_PATHS = ['/login', '/register'];

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { token, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p === '/register' ? '/register' : p));

  useEffect(() => {
    if (isLoading) return;
    if (!token && !isPublic) {
      router.replace('/login');
      return;
    }
    if (token && (pathname === '/login' || pathname === '/register')) {
      router.replace('/');
      return;
    }
  }, [isLoading, token, isPublic, pathname, router]);

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100dvh',
          background: 'var(--color-bg)',
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            border: '3px solid var(--color-border)',
            borderTopColor: 'var(--color-accent)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
      </div>
    );
  }

  if (!token && !isPublic) {
    return null;
  }

  return <>{children}</>;
}
