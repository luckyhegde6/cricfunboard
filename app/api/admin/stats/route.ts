import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Match from "@/models/Match";
import Tournament from "@/models/Tournament";

export const dynamic = "force-dynamic";

export async function GET() {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session || (session as any).user?.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        // 1. User Stats
        const userStats = await User.aggregate([
            { $group: { _id: "$role", count: { $sum: 1 } } },
        ]);
        const totalUsers = userStats.reduce((acc, curr) => acc + curr.count, 0);

        // 2. Match Stats
        const matchStats = await Match.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } },
        ]);
        const totalMatches = matchStats.reduce((acc, curr) => acc + curr.count, 0);

        // 3. Tournament Stats
        const tournamentStats = await Tournament.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } },
        ]);
        const totalTournaments = tournamentStats.reduce(
            (acc, curr) => acc + curr.count,
            0,
        );

        // 4. Socket Stats (Active Connections)
        let socketStats = { totalConnections: 0, activeRooms: {} };
        try {
            const socketRes = await fetch("http://localhost:4000/stats", {
                next: { revalidate: 0 },
            });
            if (socketRes.ok) {
                socketStats = await socketRes.json();
            }
        } catch (err) {
            console.error("Failed to fetch socket stats:", err);
        }

        return NextResponse.json({
            users: {
                total: totalUsers,
                byRole: userStats.reduce(
                    (acc, curr) => ({ ...acc, [curr._id]: curr.count }),
                    {},
                ),
            },
            matches: {
                total: totalMatches,
                byStatus: matchStats.reduce(
                    (acc, curr) => ({ ...acc, [curr._id]: curr.count }),
                    {},
                ),
            },
            tournaments: {
                total: totalTournaments,
                byStatus: tournamentStats.reduce(
                    (acc, curr) => ({ ...acc, [curr._id]: curr.count }),
                    {},
                ),
            },
            connections: socketStats,
        });
    } catch (error) {
        console.error("Stats API Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch stats" },
            { status: 500 },
        );
    }
}
