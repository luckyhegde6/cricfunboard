// app/api/matches/live/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Match from "@/models/Match";

export async function GET() {
    await dbConnect();
    // Find first live match
    const match = await Match.findOne({ status: "live" }).select("teamA teamB summary");
    return NextResponse.json({ match });
}
