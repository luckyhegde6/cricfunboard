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

        // Update Match Summary
        // 1. Runs
        // The payload 'runs' is the TOTAL runs for this ball (including extras)
        // But we need to know if it's off the bat or extras for stats, but for match total, just add it.
        summary.runs += (body.runs || 0);

        // 2. Balls & Overs
        const isLegal = body.type !== "wd" && body.type !== "nb";
        if (isLegal) {
            summary.balls += 1;
        }

        // Update overs display (e.g. 0.1, 0.2 ... 0.5, 1.0)
        // balls = 7 -> 1.1
        const completedOvers = Math.floor(summary.balls / 6);
        const ballsInOver = summary.balls % 6;
        summary.overs = parseFloat(`${completedOvers}.${ballsInOver}`);

        // 3. Wickets
        if (body.type === "wicket") {
            summary.wickets += 1;
            // Handle Striker Dismissal
            if (match.currentBatters?.striker) {
                if (!summary.dismissedBatters) {
                    summary.dismissedBatters = [];
                }
                summary.dismissedBatters.push(match.currentBatters.striker);
                match.currentBatters.striker = null; // Needs new batter
            }
        }

        // 4. Strike Rotation
        // Swap if odd runs (and not a boundary? boundaries don't swap even if 3 runs? usually 1,3 swap)
        // Assuming body.runs is total runs.
        // If it's a boundary (4 or 6), usually no swap.
        // If it's 1, 3, 5 runs (ran), swap.
        // If it's Wide + 1 run (ran) = 2 runs total. They crossed once. Swap.
        // This is complex. For now, let's assume simple rule: if runs is odd, swap.
        // EXCEPTION: If it's the last ball of the over, we swap (unless odd runs made us swap already? No, over end swap is additional).

        // Let's simplify:
        // If legal ball and end of over (balls % 6 === 0):
        //    Swap striker/non-striker (End of over change ends)
        // ELSE If runs is odd:
        //    Swap striker/non-striker

        // Note: If end of over AND odd runs?
        // e.g. 1 run on last ball.
        // 1. Batters cross (odd run).
        // 2. Over ends. Bowler changes ends.
        // Result: The batter who WAS at non-striker (now at striker end due to run) stays there?
        // No, usually:
        // A (striker) hits 1. A runs to non-striker. B runs to striker.
        // Over ends.
        // Next over: New bowler bowls to... B?
        // Yes, B is at the striker's end.
        // So if odd runs, they swap.
        // If over ends, they stay where they are (relative to ends), but the *striker* for the next ball is the one at the batting end.
        // Since ends change, the one at the non-striker end becomes the striker.
        // So effectively, over end = swap roles.

        // Logic:
        // 1. Apply Run Swap
        const isOddRuns = (body.runs || 0) % 2 !== 0;
        // Wait, boundaries (4, 6) are even/odd but don't swap.
        // We need to know if they RAN.
        // Assuming 'runs' includes boundaries.
        // If runs=4 or 6, don't swap.
        const isBoundary = body.runs === 4 || body.runs === 6; // Simple check

        if (isOddRuns && !isBoundary) {
            // Swap
            const temp = match.currentBatters.striker;
            match.currentBatters.striker = match.currentBatters.nonStriker;
            match.currentBatters.nonStriker = temp;
        }

        // 2. Apply Over End Swap
        if (isLegal && summary.balls % 6 === 0) {
            // End of over.
            // Swap striker and non-striker
            const temp = match.currentBatters.striker;
            match.currentBatters.striker = match.currentBatters.nonStriker;
            match.currentBatters.nonStriker = temp;

            // Also unset bowler? Or keep until changed?
            // Usually prompt for new bowler.
            match.currentBowler = null;
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
