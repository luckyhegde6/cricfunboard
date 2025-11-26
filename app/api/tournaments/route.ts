import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import Tournament from "@/models/Tournament";

export async function GET() {
    await dbConnect();
    try {
        const tournaments = await Tournament.find({}).sort({ startDate: 1 });
        return NextResponse.json(tournaments);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch tournaments" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || (session as any).user.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    try {
        const body = await req.json();
        const tournament = await Tournament.create(body);
        return NextResponse.json(tournament, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to create tournament" },
            { status: 500 }
        );
    }
}
