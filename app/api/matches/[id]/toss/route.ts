// app/api/matches/[id]/toss/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import MatchModel from "@/models/Match";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ensureHasRole } from "@/lib/auth";
import mongoose from "mongoose";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();

    // Auth check - only admin or assigned scorer
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

    // Check if user is assigned scorer or admin
    const isAdmin = session.user.role === "admin";
    const isAssignedScorer = match.scorerId?.toString() === session.user.id;

    if (!isAdmin && !isAssignedScorer) {
        return NextResponse.json({ error: "Not authorized for this match" }, { status: 403 });
    }

    // Check if toss already done
    if (match.toss?.winner) {
        return NextResponse.json({ error: "Toss already completed" }, { status: 400 });
    }

    const body = await req.json();
    const { winner, decision } = body;

    // Validate input
    if (!winner || !decision) {
        return NextResponse.json({ error: "Winner and decision are required" }, { status: 400 });
    }

    if (winner !== match.teamA && winner !== match.teamB) {
        return NextResponse.json({ error: "Winner must be one of the playing teams" }, { status: 400 });
    }

    if (decision !== "bat" && decision !== "bowl") {
        return NextResponse.json({ error: "Decision must be 'bat' or 'bowl'" }, { status: 400 });
    }

    // Determine batting and bowling teams based on toss
    let battingTeam: string;
    let bowlingTeam: string;

    if (decision === "bat") {
        battingTeam = winner;
        bowlingTeam = winner === match.teamA ? match.teamB : match.teamA;
    } else {
        bowlingTeam = winner;
        battingTeam = winner === match.teamA ? match.teamB : match.teamA;
    }

    // Update match with toss data
    match.toss = {
        winner,
        decision,
        completedAt: new Date()
    };
    match.battingTeam = battingTeam;
    match.bowlingTeam = bowlingTeam;
    match.matchState = "toss-done";
    match.updatedAt = new Date();

    await match.save();

    console.log(`[Toss API] Match ${id} toss completed:`, {
        winner: match.toss.winner,
        decision: match.toss.decision,
        matchState: match.matchState,
        battingTeam: match.battingTeam,
        bowlingTeam: match.bowlingTeam
    });

    return NextResponse.json({
        success: true,
        toss: match.toss,
        battingTeam: match.battingTeam,
        bowlingTeam: match.bowlingTeam,
        matchState: match.matchState
    });
}
