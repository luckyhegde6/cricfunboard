// app/page.tsx
import Link from "next/link";
import MatchCard from "@/components/MatchCard";

async function fetchMatches() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/matches`,
      { cache: "no-store" },
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";

export default async function Home() {
  const matches = await fetchMatches();
  const session = await getServerSession(authOptions);

  return (
    <div className="space-y-8">
      <section className="bg-gradient-to-tr from-white to-slate-50 rounded-lg p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight">
              Local Cricket Scoreboard
            </h1>
            <p className="mt-2 text-slate-600 max-w-xl">
              Follow live matches in your area. Real-time updates, quick score
              entry for scorers, and an admin dashboard to manage matches.
            </p>
            <div className="mt-4 flex gap-3">
              <Link
                href="/matches"
                className="px-4 py-2 bg-slate-800 text-white rounded-md shadow-sm"
              >
                See Matches
              </Link>
              {!session && (
                <Link
                  href="/auth/signin"
                  className="px-4 py-2 border rounded-md text-slate-700"
                >
                  Sign in as scorer
                </Link>
              )}
            </div>
          </div>

          <div className="hidden md:block w-64">
            <div className="bg-white border rounded p-4 text-center">
              <div className="text-sm text-slate-500">Currently live</div>
              <div className="mt-2 text-2xl font-semibold text-slate-800">
                {matches.filter((m: any) => m.status === "live").length}
              </div>
              <div className="text-sm text-slate-500">matches</div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Matches</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {matches.length
            ? matches.map((m: any) => <MatchCard key={m._id} match={m} />)
            : // skeletons
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-40 bg-white rounded shadow animate-pulse"
                />
              ))}
        </div>
      </section>
    </div>
  );
}
