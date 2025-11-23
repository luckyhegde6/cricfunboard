// app/api/matches/[id]/start/route.ts

import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ensureHasRole } from "@/lib/auth";
import dbConnect from "@/lib/db";
import MatchModel from "@/models/Match";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await dbConnect();

  // Auth check
  const session = await getServerSession(authOptions);
  try {
    ensureHasRole(session, ["admin", "scorer"]);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: err.status || 403 },
    );
  }

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid match ID" }, { status: 400 });
  }

  const match = await MatchModel.findById(id);
  if (!match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  // Check authorization
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const isAdmin = (session.user as any).role === "admin";
  const isAssignedScorer =
    match.scorerId?.toString() === (session.user as any).id;

  if (!isAdmin && !isAssignedScorer) {
    return NextResponse.json(
      { error: "Not authorized for this match" },
      { status: 403 },
    );
  }

  // Check if toss is done
  if (!match.toss?.winner) {
    return NextResponse.json(
      { error: "Toss must be completed before starting match" },
      { status: 400 },
    );
  }

  // Check if match already started
  // Allow if matchState is 'innings-break' (resuming for 2nd innings)
  if (
    (match.status === "live" || match.matchState === "live") &&
    match.matchState !== "innings-break"
  ) {
    return NextResponse.json(
      { error: "Match already started" },
      { status: 400 },
    );
  }

  // If resuming from innings break
  if (match.matchState === "innings-break") {
    match.matchState = "live";

    // Safety: Clear batters/bowler to ensure UI prompts for selection
    // This fixes cases where end-innings didn't clear them (legacy bug)
    match.currentBatters = { striker: null, nonStriker: null };
    match.currentBowler = null;

    match.updatedAt = new Date();
    await match.save();

    return NextResponse.json({
      success: true,
      status: match.status,
      matchState: match.matchState,
      teamsLocked: match.teamsLocked,
      currentInnings: match.currentInnings,
    });
  }

  // Start the match (Innings 1)
  match.status = "live";
  match.matchState = "live";
  match.teamsLocked = true;
  match.currentInnings = 1;
  match.updatedAt = new Date();

  await match.save();

  return NextResponse.json({
    success: true,
    status: match.status,
    matchState: match.matchState,
    teamsLocked: match.teamsLocked,
    currentInnings: match.currentInnings,
  });
}
