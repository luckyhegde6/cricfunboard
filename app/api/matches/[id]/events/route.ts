// app/api/matches/[id]/events/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import MatchEvent from "@/models/MatchEvent";
import mongoose from "mongoose";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
    await dbConnect();
    const matchId = params.id;
    if (!mongoose.Types.ObjectId.isValid(matchId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    // return last 100 events
    const events = await MatchEvent.find({ matchId }).sort({ createdAt: 1 }).limit(100).lean();
    return NextResponse.json(events);
}
