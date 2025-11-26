// app/api/teams/[id]/route.ts

import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import TeamModel from "@/models/Team";
import MatchModel from "@/models/Match";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await dbConnect();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid team ID" }, { status: 400 });
    }

    // Try to populate, but handle errors gracefully
    let team;
    try {
      team = await TeamModel.findById(id)
        .populate("captainId", "email name")
        .populate("viceCaptainId", "email name")
        .lean();
    } catch (populateError) {
      console.error("Error populating team:", populateError);
      // Fallback: get team without populate
      team = await TeamModel.findById(id).lean();
    }

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    return NextResponse.json(team);
  } catch (error: any) {
    console.error("Error fetching team:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    const userId = (session?.user as any)?.id;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid team ID" }, { status: 400 });
    }

    const team = await TeamModel.findById(id);
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const body = await req.json();
    const { players, captainEmail, viceCaptainEmail, contactEmail, contactPhone } = body;

    // Permission check
    const isAdmin = userRole === "admin";
    const isCaptain = team.captainId?.toString() === userId;
    const isViceCaptain = team.viceCaptainId?.toString() === userId;

    if (!isAdmin && !isCaptain && !isViceCaptain) {
      return NextResponse.json(
        { error: "You are not authorized to edit this team" },
        { status: 403 },
      );
    }

    // Check if team is in a live or completed match
    const activeMatches = await MatchModel.find({
      $or: [{ teamA: team.name }, { teamB: team.name }],
      status: { $in: ["live", "completed"] },
    });

    if (activeMatches.length > 0 && !isAdmin) {
      return NextResponse.json(
        {
          error:
            "Cannot edit team while it has live or completed matches. Contact an admin.",
        },
        { status: 403 },
      );
    }

    // Update players (captain/vice-captain can only edit players)
    if (players && Array.isArray(players)) {
      const activePlayers = players.filter((p: any) => !p.isExtra);
      if (activePlayers.length < 11) {
        return NextResponse.json(
          { error: "Team must have at least 11 active players (non-extras)" },
          { status: 400 },
        );
      }
      team.players = players;
    }

    // Admin-only updates
    if (isAdmin) {
      if (contactEmail !== undefined) team.contactEmail = contactEmail;
      if (contactPhone !== undefined) team.contactPhone = contactPhone;

      // Handle captain/vice-captain assignment
      if (captainEmail !== undefined) {
        const UserModel = (await import("@/models/User")).default;

        // Remove old captain's teamId
        if (team.captainId) {
          await UserModel.findByIdAndUpdate(team.captainId, {
            teamId: null,
          });
        }

        if (captainEmail) {
          const captain = await UserModel.findOne({ email: captainEmail });
          if (captain) {
            team.captainId = captain._id;
            captain.teamId = team._id;
            await captain.save();
          }
        } else {
          team.captainId = undefined;
        }
      }

      if (viceCaptainEmail !== undefined) {
        const UserModel = (await import("@/models/User")).default;

        // Remove old vice-captain's teamId
        if (team.viceCaptainId) {
          await UserModel.findByIdAndUpdate(team.viceCaptainId, {
            teamId: null,
          });
        }

        if (viceCaptainEmail) {
          const viceCaptain = await UserModel.findOne({
            email: viceCaptainEmail,
          });
          if (viceCaptain) {
            team.viceCaptainId = viceCaptain._id;
            viceCaptain.teamId = team._id;
            await viceCaptain.save();
          }
        } else {
          team.viceCaptainId = undefined;
        }
      }
    }

    team.updatedAt = new Date();
    await team.save();

    return NextResponse.json({ message: "Team updated", team });
  } catch (error: any) {
    console.error("Error updating team:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
