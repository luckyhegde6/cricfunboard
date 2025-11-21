// components/AuthButton.tsx
"use client";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

export default function AuthButton() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isAdmin = (session?.user as any)?.role === "admin";

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [open]);

  if (status === "loading") {
    return <div className="w-24 h-9 rounded bg-slate-100 animate-pulse" />;
  }

  if (!session) {
    return (
      <Link href="/auth/signin" className="px-3 py-1.5 bg-slate-800 text-white rounded-md text-sm shadow-sm hover:bg-slate-900">
        Sign in
      </Link>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((s) => !s)}
        aria-haspopup="true"
        aria-expanded={open}
        className="flex items-center gap-2 px-3 py-1.5 border rounded-md text-sm bg-white shadow-sm"
      >
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 text-slate-700">
          {(session.user?.email || "U").charAt(0).toUpperCase()}
        </span>
        <span className="hidden sm:block text-sm">{session.user?.email?.split("@")[0]}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white border rounded shadow-lg py-2 text-sm z-50">
          <Link href="/profile" className="block px-3 py-2 hover:bg-slate-50" onClick={() => setOpen(false)}>Profile</Link>
          {isAdmin && (
            <Link href="/admin" className="block px-3 py-2 hover:bg-slate-50" onClick={() => setOpen(false)}>Admin</Link>
          )}
          <button onClick={() => signOut({ callbackUrl: "/" })} className="w-full text-left px-3 py-2 hover:bg-slate-50">Sign out</button>
        </div>
      )}
    </div>
  );
}
