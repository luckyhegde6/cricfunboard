// app/api/matches/[id]/end-innings/route.ts
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

    // Check if match is live
    if (match.status !== "live") {
        return NextResponse.json({ error: "Match must be live to end innings" }, { status: 400 });
    }

    if (match.currentInnings === 1) {
        // End innings 1, prepare for innings 2
        match.matchState = "innings-break";
        match.currentInnings = 2;

        // Switch batting and bowling teams
        const temp = match.battingTeam;
        match.battingTeam = match.bowlingTeam;
        match.bowlingTeam = temp;

        match.updatedAt = new Date();
        await match.save();

        return NextResponse.json({
            success: true,
            message: "Innings 1 ended",
            matchState: match.matchState,
            currentInnings: match.currentInnings,
            battingTeam: match.battingTeam,
            bowlingTeam: match.bowlingTeam
        });
    } else if (match.currentInnings === 2) {
        // End innings 2, match completed
        return NextResponse.json({
            error: "Use end-match endpoint to complete the match"
        }, { status: 400 });
    } else {
        return NextResponse.json({ error: "Invalid innings state" }, { status: 400 });
    }
}
