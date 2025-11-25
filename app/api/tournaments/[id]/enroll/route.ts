import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import Tournament from "@/models/Tournament";
import Team from "@/models/Team";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session || !["captain", "vicecaptain"].includes((session as any).user.role)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    try {
        const { teamId } = await req.json();

        // Verify user owns the team
        const team = await Team.findOne({
            _id: teamId,
            $or: [{ captainId: (session as any).user.id }, { viceCaptainId: (session as any).user.id }],
        });

        if (!team) {
            return NextResponse.json(
                { error: "Team not found or you are not authorized" },
                { status: 403 }
            );
        }

        const tournament = await Tournament.findById(id);
        if (!tournament) {
            return NextResponse.json(
                { error: "Tournament not found" },
                { status: 404 }
            );
        }

        if (tournament.enrollmentStatus !== "open") {
            return NextResponse.json(
                { error: "Enrollment is closed" },
                { status: 400 }
            );
        }

        // Check if already enrolled
        const alreadyEnrolled = tournament.enrolledTeams.some(
            (t: any) => t.teamId.toString() === teamId
        );

        if (alreadyEnrolled) {
            return NextResponse.json(
                { error: "Team already enrolled" },
                { status: 400 }
            );
        }

        tournament.enrolledTeams.push({ teamId, status: "pending" });
        await tournament.save();

        return NextResponse.json({ message: "Enrollment submitted" });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to enroll team" },
            { status: 500 }
        );
    }
}
