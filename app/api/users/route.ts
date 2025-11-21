// app/api/users/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ensureHasRole } from "@/lib/auth";

export async function GET(req: Request) {
    await dbConnect();

    // Auth check - only admin can view all users
    const session = await getServerSession(authOptions);
    try {
        ensureHasRole(session, ["admin"]);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: err.status || 403 });
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");

    let query = {};
    if (role) {
        query = { role };
    }

    const users = await User.find(query).select("_id name email role").lean();
    return NextResponse.json(users);
}
