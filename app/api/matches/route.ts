// app/api/matches/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ensureHasRole } from "@/lib/auth";
import dbConnect from "@/lib/db";
import MatchModel from "@/models/Match";

const createSchema = z.object({
  teamA: z.string().min(1),
  teamB: z.string().min(1),
  venue: z.string().optional(),
  startTime: z.string().optional(),
});

export async function GET(req: Request) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const teamFilter = searchParams.get("team");
  const tournamentId = searchParams.get("tournamentId");

  let query: any = {};
  if (teamFilter) {
    query = {
      $or: [{ teamA: teamFilter }, { teamB: teamFilter }],
    };
  }
  if (tournamentId) {
    query.tournamentId = tournamentId;
  }

  const matches = await MatchModel.find(query)
    .sort({ startTime: -1 })
    .lean()
    .limit(100)
    .exec();
  return NextResponse.json(matches);
}

export async function POST(req: Request) {
  await dbConnect();

  // auth check
  const session = await getServerSession(authOptions);
  try {
    ensureHasRole(session, ["admin"]);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: err.status || 403 },
    );
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const doc = await MatchModel.create({
    teamA: parsed.data.teamA,
    teamB: parsed.data.teamB,
    venue: parsed.data.venue ?? "",
    startTime: parsed.data.startTime
      ? new Date(parsed.data.startTime)
      : undefined,
    status: "scheduled",
    summary: { runs: 0, wickets: 0, overs: 0 },
  });

  return NextResponse.json(doc, { status: 201 });
}
