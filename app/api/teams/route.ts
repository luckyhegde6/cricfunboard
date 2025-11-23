// app/api/teams/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import Team from "@/models/Team";

export async function GET() {
  try {
    await dbConnect();
    const teams = await Team.find({})
      .select("_id name contactEmail players")
      .lean();
    return NextResponse.json(teams);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    if (!session || !["captain", "vicecaptain", "admin"].includes(userRole)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const { name, players, contactEmail, contactPhone } = body;

    if (!name || !players || !Array.isArray(players)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // Check if team exists
    const existingTeam = await Team.findOne({ name });

    if (existingTeam) {
      // Update existing
      existingTeam.players = players;
      existingTeam.contactEmail = contactEmail;
      existingTeam.contactPhone = contactPhone;
      existingTeam.updatedAt = new Date();
      await existingTeam.save();
      return NextResponse.json({ message: "Team updated", team: existingTeam });
    } else {
      // Create new
      const newTeam = await Team.create({
        name,
        players,
        contactEmail,
        contactPhone,
        captainId:
          userRole === "captain" ? (session.user as any).id : undefined,
        viceCaptainId:
          userRole === "vicecaptain" ? (session.user as any).id : undefined,
      });
      return NextResponse.json({ message: "Team created", team: newTeam });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
