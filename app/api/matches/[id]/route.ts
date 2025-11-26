import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import MatchModel from "@/models/Match";
import MatchEvent from "@/models/MatchEvent";
import TeamModel from "@/models/Team";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await dbConnect();
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const match = (await MatchModel.findById(id).lean()) as any;
    if (!match)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Fetch team players for both teams
    const [teamA, teamB] = await Promise.all([
      TeamModel.findOne({ name: match.teamA })
        .select("players captainId viceCaptainId")
        .lean() as any,
      TeamModel.findOne({ name: match.teamB })
        .select("players captainId viceCaptainId")
        .lean() as any,
    ]);

    // Enrich match data with team players
    const enrichedMatch = {
      ...match,
      matchState: match.matchState || "pre-toss", // Ensure matchState has a default
      teamAPlayers: teamA?.players || [],
      teamBPlayers: teamB?.players || [],
      teamACaptainId: teamA?.captainId,
      teamAViceCaptainId: teamA?.viceCaptainId,
      teamBCaptainId: teamB?.captainId,
      teamBViceCaptainId: teamB?.viceCaptainId,
    };

    // Aggregate stats for Scorecard
    // Process aggregation into structured scorecard data
    const scorecard: any = {
      innings1: { batting: {}, bowling: {} },
      innings2: { batting: {}, bowling: {} },
    };

    // Helper to init player stats
    const initBatting = () => ({
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
      dismissal: "",
    });
    const initBowling = () => ({
      overs: 0,
      balls: 0,
      maidens: 0,
      runs: 0,
      wickets: 0,
    });

    // Fetch all events for detailed processing
    const allEvents = await MatchEvent.find({ matchId: id })
      .sort({ createdAt: 1 })
      .lean();

    allEvents.forEach((ev: any) => {
      const inn = ev.innings === 1 ? scorecard.innings1 : scorecard.innings2;
      if (!inn) return;

      // Batting Stats
      if (ev.batsman) {
        if (!inn.batting[ev.batsman]) inn.batting[ev.batsman] = initBatting();
        const bat = inn.batting[ev.batsman];

        // Runs off bat
        if (ev.type === "runs" || ev.type === "nb") {
          bat.runs += ev.runs || 0;
          if (ev.type === "nb") bat.runs = bat.runs > 0 ? bat.runs : 0; // Simplified NB logic
        }

        // Balls faced (legal deliveries)
        if (ev.type !== "wd" && ev.type !== "nb") {
          bat.balls++;
        }

        // Boundaries
        if (ev.type === "runs") {
          if (ev.runs === 4) bat.fours++;
          if (ev.runs === 6) bat.sixes++;
        }
      }

      // Bowling Stats
      if (ev.bowler) {
        if (!inn.bowling[ev.bowler]) inn.bowling[ev.bowler] = initBowling();
        const bowl = inn.bowling[ev.bowler];

        // Balls bowled (legal only)
        if (ev.type !== "wd" && ev.type !== "nb") {
          bowl.balls++;
        }

        // Runs conceded
        if (ev.type !== "bye" && ev.type !== "lb") {
          bowl.runs += ev.runs || 0;
        }

        // Wickets
        if (ev.type === "wicket" && ev.wicketType !== "run-out") {
          bowl.wickets++;
        }
      }

      // Dismissals
      if (ev.type === "wicket" && ev.batsman) {
        if (!inn.batting[ev.batsman]) inn.batting[ev.batsman] = initBatting();
        // Construct dismissal text
        let text = "";
        if (ev.wicketType === "bowled")
          text = `b ${allEvents.find((e: any) => e._id === ev._id)?.bowler || "Bowler"}`;
        else if (ev.wicketType === "caught")
          text = `c ${ev.fielder || "Fielder"} b ${ev.bowler || "Bowler"}`;
        else if (ev.wicketType === "lbw") text = `lbw b ${ev.bowler}`;
        else if (ev.wicketType === "run-out") text = `run out (${ev.fielder})`;
        else text = ev.wicketType;

        inn.batting[ev.batsman].dismissal = text;
      }
    });

    // Convert bowling balls to overs
    Object.values(scorecard.innings1.bowling).forEach(
      (b: any) => (b.overs = Math.floor(b.balls / 6) + (b.balls % 6) / 10),
    );
    Object.values(scorecard.innings2.bowling).forEach(
      (b: any) => (b.overs = Math.floor(b.balls / 6) + (b.balls % 6) / 10),
    );

    // Fetch recent events for ball-by-ball display
    const recentEvents = await MatchEvent.find({ matchId: id })
      .sort({ createdAt: -1 })
      .limit(12)
      .lean();

    return NextResponse.json(
      {
        ...enrichedMatch,
        scorecard,
        recentEvents: recentEvents.reverse(),
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error in GET /api/matches/[id]:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 },
    );
  }
}

const patchSchema = z.object({
  status: z
    .enum(["scheduled", "live", "completed", "abandoned", "cancelled"])
    .optional(),
  teamA: z.string().optional(),
  teamB: z.string().optional(),
  venue: z.string().optional(),
  startTime: z.string().optional(),
  announcement: z.string().optional(),
  currentBatters: z
    .object({
      striker: z.string().nullable().optional(),
      nonStriker: z.string().nullable().optional(),
    })
    .optional(),
  currentBowler: z.string().nullable().optional(),
  summary: z
    .object({
      runs: z.number().int().nonnegative(),
      wickets: z.number().int().nonnegative(),
      overs: z.number().nonnegative(),
    })
    .optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await dbConnect();

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  // Fetch match first to check scorerId
  const matchToCheck = await MatchModel.findById(id).select("scorerId");
  if (!matchToCheck)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  // auth check
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  const isAdmin = user?.role === "admin";
  const isAssignedScorer = matchToCheck.scorerId?.toString() === user?.id;

  if (!isAdmin && !isAssignedScorer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  console.log(`[PATCH Match] ID: ${id}, Body:`, body);

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    console.error("[PATCH Match] Validation Error:", parsed.error);
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { announcement, ...updateData } = parsed.data;

  // Handle announcement creation if present
  if (announcement) {
    await MatchEvent.create({
      matchId: id,
      innings: 0, // System event
      over: 0,
      ball: 0,
      type: "announcement",
      commentary: announcement,
    });
  }

  const updated = await MatchModel.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true },
  ).lean();
  console.log(`[PATCH Match] Updated:`, updated ? "Success" : "Not Found");

  if (!updated)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Broadcast update via Socket Server
  try {
    await fetch("http://localhost:4000/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        room: `match:${id}`,
        event: "match:update",
        payload: updated,
      }),
    });

    // Also broadcast to dashboard
    await fetch("http://localhost:4000/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        room: "dashboard",
        event: "match:update",
        payload: updated,
      }),
    });

    // Broadcast announcement if exists
    if (announcement) {
      await fetch("http://localhost:4000/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room: `match:${id}`,
          event: "match:announcement",
          payload: { message: announcement },
        }),
      });
    }
  } catch (err) {
    console.error("Socket broadcast failed:", err);
  }

  return NextResponse.json(updated);
}
