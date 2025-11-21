// app/api/matches/[id]/start/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import MatchModel from "@/models/Match";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ensureHasRole } from "@/lib/auth";
import mongoose from "mongoose";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();

    // Auth check
    const session = await getServerSession(authOptions);
    try {
        ensureHasRole(session, ["admin", "scorer"]);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: err.status || 403 });
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
    const isAdmin = session.user.role === "admin";
    const isAssignedScorer = match.scorerId?.toString() === session.user.id;

    if (!isAdmin && !isAssignedScorer) {
        return NextResponse.json({ error: "Not authorized for this match" }, { status: 403 });
    }

    // Check if toss is done
    if (!match.toss?.winner) {
        return NextResponse.json({ error: "Toss must be completed before starting match" }, { status: 400 });
    }

    // Check if match already started
    if (match.status === "live" || match.matchState === "live") {
        return NextResponse.json({ error: "Match already started" }, { status: 400 });
    }

    // Start the match
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
        currentInnings: match.currentInnings
    });
}
