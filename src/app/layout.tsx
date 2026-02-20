import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { LocaleProvider } from '@/context/LocaleContext';
import AuthGuard from '@/components/AuthGuard/AuthGuard';
import Navigation from '@/components/Navigation/Navigation';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import DevTools from '@/components/DevTools/DevTools';
import './globals.css';

export const metadata: Metadata = {
  title: 'GymTrack - Your Personal Workout Companion',
  description:
    'Track your workouts, monitor progress, and crush your fitness goals with GymTrack.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'GymTrack',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0a0a0f',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body suppressHydrationWarning>
        <ServiceWorkerRegister />
        <AuthProvider>
          <LocaleProvider>
            <AuthGuard>
              <main>{children}</main>
              <Navigation />
            </AuthGuard>
          </LocaleProvider>
        </AuthProvider>
        <Suspense fallback={null}>
          <DevTools />
        </Suspense>
      </body>
    </html>
  );
}
