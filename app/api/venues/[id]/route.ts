// app/api/venues/[id]/route.ts
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ensureHasRole } from "@/lib/auth";
import dbConnect from "@/lib/db";
import VenueModel from "@/models/Venue";

const updateSchema = z.object({
    name: z.string().min(1).optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    capacity: z.number().optional(),
    facilities: z.array(z.string()).optional(),
});

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        await dbConnect();
        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid venue ID" }, { status: 400 });
        }

        const venue = await VenueModel.findById(id).lean();
        if (!venue) {
            return NextResponse.json({ error: "Venue not found" }, { status: 404 });
        }

        return NextResponse.json(venue);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        await dbConnect();

        // Auth check - admin only
        const session = await getServerSession(authOptions);
        try {
            ensureHasRole(session, ["admin"]);
        } catch (err: any) {
            return NextResponse.json(
                { error: err.message },
                { status: err.status || 403 },
            );
        }

        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid venue ID" }, { status: 400 });
        }

        const body = await req.json();
        const parsed = updateSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.flatten() },
                { status: 400 },
            );
        }

        const venue = await VenueModel.findByIdAndUpdate(
            id,
            { $set: { ...parsed.data, updatedAt: new Date() } },
            { new: true },
        );

        if (!venue) {
            return NextResponse.json({ error: "Venue not found" }, { status: 404 });
        }

        return NextResponse.json(venue);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        await dbConnect();

        // Auth check - admin only
        const session = await getServerSession(authOptions);
        try {
            ensureHasRole(session, ["admin"]);
        } catch (err: any) {
            return NextResponse.json(
                { error: err.message },
                { status: err.status || 403 },
            );
        }

        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid venue ID" }, { status: 400 });
        }

        const venue = await VenueModel.findByIdAndDelete(id);

        if (!venue) {
            return NextResponse.json({ error: "Venue not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Venue deleted successfully" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
