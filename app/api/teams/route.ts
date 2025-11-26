// app/api/teams/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import Team from "@/models/Team";

export async function GET() {
  try {
    await dbConnect();
    
    // Try to populate, but handle errors gracefully
    let teams;
    try {
      teams = await Team.find({})
        .select("_id name contactEmail players captainId viceCaptainId")
        .populate("captainId", "email name")
        .populate("viceCaptainId", "email name")
        .lean();
    } catch (populateError) {
      console.error("Error populating teams:", populateError);
      // Fallback: get teams without populate
      teams = await Team.find({})
        .select("_id name contactEmail players captainId viceCaptainId")
        .lean();
    }
    
    return NextResponse.json(teams);
  } catch (error: any) {
    console.error("Error fetching teams:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    const userId = (session?.user as any)?.id;

    if (!session || !["captain", "vicecaptain", "admin"].includes(userRole)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const {
      name,
      players,
      contactEmail,
      contactPhone,
      captainEmail,
      viceCaptainEmail,
    } = body;

    if (!name || !players || !Array.isArray(players)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const activePlayers = players.filter((p: any) => !p.isExtra);
    if (activePlayers.length < 11) {
      return NextResponse.json(
        { error: "Team must have at least 11 active players (non-extras)" },
        { status: 400 },
      );
    }

    // Resolve captain and vice-captain IDs from emails (admin only)
    let captainId = undefined;
    let viceCaptainId = undefined;

    if (userRole === "admin") {
      const UserModel = (await import("@/models/User")).default;
      
      if (captainEmail) {
        const captain = await UserModel.findOne({ email: captainEmail });
        if (captain) {
          captainId = captain._id;
          // Update user's teamId
          captain.teamId = null; // Will be set after team creation
          await captain.save();
        }
      }
      
      if (viceCaptainEmail) {
        const viceCaptain = await UserModel.findOne({
          email: viceCaptainEmail,
        });
        if (viceCaptain) {
          viceCaptainId = viceCaptain._id;
          // Update user's teamId
          viceCaptain.teamId = null; // Will be set after team creation
          await viceCaptain.save();
        }
      }
    } else {
      // Non-admin: auto-assign based on role
      if (userRole === "captain") captainId = userId;
      if (userRole === "vicecaptain") viceCaptainId = userId;
    }

    // Check if team exists
    const existingTeam = await Team.findOne({ name });

    if (existingTeam) {
      // Update existing
      existingTeam.players = players;
      existingTeam.contactEmail = contactEmail;
      existingTeam.contactPhone = contactPhone;
      
      if (userRole === "admin") {
        if (captainId !== undefined) existingTeam.captainId = captainId;
        if (viceCaptainId !== undefined)
          existingTeam.viceCaptainId = viceCaptainId;
      }
      
      existingTeam.updatedAt = new Date();
      await existingTeam.save();

      // Update user teamIds
      if (userRole === "admin") {
        const UserModel = (await import("@/models/User")).default;
        if (captainId) {
          await UserModel.findByIdAndUpdate(captainId, {
            teamId: existingTeam._id,
          });
        }
        if (viceCaptainId) {
          await UserModel.findByIdAndUpdate(viceCaptainId, {
            teamId: existingTeam._id,
          });
        }
      }

      return NextResponse.json({ message: "Team updated", team: existingTeam });
    } else {
      // Create new
      const newTeam = await Team.create({
        name,
        players,
        contactEmail,
        contactPhone,
        captainId,
        viceCaptainId,
      });

      // Update user teamIds
      if (userRole === "admin") {
        const UserModel = (await import("@/models/User")).default;
        if (captainId) {
          await UserModel.findByIdAndUpdate(captainId, {
            teamId: newTeam._id,
          });
        }
        if (viceCaptainId) {
          await UserModel.findByIdAndUpdate(viceCaptainId, {
            teamId: newTeam._id,
          });
        }
      } else {
        // Non-admin: update own teamId
        const UserModel = (await import("@/models/User")).default;
        await UserModel.findByIdAndUpdate(userId, { teamId: newTeam._id });
      }

      return NextResponse.json({ message: "Team created", team: newTeam });
    }
  } catch (error: any) {
    console.error("Error in POST /api/teams:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
