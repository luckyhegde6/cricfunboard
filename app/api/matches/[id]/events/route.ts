import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import MatchEvent from "@/models/MatchEvent";
import MatchModel from "@/models/Match";
import mongoose from "mongoose";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    // return last 100 events
    const events = await MatchEvent.find({ matchId: id }).sort({ createdAt: 1 }).limit(100).lean();
    return NextResponse.json(events);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;
        if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

        const body = await req.json();
        // body: { type: "runs"|"wd"|"nb"|"wicket"..., runs: number, wicketType?: string, ... }

        const match = await MatchModel.findById(id);
        if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });

        if (match.status === "completed") return NextResponse.json({ error: "Match completed" }, { status: 400 });

        console.log(`[POST Event] Processing event for match ${id}`);

        const currentInnings = match.currentInnings;
        const summaryKey = currentInnings === 1 ? "innings1Summary" : "innings2Summary";

        // Ensure summary object exists
        if (!match[summaryKey]) {
            match[summaryKey] = {
                runs: 0,
                wickets: 0,
                overs: 0,
                balls: 0,
                dismissedBatters: []
            };
        }
        const summary = match[summaryKey];

        // Create Event
        const event = await MatchEvent.create({
            matchId: id,
            innings: currentInnings,
            ...body,
            createdAt: new Date()
        });

        // Add to recent events
        if (!match.recentEvents) match.recentEvents = [];
        match.recentEvents.push({
            type: body.type,
            runs: body.runs,
            batsman: body.batsman || match.currentBatters?.striker,
            bowler: body.bowler || match.currentBowler,
            createdAt: new Date(),
            by: body.by
        });
        // Keep last 20 events
        if (match.recentEvents.length > 20) {
            match.recentEvents = match.recentEvents.slice(-20);
        }

        // Update Match Summary (Skip for announcements)
        if (body.type !== "announcement") {
            // 1. Runs
            summary.runs += (body.runs || 0);

            // 2. Balls & Overs
            const isLegal = body.type !== "wd" && body.type !== "nb";
            if (isLegal) {
                summary.balls += 1;
            }

            // Update overs display (e.g. 0.1, 0.2 ... 0.5, 1.0)
            const completedOvers = Math.floor(summary.balls / 6);
            const ballsInOver = summary.balls % 6;
            summary.overs = parseFloat(`${completedOvers}.${ballsInOver}`);

            // 3. Wickets
            if (body.type === "wicket") {
                summary.wickets += 1;

                // Determine which batter was dismissed
                const dismissedBatterId = body.wicketType === "run-out"
                    ? (body.dismissedBatter || match.currentBatters?.striker)
                    : match.currentBatters?.striker;

                // Handle Striker Dismissal
                if (dismissedBatterId) {
                    if (!summary.dismissedBatters) {
                        summary.dismissedBatters = [];
                    }
                    summary.dismissedBatters.push(dismissedBatterId);

                    // Clear the dismissed batter from currentBatters
                    if (match.currentBatters?.striker === dismissedBatterId) {
                        match.currentBatters.striker = null; // Needs new batter
                    } else if (match.currentBatters?.nonStriker === dismissedBatterId) {
                        match.currentBatters.nonStriker = null; // Needs new batter
                    }
                }
            }

            // 4. Strike Rotation
            const isOddRuns = (body.runs || 0) % 2 !== 0;
            const isBoundary = body.runs === 4 || body.runs === 6;

            if (isOddRuns && !isBoundary) {
                // Swap
                const temp = match.currentBatters.striker;
                match.currentBatters.striker = match.currentBatters.nonStriker;
                match.currentBatters.nonStriker = temp;
            }

            // 2. Apply Over End Swap
            if (isLegal && summary.balls % 6 === 0) {
                // End of over.
                const temp = match.currentBatters.striker;
                match.currentBatters.striker = match.currentBatters.nonStriker;
                match.currentBatters.nonStriker = temp;
                match.currentBowler = null;
            }
        }

        // Save
        match.markModified(summaryKey);
        match.markModified('currentBatters');
        await match.save();

        // Broadcast update via Socket Server
        try {
            await fetch("http://localhost:4000/broadcast", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    room: `match:${id}`,
                    event: "match:update",
                    payload: match
                })
            });

            // Also broadcast to dashboard
            await fetch("http://localhost:4000/broadcast", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    room: "dashboard",
                    event: "match:update",
                    payload: match
                })
            });
        } catch (err) {
            console.error("Socket broadcast failed:", err);
            // Don't fail the request if socket fails
        }

        return NextResponse.json({ success: true, match });
    } catch (error: any) {
        console.error("Error in POST /api/matches/[id]/events:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
