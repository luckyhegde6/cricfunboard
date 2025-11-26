// app/api/teams/[id]/check-edit-permission/route.ts

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
        const session = await getServerSession(authOptions);
        const userRole = (session?.user as any)?.role;
        const userId = (session?.user as any)?.id;

        if (!session) {
            return NextResponse.json({ canEdit: false, reason: "Not authenticated" });
        }

        await dbConnect();
        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ canEdit: false, reason: "Invalid team ID" });
        }

        const team = await TeamModel.findById(id);
        if (!team) {
            return NextResponse.json({ canEdit: false, reason: "Team not found" });
        }

        // Check permissions
        const isAdmin = userRole === "admin";
        const isCaptain = team.captainId?.toString() === userId;
        const isViceCaptain = team.viceCaptainId?.toString() === userId;

        if (!isAdmin && !isCaptain && !isViceCaptain) {
            return NextResponse.json({
                canEdit: false,
                reason: "You are not assigned to this team",
            });
        }

        // Check if team is in a live or completed match
        const activeMatches = await MatchModel.find({
            $or: [{ teamA: team.name }, { teamB: team.name }],
            status: { $in: ["live", "completed"] },
        });

        if (activeMatches.length > 0 && !isAdmin) {
            return NextResponse.json({
                canEdit: true,
                reason: "Team has live or completed matches",
                matches: activeMatches.map((m) => ({
                    id: m._id,
                    name: m.name,
                    status: m.status,
                })),
                isAdmin,
                isCaptain,
                isViceCaptain,
            });
        }

        return NextResponse.json({
            canEdit: true,
            isAdmin,
            isCaptain,
            isViceCaptain,
        });
    } catch (error: any) {
        return NextResponse.json({
            canEdit: false,
            reason: error.message,
        });
    }
}
