// app/layout.tsx
import "./globals.css"; // must be first import for preflight to apply early
import React from "react";
import Navbar from "@/components/Navbar";
import { Providers } from "./providers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cricfunboard',
  description: 'Cricket Scoreboard Applicationc for Local Tournaments',
  keywords: ['Cricket', 'Scoreboard', 'Tournament', 'Local', 'Cricfunboard'],
  authors: [{ name: 'Lucky Hegde' }],
  publisher: 'Lucky Hegde',
  openGraph: {
    title: 'Cricfunboard',
    description: 'Cricket Scoreboard Applicationc for Local Tournaments',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Cricfunboard',
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
  robots: {
    index: true,
    googleBot: {
      index: true,
    },
  },
  verification: {
    google: 'google-site-verification',
    yandex: 'yandex-verification',
    yahoo: 'yahoo-site-verification',
  },
  themeColor: '#0f172a',
  colorScheme: 'light dark',
  metadataBase: new URL('https://github.com/luckyhegde6/cricfunboard'),
  alternates: {
    canonical: '/cricfunboard',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions).catch(() => null);

  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#0f172a" />
        <link rel="icon" href="/favicon.svg" />
      </head>
      <body className="font-sans bg-slate-50 text-slate-900 min-h-screen antialiased">
        <Providers session={session}>
          <Navbar />
          <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
