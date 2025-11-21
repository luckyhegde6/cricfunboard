// app/api/matches/[id]/score/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import MatchModel from "@/models/Match";
import MatchEvent from "@/models/MatchEvent";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import mongoose from "mongoose";

const eventSchema = z.object({
    type: z.enum(["dot", "runs", "wicket", "nb", "wd", "undo"]),
    runs: z.number().int().nonnegative().optional(),
    batsman: z.string().optional(),
    bowler: z.string().optional(),
    over: z.number().optional(),
    ball: z.number().optional(),
    meta: z.any().optional(),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { id: matchId } = await params;
    if (!mongoose.Types.ObjectId.isValid(matchId)) return NextResponse.json({ error: "Invalid match id" }, { status: 400 });

    // Fetch match to check permissions
    const match = await MatchModel.findById(matchId);
    if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });

    const userId = (session as any).user?.id;
    const userRole = (session as any).user?.role;

    const isAssigned =
        (match.scorerId && match.scorerId.toString() === userId) ||
        (match.captainId && match.captainId.toString() === userId) ||
        (match.viceCaptainId && match.viceCaptainId.toString() === userId);

    if (userRole !== "admin" && !isAssigned) {
        return NextResponse.json({ error: "Forbidden: You are not assigned to score this match" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const parsed = eventSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    const ev = parsed.data as any;
    ev.matchId = matchId;
    ev.by = session.user?.email ?? session.user?.name ?? "unknown";
    ev.createdAt = ev.createdAt ?? new Date();

    // Transactional approach
    const client = mongoose.connection; // or mongoose
    let resultMatch = null;

    // Transactions require replica set. Attempt transaction, otherwise fallback to non-transactional route.
    const sessionDb = await mongoose.startSession();
    try {
        await sessionDb.withTransaction(async () => {
            // insert event
            await MatchEvent.create([ev], { session: sessionDb });

            // aggregate summary from events collection
            const agg = await MatchEvent.aggregate([
                { $match: { matchId: new mongoose.Types.ObjectId(matchId), innings: match.currentInnings } },
                {
                    $group: {
                        _id: "$matchId",
                        totalRuns: { $sum: "$runs" },
                        totalWickets: { $sum: { $cond: [{ $eq: ["$type", "wicket"] }, 1, 0] } },
                        totalBalls: { $sum: { $cond: [{ $in: ["$type", ["dot", "runs", "wicket"]] }, 1, 0] } },
                        lastEvents: { $push: { type: "$type", runs: "$runs", batsman: "$batsman", bowler: "$bowler", createdAt: "$createdAt", by: "$by" } },
                    },
                },
            ]).session(sessionDb);

            const aggRes = agg[0] || { totalRuns: 0, totalWickets: 0, totalBalls: 0, lastEvents: [] };
            const totalBalls = aggRes.totalBalls || 0;
            const recent = aggRes.lastEvents.slice(-10).reverse();

            // Determine which innings summary to update
            const updateField = match.currentInnings === 1 ? "innings1Summary" : "innings2Summary";

            // Prepare update object
            const updateOps: any = {
                $set: {
                    [`${updateField}.runs`]: aggRes.totalRuns || 0,
                    [`${updateField}.wickets`]: aggRes.totalWickets || 0,
                    [`${updateField}.overs`]: Math.floor(totalBalls / 6),
                    [`${updateField}.balls`]: totalBalls,
                    // Also update legacy summary for compatibility
                    "summary.runs": aggRes.totalRuns || 0,
                    "summary.wickets": aggRes.totalWickets || 0,
                    "summary.overs": Math.floor(totalBalls / 6),
                    "summary.balls": totalBalls,
                    recentEvents: recent,
                    status: "live",
                }
            };

            // If wicket, add batsman to dismissed list
            if (ev.type === "wicket" && ev.batsman) {
                updateOps.$addToSet = {
                    [`${updateField}.dismissedBatters`]: ev.batsman
                };
            }

            // Update current players if provided in event
            if (ev.meta?.currentStriker) updateOps.$set["currentBatters.striker"] = ev.meta.currentStriker;
            if (ev.meta?.currentNonStriker) updateOps.$set["currentBatters.nonStriker"] = ev.meta.currentNonStriker;
            if (ev.meta?.currentBowler) updateOps.$set["currentBowler"] = ev.meta.currentBowler;

            resultMatch = await MatchModel.findByIdAndUpdate(
                matchId,
                updateOps,
                { new: true, session: sessionDb }
            ).lean();
        });
        // transaction committed
    } catch (err) {
        console.error("Transaction failed, attempting fallback update:", err);
        // fallback: non-transactional create + recompute
        try {
            await MatchEvent.create(ev);
            // recompute summary non-transactionally
            const agg = await MatchEvent.aggregate([
                { $match: { matchId: new mongoose.Types.ObjectId(matchId) } },
                {
                    $group: {
                        _id: "$matchId",
                        totalRuns: { $sum: "$runs" },
                        totalWickets: { $sum: { $cond: [{ $eq: ["$type", "wicket"] }, 1, 0] } },
                        totalBalls: { $sum: { $cond: [{ $in: ["$type", ["dot", "runs", "wicket"]] }, 1, 0] } },
                        lastEvents: { $push: { type: "$type", runs: "$runs", batsman: "$batsman", bowler: "$bowler", createdAt: "$createdAt", by: "$by" } },
                    },
                },
            ]);
            const aggRes = agg[0] || { totalRuns: 0, totalWickets: 0, totalBalls: 0, lastEvents: [] };
            const totalBalls = aggRes.totalBalls || 0;
            const recent = aggRes.lastEvents.slice(-10).reverse();
            // Determine which innings summary to update
            const updateField = match.currentInnings === 1 ? "innings1Summary" : "innings2Summary";

            // Prepare update object
            const updateOps: any = {
                $set: {
                    [`${updateField}.runs`]: aggRes.totalRuns || 0,
                    [`${updateField}.wickets`]: aggRes.totalWickets || 0,
                    [`${updateField}.overs`]: Math.floor(totalBalls / 6),
                    [`${updateField}.balls`]: totalBalls,
                    // Also update legacy summary for compatibility
                    "summary.runs": aggRes.totalRuns || 0,
                    "summary.wickets": aggRes.totalWickets || 0,
                    "summary.overs": Math.floor(totalBalls / 6),
                    "summary.balls": totalBalls,
                    recentEvents: recent,
                    status: "live",
                }
            };

            // If wicket, add batsman to dismissed list
            if (ev.type === "wicket" && ev.batsman) {
                updateOps.$addToSet = {
                    [`${updateField}.dismissedBatters`]: ev.batsman
                };
                // Clear striker if they got out (logic to be handled by frontend sending next batsman)
            }

            // Update current players if provided in event (e.g. new batsman selected)
            if (ev.meta?.currentStriker) updateOps.$set["currentBatters.striker"] = ev.meta.currentStriker;
            if (ev.meta?.currentNonStriker) updateOps.$set["currentBatters.nonStriker"] = ev.meta.currentNonStriker;
            if (ev.meta?.currentBowler) updateOps.$set["currentBowler"] = ev.meta.currentBowler;

            resultMatch = await MatchModel.findByIdAndUpdate(
                matchId,
                updateOps,
                { new: true }
            ).lean();
        } catch (err2) {
            console.error("Fallback failed", err2);
            return NextResponse.json({ error: "Failed to persist event" }, { status: 500 });
        }
    } finally {
        sessionDb.endSession();
    }

    // Broadcast to socket server if configured
    const SOCKET_SERVER_URL = process.env.SOCKET_SERVER_URL;
    if (SOCKET_SERVER_URL) {
        try {
            await fetch(`${SOCKET_SERVER_URL}/broadcast`, {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                    room: `match:${matchId}`,
                    event: "match:update",
                    payload: { matchId, match: resultMatch },
                }),
            });
        } catch (err) {
            console.warn("Socket broadcast failed", err);
        }
    }

    return NextResponse.json({ ok: true, match: resultMatch }, { status: 200 });
}
