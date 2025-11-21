// app/layout.tsx
import "./globals.css"; // must be first import for preflight to apply early
import React from "react";
import Navbar from "@/components/Navbar";
import { Providers } from "./providers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
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