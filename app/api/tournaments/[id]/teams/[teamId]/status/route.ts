import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import Tournament from "@/models/Tournament";

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string; teamId: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session || (session as any).user.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id, teamId } = await params;
    try {
        const { status } = await req.json(); // 'approved' or 'rejected'

        if (!["approved", "rejected"].includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        const tournament = await Tournament.findById(id);
        if (!tournament) {
            return NextResponse.json(
                { error: "Tournament not found" },
                { status: 404 }
            );
        }

        const enrollment = tournament.enrolledTeams.find(
            (t: any) => t.teamId.toString() === teamId
        );

        if (!enrollment) {
            return NextResponse.json(
                { error: "Enrollment not found" },
                { status: 404 }
            );
        }

        enrollment.status = status;

        // If approved, add to participating teams
        if (status === "approved") {
            if (!tournament.teams.includes(teamId)) {
                tournament.teams.push(teamId);
            }
        } else if (status === "rejected") {
            // Remove from participating teams if previously approved
            tournament.teams = tournament.teams.filter(
                (t: any) => t.toString() !== teamId
            );
        }

        await tournament.save();

        return NextResponse.json({ message: `Enrollment ${status}` });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to update enrollment status" },
            { status: 500 }
        );
    }
}
