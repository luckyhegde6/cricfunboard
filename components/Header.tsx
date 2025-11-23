// components/Header.tsx
"use client";
import Link from "next/link";
import AuthButton from "./AuthButton";

export default function Header() {
  return (
    <header className="bg-white/60 backdrop-blur sticky top-0 z-40 border-b">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <img src="/icons/logo.svg" alt="CricBoard" className="w-9 h-9" />
              <span className="font-semibold text-lg tracking-tight">
                CricBoard
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-4 ml-6">
              <Link
                href="/matches"
                className="text-sm text-slate-600 hover:text-slate-900"
              >
                Matches
              </Link>
              <Link
                href="/admin"
                className="text-sm text-slate-600 hover:text-slate-900"
              >
                Admin
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:block text-sm text-slate-500">
              Follow live local matches
            </div>
            <AuthButton />
          </div>
        </div>
      </div>
    </header>
  );
}
