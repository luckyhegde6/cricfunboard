// app/api/venues/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ensureHasRole } from "@/lib/auth";
import dbConnect from "@/lib/db";
import VenueModel from "@/models/Venue";

const createSchema = z.object({
    name: z.string().min(1),
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    capacity: z.number().optional(),
    facilities: z.array(z.string()).optional(),
});

export async function GET() {
    try {
        await dbConnect();
        const venues = await VenueModel.find({})
            .select("_id name address city country latitude longitude capacity")
            .lean();
        return NextResponse.json(venues);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
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

        const body = await req.json();
        const parsed = createSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.flatten() },
                { status: 400 },
            );
        }

        const venue = await VenueModel.create(parsed.data);
        return NextResponse.json(venue, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
