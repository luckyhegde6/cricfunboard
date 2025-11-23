// app/api/matches/[id]/end-match/route.ts

import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ensureHasRole } from "@/lib/auth";
import dbConnect from "@/lib/db";
import MatchModel from "@/models/Match";

export async function POST(
  req: Request,
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

  const body = await req.json();
  const { result } = body;

  // End the match
  match.status = "completed";
  match.matchState = "completed";
  if (result) {
    match.result = result;
  }
  match.updatedAt = new Date();

  await match.save();

  return NextResponse.json({
    success: true,
    status: match.status,
    matchState: match.matchState,
    result: match.result,
  });
}
