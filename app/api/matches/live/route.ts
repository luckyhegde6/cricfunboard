// app/api/matches/live/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Match from "@/models/Match";
import Team from "@/models/Team";

export async function GET() {
  await dbConnect();
  // Find first live match with full data
  const match = await Match.findOne({ status: "live" }).lean();

  if (!match) {
    return NextResponse.json({ match: null });
  }

  // Get team players
  const [teamADoc, teamBDoc] = await Promise.all([
    Team.findOne({ name: (match as any).teamA }).lean(),
    Team.findOne({ name: (match as any).teamB }).lean(),
  ]);

  return NextResponse.json({
    match: {
      ...match,
      teamAPlayers: (teamADoc as any)?.players || [],
      teamBPlayers: (teamBDoc as any)?.players || [],
    },
  });
}
