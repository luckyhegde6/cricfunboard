// components/AdminSidebar.tsx
"use client";
import Link from "next/link";

export default function AdminSidebar({
  className = "",
}: {
  className?: string;
}) {
  return (
    <aside className={`w-64 p-4 bg-white border rounded ${className}`}>
      <div className="font-semibold mb-4">Admin</div>
      <nav className="flex flex-col gap-2">
        <Link
          href="/admin/users"
          className="px-3 py-2 rounded hover:bg-slate-50"
        >
          Users
        </Link>
        <Link
          href="/admin/matches"
          className="px-3 py-2 rounded hover:bg-slate-50"
        >
          Matches
        </Link>
        <Link
          href="/admin/settings"
          className="px-3 py-2 rounded hover:bg-slate-50"
        >
          Settings
        </Link>
      </nav>
    </aside>
  );
}
