// app/api/matches/[id]/assign-scorer/route.ts

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

  // Auth check - only admin can assign scorers
  const session = await getServerSession(authOptions);
  try {
    ensureHasRole(session, ["admin"]);
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

  const body = await req.json();
  const { scorerId } = body;

  // Validate scorerId
  if (scorerId && !mongoose.Types.ObjectId.isValid(scorerId)) {
    return NextResponse.json({ error: "Invalid scorer ID" }, { status: 400 });
  }

  // Update scorer
  match.scorerId = scorerId || null;
  match.updatedAt = new Date();
  await match.save();

  return NextResponse.json({
    success: true,
    scorerId: match.scorerId,
  });
}
