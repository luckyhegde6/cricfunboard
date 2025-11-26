import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import Tournament from "@/models/Tournament";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    await dbConnect();
    const { id } = await params;
    try {
        const tournament = await Tournament.findById(id).populate("teams");
        if (!tournament) {
            return NextResponse.json(
                { error: "Tournament not found" },
                { status: 404 }
            );
        }
        return NextResponse.json(tournament);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch tournament" },
            { status: 500 }
        );
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session || (session as any).user.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    try {
        const body = await req.json();
        const tournament = await Tournament.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true,
        });
        if (!tournament) {
            return NextResponse.json(
                { error: "Tournament not found" },
                { status: 404 }
            );
        }
        return NextResponse.json(tournament);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to update tournament" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session || (session as any).user.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    try {
        const tournament = await Tournament.findByIdAndDelete(id);
        if (!tournament) {
            return NextResponse.json(
                { error: "Tournament not found" },
                { status: 404 }
            );
        }
        return NextResponse.json({ message: "Tournament deleted" });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to delete tournament" },
            { status: 500 }
        );
    }
}
