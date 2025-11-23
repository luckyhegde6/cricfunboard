// app/matches/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import MatchesTabs, { type MatchType } from "@/components/MatchesTabs";
import MatchTopStats from "@/components/MatchTopStats";
import MatchControls from "@/components/scorer/MatchControls";
import dbConnect from "@/lib/db";
import Team from "@/models/Team";

async function fetchMatches(): Promise<MatchType[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/matches`,
    { cache: "no-store" },
  );
  if (!res.ok) return [];
  return res.json();
}

export default async function MatchesPage() {
  const matches = await fetchMatches();
  // find a single live match (for scorer view demo)
  const liveMatch = matches.find((m) => m.status === "live");

  // get server session so we can check role and id
  const session = await getServerSession(authOptions);
  const role = (session as any)?.user?.role;
  const userId = (session as any)?.user?.id;

  const isAssigned =
    liveMatch &&
    ((liveMatch.scorerId && liveMatch.scorerId === userId) ||
      (liveMatch.captainId && liveMatch.captainId === userId) ||
      (liveMatch.viceCaptainId && liveMatch.viceCaptainId === userId));

  const canScore = role === "admin" || isAssigned;

  let teamAPlayers = [];
  let teamBPlayers = [];

  if (liveMatch) {
    await dbConnect();
    const [tA, tB] = await Promise.all([
      Team.findOne({ name: liveMatch.teamA }).lean(),
      Team.findOne({ name: liveMatch.teamB }).lean(),
    ]);
    // Serialize to ensure no pass-by-reference or ObjectId issues across boundary
    teamAPlayers = JSON.parse(JSON.stringify((tA as any)?.players || []));
    teamBPlayers = JSON.parse(JSON.stringify((tB as any)?.players || []));
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Matches</h1>

      <MatchesTabs matches={matches} userId={userId} />

      {liveMatch && canScore && (
        <div className="grid grid-cols-1 gap-4">
          <div className="w-full">
            <MatchTopStats
              match={liveMatch}
              teamAPlayers={teamAPlayers}
              teamBPlayers={teamBPlayers}
            />

            <div className="mt-4">
              <MatchControls
                matchId={liveMatch._id}
                matchState={liveMatch.status || "live"}
                currentInnings={(liveMatch as any).currentInnings || 1}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
