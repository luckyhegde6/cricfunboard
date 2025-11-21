// app/matches/page.tsx
import MatchesTabs, { MatchType } from "@/components/MatchesTabs";
import MatchTopStats from "@/components/MatchTopStats";
import ScorerPanel from "@/components/ScorerPanel";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

async function fetchMatches(): Promise<MatchType[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/matches`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export default async function MatchesPage() {
  const matches = await fetchMatches();
  // find a single live match (for scorer view demo)
  const liveMatch = matches.find(m => m.status === "live");

  // get server session so we can check role and id
  const session = await getServerSession(authOptions);
  const role = (session as any)?.user?.role;
  const userId = (session as any)?.user?.id;

  const isAssigned = liveMatch && (
    (liveMatch.scorerId && liveMatch.scorerId === userId) ||
    (liveMatch.captainId && liveMatch.captainId === userId) ||
    (liveMatch.viceCaptainId && liveMatch.viceCaptainId === userId)
  );

  const canScore = role === "admin" || isAssigned;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Matches</h1>

      <MatchesTabs matches={matches} userId={userId} />

      {liveMatch && canScore && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <MatchTopStats match={liveMatch} />
            {/* optionally more match timeline here */}
          </div>
          <div>
            <ScorerPanel matchId={liveMatch._id} />
          </div>
        </div>
      )}
    </div>
  );
}
